/* মনের আলো · গেম ২: অডিও কার রেস
   শুনে চালানো গাড়ির গেম। ফোন কাত করে লেন বদলানো যায়, বোতামেও যায়।
   কণ্ঠ: ফোনের নিজের টিটিএস, ইচ্ছেমতো ইঞ্জিন ও কণ্ঠ বাছা যায়। */
(function(){
"use strict";
if(window.__CRG)return;window.__CRG=1;

/* ---------- এখানের সংখ্যা বদলালেই গেমের হিসাব বদলায় ---------- */
const RUN_SEC=120;      // একবার দৌড়ের সময়, সেকেন্ডে
const REPAIR=50;        // কয়েন দিয়ে গাড়ি মেরামতের খরচ
const AD_COINS=100;     // একটা অ্যাডে কত কয়েন
const DAILY=50;         // প্রতিদিনের প্রথম বোনাস
const MAXLV=10;         // স্পিড বাড়ানোর সর্বোচ্চ ধাপ
const TILT=13;          // কত ডিগ্রি কাত করলে লেন বদলাবে
const DISC_MAX=6;       // একটা গাড়িতে সর্বোচ্চ কতবার অ্যাড দেখে ছাড়, প্রতিবার ৫%
const UNLOCK=150;       // রং বা হর্ন আনলকের কয়েন
const CARS=[
  {n:"ছোট সবুজ গাড়ি",p:0,s:1,hz:60,cm:1,sh:0,d:"শুরুর গাড়ি। ধীর, কিন্তু শেখার জন্য ভালো।"},
  {n:"হ্যাচব্যাক",p:600,s:1.3,hz:68,cm:1,sh:0,d:"হালকা আর চটপটে। গতি একটু বেশি।"},
  {n:"সেডান",p:2000,s:1.6,hz:76,cm:1.1,sh:0,d:"আরামদায়ক পারিবারিক গাড়ি। প্রতি পারাপারে দশ শতাংশ বেশি কয়েন।"},
  {n:"মাইক্রোবাস",p:10000,s:1.8,hz:64,cm:1.2,sh:1,d:"বড় আর মজবুত। প্রতি দৌড় শুরু হয় ঢাল নিয়ে। কুড়ি শতাংশ বেশি কয়েন।"},
  {n:"স্পোর্টস গাড়ি",p:25000,s:2.2,hz:90,cm:1.3,sh:0,d:"দ্রুত আর ঝকঝকে। ত্রিশ শতাংশ বেশি কয়েন।"},
  {n:"রেসিং গাড়ি",p:60000,s:2.6,hz:105,cm:1.5,sh:1,d:"রেসের জন্য বানানো। ঢাল নিয়ে শুরু। পঞ্চাশ শতাংশ বেশি কয়েন।"},
  {n:"সুপার জেট গাড়ি",p:150000,s:3.2,hz:125,cm:2,sh:1,d:"সবচেয়ে দ্রুত। ঢাল নিয়ে শুরু। কয়েন দ্বিগুণ।"}
];
const COLORS=["সবুজ","লাল","নীল","হলুদ","বেগুনি","সাদা","কালো","কমলা","গোলাপি","সোনালি"];
const HORNS=["সাধারণ হর্ন","মধুর হর্ন","ট্রাকের হর্ন","পুলিশের সাইরেন"];
const OBS=[
  {n:"গাড়ি",hz:190,ty:"square"},
  {n:"মানুষ",hz:330,ty:"triangle"},
  {n:"ট্রাক",hz:110,ty:"sawtooth"},
  {n:"গর্ত",hz:150,ty:"sine"}
];
/* ------------------------------------------------------------- */

const $=i=>document.getElementById(i);
const KEY="crg_v3";
let S={coins:0,own:[0],car:0,lv:{},col:{},best:0,total:0,day:"",eng:"",vo:null,rate:0,runs:0,disc:{},cols:[0],hornOwn:[0],horn:0};
try{const j=JSON.parse(localStorage.getItem(KEY)||"null");if(j)S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const B=n=>{try{return typeof bn==="function"?bn(n):String(n)}catch(e){return String(n)}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const speedOf=c=>CARS[c].s*(1+0.12*(S.lv[c]||0));
const LANE=["বাঁয়ে","মাঝে","ডানে"];

/* কয়েন: অ্যাড মডিউলের কয়েনই ব্যবহার হয়, যাতে দুই গেমের কয়েন এক থাকে */
function coins(){try{if(window.__LOM_ADS)return window.__LOM_ADS.coins|0}catch(e){}return S.coins|0}
function setCoins(n){n=Math.max(0,n|0);try{if(window.__LOM_ADS){window.__LOM_ADS.setCoins(n);return}}catch(e){}S.coins=n;save()}
function addCoins(d){setCoins(coins()+d)}

/* ---------- কণ্ঠ ---------- */
const hasNT=()=>{try{return typeof NT!=="undefined"&&typeof ntCall==="function"&&typeof ntPayload==="function"}catch(e){return false}};
async function ensureTts(){
  try{if(hasNT()&&!NT.on&&typeof ntAvail==="function"&&ntAvail()&&typeof ntInit==="function")await ntInit(S.eng||"")}catch(e){}
}
function say(t){
  try{if(hasNT()&&NT.on){
    const p=ntPayload(t,0);
    if(S.vo&&S.vo.name){p.lang=S.vo.lang;p.voice={name:S.vo.name,locale:S.vo.lang}}
    if(S.rate)p.rate=S.rate;
    return ntCall("ttsSpeak",p).catch(()=>{});
  }}catch(e){}
  try{const u=new SpeechSynthesisUtterance(t);u.lang="bn-BD";speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}
  return Promise.resolve();
}
function hush(){try{if(hasNT()&&NT.on)ntCall("ttsStop",null)}catch(e){}try{speechSynthesis.cancel()}catch(e){}}

/* ---------- শব্দ ---------- */
let AC=null,hum=null;
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(freq,dur,pan,vol,type,slide){
  const a=ac();if(!a)return;
  try{
    const o=a.createOscillator(),g=a.createGain();
    o.type=type||"square";o.frequency.value=freq;
    if(slide)o.frequency.linearRampToValueAtTime(freq*slide,a.currentTime+dur);
    g.gain.value=vol||0.1;g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
    o.connect(g);
    if(a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=pan||0;g.connect(p);p.connect(a.destination)}else g.connect(a.destination);
    o.start();o.stop(a.currentTime+dur+0.02);
  }catch(e){}
}
function humStart(hz){
  const a=ac();if(!a||hum)return;
  try{
    const o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();
    o.type="sawtooth";o.frequency.value=hz;f.type="lowpass";f.frequency.value=260;g.gain.value=0.025;
    o.connect(f);f.connect(g);g.connect(a.destination);o.start();hum={o,g};
  }catch(e){}
}
function humSet(hz){try{if(hum)hum.o.frequency.value=hz}catch(e){}}
function humStop(){try{if(hum){hum.o.stop();hum=null}}catch(e){hum=null}}
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};

/* ---------- অ্যাড ---------- */
async function watchAd(){
  try{if(window.__LOM_ADS&&window.__LOM_ADS.watch)return await window.__LOM_ADS.watch()}catch(e){}
  await sleep(2500);return true;
}
async function adCoins(){
  await say("অ্যাড আসছে। একটু অপেক্ষা করো।");
  const ok=await watchAd();
  if(ok){addCoins(AD_COINS);await say("তুমি "+B(AD_COINS)+" কয়েন পেয়েছো। এখন কয়েন "+B(coins()))}
  else await say("এখন অ্যাড পাওয়া যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করো।");
  return ok;
}

/* ---------- পর্দা ---------- */
let root=null;
async function open(){
  if(root)root.remove();
  root=document.createElement("div");root.id="crg";
  root.style.cssText="position:fixed;inset:0;z-index:99999;background:#0b1020;color:#f2f2f2;overflow:auto;padding:14px;font:600 19px/1.5 sans-serif";
  document.body.appendChild(root);
  ac();
  await ensureTts();
  const today=new Date().toISOString().slice(0,10);
  if(S.day!==today){S.day=today;save();addCoins(DAILY);menu("আজকের প্রথম বোনাস "+B(DAILY)+" কয়েন পেয়েছো।");}
  else menu("");
}
function close(){stopRun();if(root){root.remove();root=null}hush()}
function btn(label,fn,aria){
  const b=document.createElement("button");
  b.textContent=label;if(aria)b.setAttribute("aria-label",aria);
  b.style.cssText="display:block;width:100%;margin:10px 0;padding:18px;font:700 20px sans-serif;border-radius:14px;border:2px solid #ffd778;background:#1b2440;color:#fff";
  b.onclick=fn;return b;
}
function screen(title,intro,buttons){
  root.innerHTML="";
  const h=document.createElement("div");h.textContent=title;h.setAttribute("tabindex","-1");
  h.style.cssText="font:800 24px sans-serif;margin:6px 0 10px";root.appendChild(h);
  if(intro){const p=document.createElement("div");p.textContent=intro;root.appendChild(p)}
  buttons.forEach(b=>root.appendChild(b));
  try{h.focus()}catch(e){}
}
function rank(){const b=S.best;return b<10?"নতুন চালক":b<30?"দক্ষ চালক":b<80?"রেসার":"চ্যাম্পিয়ন"}
function menu(extra){
  const c=CARS[S.car];
  screen("অডিও কার রেস",(extra?extra+" ":"")+"কয়েন "+B(coins())+"। গাড়ি: "+c.n+", রং "+COLORS[S.col[S.car]||0]+", স্পিড ধাপ "+B(S.lv[S.car]||0)+"। র‍্যাংক: "+rank()+"। সেরা স্কোর "+B(S.best)+"। "+offerLine(),[
    btn("দৌড় শুরু করো",startRun),
    btn("গাড়ির শোরুম: কেনো, অফার দেখো",showroom),
    btn("আমার গাড়ি সাজাও: রং, হর্ন, স্পিড",customize),
    btn("অ্যাড দেখে "+B(AD_COINS)+" কয়েন নাও",async()=>{await adCoins();menu("")}),
    btn("কণ্ঠ বাছাই: টিটিএস ইঞ্জিন, ভয়েস, গতি",voiceMenu),
    btn("কীভাবে খেলতে হয়",how),
    btn("গেম বন্ধ করো",close)
  ]);
}
function how(){
  screen("কীভাবে খেলতে হয়","ফোন সোজা করে ধরো, পর্দা তোমার দিকে। তিনটা লেন: বাঁয়ে, মাঝে, ডানে। কণ্ঠ বলবে প্রতি লেনে কী আছে। যেমন, বাঁয়ে গাড়ি, মাঝে ফাঁকা, ডানে কয়েন। গাড়ি, মানুষ, ট্রাক, গর্ত হলো বাধা। কয়েন আর ঢাল হলো উপহার। যে লেনে যেতে চাও, ফোনটা সেদিকে কাত করো। বাঁয়ে কাত করলে বাঁয়ে যাবে। সোজা করলে মাঝে। ডানে কাত করলে ডানে। কাত করা কঠিন হলে তিনটা বোতামেও যেতে পারবে। বাধার লেনে থাকলে ধাক্কা লাগবে। ঢাল থাকলে একবার বেঁচে যাবে। ধাক্কা লাগলে কয়েন দিয়ে বা অ্যাড দেখে গাড়ি ঠিক করে আবার চালাতে পারবে। দৌড় যত এগোবে, গতি তত বাড়বে, কয়েনও তত বেশি পাবে। কয়েন জমিয়ে শোরুম থেকে নতুন গাড়ি কিনতে পারবে। রং আর হর্ন দিয়ে গাড়ি সাজাতে পারবে।",[btn("ফিরে যাও",()=>menu(""))]);
}

/* ---------- কণ্ঠ বাছাই ---------- */
function voiceMenu(){
  const bs=[];
  const nt=hasNT()&&NT.on;
  const cur=S.vo&&S.vo.name?S.vo.name:"ডিফল্ট";
  if(nt){
    bs.push(btn("ইঞ্জিন বাছো (এখন: "+(S.eng||NT.engine||"ডিফল্ট")+")",engineMenu));
    bs.push(btn("ভয়েস বাছো (এখন: "+cur+")",langMenu));
  }else bs.push(btn("এই ফোনে টিটিএস বাছা যায়নি। ব্রাউজারের কণ্ঠ চলছে।",()=>say("এখানে ব্রাউজারের কণ্ঠ চলছে")));
  const rates=[["ধীর",0.35],["স্বাভাবিক",0.5],["দ্রুত",0.7],["খুব দ্রুত",0.9]];
  rates.forEach(r=>bs.push(btn("কথার গতি: "+r[0]+(Math.abs((S.rate||0.5)-r[1])<0.01?" (এখন)":""),()=>{S.rate=r[1];save();say("কথার গতি "+r[0]);voiceMenu()})));
  bs.push(btn("ডিফল্ট কণ্ঠে ফিরে যাও",()=>{S.vo=null;S.rate=0;save();say("ডিফল্ট কণ্ঠ");voiceMenu()}));
  bs.push(btn("ফিরে যাও",()=>menu("")));
  screen("কণ্ঠ বাছাই","খেলার সব কথা এই কণ্ঠে বলা হবে। বাংলা কণ্ঠ বাছলে বাংলা ঠিক পড়বে।",bs);
}
function engineMenu(){
  const bs=(NT.engines||[]).map(e=>btn(e+(e===(S.eng||NT.engine)?" (এখন)":""),async()=>{
    S.eng=e;S.vo=null;save();
    try{await ntInit(e)}catch(x){}
    say("এই ইঞ্জিনে কণ্ঠ শোনা যাচ্ছে");voiceMenu();
  }));
  if(!bs.length)bs.push(btn("কোনো ইঞ্জিন পাওয়া যায়নি",()=>voiceMenu()));
  bs.push(btn("ফিরে যাও",voiceMenu));
  screen("টিটিএস ইঞ্জিন","ফোনে যতগুলো আছে, সব এখানে। গুগল, স্যামসাং বা অন্য কিছু।",bs);
}
function langMenu(){
  const m={};(NT.voices||[]).forEach(v=>{const k=(v.lang||"").split(/[-_]/)[0].toLowerCase();m[k]=(m[k]||0)+1});
  const names={bn:"বাংলা",en:"ইংরেজি",hi:"হিন্দি",ja:"জাপানি",ar:"আরবি",ur:"উর্দু",es:"স্পেনীয়",fr:"ফরাসি",de:"জার্মান",zh:"চীনা",ko:"কোরিয়ান",ru:"রুশ",tr:"তুর্কি",id:"ইন্দোনেশীয়",ta:"তামিল",pt:"পর্তুগিজ",it:"ইতালীয়"};
  const bs=Object.keys(m).sort((a,b)=>(a==="bn"?-1:b==="bn"?1:a<b?-1:1)).map(k=>btn((names[k]||k)+", "+B(m[k])+"টা ভয়েস",()=>voiceList(k)));
  if(!bs.length)bs.push(btn("কোনো ভয়েস পাওয়া যায়নি",voiceMenu));
  bs.push(btn("ফিরে যাও",voiceMenu));
  screen("কোন ভাষার ভয়েস","ভাষা বাছো। তারপর ভয়েসের তালিকা আসবে।",bs);
}
function voiceList(k){
  const vs=(NT.voices||[]).filter(v=>(v.lang||"").toLowerCase().split(/[-_]/)[0]===k).slice(0,40);
  const bs=vs.map(v=>btn(v.name+", "+v.lang+(v.fem===true?", নারী":v.fem===false?", পুরুষ":"")+(v.localService?"":", অনলাইন"),()=>{
    S.vo={name:v.name,lang:v.lang};save();
    say("এই কণ্ঠে খেলা চলবে। বাঁয়ে গাড়ি, মাঝে ফাঁকা, ডানে কয়েন।");
  }));
  bs.push(btn("ফিরে যাও",langMenu));
  screen("ভয়েস বাছো","একটা বোতামে ডাবল ট্যাপ করলে কণ্ঠ বাছা হবে আর শোনাবে।",bs);
}

/* ---------- শোরুম ---------- */
const price=i=>Math.round(CARS[i].p*(1-0.05*(S.disc[i]||0)));
function offer(){
  let best=-1;
  CARS.forEach((c,i)=>{if(!S.own.includes(i)&&price(i)<=coins()&&(best<0||price(i)>price(best)))best=i});
  if(best>=0)return{ok:true,i:best};
  let nx=-1;CARS.forEach((c,i)=>{if(!S.own.includes(i)&&(nx<0||price(i)<price(nx)))nx=i});
  return nx>=0?{ok:false,i:nx}:null;
}
function offerLine(){
  const o=offer();if(!o)return "সব গাড়ি তোমার! তুমি চ্যাম্পিয়ন।";
  return o.ok?"তোমার জন্য অফার অপেক্ষা করছে: "+CARS[o.i].n+", দাম "+B(price(o.i))+" কয়েন। এখনই কিনতে পারো।":"পরের লক্ষ্য: "+CARS[o.i].n+", আরও "+B(price(o.i)-coins())+" কয়েন লাগবে।";
}
function showroom(){
  const bs=[];
  const o=offer();
  if(o&&o.ok)bs.push(btn("তোমার জন্য অফার: "+CARS[o.i].n+", দাম "+B(price(o.i))+" কয়েন",()=>carDetail(o.i)));
  CARS.forEach((c,i)=>{
    const own=S.own.includes(i);
    const st=own?(S.car===i?"তোমার গাড়ি, এখন চালাচ্ছো":"তোমার আছে"):price(i)<=coins()?"কিনতে পারবে, দাম "+B(price(i))+" কয়েন":"দাম "+B(price(i))+" কয়েন, আরও "+B(price(i)-coins())+" লাগবে";
    bs.push(btn(c.n+"। "+st,()=>carDetail(i)));
  });
  bs.push(btn("ফিরে যাও",()=>menu("")));
  screen("গাড়ির শোরুম","তোমার কয়েন "+B(coins())+"। "+offerLine()+" যেকোনো গাড়িতে ডাবল ট্যাপ করলে বিস্তারিত শুনবে।",bs);
}
function carDetail(i){
  const c=CARS[i],own=S.own.includes(i),d=S.disc[i]||0;
  const info=c.n+"। "+c.d+" গতি "+B(c.s)+"। "+(c.cm>1?"কয়েন "+B(Math.round((c.cm-1)*100))+" শতাংশ বেশি। ":"")+(c.sh?"ঢাল নিয়ে দৌড় শুরু। ":"");
  const bs=[];
  if(own){
    bs.push(btn(S.car===i?"এটাই এখন তোমার গাড়ি":"এই গাড়ি চালাও",()=>{S.car=i;save();say(c.n+" বাছা হলো");carDetail(i)}));
    bs.push(btn("এই গাড়ি সাজাও",()=>{S.car=i;save();customize()}));
  }else{
    bs.push(btn("কিনো, "+B(price(i))+" কয়েন",()=>{
      if(coins()>=price(i)){addCoins(-price(i));S.own.push(i);S.car=i;save();tone(900,0.4,0,0.15,"triangle",1.8);buzz(80);say("অভিনন্দন! "+c.n+" এখন তোমার। এটাই চালাবে।");carDetail(i)}
      else say("কয়েন কম। আরও "+B(price(i)-coins())+" কয়েন লাগবে। খেলে বা অ্যাড দেখে কয়েন জোগাড় করো।");
    }));
    if(d<DISC_MAX)bs.push(btn("অ্যাড দেখে দামে পাঁচ শতাংশ ছাড় নাও ("+B(d)+"/"+B(DISC_MAX)+")",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd()){S.disc[i]=d+1;save();await say("ছাড় পেয়েছো। নতুন দাম "+B(price(i))+" কয়েন।")}
      else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
      carDetail(i);
    }));
    bs.push(btn("অ্যাড দেখে "+B(AD_COINS)+" কয়েন নাও",async()=>{await adCoins();carDetail(i)}));
  }
  bs.push(btn("শোরুমে ফিরে যাও",showroom));
  screen(c.n,info+(own?"তোমার আছে।":"দাম "+B(price(i))+" কয়েন"+(d?", ছাড়ে "+B(d*5)+" শতাংশ":"")+"। তোমার কয়েন "+B(coins())+"।"),bs);
}

/* ---------- সাজানো ---------- */
function customize(){
  const lv=S.lv[S.car]||0,cost=40*(lv+1),bs=[];
  if(lv<MAXLV){
    bs.push(btn("স্পিড বাড়াও, "+B(cost)+" কয়েন",()=>{
      if(coins()>=cost){addCoins(-cost);S.lv[S.car]=lv+1;save();say("স্পিড ধাপ "+B(lv+1));customize()}
      else say("কয়েন কম। অ্যাড দেখে স্পিড বাড়াতে পারো।");
    }));
    bs.push(btn("অ্যাড দেখে স্পিড বাড়াও",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd()){S.lv[S.car]=lv+1;save();await say("স্পিড ধাপ "+B(lv+1))}
      else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
      customize();
    }));
  }else bs.push(btn("স্পিড সর্বোচ্চ ধাপে",()=>say("স্পিড সর্বোচ্চ ধাপে আছে")));
  COLORS.forEach((n,k)=>{
    const has=S.cols.includes(k),cur=(S.col[S.car]||0)===k;
    bs.push(btn("রং "+n+(cur?", এখন বাছা":has?", ব্যবহার করো":", তালা, "+B(UNLOCK)+" কয়েন বা অ্যাড"),()=>{
      if(has){S.col[S.car]=k;save();say("রং "+n);customize()}else unlock("c",k);
    }));
  });
  HORNS.forEach((n,k)=>{
    const has=S.hornOwn.includes(k),cur=S.horn===k;
    bs.push(btn(n+(cur?", এখন বাছা":has?", ব্যবহার করো":", তালা, "+B(UNLOCK)+" কয়েন বা অ্যাড"),()=>{
      hornSound(k);
      if(has){S.horn=k;save();customize()}else unlock("h",k);
    }));
  });
  bs.push(btn("ফিরে যাও",()=>menu("")));
  screen("গাড়ি সাজাও",CARS[S.car].n+", রং "+COLORS[S.col[S.car]||0]+", স্পিড ধাপ "+B(lv)+", হর্ন "+HORNS[S.horn]+"। তোমার কয়েন "+B(coins())+"।",bs);
}
function unlock(kind,k){
  const nm=kind==="c"?"রং "+COLORS[k]:HORNS[k];
  const done=()=>{if(kind==="c"){S.cols.push(k);S.col[S.car]=k}else{S.hornOwn.push(k);S.horn=k}save();say(nm+" আনলক হলো, বাছা হলো।");customize()};
  screen(nm+" আনলক","দুটো উপায় আছে। কয়েন খরচ করতে পারো, বা একটা অ্যাড দেখলে বিনা কয়েনে পাবে। তোমার কয়েন "+B(coins())+"।",[
    btn("অ্যাড দেখে বিনা কয়েনে নাও",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd())done();else{await say("এখন অ্যাড পাওয়া যাচ্ছে না।");unlock(kind,k)}
    }),
    btn(B(UNLOCK)+" কয়েন দিয়ে নাও",()=>{if(coins()>=UNLOCK){addCoins(-UNLOCK);done()}else say("কয়েন কম।")}),
    btn("ফিরে যাও",customize)
  ]);
}
function hornSound(k){
  const f=[[300,0.3,"square"],[420,0.5,"triangle"],[140,0.8,"sawtooth"],[700,0.9,"sawtooth"]][k]||[300,0.3,"square"];
  if(k===3){tone(700,0.35,0,0.14,"sawtooth",1.5);setTimeout(()=>tone(1050,0.35,0,0.14,"sawtooth",0.7),380)}
  else{tone(f[0],f[1],0,0.14,f[2]);setTimeout(()=>tone(f[0]*1.25,f[1],0,0.1,f[2]),30)}
}

/* ---------- কাত করে চালানো ---------- */
let G=null,gOn=false,gCenter=0,gCal=[],gSeen=false;
function onOri(e){
  if(typeof e.gamma!=="number")return;
  gSeen=true;G=G==null?e.gamma:G*0.6+e.gamma*0.4;
  if(gCal)gCal.push(e.gamma);
}
function tiltOn(){
  if(gOn)return;gOn=true;gSeen=false;G=null;
  try{window.addEventListener("deviceorientation",onOri)}catch(e){}
}
function tiltOff(){gOn=false;try{window.removeEventListener("deviceorientation",onOri)}catch(e){}}

/* ---------- দৌড় ---------- */
let R=null,timer=null;
function stopRun(){if(timer){clearInterval(timer);timer=null}R=null;tiltOff();humStop()}
async function startRun(){
  stopRun();
  S.runs++;save();
  const sp=speedOf(S.car);
  R={t:0,lane:1,wave:null,next:1.5,passed:0,earn:0,sp,paused:true,streak:0,shield:false,ev:[],
     reach:4.6,gap:7,lvl:0,tilt:false};
  R.shield=!!CARS[S.car].sh;
  screen("প্রস্তুত হও","ফোনটা সোজা করে ধরো। এখন মাঝের লেন ঠিক করছি।",[btn("দৌড় থামাও",()=>{stopRun();menu("")})]);
  gCal=[];tiltOn();
  const me=R;
  say("ফোন সোজা করে ধরো।");
  await sleep(2200);if(R!==me)return;        // এই সময়ে ফোনের সোজা অবস্থান মাপা হয়
  if(gSeen&&gCal.length>3){gCenter=gCal.reduce((a,b)=>a+b,0)/gCal.length;R.tilt=true}
  tone(500,0.15,0,0.12);await sleep(500);if(R!==me)return;
  tone(600,0.15,0,0.12);await sleep(500);if(R!==me)return;
  tone(900,0.5,0,0.14);
  gCal=null;
  humStart(CARS[S.car].hz);
  R.paused=false;
  drawRun();
  say(R.tilt?"চলো! ফোন বাঁয়ে বা ডানে কাত করো।":"চলো! সেন্সর পাইনি, বোতাম ব্যবহার করো।");
  timer=setInterval(tick,100);
}
function drawRun(){
  screen("দৌড় চলছে","এখন "+LANE[R.lane]+" লেনে আছো। ফোন কাত করো, বা বোতামে ডাবল ট্যাপ করো।",[
    btn("বাঁয়ে যাও",()=>go(0),"বাঁয়ের লেনে যাও"),
    btn("মাঝে যাও",()=>go(1),"মাঝের লেনে যাও"),
    btn("ডানে যাও",()=>go(2),"ডানের লেনে যাও"),
    btn("হর্ন বাজাও",()=>hornSound(S.horn),"হর্ন বাজাও"),
    btn("দৌড় থামাও",()=>{stopRun();menu("")})
  ]);
}
function go(l){
  if(!R||R.paused||R.lane===l)return;
  R.lane=l;tone(440+l*110,0.1,l-1,0.1,"sine");buzz(15);
}
function lvlOf(t){return Math.min(3,Math.floor(t/30))}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function tick(){
  if(!R||R.paused)return;
  R.t+=0.1;
  humSet(CARS[S.car].hz*(1+R.lvl*0.18));
  /* কাত থেকে লেন */
  if(R.tilt&&G!=null){
    const d=G-gCenter;
    if(d<-TILT)go(0);else if(d>TILT)go(2);else if(Math.abs(d)<TILT*0.6)go(1);
  }
  if(R.t>=RUN_SEC){finish();return}
  const lv=lvlOf(R.t);
  if(lv>R.lvl){R.lvl=lv;say("গতি বাড়ছে!");tone(300,0.6,0,0.12,"sawtooth",2)}
  R.reach=Math.max(3.8,4.8-0.3*R.sp-0.25*R.lvl);
  R.gap=R.reach+Math.max(1.3,2.6-0.25*R.sp);
  /* নতুন ঢেউ */
  if(!R.wave&&R.t>=R.next){
    const n=Math.random()<0.4+0.1*R.lvl?2:1;
    const items=[null,null,null];
    const order=[0,1,2].sort(()=>Math.random()-.5);
    for(let k=0;k<n;k++)items[order[k]]={t:"o",o:pick(OBS)};
    if(Math.random()<0.55&&order[n]!==undefined)items[order[n]]={t:Math.random()<0.15?"s":"c"};
    R.wave={items,hit:R.t+R.reach};
    const word=i=>{const x=items[i];return LANE[i]+" "+(!x?"ফাঁকা":x.t==="o"?x.o.n:x.t==="c"?"কয়েন":"ঢাল")};
    say(word(0)+", "+word(1)+", "+word(2));
    /* কাছে আসার শব্দ: প্রতিটা বাধা নিজের দিক থেকে, ক্রমে জোরালো */
    items.forEach((x,i)=>{
      if(!x)return;
      [2.0,1.2,0.5].forEach((dt,k)=>R.ev.push({t:R.t+R.reach-dt,f:()=>{
        if(x.t==="o")tone(x.o.hz*(1+k*0.15),0.28,i-1,0.08+k*0.07,x.o.ty);
        else tone(x.t==="c"?1200:800,0.12,i-1,0.06+k*0.05,"sine");
      }}));
    });
  }
  /* সময় ধরে শব্দ চালানো */
  R.ev=R.ev.filter(e=>{if(R.t>=e.t){e.f();return false}return true});
  /* ঢেউয়ের ফল */
  if(R.wave&&R.t>=R.wave.hit){
    const x=R.wave.items[R.lane];
    R.wave=null;R.next=R.t+R.gap-R.reach;
    if(x&&x.t==="o"){
      if(R.shield){R.shield=false;R.streak=0;tone(250,0.4,0,0.2,"triangle");buzz(60);say("ঢাল তোমাকে বাঁচালো!");return}
      crash();return;
    }
    R.passed++;R.streak++;
    let c=Math.round(8*R.sp*(1+R.lvl*0.25)*CARS[S.car].cm);
    if(x&&x.t==="c"){c+=30;tone(1500,0.2,R.lane-1,0.12,"sine");}
    else if(x&&x.t==="s"){R.shield=true;tone(700,0.4,0,0.12,"triangle",1.8);say("ঢাল পেয়েছো!")}
    else tone(880,0.1,0,0.08);
    if(R.streak%5===0){c+=20;say(B(R.streak)+" বার টানা! বাড়তি কয়েন।")}
    R.earn+=c;addCoins(c);
  }
}
async function crash(){
  R.paused=true;humStop();tone(90,0.9,0,0.3,"sawtooth",0.4);buzz(250);
  S.best=Math.max(S.best,R.passed);save();
  const o=offer();
  let msg="গাড়ি ভেঙে গেছে। এই দৌড়ে "+B(R.passed)+"বার নিরাপদে পার হয়েছো, কয়েন পেয়েছো "+B(R.earn)+"। তোমার কয়েন এখন "+B(coins())+"। ";
  msg+="একটা পরামর্শ: অ্যাড দেখে গাড়ি ঠিক করলে তোমার কয়েন বেঁচে যাবে, গাড়ি কেনার লক্ষ্যের আরও কাছে থাকবে। ";
  if(o)msg+=o.ok?"মনে রেখো, তোমার জন্য অফার অপেক্ষা করছে: "+CARS[o.i].n+", দাম "+B(price(o.i))+" কয়েন। ":"পরের লক্ষ্য "+CARS[o.i].n+", আরও "+B(price(o.i)-coins())+" কয়েন লাগবে। ";
  msg+="কোনটা করবে, বেছে নাও।";
  const bs=[
    btn("অ্যাড দেখে বিনা কয়েনে গাড়ি ঠিক করো (সেরা উপায়)",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd())resume();else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
    }),
    btn(B(REPAIR)+" কয়েন দিয়ে গাড়ি ঠিক করো",()=>{
      if(coins()<REPAIR){say("কয়েন কম। অ্যাড দেখে ঠিক করতে পারো।");return}
      const hurt=o&&o.ok&&coins()-REPAIR<price(o.i);
      if(hurt){
        screen("একটু ভেবে নাও","কয়েন খরচ করলে তোমার "+CARS[o.i].n+" কেনার সুযোগ আপাতত চলে যাবে। অ্যাড দেখে ঠিক করলে সেটা কেনা যাবে। তবুও কয়েন দিয়ে ঠিক করবে?",[
          btn("না, অ্যাড দেখে ঠিক করব",async()=>{await say("অ্যাড আসছে।");if(await watchAd())resume();else{await say("এখন অ্যাড পাওয়া যাচ্ছে না।");crash2()}}),
          btn("হ্যাঁ, কয়েন দিয়েই ঠিক করো",()=>{addCoins(-REPAIR);resume()}),
          btn("ফিরে যাও",crash2)
        ]);
      }else{addCoins(-REPAIR);resume()}
    }),
    btn("গাড়ির শোরুম দেখো",()=>{pendingCrash=true;showroom()}),
    btn("নতুন করে শুরু করো",startRun),
    btn("মেনুতে ফিরে যাও",()=>{stopRun();menu("")})
  ];
  lastCrash={msg,bs};
  screen("ধাক্কা লেগেছে",msg,bs);
  say("ধাক্কা লেগেছে। "+msg);
}
let lastCrash=null,pendingCrash=false;
function crash2(){if(lastCrash)screen("ধাক্কা লেগেছে",lastCrash.msg,lastCrash.bs)}
function resume(){
  if(!R)return;
  R.paused=false;R.wave=null;R.ev=[];R.next=R.t+2;R.lane=1;R.streak=0;
  humStart(CARS[S.car].hz);
  drawRun();say("গাড়ি ঠিক হয়েছে। চালিয়ে যাও।");
}
function finish(){
  const car=CARS[S.car];
  const bonus=Math.round(60*R.sp*car.cm);addCoins(bonus);
  S.best=Math.max(S.best,R.passed);S.total+=R.earn+bonus;save();
  const earn=R.earn+bonus,p=R.passed;
  stopRun();
  screen("দৌড় শেষ","অভিনন্দন! "+B(p)+"বার নিরাপদে পার হয়েছো। বোনাস "+B(bonus)+" কয়েন। মোট "+B(earn)+" কয়েন পেয়েছো। এখন কয়েন "+B(coins())+"। র‍্যাংক: "+rank()+"। "+offerLine(),[
    btn("অ্যাড দেখে এই দৌড়ের কয়েন দ্বিগুণ করো (+"+B(earn)+")",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd()){addCoins(earn);await say("কয়েন দ্বিগুণ হলো। এখন কয়েন "+B(coins()))}else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
      menu("");
    }),
    btn("আবার চালাও",startRun),
    btn("গাড়ির শোরুম দেখো",showroom),
    btn("মেনুতে ফিরে যাও",()=>menu(""))
  ]);
  say("দৌড় শেষ। অভিনন্দন! মোট "+B(earn)+" কয়েন পেয়েছো।");
}

/* কীবোর্ডে পরীক্ষার জন্য */
document.addEventListener("keydown",e=>{
  if(!R)return;
  if(e.key==="ArrowLeft")go(0);else if(e.key==="ArrowDown"||e.key==="ArrowUp")go(1);else if(e.key==="ArrowRight")go(2);
});

/* ---------- গেম পাতায় কার্ড বসানো ---------- */
function mount(){
  const pg=$("pg_games");
  if(!pg)return false;
  if($("crgCard"))return true;
  const card=document.createElement("div");card.className="lzCard";card.id="crgCard";
  card.innerHTML='<h3>গেম ২: অডিও কার রেস</h3><p>ফোন কাত করে শুনে শুনে গাড়ি চালাও। কয়েন জেতো, নতুন গাড়ি কেনো।</p>';
  const b=document.createElement("button");b.className="lzBtn";b.id="g2";b.textContent="▶ খেলো";
  b.setAttribute("aria-label","অডিও কার রেস গেম খেলো");
  b.onclick=open;card.appendChild(b);pg.appendChild(card);
  return true;
}
let n=0;const iv=setInterval(()=>{if(mount()||++n>100)clearInterval(iv)},300);
window.__CRG_API={open,state:()=>S};
})();
