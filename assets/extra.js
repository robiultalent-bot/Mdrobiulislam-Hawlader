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
