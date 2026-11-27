/* ============================================================
 * © Blind Talent — মনের আলো (Light of Mind)
 * মালিক: Md Robiul Islam Hawlader ও H. M. Samrat
 * এই কোড মালিকানাধীন ও সর্বস্বত্ব সংরক্ষিত। লিখিত অনুমতি ছাড়া কপি,
 * পরিবর্তন বা পুনঃব্যবহার করা থেকে বিরত থাকুন। অননুমোদিত ব্যবহারে
 * আইনি ব্যবস্থা নেওয়া হতে পারে।
 * Proprietary and confidential. Unauthorized copying, modification
 * or redistribution of this file is prohibited without written
 * permission from the owners.
 * ============================================================ */
(function(){
"use strict";
if(window.__LOM_C)return;window.__LOM_C=1;
try{
const $=function(i){return document.getElementById(i)};
const app=$("lzApp");if(!app)return;
const REPO="robiultalent-bot/Mdrobiulislam-Hawlader";
const APK="https://github.com/"+REPO+"/releases/latest/download/app-release.apk";
const SITE="https://robiultalent-bot.github.io/lightofmind-official/";
const P=[
 {n:"এমডি রবিউল ইসলাম হাওলাদার",r:"মূল ডেভেলপার",m:"bWRyb2JpdWxpc2xhbWhhd2xhZGVyMEBnbWFpbC5jb20=",w:"ODgwMTgyOTkxMTk5NQ=="},
 {n:"এইচ. এম. সম্রাট",r:"পার্টনার",m:"bTI4Mjk5Nzk5QGdtYWlsLmNvbQ==",w:"ODgwMTg3NDU3OTgyNA=="}
];
const LINKS=[
 ["▶ ব্লাইন্ড ট্যালেন্ট অফিশিয়াল (ইউটিউব)","https://www.youtube.com/@BLIND_TALENT_OFFICIAL"],
 ["🌐 আমাদের ওয়েবসাইট",SITE],
 ["▶ হালাল ফান টিভি ১৯ (ইউটিউব)","https://youtube.com/@officialhalalfuntv19"],
 ["▶ ইমোশনাল ভয়েস ২৬ (ইউটিউব)","https://youtube.com/@emotionalvoice26"],
 ["✈ টেলিগ্রাম চ্যানেল","https://t.me/hlft19"]
];
const PRIV="<h3>১. আমরা কারও ব্যক্তিগত তথ্য চাই না</h3><p>মনের আলো কখনো আপনার এনআইডি (জাতীয় পরিচয়পত্র), পাসপোর্ট, ব্যক্তিগত ছবি, ঠিকানা, ব্যাংক বা কার্ডের তথ্য চায় না। কেউ আমাদের নাম করে এসব চাইলে দেবেন না। আমাদের জানাবেন।</p><h3>২. আপনার ফোনে যা থাকে</h3><p>আপনার নাম, গেমের অগ্রগতি, সেটিংস ও তারা-র হিসাব আপনার নিজের ফোনেই থাকে। অ্যাপ মুছে ফেললে এগুলোও মুছে যায়।</p><h3>৩. ক্যামেরা, মাইক ও অনুমতি</h3><p>ক্যামেরা ও মাইক শুধু সেই সুবিধা চালানোর সময়ই লাগে, যেমন এক্সপ্লোর মোড, ভিডিও স্টুডিও আর কথা বলে লেখা। আমরা আপনার ছবি বা কণ্ঠ জমা করে রাখি না। অনুমতি আপনি ফোনের সেটিংস থেকে যেকোনো সময় বন্ধ করতে পারেন।</p><h3>৪. অনলাইনে যা যেতে পারে</h3><p>মাইন্ড এআই সহকারীকে প্রশ্ন করলে সেই লেখা উত্তর তৈরির জন্য অনলাইন এআই সেবায় যায়। তাই সেখানে ব্যক্তিগত তথ্য লিখবেন না। কিছু সুবিধায় (যেমন নোটিশ, রেটিং, বিজ্ঞাপনের হিসাব) নাম-পরিচয় ছাড়া সাধারণ তথ্য অনলাইনে জমা হতে পারে।</p><h3>৫. বিজ্ঞাপন</h3><p>অ্যাপ চালু রাখতে কিছু বিজ্ঞাপন দেখানো হয়। বিজ্ঞাপন দেখানোর কাজ করে গুগল অ্যাডমব। তারা তাদের নিজস্ব নীতি অনুযায়ী বিজ্ঞাপনের জন্য ডিভাইসের বিজ্ঞাপন-আইডি ব্যবহার করতে পারে। ফোনের সেটিংস থেকে এটি বন্ধ করা যায়।</p><h3>৬. চলাফেরার নিরাপত্তা ও দায়মুক্তি</h3><p>মাইন্ড এআই ও এক্সপ্লোর মোড একটি সহায়ক গাইড মাত্র। এটি সাদা ছড়ি, গাইড বা আপনার নিজের সতর্কতার বিকল্প নয়। চলাফেরায় নিরাপত্তার জন্য আমরা সবসময় সাদা ছড়ি ব্যবহারের অনুরোধ করি। অ্যাপ সব বাধা, গর্ত, যানবাহন বা বিপদ ধরতে পারে না। অ্যাপ ব্যবহারের সময় কেউ আঘাত পেলে বা কোনো ক্ষতি হলে তার দায় আমরা নিতে পারি না।</p><h3>৭. স্বাস্থ্য বিষয়ে</h3><p>ডক্টর মায়া ও মেডিটেশন সুবিধা মনের প্রশান্তির জন্য। এটি চিকিৎসা নয় এবং ডাক্তারের পরামর্শের বিকল্প নয়। শরীর বা মনে গুরুতর সমস্যা থাকলে ডাক্তারের কাছে যান।</p><h3>৮. শিশুদের জন্য</h3><p>শিশুরা অভিভাবকের সঙ্গে থেকে অ্যাপ ব্যবহার করবে।</p><h3>৯. নীতি বদলালে</h3><p>এই নীতি প্রয়োজনে বদলানো হতে পারে। নতুন নীতি এই পাতাতেই থাকবে।</p><h3>১০. যোগাযোগ</h3><p>প্রশ্ন বা অভিযোগ থাকলে অ্যাপের যোগাযোগ পাতা থেকে এমডি রবিউল ইসলাম হাওলাদার বা এইচ. এম. সম্রাটকে জানান। আমরা ব্লাইন্ড ট্যালেন্ট টিম।</p>";
const BN="০১২৩৪৫৬৭৮৯";
const bn=function(n){return String(n).replace(/\d/g,function(d){return BN[d]})};
const norm=function(s){return String(s||"").replace(/[০-৯]/g,function(d){return BN.indexOf(d)}).replace(/\D/g,"")};
const open=function(u){try{const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}catch(e){location.href=u}};
const LOC=function(){return Number(window.__LOM_BUILD)||0};

/* ---------- যোগাযোগ পাতা ---------- */
const con=$("pg_contact");
if(con){
 const bar=con.querySelector(".lzBar");
 let h="";
 P.forEach(function(p,i){
  h+='<div class="lzCard"><h3>'+(i?"🤝 ":"👨‍💻 ")+p.r+'</h3><p><b>'+p.n+'</b> 🇧🇩</p><div class="lzRow">'
   +'<button class="lzBtn" data-act="wa" data-i="'+i+'">💬 হোয়াটসঅ্যাপে মেসেজ করুন: '+p.n+'</button>'
   +'<button class="lzBtn s" data-act="mail" data-i="'+i+'">✉ ইমেইল করুন: '+p.n+'</button></div></div>';
 });
 h+='<div class="lzCard" id="cpCap" hidden></div>';
 h+='<div class="lzCard"><h3>📺 আমাদের চ্যানেল ও ওয়েবসাইট</h3><div class="lzRow">';
 LINKS.forEach(function(l,i){h+='<button class="lzBtn s" data-act="lk" data-i="'+i+'">'+l[0]+'</button>'});
 h+='</div></div>';
 h+='<div class="lzCard"><h3>⬆ আপডেট</h3><div class="lzRow"><button class="lzBtn" data-act="upd">🔄 নতুন সংস্করণ আছে কি না দেখো</button></div><p class="lzSm" id="cpUp" role="status" aria-live="polite"></p></div>';
 h+='<div class="lzCard"><div class="lzRow"><button class="lzBtn s" data-go="privacy">🔒 গোপনীয়তা নীতি (Privacy Policy)</button></div></div>';
 con.innerHTML="";if(bar)con.appendChild(bar);
 con.insertAdjacentHTML("beforeend",h);
}

/* ---------- গোপনীয়তা পাতা ---------- */
app.insertAdjacentHTML("beforeend",'<section class="lzPg" id="pg_privacy" hidden><div class="lzBar"><button class="lzBtn s lzBack" aria-label="ব্যাক, আগের পেজে ফিরে যাও">← ব্যাক (Back)</button><h2>🔒 গোপনীয়তা নীতি</h2></div><div class="lzCard">'+PRIV+'</div></section>');

/* ---------- সেটিংস ও এক্সপ্লোরে সংযোজন ---------- */
const stg=$("pg_settings");
if(stg)stg.insertAdjacentHTML("beforeend",'<div class="lzCard"><h3>⬆ আপডেট ও নীতি</h3><div class="lzRow"><button class="lzBtn" data-act="upd">🔄 আপডেট আছে কি না দেখো</button><button class="lzBtn s" data-go="privacy">🔒 গোপনীয়তা নীতি</button></div><p class="lzSm" id="cpUp2" role="status" aria-live="polite"></p></div>');
const exp=$("pg_explore");
if(exp){
 const bar=exp.querySelector(".lzBar");
 const note='<div class="lzCard"><h3>🚧 কাজ চলছে</h3><p>এক্সপ্লোর মোডের কিছু সুবিধা এখনো তৈরি হচ্ছে, যেমন টাকা চেনা আর বেড়া শনাক্ত করা। সবসময় সাদা ছড়ি ব্যবহার করুন। শুধু অ্যাপের ওপর ভরসা করবেন না।</p></div>';
 if(bar)bar.insertAdjacentHTML("afterend",note);else exp.insertAdjacentHTML("afterbegin",note);
}

/* ---------- ক্লিক ---------- */
let cap=null;
function showCap(i){
 const box=$("cpCap");if(!box)return;
 const a=1+Math.floor(Math.random()*9),b=1+Math.floor(Math.random()*9);
 cap={i:i,s:a+b};
 box.hidden=false;
 box.innerHTML='<h3>ক্যাপচা পূরণ করুন</h3><label for="cpA" class="lzSm">'+bn(a)+' যোগ '+bn(b)+' কত?</label><input id="cpA" inputmode="numeric" autocomplete="off" aria-label="উত্তর লিখুন"><div class="lzRow"><button class="lzBtn" data-act="ok">যাচাই করুন</button></div><p class="lzSm" id="cpMsg" role="status" aria-live="polite"></p>';
 const f=$("cpA");if(f)f.focus();
}
function note(id,t){const e=$(id);if(e)e.textContent=t}
function link(u,t){return t+' <a href="'+u+'" target="_blank" rel="noopener">'}
async function latest(){
 const r=await fetch("https://api.github.com/repos/"+REPO+"/releases/latest",{cache:"no-store"});
 const j=await r.json();const m=/(\d+)/.exec(j.tag_name||"");return m?+m[1]:0;
}
async function check(){
 note("cpUp","দেখছি...");note("cpUp2","দেখছি...");
 try{
  const n=await latest(),l=LOC();
  let t;
  if(!l)t="এই সংস্করণের নম্বর জানা যায়নি। চাইলে নতুন অ্যাপ নামিয়ে নিতে পারো।";
  else if(n>l)t="নতুন সংস্করণ এসেছে। নিচের বোতাম চেপে নামিয়ে নাও।";
  else t="তোমার অ্যাপ সর্বশেষ সংস্করণে আছে।";
  note("cpUp",t);note("cpUp2",t);
  if(!l||n>l){
   document.querySelectorAll("#cpUp,#cpUp2").forEach(function(p){
    if(p.nextElementSibling&&p.nextElementSibling.dataset&&p.nextElementSibling.dataset.dl)return;
    p.insertAdjacentHTML("afterend",'<div class="lzRow" data-dl="1"><button class="lzBtn" data-act="dl">⬇ নতুন সংস্করণ নামাও</button></div>');
   });
  }
 }catch(e){const t="এখন দেখা গেল না। ইন্টারনেট চালু আছে কি না দেখে আবার চেষ্টা করো।";note("cpUp",t);note("cpUp2",t)}
}
app.addEventListener("click",function(e){
 const b=e.target.closest("[data-act]");if(!b)return;
 const k=b.dataset.act,i=+b.dataset.i;
 if(k==="wa")open("https://wa.me/"+atob(P[i].w)+"?text="+encodeURIComponent("আসসালামু আলাইকুম, আমি মনের আলো অ্যাপ থেকে মেসেজ করছি।"));
 else if(k==="mail")showCap(i);
 else if(k==="ok"){
  const v=norm(($("cpA")||{}).value);
  if(cap&&v!==""&&Number(v)===cap.s){open("mailto:"+atob(P[cap.i].m)+"?subject="+encodeURIComponent("মনের আলো অ্যাপ"));note("cpMsg","ঠিক আছে। আপনার ইমেইল অ্যাপ খুলছে।");cap=null}
  else{note("cpMsg","উত্তর ভুল হয়েছে। আবার চেষ্টা করুন।");const f=$("cpA");if(f){f.value="";f.focus()}}
 }
 else if(k==="lk")open(LINKS[i][1]);
 else if(k==="upd")check();
 else if(k==="dl")open(APK);
});

/* ---------- পুরোনো সংস্করণ আটকানো ---------- */
async function enforce(){
 try{
  const l=LOC();if(!l)return;
  const r=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/minbuild.txt?t="+Date.now(),{cache:"no-store"});
  if(!r.ok)return;
  const m=parseInt((await r.text()).trim(),10);
  if(!m||l>=m)return;
  Array.prototype.forEach.call(document.body.children,function(c){try{c.setAttribute("inert","");c.setAttribute("aria-hidden","true")}catch(e){}});
  const d=document.createElement("div");
  d.id="lomForce";d.setAttribute("role","alertdialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","নতুন সংস্করণ দরকার");
  d.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#0d1326;color:#fff;padding:28px 20px;overflow:auto;font:18px/1.8 system-ui,sans-serif";
  d.innerHTML='<h2 style="color:#f2b84b">নতুন সংস্করণ নামাতে হবে</h2><p>এই সংস্করণটি আর চলবে না। নতুন সংস্করণে অনেক উন্নতি ও ভুল সংশোধন আছে। নিচের বোতাম চেপে নতুন অ্যাপ নামিয়ে নাও।</p><button id="lomForceBtn" style="display:block;width:100%;padding:18px;font-size:20px;border:0;border-radius:14px;background:#f2b84b;color:#000">⬇ নতুন সংস্করণ নামাও</button>';
  document.body.appendChild(d);d.removeAttribute("inert");d.removeAttribute("aria-hidden");
  const bt=$("lomForceBtn");bt.onclick=function(){open(APK)};bt.focus();
 }catch(e){}
}
setTimeout(enforce,2500);
}catch(e){try{console.error("lomcontact",e)}catch(_){}}
})();
