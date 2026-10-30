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
