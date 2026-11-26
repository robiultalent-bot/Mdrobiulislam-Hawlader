/* মনের আলো · ডক্টর মায়া প্লাস: নতুন খেলা (তারা ধরো, ঠিক-ভুল, গল্পের পথ), আলোর তারা ও পদবি, জোনাকি */
(function(){
"use strict";
try{
if(typeof TASKS==="undefined"||typeof gameLevels==="undefined"||typeof MTYPE==="undefined")return;
const KEY="lom_maya_plus_v1";
const RANKS=[[0,"আলোর অতিথি"],[15,"আলোর পথিক"],[40,"আলোর বন্ধু"],[90,"আলোর সাথী"],[160,"আলোর যোদ্ধা"],[260,"আলোর রক্ষক"],[400,"আলোর দূত"],[600,"মনের আলোর তারকা"]];
let S={s:0,q:{},st:{}};
try{const d=JSON.parse(localStorage.getItem(KEY)||"{}");if(d&&typeof d.s==="number")S=Object.assign(S,d)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const rankOf=n=>{let r=RANKS[0][1];for(const x of RANKS)if(n>=x[0])r=x[1];return r};
let lvStars=0;
async function award(n){
  if(!(n>0))return;
  const before=rankOf(S.s);S.s+=n;lvStars+=n;save();
  const after=rankOf(S.s);
  if(after!==before){try{bell()}catch(e){}await speak(`অভিনন্দন, ${name}! তুমি এখন "${after}" পদবিতে পৌঁছে গেছো।`)}
}
const pick=(a)=>a[Math.random()*a.length|0];
const star=n=>bn(n)+"টা আলোর তারা";

/* ---------- খেলা ১: তারা ধরো (সময়ের খেলা) ---------- */
let dbg={tc:0,dur:0};try{window.__MP_DBG=dbg}catch(e){}
function flyStar(dur){
  ensureAudio();
  const t=AC.currentTime+.2,o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),pn=AC.createStereoPanner();
  o.type="sine";o2.type="triangle";
  o.frequency.setValueAtTime(740,t);o.frequency.linearRampToValueAtTime(880,t+dur/2);o.frequency.linearRampToValueAtTime(740,t+dur);
  o2.frequency.setValueAtTime(1480,t);o2.frequency.linearRampToValueAtTime(1760,t+dur/2);o2.frequency.linearRampToValueAtTime(1480,t+dur);
  pn.pan.setValueAtTime(-1,t);pn.pan.linearRampToValueAtTime(1,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.08);g.gain.setValueAtTime(.2,t+dur-.1);g.gain.linearRampToValueAtTime(0,t+dur);
  const g2=AC.createGain();g2.gain.value=.25;
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(pn);pn.connect(master);
  o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
  o.onended=()=>{try{o.disconnect();o2.disconnect();g.disconnect();g2.disconnect();pn.disconnect()}catch(e){}};
  return t+dur/2;
}
async function mpCatch(p){
  ambient(p);
  await speak(`${name}, এবার একটা খেলা খেলি। একটা আলোর তারা তোমার বাম কান থেকে ডান কানে উড়ে যাবে। ঠিক মাঝখানে এলে উপরে সোয়াইপ করো। তারাটা মাঝখানে থাকতে সোয়াইপ করতে পারলে বেশি তারা পাবে।`);
  const rounds=3+p,dur=2.8-.3*p,win=.5-.04*p;
  let got=0,perfect=0;
  for(let i=0;i<rounds;i++){
    await speak(i===0?"তৈরি হও।":rnd(["আরেকবার।","এবার আরও মনোযোগ দিয়ে।","তৈরি?"]));
    const w=wait(["up"]);
    await sleep(500);
    const tc=flyStar(dur);dbg.tc=tc;dbg.dur=dur;
    const r=await live(Promise.race([w,sleep((dur+1.3)*1000).then(()=>"to")]));
    const now=AC.currentTime;
    if(r==="to"){if(pending){pending=null;setWant(null)}await speak("তারাটা চলে গেল। কোনো ব্যাপার না।");continue}
    const d=now-tc,ad=Math.abs(d);
    if(ad<=win/2){bell();got+=3;perfect++;await speak(rnd(["একদম মাঝখানে!","দারুণ নিশানা!","একেবারে ঠিক সময়ে!"]))}
    else if(ad<=win){tick();got+=2;await speak("খুব কাছে ছিল, বেশ ভালো!")}
    else if(ad<=1.2){wrong();got+=1;await speak(d<0?"একটু আগে হয়ে গেছে। মাঝখানের জন্য একটু অপেক্ষা করো।":"একটু দেরি হয়ে গেছে। আরেকটু তাড়াতাড়ি।")}
    else{wrong();await speak(d<0?"অনেক আগে হয়ে গেছে।":"অনেক দেরি হয়ে গেছে।")}
  }
  if(got>0){await award(got);await speak(`তুমি এই খেলায় ${star(got)} পেলে।`)}
  else await speak("আজ তারা ধরা হলো না, কিন্তু চেষ্টা করাটাই আসল। পরের বার হবে।");
}

/* ---------- খেলা ২: ঠিক না ভুল (শেখার খেলা) ---------- */
const Q=[
[
["ভয় পাওয়া মানে তুমি দুর্বল।",0,"ভয় সবারই লাগে। ভয় আমাদের সতর্ক করে। ভয়ের সঙ্গে চলতে শেখাই সাহসের কাজ।"],
["ধীরে গভীর শ্বাস নিলে শরীর শান্ত হতে সাহায্য করে।",1,"শ্বাস ধীর করলে শরীরের টান কমে আসে, মনও শান্ত হয়।"],
["ভয় পেলে চুপ করে সব সহ্য করাই একমাত্র উপায়।",0,"নিজেকে নরমভাবে বলা, যেমন আমি নিরাপদ, মনকে শান্ত করে। কারও সঙ্গে কথা বললেও হালকা লাগে।"],
["ছোট ছোট পদক্ষেপে ভয় জয় করা যায়।",1,"একটু একটু করে এগোলে ভয় ধীরে ধীরে ছোট হয়ে আসে।"],
["ভয় একবার এলে কখনো কমে না।",0,"ভয় ধীরে ধীরে কমে, বিশেষ করে নিরাপদভাবে বারবার সামনে গেলে।"],
["অচেনা জায়গায় কান সজাগ রাখলে চারপাশ ভালো বোঝা যায়।",1,"শব্দ শুনে আমরা দিক, দূরত্ব আর পরিবেশ অনেকটা বুঝে নিতে পারি।"]
],[
["শব্দ শুনে দিক চেনা অনুশীলনে উন্নতি করা যায়।",1,"বারবার অনুশীলনে কান আরও দক্ষ হয়ে ওঠে।"],
["দুই কানে শব্দ পৌঁছানোর সামান্য সময় আর জোরের পার্থক্য থেকে মস্তিষ্ক দিক বোঝে।",1,"এই কারণেই বাম কান আর ডান কানের শব্দ আলাদা করে চেনা যায়।"],
["অনেক শব্দ একসঙ্গে এলে মনোযোগ ধরে রাখা কঠিন হওয়া স্বাভাবিক।",1,"তখন একটা শব্দ বেছে নিয়ে শুধু সেটায় মন দিলে সহজ হয়।"],
["মনোযোগ জন্ম থেকে ঠিক হয়ে থাকে, অনুশীলনে বাড়ে না।",0,"মনোযোগ অনুশীলনে বাড়ে। প্রতিদিন একটু একটু করে চেষ্টা করলে উন্নতি হয়।"],
["হেডফোনে ভলিউম সবচেয়ে বেশি রাখলে শোনা সবচেয়ে ভালো হয়।",0,"বেশি জোরে শুনলে কানের ক্ষতি হতে পারে। আরামদায়ক ভলিউমে শোনো।"],
["কিছুক্ষণ চুপচাপ শুধু চারপাশের শব্দ শুনলে মন শান্ত হতে পারে।",1,"মনোযোগ শব্দে থাকলে দুশ্চিন্তার ভাবনা একটু সরে যায়।"]
],[
["মন খারাপ হলে কাউকে বলা লজ্জার ব্যাপার।",0,"মনের কথা বললে হালকা লাগে। সাহায্য চাওয়া সাহসের কাজ।"],
["কঠিন অনুভূতি চিরকাল থাকে না, সময়ের সঙ্গে বদলায়।",1,"মেঘ যেমন সরে যায়, কষ্টের অনুভূতিও ধীরে ধীরে বদলায়।"],
["রাগ এলে পাঁচ সেকেন্ড থেমে শ্বাস নিলে সিদ্ধান্ত নেওয়া সহজ হয়।",1,"একটু থামলে মাথা ঠান্ডা হয়, তারপর ভেবে বলা যায়।"],
["ঘুম কম হলে মেজাজ আরও খারাপ হতে পারে।",1,"পর্যাপ্ত ঘুম মন ভালো রাখতে খুব সাহায্য করে।"],
["অনুভূতি চেপে রাখাই সবচেয়ে ভালো।",0,"অনুভূতি চিনে নিয়ে কাউকে বললে বা লিখে রাখলে মন হালকা হয়।"],
["ভুল করলে নিজেকে কড়া কথা বলাই শেখার সেরা উপায়।",0,"নিজের প্রতি দয়ালু হলে আমরা আরও ভালো শিখি আর আবার চেষ্টা করার জোর পাই।"]
],[
["প্রিয় মানুষের সঙ্গে নিয়মিত কথা বললে মন ভালো থাকতে সাহায্য করে।",1,"কেউ আমার খোঁজ রাখে, এই অনুভূতিই মনকে অনেক শক্তি দেয়।"],
["একা থাকা আর একাকীত্ব একই জিনিস।",0,"একা থাকা পছন্দের হতে পারে। একাকীত্ব মানে সঙ্গ চাইলেও না পাওয়ার কষ্ট।"],
["নিয়মিত হাঁটা বা হালকা ব্যায়াম মন ভালো রাখতে সাহায্য করে।",1,"শরীর নড়লে মনও হালকা হয়।"],
["প্রতিদিন তিনটা ভালো জিনিস মনে করলে মন ভালো লাগার সুযোগ বাড়ে।",1,"একে কৃতজ্ঞতার অভ্যাস বলে। খুব ছোট জিনিসও হতে পারে, যেমন এক কাপ চা।"],
["মন খারাপ হলে সবার সঙ্গে যোগাযোগ বন্ধ করে দেওয়াই ভালো।",0,"একদম বন্ধ করে দিলে মন আরও ভার হতে পারে। অন্তত একজনের সঙ্গে কথা বলো।"],
["রোজ একই সময়ে ঘুমানোর মতো ছোট অভ্যাস মনকে স্থির রাখে।",1,"নিয়ম থাকলে শরীর আর মন দুটোই আরাম পায়।"]
],[
["অগ্রগতি মানে কখনো পিছিয়ে না পড়া।",0,"পিছিয়ে পড়াও পথের অংশ। আবার উঠে এগোনোই আসল অগ্রগতি।"],
["নিজের ছোট সাফল্য মনে করলে আত্মবিশ্বাস বাড়ে।",1,"আমি এটা পেরেছিলাম, এই কথা মনে রাখলে পরেরটাও সহজ লাগে।"],
["মন খুব ভারী লাগলে আর অনেকদিন না কমলে বিশ্বাসী মানুষের বা চিকিৎসকের সাহায্য নেওয়া ভালো।",1,"সাহায্য নেওয়া দুর্বলতা নয়। এটা নিজের যত্ন নেওয়ার সবচেয়ে ভালো উপায়।"],
["নিজেকে বিশ্বাস করা একদিনে হয়ে যায়।",0,"বিশ্বাস ধীরে ধীরে গড়ে ওঠে। প্রতিদিনের ছোট পদক্ষেপই তা গড়ে।"],
["অন্যকে সাহায্য করলে নিজের মনও ভালো লাগতে পারে।",1,"ভালো কাজ করলে মনের ভেতর একটা আলো জ্বলে ওঠে।"],
["এই গেম খেলাই সব মানসিক সমস্যার চিকিৎসা।",0,"এই গেম শান্ত হতে সাহায্য করে, কিন্তু চিকিৎসকের বিকল্প নয়। বেশি কষ্ট হলে বিশেষজ্ঞের সাহায্য নিও।"]
]];
async function mpQuiz(p){
  ambient(p);
  await speak(`${name}, এবার ঠিক না ভুল খেলা। আমি একটা কথা বলব। কথাটা ঠিক হলে ডানে সোয়াইপ করো, ভুল হলে বামে।`);
  const pool=Q[p],seen=S.q[p]||[];
  let left=pool.map((_,i)=>i).filter(i=>!seen.includes(i));
  if(left.length<3){S.q[p]=[];left=pool.map((_,i)=>i)}
  const n=Math.min(3,left.length);let right=0;
  for(let k=0;k<n;k++){
    const idx=left.splice(Math.random()*left.length|0,1)[0];
    (S.q[p]=S.q[p]||[]).push(idx);
    const [t,ans,why]=pool[idx];
    const g=await ask(`প্রশ্ন ${bn(k+1)}: ${t} ঠিক হলে ডানে, ভুল হলে বামে সোয়াইপ করো।`,["left","right"]);
    const ok=(g==="right")===!!ans;
    if(ok){right++;bell();await speak(rnd(["ঠিক বলেছো!","একদম ঠিক!","সঠিক উত্তর!"]))}
    else{wrong();await speak("এবার ঠিক হলো না, তাতে কিছু যায় আসে না।")}
    await speak((ans?"কথাটা ঠিক ছিল। ":"কথাটা ভুল ছিল। ")+why);
  }
  save();
  const got=right*2+(right===n?1:0);
  await award(got);
  await speak(right===n?`সবগুলো ঠিক! তুমি ${star(got)} পেলে।`:`তুমি ${bn(n)}টার মধ্যে ${bn(right)}টা ঠিক বলেছো, আর ${star(got)} পেলে।`);
}

/* ---------- খেলা ৩: গল্পের পথ (সিদ্ধান্তের খেলা) ---------- */
const ST=[
[
["রাতে ঘরে হঠাৎ একটা শব্দ হলো। তোমার বুক ধড়ফড় করছে।","চাদরে মুখ ঢেকে চুপ করে থাকি।","ধীরে শ্বাস নিই আর ভাবি শব্দটা কীসের হতে পারে।","শ্বাস ধীর হতেই তুমি বুঝলে শব্দটা ছিল ফ্যানের। ভয় অনেক কমে গেল।","চুপ করে থাকলে ভয় আরও বড় মনে হয়। পরের বার ধীরে শ্বাস নিয়ে ভেবে দেখো।"],
["নতুন একটা জায়গায় যেতে হবে, মনে ভয় লাগছে।","যাব না, বাদ দিই।","একজন বিশ্বাসী মানুষকে সঙ্গে নিই আর ছোট করে শুরু করি।","সঙ্গে একজন থাকায় ভয়টা ছোট হয়ে এল, আর জায়গাটা তোমার চেনা হয়ে গেল।","না গেলে ভয় ঠিক থেকে যায়। ছোট পদক্ষেপে গেলে ভয় কমে।"]
],[
["ভিড়ের রাস্তায় চারদিকে শব্দ, দিক গুলিয়ে যাচ্ছে।","এক জায়গায় থেমে কান পেতে একটা পরিচিত শব্দ ধরি।","দ্রুত হাঁটতে থাকি।","থেমে শুনতেই একটা দোকানের পরিচিত শব্দ পেয়ে তুমি দিক বুঝে নিলে।","দ্রুত হাঁটলে দিক আরও গুলিয়ে যেতে পারে। একটু থেমে শোনা ভালো।"],
["বন্ধু ডাকছে, কিন্তু কোন দিক থেকে বোঝা যাচ্ছে না।","রেগে গিয়ে চেঁচিয়ে উঠি।","বলি, আরেকবার ডাকো, আমি শুনে এগিয়ে আসছি।","বন্ধুর গলা ধরে ধরে তুমি ঠিক তার কাছে পৌঁছে গেলে।","রেগে গেলে মনোযোগ ভেঙে যায়। আরেকবার ডাকতে বলাই সহজ উপায়।"]
],[
["কেউ তোমাকে অন্যায় কথা বলল, খুব রাগ হলো।","পাঁচ সেকেন্ড শ্বাস ধরে ধীরে ছাড়ি, তারপর শান্তভাবে বলি।","সঙ্গে সঙ্গে কড়া কথা বলে দিই।","শান্ত থেকে বলায় কথাটা সে ঠিকমতো বুঝল, আর ঝগড়া বাঁধল না।","কড়া কথা বললে ঝগড়া বাড়ে। একটু থেমে বললে ভালো ফল হয়।"],
["মন খুব খারাপ, কিন্তু কাউকে বলতে লজ্জা লাগছে।","একজন প্রিয় মানুষকে বলি, আজ মনটা ভার।","সব চেপে রাখি।","বলার পর মনটা অনেক হালকা হলো, আর সে তোমার পাশে থাকল।","চেপে রাখলে ভার আরও বাড়ে। একজনকে বললেও অনেক হালকা লাগে।"]
],[
["অনেকদিন কারও খোঁজ নাওনি, হঠাৎ তার কথা মনে পড়ল।","ফোন করে বলি, তোমার কথা মনে পড়ল।","ভাবি এখন আর হয় না, থাক।","সে খুব খুশি হলো। তোমাদের মধ্যে আবার উষ্ণতা ফিরে এল।","না ডাকলে দূরত্ব বাড়ে। একটা ছোট ফোনই সম্পর্ক জাগিয়ে দিতে পারে।"],
["সারাদিন একা, মন একটু ভার।","ঘরে একা বসে থাকি।","বাইরে একটু হাঁটি, নয়তো কাউকে ফোন করি।","হাঁটতে হাঁটতে মনটা হালকা হয়ে এল, আর কথা বলে ভালো লাগল।","একা বসে থাকলে ভাবনা বাড়ে। একটু নড়াচড়া বা কারও সঙ্গে কথা মনকে সাহায্য করে।"]
],[
["একটা কাজে ভুল হয়ে গেল, মনে হচ্ছে আমি পারি না।","বলি, ভুল শেখার অংশ, আবার চেষ্টা করি।","বলি, আমি যোগ্য নই।","দ্বিতীয়বার চেষ্টায় তুমি কাজটা ঠিকমতো করে ফেললে।","নিজেকে ছোট করলে সাহস কমে। ভুল হলে আবার চেষ্টা করাই শক্তি।"],
["আজ আগের চেয়ে ভালো আছো, কিন্তু ভয় লাগছে আবার খারাপ হবে।","আজকের ভালোটুকু মেনে নিই, কাল যা হয় দেখা যাবে।","ভালো লাগা বিশ্বাস করি না।","আজকের ভালো লাগাটুকু তুমি পুরোপুরি উপভোগ করলে। এটা তোমার জয়।","ভালো লাগা বিশ্বাস না করলে আনন্দটাও হারিয়ে যায়। আজকের জয়টুকু মেনে নাও।"]
]];
async function mpStory(p){
  ambient(p);
  await speak(`${name}, এবার গল্পের পথ। আমি একটা ঘটনা বলব। দুটো পথ দেব। বামে সোয়াইপ করলে প্রথম পথ, ডানে সোয়াইপ করলে দ্বিতীয় পথ।`);
  const sc=ST[p][S.st[p]=((S.st[p]||0)+1)%2];save();
  const sw=Math.random()<.5; // কোন পথ কোন দিকে
  const optL=sw?sc[2]:sc[1],optR=sw?sc[1]:sc[2];
  const g=await ask(`${sc[0]} বামে: ${optL} ডানে: ${optR}`,["left","right"]);
  const chosenGood=sw?(g==="left"):(g==="right");
  if(chosenGood){bell();await speak(sc[3]);await award(3);await speak(`দারুণ সিদ্ধান্ত! তুমি ${star(3)} পেলে।`)}
  else{tick();await speak(sc[4]);await award(1);await speak(`চেষ্টা করেছো, তাই ${star(1)} পেলে। পরের বার আরও ভালো করবে।`)}
}

/* ---------- নিবন্ধন: নতুন ধরন, লেভেলের সঙ্গে মেলানো ---------- */
MTYPE.mpCatch="mpcatch";MTYPE.mpQuiz="mpquiz";MTYPE.mpStory="mpstory";
TASKS.mpcatch=mpCatch;TASKS.mpquiz=mpQuiz;TASKS.mpstory=mpStory;
for(let i=1;i<gameLevels.length-1;i++){
  const l=i+1,D=gameLevels[i];
  if(l%7===3)D.meditationType="mpQuiz";
  else if(l%7===5)D.meditationType="mpCatch";
  else if(l%9===4)D.meditationType="mpStory";
}

/* ---------- লেভেল শেষে তারা ও জোনাকি ---------- */
async function firefly(){
  await speak("দেখো, একটা জোনাকি উড়ছে! শুনতে পেলে চার সেকেন্ডের মধ্যে উপরে সোয়াইপ করো।");
  const w=wait(["up"]);
  ensureAudio();const t=AC.currentTime+.1,pn=AC.createStereoPanner();pn.pan.value=Math.random()<.5?-.8:.8;pn.connect(master);
  for(let i=0;i<5;i++)tone(pn,1320+(i%2)*220,t+i*.5,.35,"sine",.08);
  const r=await live(Promise.race([w,sleep(4000).then(()=>"to")]));
  if(r==="to"){if(pending){pending=null;setWant(null)}await speak("জোনাকিটা উড়ে চলে গেল।");return}
  bell();await award(5);await speak(`ধরে ফেলেছো! তুমি ${star(5)} পেলে।`);
}
if(typeof window.runLevel==="function"){
  const orig=window.runLevel;
  window.runLevel=async function(l){
    lvStars=0;
    if(l===1&&!S.disc){S.disc=1;save();await speak(`${name}, শুরুর আগে একটা কথা। এই গেম শান্ত হওয়ার আর মনের যত্নের একটা অনুশীলন। এটা চিকিৎসা নয়, চিকিৎসকের বিকল্পও নয়। কষ্ট বেশি হলে কারও সঙ্গে কথা বোলো। দুই আঙুলে উপরে সোয়াইপ করলে আমি সবসময় পাশে আছি।`)}
    await orig.apply(this,arguments);
    try{
      if(l>=1&&l<200){
        await award(2);
        if(Math.random()<.25)await firefly();
        await speak(`আজকের আলোর তারা ${bn(lvStars)}টা। মোট ${bn(S.s)}টা। তোমার পদবি, ${rankOf(S.s)}।`);
      }
    }catch(e){}
  };
}
/* ================= ডক্টর মায়া: ছোট লেভেল, নানা রকম শান্ত শব্দ, সহজ ভাষা ================= */
(function(){
const ri=n=>Math.random()*n|0, R2=a=>a[ri(a.length)];
/* ১. কঠিন শব্দ সরানো, দাবি নরম করা */
try{
 const sub=s=>String(s).replace(/বাইনোরাল সুর ও জেশ্চার ধাঁধা/g,"সুর আর ইশারার ধাঁধা").replace(/থিটা ওয়েভ ও ইকো/g,"গভীর শান্তি ও প্রতিধ্বনি").replace(/জেশ্চারগুলো/g,"ইশারাগুলো").replace(/জেশ্চার/g,"ইশারা").replace(/বাইনোরাল/g,"জোড়া সুরের").replace(/থিটা ওয়েভ/g,"গভীর শান্তির সুর");
 gameLevels.forEach(d=>{d.title=sub(d.title);d.narrative=sub(d.narrative);if(d.socialMission)d.socialMission=sub(d.socialMission)});
 PHASES.forEach(p=>{p.n=sub(p.n).replace("বিষণ্ণতা মুক্তি","মনের যত্ন");p.intro=sub(p.intro)});
 RESP.length=0;["একটু একটু করে তোমার শরীর আলগা হচ্ছে।","চিন্তাগুলো আস্তে আস্তে দূরে সরে যাচ্ছে।","কোনো তাড়া নেই। শুধু শ্বাস আর তুমি।","তোমার কাঁধ আর মুখ নরম হয়ে আসছে।","শরীর এখন ভারী আর আরামদায়ক।","তুমি ঠিক পথেই আছো।"].forEach(x=>RESP.push(x));
 RESP_OLD.length=0;RESP.forEach(x=>RESP_OLD.push(x));
}catch(e){}
/* ২. শ্বাসের নির্দেশ: প্রতিবার আলাদা ছবি-কল্পনা */
const BI=["আস্তে আস্তে গভীর শ্বাস নাও...","নাক দিয়ে ঠান্ডা বাতাস টেনে নাও...","ফুলের গন্ধ নেওয়ার মতো করে ধীরে শ্বাস নাও...","পেট ফুলিয়ে আস্তে শ্বাস নাও...","পাহাড়ের হাওয়া বুক ভরে নাও..."];
const BH=["শ্বাস ধরে রাখো...","একটু থেমে থাকো, আরাম করে...","শরীর হালকা, শ্বাস স্থির..."];
const BE=["ধীরে ধীরে মুখ দিয়ে শ্বাস ছাড়ো...","মোমবাতি নেভানোর মতো আস্তে ছাড়ো...","সব ভার বেরিয়ে যেতে দাও, ধীরে ছাড়ো...","কাঁধ ঢিলে করে শ্বাস ছাড়ো..."];
window.breathCycle=async function(){
 const ph=[[R2(BI),5,1.2,inhale],[R2(BH),6,0,null],[R2(BE),7,.6,exhale]];
 for(const [txt,n,sc,snd] of ph){
  await say(txt);
  if(sc)orb(sc,n);if(snd)snd(n);breathCue(snd===inhale?1:snd===exhale?-1:0,n);
  for(let k=1;k<=n;k++){cap(bn(k));countSay(k);await sleep(1000)}
 }
 cap("");brainSync();bcount++;if(bcount>=2)await speak(RESP[(bcount-2)%RESP.length]);else await sleep(2500);
};
/* ৩. প্রকৃতির নানা শব্দ, কৃত্রিম নয় */
function noiseBuf(sec,kind){
 const n=AC.sampleRate*sec|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let c=0;c<2;c++){const d=b.getChannelData(c);let l=0,b0=0,b1=0,b2=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;
   if(kind==="brown"){l=(l+.02*w)/1.02;d[i]=l*3.5}
   else{b0=.99765*b0+w*.099;b1=.963*b1+w*.2965;b2=.57*b2+w*1.05;d[i]=(b0+b1+b2+w*.18)*.12}}}
 return b;
}
function loopNoise(kind,sec,filt,fq,q,vol,pan,lfoHz,lfoDepth){
 const s=AC.createBufferSource();s.buffer=noiseBuf(4,kind);s.loop=true;
 const f=AC.createBiquadFilter();f.type=filt;f.frequency.value=fq;f.Q.value=q||.7;
 const g=AC.createGain();g.gain.value=vol;const p=AC.createStereoPanner();p.pan.value=pan||0;
 s.connect(f);f.connect(g);g.connect(p);p.connect(bgm);
 let nodes=[s,f,g,p];
 if(lfoHz){const o=AC.createOscillator(),og=AC.createGain();o.frequency.value=lfoHz;og.gain.value=vol*lfoDepth;o.connect(og);og.connect(g.gain);o.start();nodes.push(o,og)}
 s.start();
 return {gain:g,stop(){try{s.stop()}catch(e){}nodes.forEach(x=>{try{if(x.stop)x.stop()}catch(e){}});kill(nodes)}};
}
function bleep(t,fq,dur,vol,pan,type){
 const o=AC.createOscillator(),g=AC.createGain(),p=AC.createStereoPanner();o.type=type||"sine";p.pan.value=pan;
 o.frequency.setValueAtTime(fq[0],t);if(fq[1])o.frequency.exponentialRampToValueAtTime(fq[1],t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+Math.min(.02,dur/4));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(p);p.connect(bgm);o.start(t);o.stop(t+dur+.05);o.onended=()=>kill([o,g,p]);
}
const SCENES=[
 {id:"rain",n:"বৃষ্টি",start(sec){const a=loopNoise("pink",sec,"highpass",900,.5,.10,0);const b=loopNoise("pink",sec,"lowpass",5500,.5,.05,0,.07,.4);
   const iv=setInterval(()=>{const t=AC.currentTime;bleep(t,[2200+ri(1800),1500],.05,.035,Math.random()*2-1)},180);
   return ()=>{clearInterval(iv);a.stop();b.stop()}},
  lines:["বাইরে নরম বৃষ্টি পড়ছে।","টিনের চালে টুপটাপ শব্দ হচ্ছে।","বৃষ্টির ফোঁটা পাতায় পাতায় গড়িয়ে পড়ছে।","তুমি শুকনো আর আরামে বসে আছো।","মাটির সোঁদা গন্ধ ভেসে আসছে।","বৃষ্টি আস্তে আস্তে শান্ত হয়ে আসছে।"]},
 {id:"sea",n:"সমুদ্র",start(sec){const a=loopNoise("brown",sec,"lowpass",650,.7,.20,-.2,.11,.9);const b=loopNoise("pink",sec,"bandpass",1800,.6,.035,.3,.09,.8);return ()=>{a.stop();b.stop()}},
  lines:["দূরে সমুদ্রের ঢেউ আসছে আর যাচ্ছে।","ঢেউ বালিতে এসে মিলিয়ে যাচ্ছে।","ঢেউয়ের সঙ্গে তোমার শ্বাসও ওঠানামা করছে।","নোনা হাওয়া মুখে লাগছে।","আকাশ বড় আর খোলা।","ঢেউ ধীরে ধীরে সব ভার ভাসিয়ে নিয়ে যাচ্ছে।"]},
 {id:"forest",n:"বন",start(sec){const a=loopNoise("pink",sec,"bandpass",500,.6,.07,0,.05,.7);
   const iv=setInterval(()=>{if(Math.random()<.6){const t=AC.currentTime,p=Math.random()*1.6-.8,f=2200+ri(1800),k=1+ri(3);for(let i=0;i<k;i++)bleep(t+i*.14,[f,f*(1.2+Math.random()*.4)],.11,.045,p)}},2600);
   return ()=>{clearInterval(iv);a.stop()}},
  lines:["গাছের পাতায় হাওয়া খেলছে।","দূরে একটা পাখি ডাকছে।","গাছের ছায়ায় ঠান্ডা আর শান্ত।","পাতার ফাঁক দিয়ে নরম আলো আসছে।","মাটি আর ভেজা ঘাসের গন্ধ।","বনের নীরবতা তোমাকে ঘিরে আছে।"]},
 {id:"night",n:"রাতের গ্রাম",start(sec){const a=loopNoise("pink",sec,"lowpass",420,.7,.045,0,.04,.6);
   const mk=(pan,hz,rate)=>{const o=AC.createOscillator(),g=AC.createGain(),p=AC.createStereoPanner(),l=AC.createOscillator(),lg=AC.createGain();o.frequency.value=hz;g.gain.value=0;p.pan.value=pan;l.type="square";l.frequency.value=rate;lg.gain.value=.012;l.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(p);p.connect(bgm);o.start();l.start();return [o,g,p,l,lg]};
   const c1=mk(-.6,4300,13+Math.random()*2),c2=mk(.6,4700,15+Math.random()*2);
   return ()=>{[c1,c2].forEach(c=>{c.forEach(x=>{try{x.stop&&x.stop()}catch(e){}});kill(c)});a.stop()}},
  lines:["গ্রামে রাত নেমেছে, চারদিকে নিঝুম।","ঝিঁঝি পোকা মৃদু সুরে ডাকছে।","আকাশে অনেক তারা।","দূরে কোথাও একটা নৌকার শব্দ।","ঠান্ডা হাওয়া গায়ে লাগছে।","চারদিক শান্ত, তুমি নিরাপদ।"]},
 {id:"stream",n:"ঝরনা",start(sec){const a=loopNoise("pink",sec,"bandpass",1400,.8,.10,-.15,.23,.5);const b=loopNoise("pink",sec,"highpass",2500,.5,.035,.2,.31,.7);const c=loopNoise("brown",sec,"lowpass",300,.7,.08,0);return ()=>{a.stop();b.stop();c.stop()}},
  lines:["পাহাড়ি ঝরনার জল পাথরের ওপর দিয়ে বয়ে যাচ্ছে।","স্বচ্ছ ঠান্ডা জল।","জল আপনমনে কুলকুল করে বয়ে যায়।","পাথরের ফাঁকে জল ঝিরঝির করছে।","জলের শব্দের সঙ্গে মন হালকা হচ্ছে।","জল যেমন সব ধুয়ে নিয়ে যায়, তেমনি ভার সরে যাচ্ছে।"]},
 {id:"chimes",n:"বাতাসের ঘণ্টা",start(sec){const a=loopNoise("pink",sec,"lowpass",500,.6,.05,0,.06,.8);const pent=[523.25,587.33,659.25,783.99,880,1046.5];
   const iv=setInterval(()=>{const k=1+ri(2);for(let i=0;i<k;i++){const t=AC.currentTime+i*.35;bleep(t,[R2(pent),0],3.2,.05,Math.random()*1.6-.8)}},2200);
   return ()=>{clearInterval(iv);a.stop()}},
  lines:["বারান্দায় ঘণ্টা বাতাসে দুলছে।","ঘণ্টার মিষ্টি সুর ভেসে আসছে।","প্রতিটা সুর আস্তে আস্তে মিলিয়ে যাচ্ছে।","বাতাস এলে ঘণ্টা বাজে, বাতাস গেলে নীরবতা।","সুরের সঙ্গে মন ভেসে যাচ্ছে।","নরম সুর তোমাকে আদর করছে।"]}
];
let lastScene=-1;
const INTRO=["চলো, এবার একটু প্রকৃতির কাছে যাই।","এবার চোখ বন্ধ করে শুধু শোনো।","এবার একটু বিশ্রাম নিই। কিছু করতে হবে না।","চলো, একটা শান্ত জায়গায় যাই, মনে মনে।","এবার শরীর আলগা করে শুধু শুনবে।"];
const OUTRO=["আস্তে আস্তে ফিরে এসো, ধীরে।","খুব ভালো লাগছে, তাই না?","এই শান্তিটা সঙ্গে নিয়ে যাও।","একটা লম্বা শ্বাস নিয়ে ফিরে এসো।"];
window.deepen=async function(p,t0){
 ambient(p);heart(66-p*3);lvMin=4;
 let si;do{si=ri(SCENES.length)}while(si===lastScene&&SCENES.length>1);lastScene=si;
 const sc=SCENES[si],sec=70+8*p;
 await speak(`${name}, ${R2(INTRO)} আজকের জায়গা: ${sc.n}।`);
 if(Math.random()<.6)await breathCycle();
 const rawStop=sc.start(sec);let done=false;const stopSc=()=>{if(done)return;done=true;try{rawStop()}catch(e){}};ints.push(stopSc);
 const end=Date.now()+sec*1000,ln=sc.lines.slice().sort(()=>Math.random()-.5);
 try{
  for(let i=0;Date.now()<end-6000&&i<ln.length;i++){
   await speak(ln[i]);
   await sleep(Math.min(14000,Math.max(0,end-Date.now()-6000)));
  }
  const rest=end-Date.now();if(rest>0)await sleep(rest);
 }finally{try{stopSc()}catch(e){}}
 await speak(R2(OUTRO));
};
})();

/* সমাপনী বার্তায় দুই নির্মাতার নাম */
window.finale=async function(){
  const t=AC.currentTime,CL=AC.sampleRate*.08|0,CB=AC.createBuffer(1,CL,AC.sampleRate),CD=CB.getChannelData(0);
  for(let j=0;j<CL;j++)CD[j]=(Math.random()*2-1)*Math.exp(-j/(CL*.25));
  for(let i=0;i<70;i++){
    const pn=AC.createStereoPanner();pn.pan.value=Math.random()*2-1;pn.connect(master);
    const s=AC.createBufferSource(),g=AC.createGain();s.buffer=CB;g.gain.value=.25;s.connect(g);g.connect(pn);s.start(t+Math.random()*7);
    s.onended=()=>{try{s.disconnect();g.disconnect();pn.disconnect()}catch(e){}};
  }
  [[392,0],[392,.35],[523.25,.7],[523.25,1.4],[659.25,1.75],[783.99,2.4]].forEach(([f,o],i)=>{
    const bp=AC.createStereoPanner();bp.pan.value=P(i%2?.6:-.6);bp.connect(master);tone(bp,f,t+o,.55,"sawtooth",.1);
  });
  for(let i=0;i<6;i++)setTimeout(()=>{if(!suspended)bell()},i*900);
  orb(1.4,3);
  await speak(`${name}, তুমি দুশ্চিন্তা আর ভয়ের সঙ্গে চলতে শিখেছো। এই পথচলা তোমার নিজের।`);
  await speak("এই গেমটা বানিয়েছেন বাংলাদেশের এমডি রবিউল ইসলাম হাওলাদার আর এইচ. এম. সম্রাট, ব্লাইন্ড ট্যালেন্ট দলের পক্ষ থেকে। তোমার জন্য আন্তরিক শুভেচ্ছা।");
  await speak("মনে রেখো, এই গেম শান্ত হতে সাহায্য করে, কিন্তু চিকিৎসকের বিকল্প নয়। মন বেশি ভার থাকলে কারও সঙ্গে কথা বলো।");
};
}catch(e){try{console.error("mayaplus",e)}catch(_){}}
})();
