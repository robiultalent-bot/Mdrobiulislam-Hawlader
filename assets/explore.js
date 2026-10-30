  try{if(typeof ntSpeak==="function")return ntSpeak(t,0)}catch(e){}
  try{const u=new SpeechSynthesisUtterance(t);u.lang="bn-BD";speechSynthesis.speak(u)}catch(e){}
  return Promise.resolve();
}
function sayEn(t){
  stopSay();
  try{if(typeof ntSpeak==="function")return ntSpeak(t,true)}catch(e){}
  try{const u=new SpeechSynthesisUtterance(t);u.lang="en-US";speechSynthesis.speak(u)}catch(e){}
  return Promise.resolve();
}
const sayW=function(t){return Promise.race([say(t),sleep(12000)])};
const sayEnW=function(t){return Promise.race([sayEn(t),sleep(15000)])};
const setSt=function(id,t){const e=$(id);if(e)e.textContent=t};

/* ---------- ক্যামেরা ---------- */
let stream=null,vid=null;
async function camOn(){
  camOff();
  if(native()){
    let ok=false;
    try{ok=(await nat("camPerm",true))===true}catch(e){}
    for(let i=0;i<24&&!ok;i++){await sleep(500);try{ok=(await nat("camPerm",false))===true}catch(e){}}
    if(!ok)throw new Error("perm");
  }
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false});
  vid=document.createElement("video");
  vid.setAttribute("playsinline","");vid.muted=true;vid.srcObject=stream;
  vid.style.cssText="position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
  document.body.appendChild(vid);
  await vid.play();await sleep(800);
}
function camOff(){
  try{if(stream)stream.getTracks().forEach(function(t){t.stop()})}catch(e){}
  stream=null;if(vid){try{vid.remove()}catch(e){}vid=null}
}
function grab(w0){
  if(!vid||!vid.videoWidth)return null;
  const w=Math.min(w0,vid.videoWidth),h=Math.round(vid.videoHeight*w/vid.videoWidth);
  const c=document.createElement("canvas");c.width=w;c.height=h;
  c.getContext("2d").drawImage(vid,0,0,w,h);
  return c.toDataURL("image/jpeg",0.7).split(",")[1];
}

/* ---------- টর্চ ও আলো ---------- */
let torchOn=false,torchAuto=false,torchT=0;
async function setTorch(on){
  let ok=false;
  if(native()){try{ok=(await nat("torch",on))===true}catch(e){}}
  if(!ok&&stream){try{await stream.getVideoTracks()[0].applyConstraints({advanced:[{torch:on}]});ok=true}catch(e){}}
  if(ok){torchOn=on;torchT=Date.now()}
  return ok;
}
async function getLux(){
  if(!native())return -1;
  try{return Number(await nat("lux"))}catch(e){return -1}
}
async function lightTick(S){
  const v=await getLux();if(v<0||!S.active)return;
  if(v<12&&!torchOn){
    if(await setTorch(true)){torchAuto=true;S.pend.push("আলো অনেক কম। টর্চ চালু করেছি।")}
    else if(!S.darkWarned){S.darkWarned=true;S.pend.push("আলো অনেক কম।")}
  }else if(v>120&&torchOn&&torchAuto&&Date.now()-torchT>20000){
    await setTorch(false);torchAuto=false;S.pend.push("আলো এখন ঠিক আছে। টর্চ বন্ধ করেছি।");
  }
}

/* ---------- বাঁশির সুর: মানুষ যত কাছে, সুর তত উঁচু ও দ্রুত ---------- */
const beeper=(function(){
  let ac=null,near=0,on=false;
  function ensure(){
    try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume()}catch(e){}
  }
  function ping(f){
    try{
      const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      o.type="sine";o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.09,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
      o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+0.25);
    }catch(e){}
  }
  async function run(){
    if(on)return;on=true;
    while(near>0){
      const k=Math.max(0,Math.min(1,(3-near)/3));
      ping(500+k*900);
      await sleep(900-k*740);
    }
    on=false;
  }
  return {ensure:ensure,set:function(d){near=d;if(d>0)run()}};
})();

/* ---------- মডিউল রেজিস্ট্রি: নতুন ফিচার এখানে register করলেই যুক্ত হয় ---------- */
const X={mods:[],register:function(m){X.mods.push(m)}};
window.LOM_X=X;

function jac(a,b){
  const A=new Set(a.toLowerCase().split(/\W+/).filter(Boolean)),Bw=new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if(!A.size||!Bw.size)return 0;
  let i=0;A.forEach(function(w){if(Bw.has(w))i++});
  return i/(A.size+Bw.size-i);
}

/* টাকা চেনা */
const money=(function(){
  let votes=[],present=false,cur=0,miss=0;
  function pick(items){
    let bv=0,bh=0;
    for(const it of items){
      const t=String(it.t).replace(/[^0-9]/g,""),v=+t;
      if(DEN[v]&&String(v)===t&&it.h>bh){bv=v;bh=it.h}
    }
    return bv;
  }
  return {id:"money",mask:1,
    get present(){return present},
    reset:function(){votes=[];present=false;cur=0;miss=0},
    tick:function(r){
      const b=pick(r.items||[]);
      votes.push(b);if(votes.length>5)votes.shift();
      const cnt={};votes.forEach(function(v){if(v)cnt[v]=(cnt[v]||0)+1});
      let best=0;Object.keys(cnt).forEach(function(k){if(cnt[k]>=2&&(!best||cnt[k]>cnt[best]))best=+k});
      if(!best){if(++miss>=3){present=false;cur=0}return null}
      miss=0;
      if(present&&cur===best)return null;
      return {p:10,t:DEN[best]+" টাকা",commit:function(){present=true;cur=best}};
    }};
})();

/* লেখা পড়া (ইংরেজি) */
const text=(function(){
  let last="",lastT=0,gap=0;
  return {id:"text",mask:1,
    reset:function(){last="";lastT=0;gap=0},
    tick:function(r){
      if(money.present)return null;
      const s=(r.lines||[]).join(" ").replace(/\s+/g," ").trim();
      const letters=(s.match(/[A-Za-z]/g)||[]).length;
      if(letters<8){if(++gap>3)last="";return null}
      gap=0;
      if(last&&jac(s,last)>0.6)return null;
      if(Date.now()-lastT<6000)return null;
      return {p:5,pre:"লেখা আছে",t:s.slice(0,220),en:true,commit:function(){last=s;lastT=Date.now()}};
    }};
})();

/* বারকোড */
const barcode=(function(){
  let last="",lastT=0;
  async function lookup(code){
    try{
      const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+encodeURIComponent(code)+".json?fields=product_name,brands");
      const d=await r.json();
      if(d&&d.status===1&&d.product&&d.product.product_name)return (d.product.brands?d.product.brands+" ":"")+d.product.product_name;
    }catch(e){}
    return "";
  }
  return {id:"barcode",mask:8,
    reset:function(){last="";lastT=0},
    tick:function(r){
      const c=(r.codes||[])[0];
      if(!c||(c===last&&Date.now()-lastT<20000))return null;
      return {p:8,t:"বারকোড",commit:function(){last=c;lastT=Date.now()},
        go:async function(){
          await sayW("বারকোড পেয়েছি");
          const n=navigator.onLine?await lookup(c):"";
          if(n){await sayW("পণ্য");await sayEnW(n)}
          else await sayW("বারকোড নম্বর "+c.split("").map(B).join(" "));
        }};
    }};
})();

/* মানুষ চেনা (উপস্থিতি, দিক, আনুমানিক দূরত্ব) */
function dist(d){
  const m={0.5:"আধা মিটার",1:"এক মিটার",1.5:"দেড় মিটার",2:"দুই মিটার",2.5:"আড়াই মিটার"};
  return m[d]||(B(Math.round(d))+" মিটার");
}
const person=(function(){
  let key="",lastT=0,miss=0;
  return {id:"person",mask:2,
    reset:function(){key="";lastT=0;miss=0;beeper.set(0)},
    tick:function(r){
      const f=(r.faces||[]).slice().sort(function(a,b){return b.w-a.w});
      if(!f.length){if(++miss>=3){key="";beeper.set(0)}return null}
      miss=0;
      const a=f[0],d=Math.max(0.3,Math.round(0.126/Math.max(a.w,0.03)*2)/2);
      beeper.set(d);
      const zone=a.x<0.35?"বাম দিকে":a.x>0.65?"ডান দিকে":"সামনে";
      const near=d<0.8?"খুব কাছে":d<1.6?"কাছে":d<3?"একটু দূরে":"দূরে";
      const k=f.length+"|"+zone+"|"+near;
      if(k===key||Date.now()-lastT<3500)return null;
      const dt=dist(d);
      const t=f.length===1?"একজন মানুষ, "+zone+", "+near+", প্রায় "+dt:B(f.length)+" জন মানুষ, সবচেয়ে কাছের জন "+zone+", প্রায় "+dt;
      return {p:6,t:t,commit:function(){key=k;lastT=Date.now()}};
    }};
})();
[money,text,barcode,person].forEach(X.register);

/* ---------- সেশন, কয়েন ও অ্যাড ---------- */
const K_USED="lom_x_used",K_COINS="lom_x_coins";
const used=function(){return +ls(K_USED,0)||0};
const coins=function(){return +ls(K_COINS,0)||0};
function paintInfo(){
  const left=Math.max(0,CFG.FREE-used());
  setSt("xInfo","বিনামূল্যের সেশন বাকি: "+B(left)+"। কয়েন: "+B(coins())+"।");
}
function canStart(){return isDev()||used()<CFG.FREE||coins()>=CFG.COST}
function consume(){
  if(isDev())return;
  if(used()>=CFG.FREE)lsS(K_COINS,coins()-CFG.COST);
  lsS(K_USED,used()+1);
}
async function adCoins(){
  const A=window.__LOM_ADS;
  if(!A||typeof A.watch!=="function"){say("এখন অ্যাড পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।");return}
  await sayW("অ্যাড আসছে। একটু অপেক্ষা করুন।");
  let ok=false;try{ok=await A.watch()}catch(e){}
  if(ok){lsS(K_COINS,coins()+CFG.PER_AD);paintInfo();say("ধন্যবাদ! আপনি "+B(CFG.PER_AD)+" কয়েন পেয়েছেন।")}
  else say("অ্যাড সম্পূর্ণ দেখা হয়নি, তাই কয়েন যোগ হয়নি। আবার চেষ্টা করুন।");
}

const S={id:0,active:false,pend:[],timer:0,darkWarned:false};
async function startExplore(){
  if(S.active)return;
  if(!canStart()){
    await sayW("প্রিয় ব্যবহারকারী, আপনার বিনামূল্যের সেশন শেষ হয়েছে। একটি ছোট অ্যাড দেখলে আপনি "+B(CFG.PER_AD)+" কয়েন পাবেন, তা দিয়ে আরও সেশন চালাতে পারবেন। অ্যাড দেখতে অ্যাড দেখে কয়েন নিন বাটনে ডাবল ট্যাপ করুন।");
    return;
  }
  consume();paintInfo();
  const id=++S.id;S.active=true;S.pend=[];S.darkWarned=false;
  [money,text,barcode,person].forEach(function(m){m.reset()});
  beeper.ensure();setSt("xSt","ক্যামেরা চালু হচ্ছে...");
  try{await camOn()}catch(e){
    S.active=false;setSt("xSt","ক্যামেরা চালু হয়নি");
    say("ক্যামেরা চালু করা যায়নি। ক্যামেরার অনুমতি দিয়েছেন কিনা দেখুন।");return;
  }
  if(id!==S.id){camOff();return}
  setSt("xSt","এক্সপ্লোর মোড চালু");
  await sayW("এক্সপ্লোর মোড চালু। আমি সামনের টাকা, লেখা, বারকোড ও মানুষ নিজে থেকেই জানাব। বন্ধ করতে বন্ধ বাটনে ডাবল ট্যাপ করুন।");
  S.timer=setInterval(function(){lightTick(S)},4000);lightTick(S);
  await loop(id);
}
async function loop(id){
  const mask=X.mods.reduce(function(m,x){return m|x.mask},0);
  while(id===S.id){
    const pm=S.pend.shift();
    if(pm){await sayW(pm);continue}
    const f=grab(960);
    if(!f){await sleep(300);continue}
    let r=null;
    try{r=await nat("scan",f,mask)}catch(e){
      setSt("xSt","এই সংস্করণে সুবিধাটি নেই");say("ক্যামেরা বিশ্লেষণের সুবিধা এই সংস্করণে নেই।");break;
    }
    if(id!==S.id)break;
    let best=null;
    X.mods.forEach(function(m){
      let c=null;try{c=m.tick(r||{})}catch(e){}
      if(c&&(!best||c.p>best.p))best=c;
    });
    if(best){
      best.commit();setSt("xSt",best.t.slice(0,80));
      if(best.go)await best.go();
      else if(best.en){await sayW(best.pre||"");await sayEnW(best.t)}
      else await sayW(best.t);
    }
    await sleep(350);
  }
  if(id===S.id)stopExplore(false);
}
function stopExplore(rate){
  const was=S.active;
  S.id++;S.active=false;S.pend=[];
  if(S.timer){clearInterval(S.timer);S.timer=0}
  beeper.set(0);camOff();stopSay();
  if(torchOn&&torchAuto){setTorch(false);torchAuto=false}
  setSt("xSt","বন্ধ আছে");
  if(was&&rate)askRating();
}

/* ---------- রেটিং ও ফায়ারবেস ---------- */
const K_RQ="lom_x_rq";
async function flushRatings(){
  const q=ls(K_RQ,[]);if(!q.length||!navigator.onLine)return;
  const rest=[];
  for(const it of q){
    try{
      const r=await fetch(CFG.FB+"/ratings.json",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({ts:{".sv":"timestamp"}},it))});
      if(!r.ok)rest.push(it);
    }catch(e){rest.push(it)}
  }
  lsS(K_RQ,rest);
}
function saveRating(stars,excellent){
  const q=ls(K_RQ,[]);
  q.push({stars:stars,excellent:!!excellent,name:nm(),when:new Date().toISOString()});
  lsS(K_RQ,q.slice(-50));
  flushRatings();
}
function askRating(){
  if($("xRate"))return;
  const d=document.createElement("div");
  d.id="xRate";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","xRateT");
  d.style.cssText="position:fixed;inset:0;z-index:120;background:rgba(5,8,18,.94);overflow-y:auto;padding:24px 16px;color:#f4efe0";
  let h='<h2 id="xRateT" tabindex="-1" style="color:#f2b84b;font-size:20px">আমি আপনাকে কিরকম সেবা দিতে পেরেছি?</h2><div class="lzRow" style="margin-top:14px">';
  for(let i=1;i<=5;i++)h+='<button class="lzBtn s" data-s="'+i+'">'+"⭐".repeat(i)+" "+B(i)+" স্টার</button>";
  h+='<button class="lzBtn" data-s="5" data-x="1">🌟 Excellent (অসাধারণ)</button><button class="lzBtn r" data-s="0">পরে বলব</button></div>';
  d.innerHTML=h;document.body.appendChild(d);
  d.addEventListener("click",function(e){
    const b=e.target.closest("button");if(!b)return;
    const s=+b.getAttribute("data-s");
    if(s>0){saveRating(s,b.getAttribute("data-x")==="1");say("ধন্যবাদ! আপনার মতামত আমাদের কাছে পৌঁছে গেছে।")}
    d.remove();
  });
  say("আমি আপনাকে কিরকম সেবা দিতে পেরেছি? এক থেকে পাঁচ স্টার বেছে নিন, অথবা Excellent বাটন চাপুন।");
  try{$("xRateT").focus()}catch(e){}
}

/* ---------- ব্যবহারকারীর ডেটা মোছা ---------- */
let delArmed=0;
function delData(){
  if(Date.now()-delArmed>8000){
    delArmed=Date.now();
    setSt("dSt","সত্যিই মুছবেন? আবার চাপুন। কয়েন, অগ্রগতি ও প্রিমিয়াম কোডও মুছে যাবে।");
    say("সত্যিই সব ডেটা মুছবেন? কয়েন, অগ্রগতি ও প্রিমিয়াম কোডও মুছে যাবে। নিশ্চিত হলে আট সেকেন্ডের মধ্যে আবার ডাবল ট্যাপ করুন।");
    return;
  }
  try{
    const ks=[];for(let i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));
    ks.forEach(function(k){if(/^lom|^all_levels/.test(k))localStorage.removeItem(k)});
  }catch(e){}
  say("আপনার সব ডেটা মুছে ফেলা হয়েছে।");
  setTimeout(function(){try{location.reload()}catch(e){}},2500);
}

/* ---------- ওয়েলকাম ব্যানার ---------- */
function welcomeBanner(){
  if(ls("lom_x_seen","")===CFG.VER||$("xWel"))return;
  const d=document.createElement("div");
  d.id="xWel";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","xWelT");
  d.style.cssText="position:fixed;inset:0;z-index:110;background:linear-gradient(160deg,#0b1020,#1b2750);overflow-y:auto;padding:28px 18px;color:#f4efe0;text-align:center";
  d.innerHTML='<svg aria-hidden="true" width="96" height="96" viewBox="0 0 96 96" style="display:block;margin:0 auto 12px"><defs><radialGradient id="xg"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#e9a82f"/></radialGradient></defs><circle cx="48" cy="48" r="44" fill="url(#xg)" opacity=".25"/><circle cx="48" cy="40" r="20" fill="url(#xg)"/><rect x="30" y="62" width="36" height="22" rx="10" fill="#f2b84b"/><circle cx="41" cy="38" r="3" fill="#241a04"/><circle cx="55" cy="38" r="3" fill="#241a04"/><path d="M40 47 Q48 54 56 47" stroke="#241a04" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'
   +'<h2 id="xWelT" tabindex="-1" style="color:#f2b84b;font-size:21px;line-height:1.5">'+QUOTE+'</h2>'
   +'<p style="font-size:15px;line-height:1.8;color:#dfe6ff;margin:14px 0">'+UPD+'</p>'
   +'<div class="lzRow" style="justify-content:center"><button class="lzBtn" id="xWelGo">এক্সপ্লোর মোডে প্রবেশ করুন</button><button class="lzBtn s" id="xWelNo">পরে</button></div>';
  document.body.appendChild(d);
  const close=function(){lsS("lom_x_seen",CFG.VER);d.remove();stopSay()};
  $("xWelGo").onclick=function(){close();const b=$("lzMindBtn");if(b)b.click()};
  $("xWelNo").onclick=close;
  try{$("xWelT").focus()}catch(e){}
}
function addNotice(){
  const T="সামনে আসছে";let a=ls("lom2_notices",null);
  if(!a)a=[{t:"মনের আলো-তে স্বাগতম",b:"নতুন হোম, শপ ও এক্সপ্লোর যুক্ত হয়েছে।",d:"২০২৬"}];
  if(a.some(function(x){return x.t===T}))return;
  a.unshift({t:T,b:"এক্সপ্লোর মোডে নতুন সুবিধা যুক্ত হয়েছে। শীঘ্রই আসছে: সেলফি মোড, মানুষ চেনা, বাজার দর, ব্লুটুথ স্কেল ও আরও ভাষা।",d:new Date().toLocaleDateString("bn-BD")});
  lsS("lom2_notices",a.slice(0,30));
}

/* ---------- পেজ ---------- */
const card=function(t,b){return '<div class="lzCard"><h3>'+t+'</h3>'+b+'</div>'};
const btn=function(id,t,s){return '<button class="lzBtn'+(s?' s':'')+'" id="'+id+'">'+t+'</button>'};
function build(){
  const app=$("lzApp"),home=$("pg_home");
  if(!app||!home)return false;
  const old=$("pg_mind");
  if(old&&old.getAttribute("data-v")==="3")return true;
  if(old)old.remove();
  const ob=$("lzMindBtn");if(ob)ob.remove();
  const ex=home.querySelector('[data-go="explore"]');if(!ex)return false;
  const b0=document.createElement("button");
  b0.className="lzBig";b0.id="lzMindBtn";b0.setAttribute("data-go","mind");b0.textContent="🧠 মাইন্ড এআই";
  ex.insertAdjacentElement("afterend",b0);

  const sec=document.createElement("section");
  sec.className="lzPg";sec.id="pg_mind";sec.hidden=true;sec.setAttribute("data-v","3");
  let h='<div class="lzBar"><button class="lzBtn s lzBack" aria-label="ব্যাক, আগের পেজে ফিরে যাও">← ব্যাক (Back)</button><h2>🧠 মাইন্ড এআই</h2></div>';
  h+=card("💛 স্বাগতম",'<p id="mindWel"></p><div class="lzRow">'+btn("mindSay","🔊 আবার শোনো",1)+'</div>');
  h+=card("⚠ গুরুত্বপূর্ণ বার্তা",'<p id="mindDisc"></p><div class="lzRow">'+btn("mindDiscSay","🔊 বার্তাটি শোনো",1)+'</div>');
  h+=card(TITLE,'<p class="lzSm">চালু করলে ক্যামেরা একটানা চলে। সামনে টাকা, ইংরেজি লেখা, বারকোড বা মানুষ এলে নিজে থেকেই জানাবে। আলো কম হলে টর্চ নিজে চালু হবে। মানুষ কাছে এলে বাঁশির সুর দ্রুত ও উঁচু হবে।</p><p id="xInfo" class="lzSm"></p><p id="xSt" class="lzSm">বন্ধ আছে</p><div class="lzRow">'+btn("xGo","▶ এক্সপ্লোর মোড চালু করো")+btn("xStop","⏹ বন্ধ করো",1)+btn("xAd","🎁 অ্যাড দেখে কয়েন নিন",1)+'</div>');
  h+=card("🗑 আমার ডেটা",'<p class="lzSm">এই ফোনে জমা থাকা কয়েন, অগ্রগতি ও কোড মুছে ফেলতে পারবেন।</p><p id="dSt" class="lzSm"></p><div class="lzRow">'+btn("dDel","🗑 সব ডেটা মুছে ফেলো",1)+'</div>');
  h+=card("🚧 সামনে আসছে",'<div class="lzMsg">🤳 সেলফি মোড</div><div class="lzMsg">👤 মানুষ চিনে রাখা</div><div class="lzMsg">🛒 লোকেশন অনুযায়ী বাজার দর</div><div class="lzMsg">⚖ ব্লুটুথ স্কেলে অটো ওজন ও দাম</div><div class="lzMsg">🔎 হারানো জিনিস খোঁজা</div><div class="lzMsg">🌐 আরও ভাষা</div>');
  sec.innerHTML=h;app.appendChild(sec);
  $("mindDisc").textContent=DISC;

  $("mindSay").onclick=function(){say(QUOTE+" "+nm()+", তুমি এখানে এসেছো, এটাই একটা সুন্দর শুরু।")};
  $("mindDiscSay").onclick=function(){say(DISC)};
  $("xGo").onclick=startExplore;
  $("xStop").onclick=function(){stopExplore(true)};
  $("xAd").onclick=adCoins;
  $("dDel").onclick=delData;
  paintInfo();

  let first=true;
  new MutationObserver(function(){
    if(sec.hidden){stopExplore(true);return}
    $("mindWel").textContent=QUOTE;paintInfo();
    if(first){first=false;say(QUOTE+" "+DISC)}else say("মাইন্ড এআই।");
  }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  return true;
}
document.addEventListener("visibilitychange",function(){if(document.hidden&&S.active)stopExplore(false)});
window.addEventListener("online",flushRatings);

if(!CFG.CLOUD_SAVE){try{if(localStorage.getItem("lom_cloud_v1")===CFG.FB)localStorage.removeItem("lom_cloud_v1")}catch(e){}}
let n=0;
(function wait(){
  if(n++>150)return;
  if($("pg_home")&&$("lzApp")){setTimeout(function(){build();addNotice();welcomeBanner();flushRatings()},1200);return}
  setTimeout(wait,200);
})();
})();
