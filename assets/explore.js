      if(OBJ_DUP[k]&&Date.now()-OBJ_ON<5000)return;
      if(SC[k]&&!seen[k]){seen[k]=1;out.push(k)}
    });
    return out;
  }
  return {id:"scene",mask:16,
    reset:function(){hist={L:[],C:[],R:[]};sig="";lastT=0;roadT=0},
    tick:function(r){
      if(!r.scene)return null;
      const cur={};
      ["L","C","R"].forEach(function(z){
        hist[z].push(names(z,r));if(hist[z].length>3)hist[z].shift();
        const cnt={};
        hist[z].forEach(function(a){a.forEach(function(k){cnt[k]=(cnt[k]||0)+1})});
        cur[z]=Object.keys(cnt).filter(function(k){return cnt[k]>=2}).slice(0,2);
      });
      const nm=function(a){return a.map(function(k){return SC[k]}).join(" ও ")};
      const parts=[];
      if(cur.C.length)parts.push("সামনে "+nm(cur.C));
      if(cur.R.length)parts.push("ডান দিকে "+nm(cur.R));
      if(cur.L.length)parts.push("বাম দিকে "+nm(cur.L));
      const k=parts.join("|");
      if(!k||k===sig||Date.now()-lastT<3500||money.present)return null;
      const road=[].concat(cur.L,cur.C,cur.R).some(function(x){return ROAD[x]});
      let t=parts.join("। ");
      if(road&&Date.now()-roadT>25000)t+="। রাস্তায় সাবধানে পা ফেলুন, ছড়ি দিয়ে দেখে চলুন";
      return {p:4,t:t,commit:function(){sig=k;lastT=Date.now();if(road&&t.indexOf("ছড়ি")>=0)roadT=Date.now()}};
    }};
})();
[money,text,barcode,person,objs,scene].forEach(X.register);

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
async function watchAd(){
  const A=window.__LOM_ADS;
  const test=(A&&A.cfg&&typeof A.cfg.TEST==="boolean")?A.cfg.TEST:CFG.AD_TEST;
  const unit=test?CFG.AD_TEST_UNIT:CFG.AD_UNIT;
  if(!native()){await sleep(2500);return {ok:true,err:""}}
  let loaded=false,err="";
  for(let i=0;i<4&&!loaded;i++){
    let r=null;try{r=await nat("adLoad",unit)}catch(e){}
    if(r===true){loaded=true;break}
    err=typeof r==="string"?r:"E?";
    await sleep(2500);
  }
  if(!loaded)return {ok:false,err:err};
  let ok=false;try{ok=(await nat("adShow"))===true}catch(e){}
  try{nat("adLoad",unit).catch(function(){})}catch(e){}
  return {ok:ok,err:ok?"":"show"};
}
function adMsg(c){
  if(c==="E3")return "এখন কোনো বিজ্ঞাপন পাওয়া যাচ্ছে না। নতুন অ্যাড আইডিতে প্রথম কিছু ঘণ্টা বা দিন এমন হয়। পরে আবার চেষ্টা করুন।";
  if(c==="E2")return "ইন্টারনেট নেই বা খুব দুর্বল। ইন্টারনেট দেখে আবার চেষ্টা করুন।";
  if(c==="E1")return "অ্যাড আইডিতে সমস্যা আছে। ডেভেলপারকে জানান।";
  if(c==="E0")return "অ্যাড সার্ভারে সাময়িক সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।";
  return "অ্যাড লোড হয়নি। ত্রুটির কোড "+c.replace(/[^0-9A-Za-z?]/g,"")+"। আবার চেষ্টা করুন।";
}
async function adCoins(){
  await sayW("অ্যাড আসছে। একটু অপেক্ষা করুন।");
  const r=await watchAd();
  if(r.ok){lsS(K_COINS,coins()+CFG.PER_AD);paintInfo();say("ধন্যবাদ! আপনি "+B(CFG.PER_AD)+" কয়েন পেয়েছেন।")}
  else if(r.err==="show")say("অ্যাড সম্পূর্ণ দেখা হয়নি, তাই কয়েন যোগ হয়নি। আবার চেষ্টা করুন।");
  else{setSt("xSt","অ্যাড ত্রুটি: "+r.err);say(adMsg(r.err))}
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
  [money,text,barcode,person,objs,scene].forEach(function(m){m.reset()});
  beeper.ensure();setSt("xSt","ক্যামেরা চালু হচ্ছে...");
  try{await camOn()}catch(e){
    S.active=false;setSt("xSt","ক্যামেরা চালু হয়নি");
    say("ক্যামেরা চালু করা যায়নি। ক্যামেরার অনুমতি দিয়েছেন কিনা দেখুন।");return;
  }
  if(id!==S.id){camOff();return}
  setSt("xSt","এক্সপ্লোর মোড চালু");
  await sayW("এক্সপ্লোর মোড চালু। আমি সামনের টাকা, লেখা, বারকোড, মানুষ ও আশেপাশের জিনিস নিজে থেকেই জানাব। বন্ধ করতে বন্ধ বাটনে ডাবল ট্যাপ করুন।");
  S.timer=setInterval(function(){lightTick(S)},4000);lightTick(S);
  await loop(id);
}
async function loop(id){
  const mask=X.mods.reduce(function(m,x){return m|x.mask},0);
  let n=0;
  while(id===S.id){
    const pm=S.pend.shift();
    if(pm){await sayW(pm);continue}
    const f=grab(800);
    if(!f){await sleep(300);continue}
    let r=null;
    try{r=await nat("scan",f,(++n%2)?mask:(mask&~16))}catch(e){
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
    await sleep(100);
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
