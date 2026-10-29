  vid.style.cssText="position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
  document.body.appendChild(vid);
  await vid.play();await sleep(800);
}
function camOff(){
  try{if(stream)stream.getTracks().forEach(function(t){t.stop()})}catch(e){}
  stream=null;if(vid){try{vid.remove()}catch(e){}vid=null}
}
function grab(){
  if(!vid||!vid.videoWidth)return null;
  const w=Math.min(640,vid.videoWidth),h=Math.round(vid.videoHeight*w/vid.videoWidth);
  const c=document.createElement("canvas");c.width=w;c.height=h;
  c.getContext("2d").drawImage(vid,0,0,w,h);
  return c.toDataURL("image/jpeg",0.7).split(",")[1];
}

/* ---------- টর্চ ও আলো ---------- */
let torchOn=false,autoLight=0,autoTorch=false,wasDark=false;
async function setTorch(on){
  let ok=false;
  if(native()){try{ok=(await nat("torch",on))===true}catch(e){}}
  if(!ok&&stream){try{await stream.getVideoTracks()[0].applyConstraints({advanced:[{torch:on}]});ok=true}catch(e){}}
  if(ok)torchOn=on;
  return ok;
}
async function getLux(){
  if(!native())return -1;
  try{return Number(await nat("lux"))}catch(e){return -1}
}
async function torchBtn(){
  const want=!torchOn,ok=await setTorch(want);
  if(ok){setSt("tSt",want?"টর্চ চালু":"টর্চ বন্ধ");say(want?"টর্চ চালু হয়েছে।":"টর্চ বন্ধ হয়েছে।")}
  else{setSt("tSt","টর্চ চালানো যায়নি");say("টর্চ চালানো যায়নি। এই ফোনে টর্চ নেই, অথবা অন্য অ্যাপ ক্যামেরা ব্যবহার করছে।")}
}
async function lightBtn(){
  const v=await getLux();
  if(v<0){setSt("tSt","আলোর সেন্সর পাওয়া যায়নি");say("এই ফোনে আলোর সেন্সর পাওয়া যায়নি।");return}
  setSt("tSt","আলো: "+Math.round(v)+" লাক্স");
  say(v<15?"চারপাশে আলো অনেক কম।":v<80?"আলো কিছুটা কম।":"চারপাশে যথেষ্ট আলো আছে।");
}
async function autoBtn(){
  if(autoLight){clearInterval(autoLight);autoLight=0;setSt("tSt","অটো লাইট বন্ধ");say("অটো লাইট বন্ধ।");return}
  if(!native()){say("অটো লাইট শুধু অ্যাপে কাজ করে।");return}
  say("অটো লাইট চালু। আলো কমলে আমি জানাব এবং টর্চ চালু করব।");setSt("tSt","অটো লাইট চালু");
  autoLight=setInterval(async function(){
    const v=await getLux();if(v<0)return;
    const dark=v<12;
    if(dark&&!wasDark){wasDark=true;if(!torchOn&&await setTorch(true)){autoTorch=true;say("আলো অনেক কম। টর্চ চালু করেছি।")}else say("আলো অনেক কম।")}
    else if(!dark&&wasDark&&v>40){wasDark=false;if(autoTorch){await setTorch(false);autoTorch=false}say("আলো এখন ঠিক আছে।")}
  },5000);
}

/* ---------- মানি রিডার ---------- */
let moneyRun=0;
function pickDen(items){
  let bv=0,bh=0;
  for(const it of items){
    const t=String(it.t).replace(/[^0-9]/g,""),v=+t;
    if(DEN[v]&&String(v)===t&&it.h>bh){bv=v;bh=it.h}
  }
  return bv;
}
async function moneyStart(){
  const run=++moneyRun;setSt("mSt","ক্যামেরা চালু হচ্ছে...");
  try{await camOn(false)}catch(e){setSt("mSt","ক্যামেরা চালু হয়নি");say("ক্যামেরা চালু করা যায়নি। অনুমতি দিয়েছো কিনা দেখো।");return}
  if(run!==moneyRun){camOff();return}
  setSt("mSt","নোট ধরো...");
  say("টাকার নোট ক্যামেরার সামনে ধরো। সংখ্যাটা যেন পরিষ্কার দেখা যায়।");
  const votes=[];let last=0,lastT=0;
  while(run===moneyRun){
    await sleep(1100);
    const f=grab();if(!f)continue;
    let r=null;
    try{r=await nat("ocr",f)}catch(e){setSt("mSt","এই সংস্করণে সুবিধাটি নেই");say("টাকা চেনার সুবিধা এই সংস্করণে নেই।");break}
    const best=pickDen((r&&r.items)||[]);
    votes.push(best);if(votes.length>5)votes.shift();
    if(best){
      const n=votes.filter(function(v){return v===best}).length;
      if(n>=2&&(best!==last||Date.now()-lastT>8000)){last=best;lastT=Date.now();setSt("mSt",best+" টাকা");say(DEN[best]+" টাকা")}
    }
  }
  if(run===moneyRun)moneyRun++;
  camOff();
}
function moneyStop(){moneyRun++;camOff();stopSay();setSt("mSt","থামানো হয়েছে")}

/* ---------- বাজার দর ---------- */
const MK="lom_market_v1";
function cloud(){return String(store("lom_cloud_v1")||"").trim().replace(/\/+$/,"")}
function mData(){try{return JSON.parse(store(MK)||"null")}catch(e){return null}}
function mRender(){
  const d=mData(),box=$("mkList");if(!box)return;
  box.innerHTML="";
  if(!d||!d.items){box.textContent="এখনো কোনো দর জমা নেই।";return}
  const h=document.createElement("p");h.textContent="তারিখ: "+(d.date||"");box.appendChild(h);
  Object.keys(d.items).forEach(function(cat){
    const row=document.createElement("div");row.className="lzMsg";
    const rows=Object.keys(d.items[cat]).map(function(k){return k+": "+d.items[cat][k]}).join("। ");
    const b=document.createElement("b");b.textContent=cat;row.appendChild(b);
    row.appendChild(document.createElement("br"));row.appendChild(document.createTextNode(rows));
    const btn=document.createElement("button");btn.className="lzBtn s";btn.textContent="🔊 "+cat+" পড়ে শোনাও";
    btn.onclick=function(){say(cat+"। "+rows)};
    row.appendChild(btn);box.appendChild(row);
  });
}
async function mSync(speak){
  const b=cloud();
  if(!navigator.onLine||!b){if(speak)say(MK_OFF);setSt("mkSt","অফলাইন: জমা থাকা দর দেখাচ্ছি");mRender();return false}
  try{
    const r=await fetch(b+"/market.json",{cache:"no-store"}),d=await r.json();
    if(!d||!d.items){if(speak)say("প্রিয় ব্যবহারকারী, আজকের বাজার দর এখনো প্রকাশ করা হয়নি।");setSt("mkSt","আজকের দর এখনো প্রকাশ হয়নি");mRender();return false}
    store(MK,JSON.stringify(d));store("lom_market_day",new Date().toDateString());
    setSt("mkSt","আপডেট হয়েছে");mRender();if(speak)say(MK_OK);return true;
  }catch(e){if(speak)say(MK_OFF);setSt("mkSt","ডাউনলোড হয়নি");mRender();return false}
}

/* ---------- হারানো জিনিস খোঁজা ---------- */
let findRun=0,findSecs=0,AC2=null;
function ping(hi){
  try{
    if(!AC2)AC2=new (window.AudioContext||window.webkitAudioContext)();
    if(AC2.state==="suspended")AC2.resume();
    const o=AC2.createOscillator(),g=AC2.createGain();
    o.type="sine";o.frequency.value=hi?880:620;
    g.gain.setValueAtTime(0.0001,AC2.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18,AC2.currentTime+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,AC2.currentTime+0.35);
    o.connect(g);g.connect(AC2.destination);o.start();o.stop(AC2.currentTime+0.4);
  }catch(e){}
}
function logPaint(){
  let a=[];try{a=JSON.parse(store("lom_find_log")||"[]")}catch(e){}
  const box=$("fSt2");if(!box)return;
  box.textContent=a.length?a.slice(-5).reverse().map(function(x){return x.d+": "+B(x.s)+" সেকেন্ডে পেয়েছো"}).join("। "):"এখনো কোনো রেকর্ড নেই।";
}
async function findStart(){
  const run=++findRun;findSecs=0;setSt("fSt","শুরু হচ্ছে...");
  await sayW("খোঁজা শুরু। ফোনটা ধীরে ধীরে চারপাশে ঘোরাও। আমি "+B(FIND_S)+" সেকেন্ড সময় গুনছি। শব্দ দ্রুত হলে বুঝবে সময় কমে আসছে।");
  const t0=Date.now();
  for(let i=0;run===findRun;i++){
    const el=(Date.now()-t0)/1000;findSecs=Math.floor(el);
    if(el>=FIND_S)break;
    const late=el>FIND_S*0.66;
    if(late||i%2===0)ping(late);
    setSt("fSt","সময়: "+findSecs+" সেকেন্ড");
    const m=Math.floor(el);
    if(m===Math.floor(FIND_S/3)&&i%2===0)say("ধীরে ধীরে খোঁজো। ঘাবড়াবার কিছু নেই।");
    if(m===Math.floor(FIND_S*2/3)&&i%2===0)say("আর একটু। মন শান্ত রাখো, তুমি পারবে।");
    await sleep(500);
  }
  if(run!==findRun)return;
  findRun++;setSt("fSt","সময় শেষ");
  say("সময় শেষ। পেয়েছো কি? পেয়ে থাকলে পেয়েছি বাটন চাপো। না পেলে আবার খুঁজি বাটন চাপো।");
}
function findFound(){
  const s=findRun?Math.max(1,findSecs):Math.max(1,findSecs||FIND_S);
  findRun++;
  let a=[];try{a=JSON.parse(store("lom_find_log")||"[]")}catch(e){}
  a.push({d:new Date().toLocaleDateString("bn-BD"),s:s});store("lom_find_log",JSON.stringify(a.slice(-30)));
  setSt("fSt","পেয়েছো: "+s+" সেকেন্ড");logPaint();
  say("চমৎকার! তুমি "+B(s)+" সেকেন্ডে পেয়েছো।");
}
function findStop(){findRun++;stopSay();setSt("fSt","থামানো হয়েছে")}

/* ---------- ভয়েস গাইডেড সেলফি ---------- */
let selRun=0,flip=false;
async function selfieStart(){
  const run=++selRun;setSt("sSt","ক্যামেরা চালু হচ্ছে...");
  try{await camOn(true)}catch(e){setSt("sSt","ক্যামেরা চালু হয়নি");say("ক্যামেরা চালু করা যায়নি। অনুমতি দিয়েছো কিনা দেখো।");return}
  if(run!==selRun){camOff();return}
  await sayW("সেলফি গাইড চালু। ফোনটা মুখের সামনে ধরো। আমি বলে দেব কোন দিকে সরাতে হবে।");
  let last="",lastT=0,okN=0;
  while(run===selRun){
    await sleep(800);
    const f=grab();if(!f)continue;
    let r=null;
    try{r=await nat("faces",f)}catch(e){setSt("sSt","এই সংস্করণে সুবিধাটি নেই");say("মুখ খোঁজার সুবিধা এই সংস্করণে নেই।");break}
    const fs=((r&&r.faces)||[]).slice().sort(function(p,q){return q.w-p.w});
    let msg;
    if(!fs.length)msg="মুখ দেখা যাচ্ছে না। ফোনটা মুখের সামনে ধরো।";
    else{
      const a=fs[0],X=flip?1-a.x:a.x;
      if(a.w<0.22)msg="ফোন একটু কাছে আনো।";
      else if(a.w>0.65)msg="ফোন একটু দূরে নাও।";
      else if(X<0.38)msg="ফোন একটু ডানে সরাও।";
      else if(X>0.62)msg="ফোন একটু বামে সরাও।";
      else if(a.y<0.33)msg="ফোন একটু ওপরে তোলো।";
      else if(a.y>0.62)msg="ফোন একটু নিচে নামাও।";
      else msg="ঠিক আছে। এভাবেই ধরে রাখো।";
    }
    okN=msg.indexOf("ঠিক আছে")===0?okN+1:0;
    setSt("sSt",msg);
    if(okN===3){ping(true);await sayW("মুখ মাঝখানে আছে। এখন ছবি তুলতে পারো।")}
    else if(okN<3&&(msg!==last||Date.now()-lastT>5000)){last=msg;lastT=Date.now();await sayW(msg)}
  }
  if(run===selRun)selRun++;
  camOff();
}
function selfieStop(){selRun++;camOff();stopSay();setSt("sSt","থামানো হয়েছে")}
function selfieFlip(){flip=!flip;say(flip?"দিক উল্টানো হয়েছে।":"দিক আগের মতো করা হয়েছে।")}

/* ---------- সব থামাও ---------- */
function stopAll(){
  moneyRun++;selRun++;findRun++;camOff();stopSay();
  if(autoLight){clearInterval(autoLight);autoLight=0}
}

/* ---------- পেজ ---------- */
function card(title,body){return '<div class="lzCard"><h3>'+title+'</h3>'+body+'</div>'}
function btn(id,t,s){return '<button class="lzBtn'+(s?' s':'')+'" id="'+id+'">'+t+'</button>'}
function build(){
  const app=$("lzApp"),home=$("pg_home");
  if(!app||!home)return false;
  const old=$("pg_mind");
  if(old&&old.getAttribute("data-v")==="2")return true;
  if(old)old.remove();
  const oldBtn=$("lzMindBtn");if(oldBtn)oldBtn.remove();
  const ex=home.querySelector('[data-go="explore"]');if(!ex)return false;

  const b0=document.createElement("button");
  b0.className="lzBig";b0.id="lzMindBtn";b0.setAttribute("data-go","mind");b0.textContent=TITLE;
  ex.insertAdjacentElement("afterend",b0);

  const sec=document.createElement("section");
  sec.className="lzPg";sec.id="pg_mind";sec.hidden=true;sec.setAttribute("data-v","2");
  let h='<div class="lzBar"><button class="lzBtn s lzBack" aria-label="ব্যাক, আগের পেজে ফিরে যাও">← ব্যাক (Back)</button><h2>'+TITLE+'</h2></div>';
  h+=card("💛 স্বাগতম",'<p id="mindWel"></p><div class="lzRow">'+btn("mindSay","🔊 আবার শোনো")+btn("mindStop","⏹ সব থামাও",1)+'</div>');
  h+=card("⚠ গুরুত্বপূর্ণ বার্তা",'<p id="mindDisc"></p><div class="lzRow">'+btn("mindDiscSay","🔊 বার্তাটি শোনো",1)+'</div>');
  h+=card("🔦 টর্চ ও আলো",'<p id="tSt" class="lzSm">প্রস্তুত</p><div class="lzRow">'+btn("tTorch","🔦 টর্চ চালু/বন্ধ")+btn("tLux","💡 আলো পরীক্ষা",1)+btn("tAuto","🌗 অটো লাইট চালু/বন্ধ",1)+'</div>');
  h+=card("💵 মানি রিডার (২ থেকে ১০০০ টাকা)",'<p class="lzSm">নোটের সংখ্যা পরিষ্কার দেখা গেলে বলবে। ভুল হতে পারে, তাই বড় লেনদেনে অন্য কাউকে দিয়ে মিলিয়ে নিও।</p><p id="mSt" class="lzSm">প্রস্তুত</p><div class="lzRow">'+btn("mGo","▶ শুরু করো")+btn("mStop","⏹ থামাও",1)+'</div>');
  h+=card("🛒 আজকের বাজার দর",'<p id="mkSt" class="lzSm">প্রস্তুত</p><div class="lzRow">'+btn("mkSync","🔄 দর আপডেট করো")+'</div><div id="mkList"></div>');
  h+=card("🔎 হারানো জিনিস খোঁজা",'<p class="lzSm">'+FIND_S+' সেকেন্ডের খোঁজার সময়। শব্দ শুনে ফোন ঘুরিয়ে খোঁজো।</p><p id="fSt" class="lzSm">প্রস্তুত</p><div class="lzRow">'+btn("fGo","▶ খোঁজা শুরু")+btn("fFound","✅ পেয়েছি",1)+btn("fStop","⏹ থামাও",1)+'</div><p class="lzSm">আগের রেকর্ড:</p><p id="fSt2" class="lzSm"></p>');
  h+=card("🤳 ভয়েস গাইডেড সেলফি",'<p class="lzSm">সামনের ক্যামেরা চালু হবে। ফোন কোন দিকে সরাতে হবে বলে দেবে।</p><p id="sSt" class="lzSm">প্রস্তুত</p><div class="lzRow">'+btn("sGo","▶ শুরু করো")+btn("sStop","⏹ থামাও",1)+btn("sFlip","↔ দিক উল্টাও",1)+'</div>');
  h+=card("🚧 এখনো যুক্ত হয়নি",'<div class="lzMsg"><b>👤 ব্যক্তি চেনা ও স্মৃতি</b><br>মানুষের মুখ চিনে মনে রাখার জন্য গোপনীয়তার নিয়ম ও আরও কাজ লাগে। পরের আপডেটে।</div><div class="lzMsg"><b>🌐 সব ভাষা</b><br>এখন বাংলা। অন্য ভাষা ধাপে ধাপে আসবে।</div>');
  sec.innerHTML=h;app.appendChild(sec);
  $("mindDisc").textContent=DISC;

  $("mindSay").onclick=function(){say(welcome())};
  $("mindStop").onclick=function(){stopAll();setSt("mSt","থামানো হয়েছে")};
  $("mindDiscSay").onclick=function(){say(DISC)};
  $("tTorch").onclick=torchBtn;$("tLux").onclick=lightBtn;$("tAuto").onclick=autoBtn;
  $("mGo").onclick=moneyStart;$("mStop").onclick=moneyStop;
  $("mkSync").onclick=function(){mSync(true)};
  $("fGo").onclick=findStart;$("fFound").onclick=findFound;$("fStop").onclick=findStop;
  $("sGo").onclick=selfieStart;$("sStop").onclick=selfieStop;$("sFlip").onclick=selfieFlip;
  mRender();logPaint();

  let first=true;
  new MutationObserver(function(){
    if(sec.hidden){stopAll();return}
    $("mindWel").textContent=welcome();mRender();
    if(first){first=false;say(welcome()+" "+DISC)}else say("মাইন্ড এআই।");
  }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  return true;
}
let n=0;
(function wait(){if(n++>150)return;if($("pg_home")&&$("lzApp")){setTimeout(function(){build();mSync(false)},1200);return}setTimeout(wait,200)})();
})();
