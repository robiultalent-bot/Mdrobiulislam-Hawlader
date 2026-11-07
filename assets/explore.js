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
