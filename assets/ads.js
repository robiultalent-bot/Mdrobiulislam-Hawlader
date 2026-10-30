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
const TEST=false;   // true = Google-এর টেস্ট অ্যাড (প্রিভিউয়ের জন্য)।  আসল অ্যাডের জন্য false করো
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
