/* মনের আলো · গেম ২: অডিও কার রেস
   শুনে চালানো গাড়ির গেম। ফোন কাত করে লেন বদলানো যায়, বোতামেও যায়। ফোন ঝাঁকালে হর্ন।
   কণ্ঠ: ফোনের নিজের টিটিএস, ইচ্ছেমতো ইঞ্জিন ও ভয়েস বাছা যায়। */
(function(){
"use strict";
if(window.__CRG)return;window.__CRG=1;

/* ---------- এখানের সংখ্যা বদলালেই গেমের হিসাব বদলায় ---------- */
const TRIPS=[{km:3,n:"ছোট ট্রিপ, তিন কিলোমিটার",en:"Short trip, three kilometers"},{km:6,n:"মাঝারি ট্রিপ, ছয় কিলোমিটার",en:"Medium trip, six kilometers"},{km:10,n:"লম্বা ট্রিপ, দশ কিলোমিটার",en:"Long trip, ten kilometers"}];
const KMS=0.0133;          // প্রথম গাড়ির গতি: প্রতি সেকেন্ডে কত কিলোমিটার
const REPAIR=50;        // কয়েন দিয়ে গাড়ি মেরামতের খরচ
const AD_COINS=100;     // একটা অ্যাডে কত কয়েন
const DAILY=50;         // প্রতিদিনের প্রথম বোনাস
const MAXLV=10;         // স্পিড বাড়ানোর সর্বোচ্চ ধাপ
const TILT=13;          // কত ডিগ্রি কাত করলে লেন বদলাবে
const DISC_MAX=6;       // একটা গাড়িতে সর্বোচ্চ কতবার অ্যাড দেখে ছাড়, প্রতিবার ৫%
const UNLOCK=150;       // রং বা হর্ন আনলকের কয়েন
const CARS=[
  {n:"ছোট সবুজ গাড়ি",p:0,s:1,hz:60,eng:"e0",cm:1,sh:0,d:"শুরুর গাড়ি। ধীর, কিন্তু শেখার জন্য ভালো।"},
  {n:"হ্যাচব্যাক",p:600,s:1.3,hz:68,eng:"e1",cm:1,sh:0,d:"হালকা আর চটপটে। গতি একটু বেশি।"},
  {n:"সেডান",p:2000,s:1.6,hz:76,eng:"e2",cm:1.1,sh:0,d:"আরামদায়ক পারিবারিক গাড়ি। প্রতি পারাপারে দশ শতাংশ বেশি কয়েন।"},
  {n:"মাইক্রোবাস",p:10000,s:1.8,hz:64,eng:"e3",cm:1.2,sh:1,d:"বড় আর মজবুত। প্রতি দৌড় শুরু হয় ঢাল নিয়ে। কুড়ি শতাংশ বেশি কয়েন।"},
  {n:"স্পোর্টস গাড়ি",p:25000,s:2.2,hz:90,eng:"e4",cm:1.3,sh:0,d:"দ্রুত আর ঝকঝকে। ত্রিশ শতাংশ বেশি কয়েন।"},
  {n:"রেসিং গাড়ি",p:60000,s:2.6,hz:105,eng:"e5",cm:1.5,sh:1,d:"রেসের জন্য বানানো। ঢাল নিয়ে শুরু। পঞ্চাশ শতাংশ বেশি কয়েন।"},
  {n:"সুপার জেট গাড়ি",p:150000,s:3.2,hz:125,eng:"e6",cm:2,sh:1,d:"সবচেয়ে দ্রুত। ঢাল নিয়ে শুরু। কয়েন দ্বিগুণ।"}
];
const COLORS=["সবুজ","লাল","নীল","হলুদ","বেগুনি","সাদা","কালো","কমলা","গোলাপি","সোনালি"];
const HORNS=["গাড়ির সাধারণ হর্ন","গাড়ির উঁচু হর্ন","গাড়ির গম্ভীর হর্ন","বাসের হর্ন","ট্রাকের এয়ার হর্ন","পুলিশের সাইরেন, লম্বা","পুলিশের সাইরেন, দ্রুত","পুলিশের দুই সুরের সাইরেন","অ্যাম্বুলেন্সের সাইরেন","ফায়ার ট্রাকের সাইরেন","মোটরসাইকেলের হর্ন","অটোরিকশার হর্ন","স্পোর্টস গাড়ির হর্ন","ট্যাক্সির হর্ন","ইলেকট্রিক হর্ন","ট্রেনের হর্ন","জাহাজের হর্ন","দুইবার বিপ","তিনবার বিপ","শহরের হর্ন"];
const HORN_COST=[0,150,150,200,250,300,300,300,300,300,150,150,200,150,150,400,400,150,150,150];
const OBS={
  car:{k:"car",bn:"গাড়ি",en:"a car",loop:"e1",horn:["h01","h02","h14","h13","h15","h20","h18"],rate:[0.92,1.08]},
  rick:{k:"rick",bn:"রিকশা",en:"a rickshaw",loop:"e_rick",horn:["h12","h19","h18"],rate:[0.95,1.05]},
  bike:{k:"bike",bn:"মোটরসাইকেল",en:"a motorbike",loop:"e_bike",horn:["h11","h19","h18"],rate:[0.95,1.1]},
  bus:{k:"bus",bn:"বাস",en:"a bus",loop:"e_bus",horn:["h04","h03"],rate:[0.85,0.95]},
  truck:{k:"truck",bn:"ট্রাক",en:"a truck",loop:"e_truck",horn:["h05","h03"],rate:[0.9,1.0]},
  person:{k:"person",bn:"মানুষ",en:"a person",loop:"steps",horn:[],rate:[0.95,1.05]},
  pit:{k:"pit",bn:"গর্ত",en:"a pothole",loop:"pit",horn:[],rate:[1,1]}
};
const STAGES=[
  {n:"শহরের পথ",en:"the city road",pool:["car","rick","bike","person","bus","car","rick"],say:"আপনি শহরের পথে। গাড়ি, রিকশা আর মানুষ সামলে চলুন।",sayEn:"You are on the city road. Watch for cars, rickshaws and people."},
  {n:"হাইওয়ে",en:"the highway",pool:["car","truck","bus","car","truck","bike"],say:"হাইওয়েতে উঠলেন। ট্রাক আর বাস আসছে, সাবধান।",sayEn:"You are on the highway. Trucks and buses ahead."},
  {n:"গ্রামের পথ",en:"the village road",pool:["person","rick","pit","bike","person","car","pit"],say:"গ্রামের পথে ঢুকলেন। মানুষ আর গর্ত থেকে সাবধান।",sayEn:"You are on the village road. Watch for people and potholes."}
];
/* ------------------------------------------------------------- */

const $=i=>document.getElementById(i);
const KEY="crg_v5";
let S={coins:0,own:[0],car:0,lv:{},col:{},best:0,total:0,day:"",eng:"",vo:null,rate:0,runs:0,disc:{},cols:[0],hornOwn:[0],horn:0,broken:false,lang:"bn"};
try{const j=JSON.parse(localStorage.getItem(KEY)||"null");if(j)S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const B=n=>{try{return typeof bn==="function"?bn(n):String(n)}catch(e){return String(n)}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const speedOf=c=>CARS[c].s*(1+0.12*(S.lv[c]||0));
const isEn=()=>S.lang==="en";

/* কয়েন: অ্যাড মডিউলের কয়েনই ব্যবহার হয়, যাতে দুই গেমের কয়েন এক থাকে */
function coins(){try{if(window.__LOM_ADS)return window.__LOM_ADS.coins|0}catch(e){}return S.coins|0}
function setCoins(n){n=Math.max(0,n|0);try{if(window.__LOM_ADS){window.__LOM_ADS.setCoins(n);return}}catch(e){}S.coins=n;save()}
function addCoins(d){setCoins(coins()+d)}

/* ---------- কণ্ঠ ---------- */
const hasNT=()=>{try{return typeof NT!=="undefined"&&typeof ntCall==="function"&&typeof ntPayload==="function"}catch(e){return false}};
async function ensureTts(){
  try{if(hasNT()&&!NT.on&&typeof ntAvail==="function"&&ntAvail()&&typeof ntInit==="function")await ntInit(S.eng||"")}catch(e){}
}
function say(t,en){
  try{if(hasNT()&&NT.on){
    const p=ntPayload(t,en?1:0);
    if(!en&&S.vo&&S.vo.name){p.lang=S.vo.lang;p.voice={name:S.vo.name,locale:S.vo.lang}}
    if(S.rate)p.rate=S.rate;
    return ntCall("ttsSpeak",p).catch(()=>{});
  }}catch(e){}
  try{const u=new SpeechSynthesisUtterance(t);u.lang=en?"en-US":"bn-BD";speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}
  return Promise.resolve();
}
const sayG=t=>say(t,isEn());           // খেলার ভাষায় বলা
function hush(){try{if(hasNT()&&NT.on)ntCall("ttsStop",null)}catch(e){}try{speechSynthesis.cancel()}catch(e){}}

/* ---------- শব্দ ঘর: আসল রেকর্ড-করা ধরনের নমুনা ---------- */
let AC=null,bus=null,NB=null;
const BUF={};
let loaded=false;
const NEED=["h01","h02","h03","h04","h05","h06","h07","h08","h09","h10","h11","h12","h13","h14","h15","h16","h17","h18","h19","h20","e0","e1","e2","e3","e4","e5","e6","e_rick","e_bike","e_truck","e_bus","steps","pit","wind","road","crash","shbreak","coin","shget","pass","whoosh","mile","fanfare","gear","hiss"];
const missing=()=>NEED.filter(k=>!BUF[k]);
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function out(){
  const a=ac();if(!a)return null;
  if(!bus){try{bus=a.createGain();bus.gain.value=1;bus.connect(a.destination)}catch(e){bus=null}}
  return bus||a.destination;
}
function newBus(){ try{if(bus){bus.disconnect()}}catch(e){} bus=null; return out() }
async function loadAudio(){
  if(loaded)return;loaded=true;
  const a=ac();const M=window.__CRG_AUD||{};if(!a)return;
  const keys=Object.keys(M);
  await Promise.all(keys.map(async k=>{
    try{
      const bin=atob(M[k]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      BUF[k]=await new Promise((res,rej)=>{const p=a.decodeAudioData(u.buffer,res,rej);if(p&&p.then)p.then(res,rej)});
    }catch(e){}
  }));
}
function noiseBuf(){
  const a=ac();if(!a)return null;
  if(!NB){NB=a.createBuffer(1,a.sampleRate*1.5,a.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  return NB;
}
function pan(a,p){
  if(a.createStereoPanner){const n=a.createStereoPanner();n.pan.value=Math.max(-1,Math.min(1,p||0));return n}
  return null;
}
/* নমুনা একবার বাজানো */
function play(name,p,vol,rate,delay){
  const a=ac(),b=BUF[name];if(!a||!b)return null;
  try{
    const s=a.createBufferSource(),g=a.createGain(),t=a.currentTime+(delay||0);
    s.buffer=b;s.playbackRate.value=rate||1;g.gain.value=vol==null?0.8:vol;
    const pn=pan(a,p),o=out();s.connect(g);
    if(pn){g.connect(pn);pn.connect(o)}else g.connect(o);
    s.start(t);return s;
  }catch(e){return null}
}
/* সাধারণ স্বর (শুধু কাউন্টডাউন বিপ আর নমুনা না থাকলে বিকল্প) */
function tone(freq,dur,p,vol,type,slide){
  const a=ac();if(!a)return;
  try{
    const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
    o.type=type||"sine";o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*slide),t+dur);
    g.gain.setValueAtTime(vol||0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    const pn=pan(a,p),out_=out();o.connect(g);if(pn){g.connect(pn);pn.connect(out_)}else g.connect(out_);
    o.start(t);o.stop(t+dur+0.02);
  }catch(e){}
}
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};

/* ---- ইঞ্জিন: গাড়ি অনুযায়ী আলাদা নমুনা, গতি বাড়লে পিচ বাড়ে; সঙ্গে বাতাস ও রাস্তার শব্দ ---- */
let eng=null,lastObsHorn="";
function engineStart(){
  const a=ac();if(!a||eng||!BUF[CARS[S.car].eng])return;
  try{
    const o=out(),mk=(name,vol,rate)=>{const s=a.createBufferSource(),g=a.createGain();s.buffer=BUF[name];s.loop=true;s.playbackRate.value=rate;g.gain.value=vol;s.connect(g);g.connect(o);s.start();return{s,g}};
    eng={e:mk(CARS[S.car].eng,0.55,0.8)};
    if(BUF.wind)eng.w=mk("wind",0.0,1);
    if(BUF.road)eng.r=mk("road",0.0,1);
  }catch(e){eng=null}
}
function engineSet(rev,wind){
  if(!eng||!AC)return;
  try{
    const t=AC.currentTime;
    eng.e.s.playbackRate.setTargetAtTime(rev,t,0.25);
    if(eng.w)eng.w.g.gain.setTargetAtTime(0.05+0.35*wind,t,0.4);
    if(eng.r)eng.r.g.gain.setTargetAtTime(0.05+0.3*wind,t,0.4);
  }catch(e){}
}
function engineStop(){try{if(eng){["e","w","r"].forEach(k=>{if(eng[k])try{eng[k].s.stop()}catch(e){}});eng=null}}catch(e){eng=null}}
function gearUp(){play("gear",0,0.6)}

/* ---- বাধা কাছে আসার শব্দ: নিজের ইঞ্জিন, নিজের হর্ন, নিজের দিক থেকে; দূরে চাপা, কাছে এলে পরিষ্কার, পেরিয়ে গেলে ডপলারে নিচু ---- */
function approach(x,lane,reach){
  const a=ac();if(!a)return;
  const t0=a.currentTime,p=(lane-1)*0.9,end=t0+reach,tail=end+1.4;
  try{
    if(x.t==="o"){
      const O=x.o,b=BUF[O.loop];
      if(b){
        const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),r=O.rate[0]+Math.random()*(O.rate[1]-O.rate[0]);
        s.buffer=b;s.loop=true;
        const veh=O.k!=="person"&&O.k!=="pit";
        s.playbackRate.setValueAtTime(r*(veh?0.94:1),t0);
        if(veh){s.playbackRate.linearRampToValueAtTime(r*1.08,end);s.playbackRate.exponentialRampToValueAtTime(r*0.8,tail)}
        f.type="lowpass";f.frequency.setValueAtTime(500,t0);f.frequency.exponentialRampToValueAtTime(7000,end);f.frequency.exponentialRampToValueAtTime(1200,tail);
        g.gain.setValueAtTime(0.02,t0);g.gain.exponentialRampToValueAtTime(veh?0.6:0.5,end-0.1);g.gain.exponentialRampToValueAtTime(0.001,tail);
        const pn=pan(a,p),o=out();s.connect(f);f.connect(g);
        if(pn){pn.pan.setValueAtTime(p,t0);pn.pan.linearRampToValueAtTime(p*0.5,end);pn.pan.linearRampToValueAtTime(Math.max(-1,Math.min(1,p*1.3)),tail);g.connect(pn);pn.connect(o)}else g.connect(o);
        s.start(t0);s.stop(tail+0.1);
      }else tone(200,0.4,p,0.15,"triangle");
      if(O.horn.length&&Math.random()<0.85){
        let h=O.horn[Math.floor(Math.random()*O.horn.length)];
        if(O.horn.length>1&&h===lastObsHorn)h=O.horn[(O.horn.indexOf(h)+1)%O.horn.length];
        lastObsHorn=h;
        play(h,p*0.7,0.55,0.93+Math.random()*0.14,Math.max(0.4,reach-2.4+Math.random()*0.8));
      }
    }else{
      play(x.t==="c"?"coin":"shget",p,0.35,1,Math.max(0,reach-1.2));
      tone(x.t==="c"?1320:760,0.12,p,0.06);
    }
  }catch(e){}
}
function crashSound(){if(BUF.crash)play("crash",0,0.95);else tone(90,0.9,0,0.3,"sawtooth",0.4);buzz(300);if(BUF.hiss)play("hiss",0,0.4,1,1.0)}
function passSound(lane){if(BUF.pass)play("pass",(lane-1)*0.6,0.7);else tone(880,0.1,0,0.08)}
function coinSound(lane){if(BUF.coin)play("coin",(lane-1)*0.6,0.7);else tone(1500,0.2,0,0.1)}
function shieldSound(){play("shget",0,0.7)}
function shieldBreak(){play("shbreak",0,0.8);buzz(80)}
function mileSound(){if(BUF.mile)play("mile",0,0.6);else tone(800,0.3,0,0.1)}
function fanfare(){if(BUF.fanfare)play("fanfare",0,0.8);else tone(1000,0.4,0,0.1)}
function hornFor(){
  if(S.horn>=0)return S.horn;
  const own=S.hornOwn.filter(k=>k!==lastPlayerHorn);
  const k=own.length?own[Math.floor(Math.random()*own.length)]:0;
  lastPlayerHorn=k;return k;
}
let lastPlayerHorn=-1;
function hornSound(k){const s=play("h"+String(k+1).padStart(2,"0"),0,0.9,0.97+Math.random()*0.06);if(!s)tone(300,0.4,0,0.14,"square")}
const hornName=()=>S.horn<0?"প্রতিবার আলাদা হর্ন":HORNS[S.horn];

/* ---------- অ্যাড ---------- */
async function watchAd(){
  /* সব অ্যাড বোতাম এই একটা পথে যায়: অ্যাড মডিউল অ্যাডমবে অনুরোধ পাঠায়, দেখায়, পরের অ্যাড তৈরি রাখে */
  if(window.__LOM_ADS&&window.__LOM_ADS.watch){
    try{return (await window.__LOM_ADS.watch())===true}catch(e){return false}
  }
  await sleep(2500);return true;     // শুধু ব্রাউজারের প্রিভিউয়ে, যেখানে অ্যাড মডিউলই নেই
}
async function adCoins(){
  await say("অ্যাড আসছে। একটু অপেক্ষা করো।");
  const ok=await watchAd();
  if(ok){addCoins(AD_COINS);await say("তুমি "+B(AD_COINS)+" কয়েন পেয়েছো। এখন কয়েন "+B(coins()))}
  else await say("এখন অ্যাড পাওয়া যাচ্ছে না। ইন্টারনেট দেখে আবার চেষ্টা করো।");
  return ok;
}

/* ---------- পর্দা ও ব্যাক ---------- */
let root=null,stack=[],histOn=false,swallow=0,hidden=[];
function hideOthers(){
  hidden=[];
  Array.prototype.slice.call(document.body.children).forEach(el=>{
    if(el===root)return;
    hidden.push([el,el.getAttribute("aria-hidden"),!!el.inert]);
    try{el.setAttribute("aria-hidden","true");el.inert=true}catch(e){}
  });
}
function showOthers(){
  hidden.forEach(h=>{try{if(h[1]==null)h[0].removeAttribute("aria-hidden");else h[0].setAttribute("aria-hidden",h[1]);h[0].inert=h[2]}catch(e){}});
  hidden=[];
}
function teardown(){stopRun();if(root){root.remove();root=null}showOthers();stack=[];hush()}
function gameBack(){
  if(!root)return;
  if(R)stopRun();
  if(stack.length>1){stack.pop();stack[stack.length-1]();try{history.pushState({crg:1},"");histOn=true}catch(e){histOn=false}}
  else{histOn=false;teardown()}
}
function goBack(){ if(histOn){try{history.back();return}catch(e){}} gameBack() }
window.addEventListener("popstate",e=>{
  if(swallow>0){swallow--;e.stopImmediatePropagation();return}
  if(root){e.stopImmediatePropagation();gameBack()}
},true);
function nav(fn){stack.push(fn);fn()}
function setTop(fn){stack[stack.length-1]=fn;fn()}
function redo(){stack[stack.length-1]()}

async function open(){
  if(root)return;
  root=document.createElement("div");root.id="crg";
  root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-label","অডিও কার রেস");
  root.style.cssText="position:fixed;inset:0;z-index:99999;background:#0b1020;color:#f2f2f2;overflow:auto;padding:14px;font:600 19px/1.5 sans-serif";
  document.body.appendChild(root);
  hideOthers();
  try{history.pushState({crg:1},"");histOn=true}catch(e){histOn=false}
  stack=[menu];
  ac();
  await ensureTts();
  await loadAudio();
  try{window.__LOM_ADS&&window.__LOM_ADS.preload&&window.__LOM_ADS.preload()}catch(e){}
  const today=new Date().toISOString().slice(0,10);
  let extra="";
  if(S.day!==today){S.day=today;save();addCoins(DAILY);extra="আজকের প্রথম বোনাস "+B(DAILY)+" কয়েন পেয়েছো।"}
  menu(extra);
}
function btn(label,fn,aria){
  const b=document.createElement("button");
  b.textContent=label;if(aria)b.setAttribute("aria-label",aria);
  b.style.cssText="display:block;width:100%;margin:10px 0;padding:18px;font:700 20px sans-serif;border-radius:14px;border:2px solid #ffd778;background:#1b2440;color:#fff";
  b.onclick=fn;return b;
}
function screen(title,intro,buttons){
  if(!root)return;
  root.innerHTML="";
  const h=document.createElement("div");h.textContent=title;h.setAttribute("tabindex","-1");
  h.style.cssText="font:800 24px sans-serif;margin:6px 0 10px";root.appendChild(h);
  if(intro){const p=document.createElement("div");p.textContent=intro;root.appendChild(p)}
  buttons.forEach(b=>root.appendChild(b));
  const bk=btn("ব্যাক",goBack,"ব্যাক");bk.style.borderColor="#6b7bb0";root.appendChild(bk);
  try{h.focus()}catch(e){}
}
function rank(){const b=S.best;return b<10?"নতুন চালক":b<30?"দক্ষ চালক":b<80?"রেসার":"চ্যাম্পিয়ন"}

/* ---------- মেনু ---------- */
function menu(extra){
  const c=CARS[S.car];
  const miss=missing().length;
  screen("অডিও কার রেস",(extra?extra+" ":"")+(miss?"সতর্কতা: শব্দের "+B(miss)+"টা নমুনা লোড হয়নি, তাই কিছু শব্দ সাধারণ বিপে বাজবে। শব্দের ফাইলগুলো সব ঠিকমতো বসানো হয়েছে কি না দেখুন। ":"")+(S.broken?"তোমার গাড়ি ভাঙা, আগে মেরামত করতে হবে। ":"")+"কয়েন "+B(coins())+"। গাড়ি: "+c.n+", রং "+COLORS[S.col[S.car]||0]+", স্পিড ধাপ "+B(S.lv[S.car]||0)+"। র‍্যাংক: "+rank()+"। সেরা স্কোর "+B(S.best)+"। "+offerLine(),[
    btn(S.broken?"গাড়ি মেরামত করে দৌড় শুরু করো":"দৌড় শুরু করো",()=>{ if(S.broken)nav(()=>repairPage("start")); else nav(tripPage) }),
    btn("গাড়ির শোরুম: কেনো, অফার দেখো",()=>nav(showroom)),
    btn("আমার গাড়ি সাজাও: রং, হর্ন, স্পিড",()=>nav(customize)),
    btn("অ্যাড দেখে "+B(AD_COINS)+" কয়েন নাও",async()=>{await adCoins();redo()}),
    btn("কণ্ঠ বাছাই: ইঞ্জিন, ভয়েস, গতি, ভাষা",()=>nav(voiceMenu)),
    btn("কীভাবে খেলতে হয়",()=>nav(how))
  ]);
}
function how(){
  screen("কীভাবে খেলতে হয়","ফোন সোজা করে ধরো, পর্দা তোমার দিকে। তিনটা লেন: বাঁয়ে, মাঝে, ডানে। কণ্ঠ বলবে কোন লেনে কী আছে, আর তুমি কোন লেনে আছো সেটা ধরে সাবধান করবে। যে লেনে যেতে চাও, ফোনটা সেদিকে কাত করো। বাঁয়ে কাত করলে বাঁয়ে, সোজা করলে মাঝে, ডানে কাত করলে ডানে। কাত করা কঠিন হলে বোতামেও যেতে পারবে। বাধার লেনে থাকলে ধাক্কা লাগবে। ঢাল থাকলে একবার বেঁচে যাবে। ফোন ঝাঁকালে হর্ন বাজবে। হর্ন শুনলে সামনের মানুষ পাশে সরে যায়। ট্রিপ তিন, ছয় বা দশ কিলোমিটারের। পথের ধরন বদলায়: শহর, হাইওয়ে, গ্রামের পথ। কিছুদূর পরপর কণ্ঠ জানাবে কত পার হলো। গাড়ি ভাঙলে মেরামত না করে আবার খেলা যাবে না। কয়েন জমিয়ে শোরুম থেকে নতুন গাড়ি কিনতে পারবে। রং আর হর্ন দিয়ে গাড়ি সাজাতে পারবে।",[]);
}

/* ---------- কণ্ঠ বাছাই ---------- */
function voiceMenu(){
  const bs=[];
  const nt=hasNT()&&NT.on;
  const cur=S.vo&&S.vo.name?S.vo.name:"ডিফল্ট";
  bs.push(btn("খেলার কথার ভাষা: "+(isEn()?"English":"বাংলা")+"। বদলাতে ডাবল ট্যাপ করো",()=>{S.lang=isEn()?"bn":"en";save();sayG(isEn()?"The game will now speak English.":"এখন থেকে খেলা বাংলায় কথা বলবে।");redo()}));
  if(nt){
    bs.push(btn("ইঞ্জিন বাছো (এখন: "+(S.eng||NT.engine||"ডিফল্ট")+")",()=>nav(engineMenu)));
    bs.push(btn("ভয়েস বাছো (এখন: "+cur+")",()=>nav(langMenu)));
  }else bs.push(btn("এই ফোনে টিটিএস বাছা যায়নি। ব্রাউজারের কণ্ঠ চলছে।",()=>say("এখানে ব্রাউজারের কণ্ঠ চলছে")));
  const rates=[["ধীর",0.35],["স্বাভাবিক",0.5],["দ্রুত",0.7],["খুব দ্রুত",0.9]];
  rates.forEach(r=>bs.push(btn("কথার গতি: "+r[0]+(Math.abs((S.rate||0.5)-r[1])<0.01?" (এখন)":""),()=>{S.rate=r[1];save();say("কথার গতি "+r[0]);redo()})));
  bs.push(btn("ডিফল্ট কণ্ঠে ফিরে যাও",()=>{S.vo=null;S.rate=0;save();say("ডিফল্ট কণ্ঠ");redo()}));
  screen("কণ্ঠ বাছাই","খেলার সব কথা এই কণ্ঠে বলা হবে। বাংলা কণ্ঠ বাছলে বাংলা ঠিক পড়বে।",bs);
}
function engineMenu(){
  const bs=(NT.engines||[]).map(e=>btn(e+(e===(S.eng||NT.engine)?" (এখন)":""),async()=>{
    S.eng=e;S.vo=null;save();
    try{await ntInit(e)}catch(x){}
    say("এই ইঞ্জিনে কণ্ঠ শোনা যাচ্ছে");redo();
  }));
  if(!bs.length)bs.push(btn("কোনো ইঞ্জিন পাওয়া যায়নি",()=>{}));
  screen("টিটিএস ইঞ্জিন","ফোনে যতগুলো আছে, সব এখানে। গুগল, স্যামসাং বা অন্য কিছু।",bs);
}
function langMenu(){
  const m={};(NT.voices||[]).forEach(v=>{const k=(v.lang||"").split(/[-_]/)[0].toLowerCase();m[k]=(m[k]||0)+1});
  const names={bn:"বাংলা",en:"ইংরেজি",hi:"হিন্দি",ja:"জাপানি",ar:"আরবি",ur:"উর্দু",es:"স্পেনীয়",fr:"ফরাসি",de:"জার্মান",zh:"চীনা",ko:"কোরিয়ান",ru:"রুশ",tr:"তুর্কি",id:"ইন্দোনেশীয়",ta:"তামিল",pt:"পর্তুগিজ",it:"ইতালীয়"};
  const bs=Object.keys(m).sort((a,b)=>(a==="bn"?-1:b==="bn"?1:a<b?-1:1)).map(k=>btn((names[k]||k)+", "+B(m[k])+"টা ভয়েস",()=>nav(()=>voiceList(k))));
  if(!bs.length)bs.push(btn("কোনো ভয়েস পাওয়া যায়নি",()=>{}));
  screen("কোন ভাষার ভয়েস","ভাষা বাছো। তারপর ভয়েসের তালিকা আসবে।",bs);
}
function voiceList(k){
  const vs=(NT.voices||[]).filter(v=>(v.lang||"").toLowerCase().split(/[-_]/)[0]===k).slice(0,40);
  const bs=vs.map(v=>btn(v.name+", "+v.lang+(v.fem===true?", নারী":v.fem===false?", পুরুষ":"")+(v.localService?"":", অনলাইন"),()=>{
    S.vo={name:v.name,lang:v.lang};save();
    say("এই কণ্ঠে খেলা চলবে। সাবধান, ডান লেনে মানুষ আছে।");
  }));
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
  if(o&&o.ok)bs.push(btn("তোমার জন্য অফার: "+CARS[o.i].n+", দাম "+B(price(o.i))+" কয়েন",()=>nav(()=>carDetail(o.i))));
  CARS.forEach((c,i)=>{
    const own=S.own.includes(i);
    const st=own?(S.car===i?"তোমার গাড়ি, এখন চালাচ্ছো":"তোমার আছে"):price(i)<=coins()?"কিনতে পারবে, দাম "+B(price(i))+" কয়েন":"দাম "+B(price(i))+" কয়েন, আরও "+B(price(i)-coins())+" লাগবে";
    bs.push(btn(c.n+"। "+st,()=>nav(()=>carDetail(i))));
  });
  screen("গাড়ির শোরুম","তোমার কয়েন "+B(coins())+"। "+offerLine()+" যেকোনো গাড়িতে ডাবল ট্যাপ করলে বিস্তারিত শুনবে।",bs);
}
function carDetail(i){
  const c=CARS[i],own=S.own.includes(i),d=S.disc[i]||0;
  const info=c.n+"। "+c.d+" গতি "+B(c.s)+"। "+(c.cm>1?"কয়েন "+B(Math.round((c.cm-1)*100))+" শতাংশ বেশি। ":"")+(c.sh?"ঢাল নিয়ে দৌড় শুরু। ":"");
  const bs=[];
  if(own){
    bs.push(btn(S.car===i?"এটাই এখন তোমার গাড়ি":"এই গাড়ি চালাও",()=>{S.car=i;save();say(c.n+" বাছা হলো");redo()}));
    bs.push(btn("এই গাড়ি সাজাও",()=>{S.car=i;save();nav(customize)}));
  }else{
    bs.push(btn("কিনো, "+B(price(i))+" কয়েন",()=>{
      if(coins()>=price(i)){addCoins(-price(i));S.own.push(i);S.car=i;save();fanfare();buzz(80);say("অভিনন্দন! "+c.n+" এখন তোমার। এটাই চালাবে।");redo()}
      else say("কয়েন কম। আরও "+B(price(i)-coins())+" কয়েন লাগবে। খেলে বা অ্যাড দেখে কয়েন জোগাড় করো।");
    }));
    if(d<DISC_MAX)bs.push(btn("অ্যাড দেখে দামে পাঁচ শতাংশ ছাড় নাও ("+B(d)+"/"+B(DISC_MAX)+")",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd()){S.disc[i]=d+1;save();await say("ছাড় পেয়েছো। নতুন দাম "+B(price(i))+" কয়েন।")}
      else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
      redo();
    }));
    bs.push(btn("অ্যাড দেখে "+B(AD_COINS)+" কয়েন নাও",async()=>{await adCoins();redo()}));
  }
  screen(c.n,info+(own?"তোমার আছে।":"দাম "+B(price(i))+" কয়েন"+(d?", ছাড়ে "+B(d*5)+" শতাংশ":"")+"। তোমার কয়েন "+B(coins())+"।"),bs);
}

/* ---------- সাজানো ---------- */
function customize(){
  const lv=S.lv[S.car]||0,cost=40*(lv+1),bs=[];
  if(lv<MAXLV){
    bs.push(btn("স্পিড বাড়াও, "+B(cost)+" কয়েন",()=>{
      if(coins()>=cost){addCoins(-cost);S.lv[S.car]=lv+1;save();say("স্পিড ধাপ "+B(lv+1));redo()}
      else say("কয়েন কম। অ্যাড দেখে স্পিড বাড়াতে পারো।");
    }));
    bs.push(btn("অ্যাড দেখে স্পিড বাড়াও",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd()){S.lv[S.car]=lv+1;save();await say("স্পিড ধাপ "+B(lv+1))}
      else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
      redo();
    }));
  }else bs.push(btn("স্পিড সর্বোচ্চ ধাপে",()=>say("স্পিড সর্বোচ্চ ধাপে আছে")));
  bs.push(btn("গাড়ির রং বাছো (এখন: "+COLORS[S.col[S.car]||0]+")",()=>nav(colorPage)));
  bs.push(btn("হর্ন বাছো (এখন: "+hornName()+")",()=>nav(hornPage)));
  screen("গাড়ি সাজাও",CARS[S.car].n+", রং "+COLORS[S.col[S.car]||0]+", স্পিড ধাপ "+B(lv)+", হর্ন "+hornName()+"। তোমার কয়েন "+B(coins())+"।",bs);
}
function colorPage(){
  const bs=COLORS.map((n,k)=>{
    const has=S.cols.includes(k),cur=(S.col[S.car]||0)===k;
    return btn("রং "+n+(cur?", এখন বাছা":has?", ব্যবহার করো":", তালা, "+B(UNLOCK)+" কয়েন বা অ্যাড"),()=>{
      if(has){S.col[S.car]=k;save();say("রং "+n);redo()}else nav(()=>unlock("c",k));
    });
  });
  screen("গাড়ির রং","তোমার কয়েন "+B(coins())+"।",bs);
}
function hornPage(){
  const bs=HORNS.map((n,k)=>{
    const has=S.hornOwn.includes(k),cur=S.horn===k;
    return btn(n+(cur?", এখন বাছা":has?", ব্যবহার করো":", তালা, "+B(HORN_COST[k])+" কয়েন বা অ্যাড"),()=>{
      hornSound(k);
      if(has){S.horn=k;save();redo()}else nav(()=>unlock("h",k));
    });
  });
  bs.unshift(btn("প্রতিবার আলাদা হর্ন"+(S.horn<0?", এখন বাছা":", তোমার আনলক করা হর্ন থেকে এলোমেলো"),()=>{S.horn=-1;save();say("এখন প্রতিবার আলাদা হর্ন বাজবে");redo()}));
  screen("হর্ন বাছাই","একটা বোতামে ডাবল ট্যাপ করলে হর্নের শব্দ শুনবে। বাছতে আবার ডাবল ট্যাপ করো। তোমার কয়েন "+B(coins())+"।",bs);
}
function unlock(kind,k){
  const nm=kind==="c"?"রং "+COLORS[k]:HORNS[k],cost=kind==="c"?UNLOCK:HORN_COST[k];
  const done=()=>{if(kind==="c"){S.cols.push(k);S.col[S.car]=k}else{S.hornOwn.push(k);S.horn=k}save();say(nm+" আনলক হলো, বাছা হলো।");goBack()};
  screen(nm+" আনলক","দুটো উপায় আছে। কয়েন খরচ করতে পারো, বা একটা অ্যাড দেখলে বিনা কয়েনে পাবে। তোমার কয়েন "+B(coins())+"।",[
    btn("অ্যাড দেখে বিনা কয়েনে নাও",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd())done();else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
    }),
    btn(B(cost)+" কয়েন দিয়ে নাও",()=>{if(coins()>=cost){addCoins(-cost);done()}else say("কয়েন কম।")})
  ]);
}

/* ---------- কাত করা ও ঝাঁকানো ---------- */
let G=null,gOn=false,gCenter=0,gCal=null,gSeen=false,lastShake=0;
function onOri(e){
  if(typeof e.gamma!=="number")return;
  gSeen=true;G=G==null?e.gamma:G*0.6+e.gamma*0.4;
  if(gCal)gCal.push(e.gamma);
}
function onMotion(e){
  const a=e.accelerationIncludingGravity;if(!a||!R||R.paused)return;
  const m=Math.sqrt((a.x||0)*(a.x||0)+(a.y||0)*(a.y||0)+(a.z||0)*(a.z||0));
  if(m>26&&Date.now()-lastShake>900){lastShake=Date.now();honk()}
}
function sensorsOn(){
  if(gOn)return;gOn=true;gSeen=false;G=null;
  try{window.addEventListener("deviceorientation",onOri);window.addEventListener("devicemotion",onMotion)}catch(e){}
}
function sensorsOff(){gOn=false;try{window.removeEventListener("deviceorientation",onOri);window.removeEventListener("devicemotion",onMotion)}catch(e){}}

/* ---------- মেরামত ---------- */
function repairPage(mode){
  try{window.__LOM_ADS&&window.__LOM_ADS.preload&&window.__LOM_ADS.preload()}catch(e){}
  const o=offer();
  let msg=mode==="resume"?"গাড়ি ভেঙে গেছে। এই দৌড়ে "+B(R?R.passed:0)+"বার নিরাপদে পার হয়েছো। ":"তোমার গাড়ি ভাঙা, মেরামত না করে খেলা যাবে না। ";
  msg+="তোমার কয়েন "+B(coins())+"। একটা পরামর্শ: অ্যাড দেখে ঠিক করলে কয়েন বেঁচে যায়, গাড়ি কেনার লক্ষ্যের আরও কাছে থাকবে। ";
  if(o)msg+=o.ok?"তোমার জন্য অফার অপেক্ষা করছে: "+CARS[o.i].n+", দাম "+B(price(o.i))+" কয়েন। ":"পরের লক্ষ্য "+CARS[o.i].n+", আরও "+B(price(o.i)-coins())+" কয়েন লাগবে। ";
  msg+="কোনটা করবে, বেছে নাও।";
  const fixed=()=>{S.broken=false;save();if(mode==="resume"&&R)resume();else setTop(tripPage)};
  const bs=[
    btn("অ্যাড দেখে বিনা কয়েনে গাড়ি ঠিক করো (সেরা উপায়)",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd())fixed();else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
    }),
    btn(B(REPAIR)+" কয়েন দিয়ে গাড়ি ঠিক করো",()=>{
      if(coins()<REPAIR){say("কয়েন কম। অ্যাড দেখে ঠিক করতে পারো।");return}
      if(o&&o.ok&&coins()-REPAIR<price(o.i)){
        nav(()=>screen("একটু ভেবে নাও","কয়েন খরচ করলে তোমার "+CARS[o.i].n+" কেনার সুযোগ আপাতত চলে যাবে। অ্যাড দেখে ঠিক করলে সেটা কেনা যাবে। তবুও কয়েন দিয়ে ঠিক করবে?",[
          btn("না, অ্যাড দেখে ঠিক করব",async()=>{await say("অ্যাড আসছে।");if(await watchAd()){stack.pop();fixed()}else await say("এখন অ্যাড পাওয়া যাচ্ছে না।")}),
          btn("হ্যাঁ, কয়েন দিয়েই ঠিক করো",()=>{addCoins(-REPAIR);stack.pop();fixed()})
        ]));
      }else{addCoins(-REPAIR);fixed()}
    }),
    btn("গাড়ির শোরুম দেখো",()=>nav(showroom))
  ];
  screen(mode==="resume"?"ধাক্কা লেগেছে":"গাড়ি ভাঙা",msg,bs);
  say(msg);
}

/* ---------- দৌড় ---------- */
let R=null,timer=null;
function stopRun(){if(timer){clearInterval(timer);timer=null}R=null;sensorsOff();engineStop();newBus()}
const kmBn=x=>x===0.5?"আধা":x===1.5?"দেড়":x===2.5?"আড়াই":Number.isInteger(x)?B(x):"সাড়ে "+B(Math.floor(x));
const kmEn=x=>String(x);
let tripBoost=false;
function tripPage(){
  const bs=TRIPS.map(t=>btn((isEn()?t.en:t.n),()=>setTop(()=>runStart(t))));
  bs.unshift(btn(tripBoost?"বুস্ট চালু আছে: ঢাল আর দ্বিগুণ কয়েন":"অ্যাড দেখে বুস্ট নাও: ঢাল আর দ্বিগুণ কয়েন",async()=>{
    if(tripBoost){say("বুস্ট আগে থেকেই চালু আছে");return}
    await say("অ্যাড আসছে।");
    if(await watchAd()){tripBoost=true;await say("বুস্ট চালু। এই ট্রিপে ঢাল নিয়ে শুরু করবে আর কয়েন দ্বিগুণ পাবে।");redo()}
    else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
  }));
  screen("ট্রিপ বেছে নাও","পথ যত লম্বা, বোনাস তত বেশি। পথ বদলাবে: শহর, হাইওয়ে, গ্রামের পথ। "+offerLine(),bs);
}
async function runStart(trip){
  stopRun();newBus();
  S.runs++;save();
  trip=trip||TRIPS[0];
  const sp=speedOf(S.car),car=CARS[S.car];
  R={t:0,dist:0,km:trip.km,mile:1,step:trip.km<=3?0.5:1,lane:1,wave:null,next:2.5,passed:0,earn:0,sp,paused:true,streak:0,shield:!!car.sh||tripBoost,cmul:tripBoost?2:1,ev:[],
     reach:5,gap:8,lvl:0,tilt:false,honkAt:-99,stage:-1};
  tripBoost=false;
  screen("প্রস্তুত হও","ফোনটা সোজা করে ধরো। এখন মাঝের লেন ঠিক করছি।",[]);
  gCal=[];sensorsOn();
  const me=R;
  sayG(isEn()?"Hold the phone straight. Your trip is "+kmEn(trip.km)+" kilometers.":"ফোন সোজা করে ধরো। আজকের পথ "+B(trip.km)+" কিলোমিটার।");
  await sleep(3200);if(R!==me)return;
  if(gSeen&&gCal.length>3){gCenter=gCal.reduce((a,b)=>a+b,0)/gCal.length;R.tilt=true}
  gCal=null;
  tone(500,0.15,0,0.12);await sleep(500);if(R!==me)return;
  tone(600,0.15,0,0.12);await sleep(500);if(R!==me)return;
  tone(900,0.5,0,0.14);
  engineStart();
  R.paused=false;
  setTop(drawRun);
  sayG(R.tilt?(isEn()?"Go! Tilt your phone left or right.":"চলো! ফোন বাঁয়ে বা ডানে কাত করো।"):(isEn()?"Go! No sensor found, use the buttons.":"চলো! সেন্সর পাইনি, বোতাম ব্যবহার করো।"));
  timer=setInterval(tick,100);
}
function drawRun(){
  screen("দৌড় চলছে","ফোন কাত করো, বা বোতামে ডাবল ট্যাপ করো। ফোন ঝাঁকালে হর্ন বাজবে। পেছনে যেতে নিচের ব্যাক বোতাম বা ফোনের ব্যাক চাপো।",[
    btn("বাঁয়ে যাও",()=>go(0),"বাঁয়ের লেনে যাও"),
    btn("মাঝে যাও",()=>go(1),"মাঝের লেনে যাও"),
    btn("ডানে যাও",()=>go(2),"ডানের লেনে যাও"),
    btn("হর্ন বাজাও",honk,"হর্ন বাজাও")
  ]);
}
function go(l){
  if(!R||R.paused||R.lane===l)return;
  R.lane=l;tone(440+l*110,0.1,l-1,0.1,"sine");buzz(15);
}
function honk(){
  hornSound(hornFor());
  if(!R||R.paused||!R.wave||R.t-R.honkAt<4)return;
  R.honkAt=R.t;
  let moved=false;
  R.wave.items.forEach((x,i)=>{if(x&&x.t==="o"&&x.o.k==="person"){R.wave.items[i]=null;moved=true}});
  if(moved){setTimeout(()=>{play("whoosh",0,0.3);sayG(isEn()?"The person stepped aside.":"মানুষটা সরে গেছে।")},700)}
}
document.addEventListener("dblclick",e=>{ if(R&&!R.paused&&!e.target.closest("button"))honk() });

/* কণ্ঠের নির্দেশ: যে লেনে আছো তা ধরে, ভদ্রভাবে, ছোট করে */
function phrase(items,cur){
  const en=isEn();
  const L=en?["the left lane","the middle lane","the right lane"]:["বাঁ লেনে","মাঝের লেনে","ডান লেনে"];
  const nm=x=>x.t==="o"?(en?x.o.en:x.o.bn):x.t==="c"?(en?"coins":"কয়েন"):(en?"a shield":"ঢাল");
  const free=[0,1,2].filter(i=>!items[i]);
  const obs=[0,1,2].filter(i=>items[i]&&items[i].t==="o");
  const pk=[0,1,2].filter(i=>items[i]&&items[i].t!=="o");
  const parts=[];
  if(items[cur]&&items[cur].t==="o"){
    const F=free.length?free[0]:(pk.length?pk[0]:-1);
    parts.push(en?pick(["Careful, "+nm(items[cur])+" is coming in your lane. Please move now.","Warning! "+nm(items[cur])+" ahead of you. Move out of the way."]):pick(["সাবধান, আপনার লেনে "+nm(items[cur])+" আসছে। এখনই সরে যান।","আপনার সামনে "+nm(items[cur])+"। দয়া করে সরে যান, নইলে দুর্ঘটনা হতে পারে।"]));
    if(F>=0)parts.push(en?L[F].replace(/^./,c=>c.toUpperCase())+" is clear.":L[F]+" ফাঁকা আছে।");
  }else{
    obs.forEach(i=>parts.push(en?pick(["There is "+nm(items[i])+" in "+L[i]+". Do not go there.","Careful, "+nm(items[i])+" in "+L[i]+"."]):pick([L[i]+" "+nm(items[i])+" আছে, ওদিকে যাবেন না।",L[i]+" "+nm(items[i])+" আসছে, সাবধান।"])));
    pk.forEach(i=>parts.push(en?(items[i].t==="c"?"There are coins in "+L[i]+".":"There is a shield in "+L[i]+"."):L[i]+" "+nm(items[i])+" আছে।"));
    if(!parts.length)parts.push(en?"The road is clear.":"রাস্তা ফাঁকা, চালিয়ে যান।");
  }
  return parts.slice(0,2).join(" ");
}
function tick(){
  if(!R||R.paused)return;
  R.t+=0.1;
  const lvl=Math.min(5,Math.floor(R.dist/(R.km/6)));
  const v=KMS*Math.pow(R.sp,0.8)*(1+0.06*lvl);   // কিলোমিটার প্রতি সেকেন্ড
  R.dist+=v*0.1;
  if(lvl>R.lvl){R.lvl=lvl;gearUp()}
  engineSet(0.8+R.lvl*0.14+R.sp*0.05+0.04*Math.sin(R.t*3),Math.min(1,R.sp*0.25+R.lvl*0.15));
  /* কাত থেকে লেন */
  if(R.tilt&&G!=null){
    const d=G-gCenter;
    if(d<-TILT)go(0);else if(d>TILT)go(2);else if(Math.abs(d)<TILT*0.6)go(1);
  }
  R.reach=Math.max(4.6,5.4-0.25*R.sp-0.1*R.lvl);
  R.gap=R.reach+Math.max(2.4,3.4-0.25*R.sp);
  /* পথের ধরন বদল */
  const st=Math.floor(R.dist/2)%3;
  if(st!==R.stage&&!R.wave){R.stage=st;sayG(isEn()?STAGES[st].sayEn:STAGES[st].say);R.next=Math.max(R.next,R.t+5.5)}
  /* মাইলফলক */
  if(R.dist>=R.km){finish();return}
  if(!R.wave&&R.dist>=R.mile*R.step&&R.dist<R.km-0.2){
    const d=R.mile*R.step;R.mile++;
    mileSound();
    const left=Math.round((R.km-d)*2)/2;
    sayG(isEn()?"Passed "+kmEn(d)+" kilometers. "+kmEn(left)+" to go.":"পার হলো "+kmBn(d)+" কিলোমিটার। বাকি "+kmBn(left)+" কিলোমিটার।");
    R.next=Math.max(R.next,R.t+4.2);
  }
  /* নতুন ঢেউ */
  if(!R.wave&&R.t>=R.next){
    const n=Math.random()<0.4+0.1*R.lvl?2:1;
    const items=[null,null,null];
    const order=[0,1,2].sort(()=>Math.random()-.5);
    for(let k=0;k<n;k++)items[order[k]]={t:"o",o:OBS[pick(STAGES[Math.max(0,R.stage)].pool)]};
    if(Math.random()<0.55&&order[n]!==undefined)items[order[n]]={t:Math.random()<0.15?"s":"c"};
    R.wave={items,hit:R.t+R.reach};
    sayG(phrase(items,R.lane));
    items.forEach((x,i)=>{if(x)approach(x,i,R.reach)});
  }
  /* ঢেউয়ের ফল */
  if(R.wave&&R.t>=R.wave.hit){
    const x=R.wave.items[R.lane];
    R.wave=null;R.next=R.t+R.gap-R.reach;
    if(x&&x.t==="o"){
      if(R.shield){R.shield=false;R.streak=0;shieldBreak();sayG(isEn()?"The shield saved you!":"ঢাল আপনাকে বাঁচালো!");R.next=Math.max(R.next,R.t+2.5);return}
      crash();return;
    }
    R.passed++;R.streak++;
    let c=Math.round(8*R.sp*(1+R.lvl*0.2)*CARS[S.car].cm*R.cmul);
    let sp="";
    if(x&&x.t==="c"){c+=30;coinSound(R.lane)}
    else if(x&&x.t==="s"){R.shield=true;shieldSound();sp=isEn()?"Shield collected.":"ঢাল পেয়েছেন।"}
    else passSound(R.lane);
    if(R.streak%5===0){c+=20;sp=(isEn()?R.streak+" in a row! Bonus coins.":B(R.streak)+" বার টানা! বাড়তি কয়েন।")}
    if(sp){sayG(sp);R.next=Math.max(R.next,R.t+2.5)}
    R.earn+=c;addCoins(c);
  }
}
function crash(){
  R.paused=true;engineStop();crashSound();
  S.broken=true;S.best=Math.max(S.best,R.passed);save();
  setTimeout(()=>{if(R)setTop(()=>repairPage("resume"))},1100);
}
function resume(){
  if(!R)return;
  R.paused=false;R.wave=null;R.ev=[];R.next=R.t+2.5;R.lane=1;R.streak=0;
  engineStart();
  setTop(drawRun);sayG(isEn()?"The car is fixed. Keep going.":"গাড়ি ঠিক হয়েছে। চালিয়ে যান।");
}
function finish(){
  const car=CARS[S.car],km=R.km;
  const bonus=Math.round(30*R.sp*car.cm*R.km*R.cmul);addCoins(bonus);
  S.best=Math.max(S.best,R.passed);S.total+=R.earn+bonus;save();
  const earn=R.earn+bonus,p=R.passed,secs=Math.round(R.t),m=Math.floor(secs/60),s2=secs%60;
  stopRun();fanfare();buzz(200);
  const tm=(m?B(m)+" মিনিট ":"")+B(s2)+" সেকেন্ড";
  const msg="অভিনন্দন! "+B(km)+" কিলোমিটারের লক্ষ্য পূরণ। সময় লেগেছে "+tm+"। "+B(p)+"বার নিরাপদে পার হয়েছো। বোনাস "+B(bonus)+" কয়েন। মোট "+B(earn)+" কয়েন পেয়েছো। এখন কয়েন "+B(coins())+"। র‍্যাংক: "+rank()+"। "+offerLine();
  setTop(()=>screen("লক্ষ্য পূরণ",msg,[
    btn("অ্যাড দেখে এই দৌড়ের কয়েন দ্বিগুণ করো (+"+B(earn)+")",async()=>{
      await say("অ্যাড আসছে।");
      if(await watchAd()){addCoins(earn);await say("কয়েন দ্বিগুণ হলো। এখন কয়েন "+B(coins()))}else await say("এখন অ্যাড পাওয়া যাচ্ছে না।");
      redo();
    }),
    btn("আবার চালাও",()=>setTop(tripPage)),
    btn("গাড়ির শোরুম দেখো",()=>nav(showroom))
  ]));
  sayG(isEn()?"Goal reached. Congratulations!":"লক্ষ্য পূরণ। অভিনন্দন! সময় লেগেছে "+tm+"। মোট "+B(earn)+" কয়েন পেয়েছেন।");
}

/* কীবোর্ডে পরীক্ষার জন্য */
document.addEventListener("keydown",e=>{
  if(!R)return;
  if(e.key==="ArrowLeft")go(0);else if(e.key==="ArrowDown"||e.key==="ArrowUp")go(1);else if(e.key==="ArrowRight")go(2);else if(e.key==="h")honk();
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
