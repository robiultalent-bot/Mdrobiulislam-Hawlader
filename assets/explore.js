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
