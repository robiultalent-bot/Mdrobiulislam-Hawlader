/* =====================================================================
   মনের আলো · অ্যাড ও কয়েন মডিউল v1 (AdMob রিওয়ার্ড অ্যাড)
   নিয়ম: প্রথম ১০ লেভেল বিনা কয়েনে। এরপর প্রতি লেভেলে ১ কয়েন লাগে।
   কয়েন শেষ হলে ব্যবহারকারী নিজে দুবার ট্যাপ করে একটা অ্যাড দেখলে ২ কয়েন পায়।
   ===================================================================== */
(function(){
"use strict";
if(window.__LOM_ADS)return;
try{if(!localStorage.getItem("lom_cloud_v1"))localStorage.setItem("lom_cloud_v1","https://sonicmind-72928-default-rtdb.firebaseio.com")}catch(e){}

/* ---------- এখানে শুধু এই কয়েকটা সংখ্যা বদলালেই চলে ---------- */
const TEST=true;   // true = Google-এর টেস্ট অ্যাড (প্রিভিউয়ের জন্য)।  আসল অ্যাডের জন্য false করো
const REAL_UNIT="ca-app-pub-5481902015314492/1747625034";
const TEST_UNIT="ca-app-pub-3940256099942544/5224354917";
const FREE=10;     // প্রথম এত লেভেল বিনা কয়েনে
const COST=1;      // প্রতি লেভেলে কয়েন খরচ
const PER_AD=2;    // প্রতি অ্যাডে কয়েন পাওয়া
/* ---------------------------------------------------------------- */

const KEY="lom_coins_v1",PAID="lom_paid_lv";
let coins=0,paid=0;
try{coins=Math.max(0,parseInt(localStorage.getItem(KEY)||"0",10)||0);paid=parseInt(localStorage.getItem(PAID)||"0",10)||0}catch(e){}
const unit=()=>TEST?TEST_UNIT:REAL_UNIT;
const save=()=>{try{localStorage.setItem(KEY,String(coins));localStorage.setItem(PAID,String(paid))}catch(e){}};
const native=()=>!!(window.flutter_inappwebview&&window.AndroidTTS);
const nat=(n,a)=>window.flutter_inappwebview.callHandler(n,a);

/* কয়েনের ব্যাজ */
const badge=document.createElement("div");
badge.style.cssText="position:fixed;top:6px;right:8px;z-index:50;padding:4px 10px;border-radius:14px;background:rgba(255,215,120,.18);color:#ffd778;font:600 15px sans-serif;pointer-events:none";
function paint(){badge.textContent="🪙 "+bn(coins);badge.setAttribute("aria-label","কয়েন "+bn(coins))}
document.body.appendChild(badge);paint();

async function ready(){
  if(!native())return true;
  for(let i=0;i<3;i++){
    try{if((await live(nat("adLoad",unit())))===true)return true}catch(e){}
    await live(new Promise(r=>setTimeout(r,3000)));
  }
  return false;
}
async function watch(){
  try{cancelVoice()}catch(e){}
  if(!native()){await live(new Promise(r=>setTimeout(r,2500)));return true} // ব্রাউজারে প্রিভিউ: নকল অ্যাড
  if(!(await ready()))return false;
  let ok=false;
  try{ok=(await live(nat("adShow")))===true}catch(e){}
  try{AC&&AC.resume()}catch(e){}
  try{nat("adLoad",unit()).catch(()=>0)}catch(e){} // পরের অ্যাড আগেই লোড
  return ok;
}
async function gate(l){
  if(l<=FREE||DEV||paid===l)return;
  for(;;){
    if(coins>=COST){coins-=COST;paid=l;save();paint();return}
    await ask(`${name}, পরের লেভেলে যেতে ${bn(COST)}টা কয়েন লাগে। তোমার কয়েন এখন ${bn(coins)}টা। একটা ছোট অ্যাড দেখলে ${bn(PER_AD)}টা কয়েন পাবে। অ্যাড দেখতে দুবার ট্যাপ করো।`,["dbl"]);
    await say("অ্যাড আসছে। একটু অপেক্ষা করো।");
    if(await watch()){
      coins+=PER_AD;save();paint();
      await speak(`ধন্যবাদ ${name}! তুমি ${bn(PER_AD)}টা কয়েন পেয়েছো। এখন তোমার কয়েন ${bn(coins)}টা।`);
    }else{
      await speak("এখন অ্যাড পাওয়া যাচ্ছে না। ইন্টারনেট ঠিক আছে কিনা দেখো, তারপর আবার চেষ্টা করো।");
    }
  }
}
const _rl=runLevel;
runLevel=function(l){return gate(l).then(()=>_rl(l))};
if(native())setTimeout(()=>{try{nat("adLoad",unit()).catch(()=>0)}catch(e){}},4000);

window.__LOM_ADS={get coins(){return coins},setCoins(n){coins=n;save();paint()},gate,watch,cfg:{TEST,FREE,COST,PER_AD}};
})();

(function(){
"use strict";
if(window.__LOM_EXTRA)return;window.__LOM_EXTRA=1;

const TITLE="🧠 মাইন্ড এআই (স্মার্ট গাইড)";
const DISC="প্রিয় ব্যবহারকারী, এই ডিজিটাল গাইড অ্যাপ্লিকেশনটি আপনার দৈনন্দিন চলাফেরা ও পরিবেশ অনুধাবনে সহায়তার উদ্দেশ্যে অত্যন্ত যত্নের সাথে তৈরি করা হয়েছে। তবে অনুগ্রহ করে মনে রাখবেন, এটি কোনোভাবেই মানবীয় সচেতনতা, দৃষ্টিশক্তি কিংবা অভিজ্ঞ গাইডের বিকল্প নয়। এটি কেবল আপনার যাত্রাকে কিছুটা সহজ করার একটি আধুনিক প্রযুক্তিগত মাধ্যম মাত্র। আপনার ব্যক্তিগত নিরাপত্তা ও সার্বিক সুরক্ষার স্বার্থে যাতায়াতের সময় সর্বদা সাদা ছড়ি ব্যবহারের জন্য বিশেষভাবে অনুরোধ করা হচ্ছে।";
const SOON=[
 ["💵 মানি রিডার (২ থেকে ১০০০ টাকা)","ক্যামেরায় টাকার নোট চেনা"],
 ["🛒 আজকের বাজার দর","অনলাইনে এলে দর জমা হবে, অফলাইনেও দেখা যাবে"],
 ["👤 ব্যক্তি চেনা ও স্মৃতি","কাকে কবে কোথায় দেখা গেছে মনে রাখা"],
 ["🤳 ভয়েস গাইডেড সেলফি","ফোন ডানে বামে ঘোরানোর নির্দেশনা"],
 ["🔎 হারানো জিনিস খোঁজা","৩০ সেকেন্ডের সার্চিং সাউন্ড"],
 ["🔦 অটো লাইট ও টর্চ","আলো কম হলে জানানো"]
];

function nm(){const e=document.getElementById("lzName");return(e&&e.textContent.trim())||"বন্ধু"}
function stopSay(){try{cancelVoice()}catch(e){}try{if("speechSynthesis" in window)speechSynthesis.cancel()}catch(e){}}
function say(t){
  stopSay();
  try{if(typeof ntSpeak==="function"){ntSpeak(t,0);return}}catch(e){}
  try{const u=new SpeechSynthesisUtterance(t);u.lang="bn-BD";speechSynthesis.speak(u)}catch(e){}
}
function welcome(){return "প্রিয় "+nm()+", তুমি এখানে এসেছো, এটাই একটা সুন্দর শুরু। প্রতিটা ছোট পদক্ষেপই তোমার সাহস আর শক্তির পরিচয়। আমরা ধাপে ধাপে তোমার পাশে আছি।"}

function build(){
  const app=document.getElementById("lzApp"),home=document.getElementById("pg_home");
  if(!app||!home||document.getElementById("pg_mind"))return !!document.getElementById("pg_mind");
  const ex=home.querySelector('[data-go="explore"]');if(!ex)return false;

  const btn=document.createElement("button");
  btn.className="lzBig";btn.id="lzMindBtn";btn.setAttribute("data-go","mind");btn.textContent=TITLE;
  ex.insertAdjacentElement("afterend",btn);

  const sec=document.createElement("section");
  sec.className="lzPg";sec.id="pg_mind";sec.hidden=true;
  let h='<div class="lzBar"><button class="lzBtn s lzBack" aria-label="ব্যাক, আগের পেজে ফিরে যাও">← ব্যাক (Back)</button><h2>'+TITLE+'</h2></div>';
  h+='<div class="lzCard"><h3>💛 স্বাগতম</h3><p id="mindWel"></p><div class="lzRow"><button class="lzBtn" id="mindSay">🔊 আবার শোনো</button><button class="lzBtn s" id="mindStop">⏹ থামাও</button></div></div>';
  h+='<div class="lzCard"><h3>⚠ গুরুত্বপূর্ণ বার্তা</h3><p id="mindDisc"></p><div class="lzRow"><button class="lzBtn s" id="mindDiscSay">🔊 বার্তাটি শোনো</button></div></div>';
  h+='<div class="lzCard"><h3>🚧 শীঘ্রই আসছে</h3><p>নিচের ফিচারগুলো ধাপে ধাপে যুক্ত হবে। এখনো চালু হয়নি।</p>';
  SOON.forEach(function(x){h+='<div class="lzMsg"><b>'+x[0]+'</b><br>'+x[1]+'</div>'});
  h+='</div>';
  sec.innerHTML=h;app.appendChild(sec);
  document.getElementById("mindDisc").textContent=DISC;

  const q=function(i){return document.getElementById(i)};
  q("mindSay").onclick=function(){say(welcome())};
  q("mindStop").onclick=stopSay;
  q("mindDiscSay").onclick=function(){say(DISC)};

  new MutationObserver(function(){
    if(sec.hidden){stopSay();return}
    q("mindWel").textContent=welcome();
    say(welcome()+" "+DISC);
  }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  return true;
}
let n=0;
(function wait(){if(build()||++n>100)return;setTimeout(wait,200)})();
})();
