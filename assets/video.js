(function(){
"use strict";
if(window.__LOM_V)return;window.__LOM_V=1;

const WM="Developed by Blind Talent\nMain developer: H. M. Samrat";
const $=function(i){return document.getElementById(i)};
const sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
const native=function(){return !!(window.flutter_inappwebview&&window.AndroidTTS)};
const nat=function(n){
  const a=Array.prototype.slice.call(arguments,1);
  try{return Promise.resolve(window.flutter_inappwebview.callHandler.apply(null,[n].concat(a)))}catch(e){return Promise.reject(e)}
};
const ls=function(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

let lang=ls("vs_lang","bn");
if(lang!=="en")lang="bn";

const T={
bn:{
 btn:"🎬 ভিডিও স্টুডিও",title:"🎬 ভিডিও স্টুডিও",back:"← ব্যাক (Back)",
 lang:"🌐 ভাষা (Language)",intro:"এখানে ভিডিও কাটা, রং ঠিক করা, গান মেশানো ও নতুন ভিডিও সেভ করা যায়। ফ্রি সংস্করণে ভিডিওর নিচে ওয়াটারমার্ক বসে।",
 hear:"🔊 শোনো",
 c1:"১. ভিডিও বাছো",pick:"📂 গ্যালারি থেকে ভিডিও বাছো",rec:"🎥 ক্যামেরায় নতুন ভিডিও করো",permMsg:"ক্যামেরার অনুমতি চাওয়া হয়েছে। অনুমতি দিয়ে আবার বোতামটা চাপো।",why:" কারণ: ",none:"এখনও ভিডিও বাছা হয়নি।",
 picking:"গ্যালারি খুলছে। একটা ভিডিও বেছে নাও।",loading:"ভিডিও আনা হচ্ছে, একটু অপেক্ষা করো।",
 picked:"ভিডিও পাওয়া গেছে। সময় ",noPick:"কোনো ভিডিও বাছা হয়নি।",
 c2:"২. কাটো (শুরু ও শেষ)",st:"শুরু: ",en:"শেষ: ",setS:"▶ এখন থেকে শুরু",setE:"⏹ এখন পর্যন্ত শেষ",len:"নতুন ভিডিওর দৈর্ঘ্য: ",
 c3:"৩. দেখতে কেমন হবে",ratio:"আকার (রেশিও)",r_orig:"আসল আকার",br:"উজ্জ্বলতা: ",ct:"কনট্রাস্ট: ",sat:"রঙের গাঢ়তা: ",gray:"সাদা-কালো করো",reset:"↺ সব আগের মতো করো",
 c4:"৪. শব্দ",vol:"ভিডিওর শব্দ: ",music:"🎵 গান বাছো",noMusic:"কোনো গান বাছা হয়নি।",mname:"গান যোগ হয়েছে।",mvol:"গানের শব্দ: ",mdel:"✖ গান বাদ দাও",
 c5:"৫. সেভ করো",exp:"📤 নতুন ভিডিও বানাও ও সেভ করো",cancel:"✖ বন্ধ করো",
 wmNote:"ওয়াটারমার্ক: ভিডিওর নিচে \"Developed by Blind Talent\" লেখা থাকবে।",
 onlyApp:"এই সুবিধা শুধু মনের আলো অ্যাপের ভেতরে কাজ করে।",needVideo:"আগে একটা ভিডিও বাছো।",
 working:"ভিডিও বানানো হচ্ছে। শেষ হতে কিছুক্ষণ লাগবে। অ্যাপ বন্ধ কোরো না।",
 prog:"প্রগতি: ",done:"হয়ে গেছে! নতুন ভিডিও ফোনের গ্যালারির Movies ফোল্ডারে সেভ হয়েছে।",
 doneNoSave:"ভিডিও বানানো হয়েছে, কিন্তু গ্যালারিতে সেভ করা যায়নি।",
 fail:"দুঃখিত, ভিডিও বানানো যায়নি। ",cancelled:"বন্ধ করা হয়েছে।",
 skipped:"এই অংশগুলো বাদ গেছে: ",s_music:"গান ও ভলিউম",s_effects:"রং ও আকারের বদল",
 prevErr:"ভিডিও এখানে চালিয়ে দেখা যাচ্ছে না, তবে এডিট কাজ করবে।",
 sec:" সেকেন্ড",min:" মিনিট "
},
en:{
 btn:"🎬 Video Studio",title:"🎬 Video Studio",back:"← Back",
 lang:"🌐 Language",intro:"Trim videos, adjust colours, add music and save a new video. In the free version a watermark appears at the bottom of the video.",
 hear:"🔊 Listen",
 c1:"1. Choose a video",pick:"📂 Choose a video from gallery",rec:"🎥 Record a new video with camera",permMsg:"Camera permission was requested. Allow it and tap the button again.",why:" Reason: ",none:"No video chosen yet.",
 picking:"Opening the gallery. Please pick a video.",loading:"Loading the video, please wait.",
 picked:"Video ready. Length ",noPick:"No video was chosen.",
 c2:"2. Trim (start and end)",st:"Start: ",en:"End: ",setS:"▶ Start from here",setE:"⏹ End at here",len:"New video length: ",
 c3:"3. Look",ratio:"Shape (aspect ratio)",r_orig:"Original",br:"Brightness: ",ct:"Contrast: ",sat:"Colour strength: ",gray:"Black and white",reset:"↺ Reset all",
 c4:"4. Sound",vol:"Video volume: ",music:"🎵 Choose music",noMusic:"No music chosen.",mname:"Music added.",mvol:"Music volume: ",mdel:"✖ Remove music",
 c5:"5. Save",exp:"📤 Make and save the new video",cancel:"✖ Stop",
 wmNote:"Watermark: \"Developed by Blind Talent\" appears at the bottom of the video.",
 onlyApp:"This feature works only inside the Light of Mind app.",needVideo:"Choose a video first.",
 working:"Making the video. This will take a while. Do not close the app.",
 prog:"Progress: ",done:"Done! The new video is saved in the Movies folder of your gallery.",
 doneNoSave:"The video was made, but it could not be saved to the gallery.",
 fail:"Sorry, the video could not be made. ",cancelled:"Stopped.",
 skipped:"These parts were left out: ",s_music:"music and volume",s_effects:"colour and shape changes",
 prevErr:"The video cannot be played here, but editing will still work.",
 sec:" seconds",min:" min "
}};
const t=function(k){return (T[lang]&&T[lang][k])||T.bn[k]||k};
const RATIOS=[["orig","r_orig"],["9:16","9:16"],["16:9","16:9"],["1:1","1:1"],["4:3","4:3"]];

function speak(txt){
  try{if(typeof cancelVoice==="function")cancelVoice()}catch(e){}
  try{if("speechSynthesis" in window)speechSynthesis.cancel()}catch(e){}
  try{if(typeof ntSpeak==="function")return ntSpeak(txt,lang==="en"?true:0)}catch(e){}
  return Promise.resolve();
}
function fmt(s){
  s=Math.max(0,s);
  const m=Math.floor(s/60),r=s-m*60;
  return (m>0?m+t("min"):"")+r.toFixed(1)+t("sec");
}
function msg(x,say){
  const e=$("vsMsg");if(e)e.textContent=x;
  if(say!==false)speak(x);
}

const S={v:null,a:null,start:0,end:0,ratio:"orig",br:0,ct:0,sat:0,gray:false,vol:100,mvol:50,busy:false};
/* gate(): later steps (ads and coins) will be added here */
async function gate(kind){return true}

const card=function(h,b){return '<div class="lzCard"><h3>'+h+'</h3>'+b+'</div>'};
const lbl=function(id,k,v,min,max,step,val){
  return '<label class="lzSm" style="display:block;margin:8px 0"><span id="'+id+'L"></span>'
   +'<input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" aria-label="'+t(k).replace(/[: ]+$/,"")+'" style="width:100%;touch-action:none"></label>';
};
function html(){
  let h='<div class="lzBar"><button class="lzBtn s lzBack" aria-label="'+t("back")+'">'+t("back")+'</button><h2>'+t("title")+'</h2></div>';
  h+=card(t("lang"),'<select id="vsLang" aria-label="'+t("lang")+'" style="width:100%;font-size:16px;padding:8px">'
    +'<option value="bn"'+(lang==="bn"?" selected":"")+'>বাংলা</option><option value="en"'+(lang==="en"?" selected":"")+'>English</option></select>'
    +'<p class="lzSm">'+t("intro")+'</p><div class="lzRow"><button class="lzBtn s" id="vsHear">'+t("hear")+'</button></div>');
  h+=card(t("c1"),'<div class="lzRow"><button class="lzBtn" id="vsPick">'+t("pick")+'</button><button class="lzBtn" id="vsRec">'+t("rec")+'</button></div>'
    +'<p class="lzSm" id="vsInfo"></p><video id="vsPrev" controls playsinline style="width:100%;max-height:260px;background:#000;border-radius:10px;display:none" aria-label="preview"></video>');
  h+=card(t("c2"),lbl("vsSt","st",0,0,10,0.1,0)+lbl("vsEn","en",0,0,10,0.1,10)
    +'<div class="lzRow"><button class="lzBtn s" id="vsSetS">'+t("setS")+'</button><button class="lzBtn s" id="vsSetE">'+t("setE")+'</button></div>'
    +'<p class="lzSm" id="vsLen"></p>');
  let ro="";for(let i=0;i<RATIOS.length;i++){const k=RATIOS[i];ro+='<option value="'+k[0]+'"'+(S.ratio===k[0]?" selected":"")+'>'+(k[1]==="r_orig"?t("r_orig"):k[1])+'</option>'}
  h+=card(t("c3"),'<label class="lzSm">'+t("ratio")+'<select id="vsRatio" style="width:100%;font-size:16px;padding:8px;margin-top:6px">'+ro+'</select></label>'
    +lbl("vsBr","br",0,-100,100,5,0)+lbl("vsCt","ct",0,-100,100,5,0)+lbl("vsSat","sat",0,-100,100,5,0)
    +'<label class="lzSm" style="display:block;margin:8px 0"><input type="checkbox" id="vsGray" style="width:auto"> '+t("gray")+'</label>'
    +'<div class="lzRow"><button class="lzBtn s" id="vsReset">'+t("reset")+'</button></div>');
  h+=card(t("c4"),lbl("vsVol","vol",0,0,200,10,100)
    +'<div class="lzRow"><button class="lzBtn s" id="vsMus">'+t("music")+'</button><button class="lzBtn r" id="vsMDel">'+t("mdel")+'</button></div>'
    +'<p class="lzSm" id="vsMInfo"></p>'+lbl("vsMVol","mvol",0,0,200,10,50));
  h+=card(t("c5"),'<p class="lzSm">'+t("wmNote")+'</p><div class="lzRow"><button class="lzBtn" id="vsExp">'+t("exp")+'</button><button class="lzBtn r" id="vsCan">'+t("cancel")+'</button></div>'
    +'<div style="height:8px;background:#1c2442;border-radius:6px;overflow:hidden;margin:10px 0"><i id="vsBar" style="display:block;height:100%;width:0;background:#f2b84b"></i></div>'
    +'<p class="lzSm" id="vsPg" aria-live="polite"></p><div class="lzMsg" id="vsMsg" role="status" aria-live="polite"></div>'
    +'<video id="vsOut" controls playsinline style="width:100%;max-height:260px;background:#000;border-radius:10px;display:none" aria-label="result"></video>');
  return h;
}
function upd(){
  const set=function(id,x){const e=$(id);if(e)e.textContent=x};
  const dur=S.v?S.v.durationMs/1000:0;
  set("vsStL",t("st")+fmt(S.start));set("vsEnL",t("en")+fmt(S.end));
  set("vsLen",t("len")+fmt(Math.max(0,S.end-S.start)));
  set("vsBrL",t("br")+S.br);set("vsCtL",t("ct")+S.ct);set("vsSatL",t("sat")+S.sat);
  set("vsVolL",t("vol")+S.vol+"%");set("vsMVolL",t("mvol")+S.mvol+"%");
  set("vsInfo",S.v?(t("picked")+fmt(dur)):t("none"));
  set("vsMInfo",S.a?t("mname"):t("noMusic"));
}
function bindRange(id,key,after){
  const e=$(id);if(!e)return;
  e.oninput=function(){S[key]=parseFloat(e.value);if(after)after();upd()};
}
function loadVals(){
  const d=S.v?S.v.durationMs/1000:10;
  const a=$("vsSt"),b=$("vsEn");
  if(a){a.max=d;a.value=S.start}
  if(b){b.max=d;b.value=S.end}
  const m={vsBr:"br",vsCt:"ct",vsSat:"sat",vsVol:"vol",vsMVol:"mvol"};
  for(const k in m){const e=$(k);if(e)e.value=S[m[k]]}
  const g=$("vsGray");if(g)g.checked=S.gray;
  const p=$("vsPrev");
  if(p&&S.v){p.style.display="block";p.src=S.v.url;p.onerror=function(){msg(t("prevErr"),false)}}
}

async function getVideo(mode){
  if(!native()){msg(t("onlyApp"));return}
  if(S.busy)return;
  speak(t("picking"));
  let r={};
  try{r=await nat(mode)}catch(e){r={ok:false,err:String(e).slice(0,80)}}
  if(r&&r.err==="perm"){msg(t("permMsg"));return}
  if(!r||!r.ok){msg(t("noPick")+((r&&r.err)?t("why")+r.err:""));return}
  msg(t("loading"),false);
  S.v=r;S.start=0;S.end=r.durationMs/1000;
  loadVals();upd();
  msg(t("picked")+fmt(r.durationMs/1000));
}
function pickVideo(){return getVideo("vedPick")}
function recVideo(){return getVideo("vedRecord")}
async function pickMusic(){
  if(!native()){msg(t("onlyApp"));return}
  if(S.busy)return;
  speak(t("picking"));
  let r={};
  try{r=await nat("vedPickAudio")}catch(e){r={ok:false,err:String(e).slice(0,80)}}
  if(!r||!r.ok){msg(t("noPick")+((r&&r.err)?t("why")+r.err:""));return}
  S.a=r;upd();msg(t("mname"));
}
function resetAll(){
  S.ratio="orig";S.br=0;S.ct=0;S.sat=0;S.gray=false;S.vol=100;S.mvol=50;
  if(S.v){S.start=0;S.end=S.v.durationMs/1000}
  const r=$("vsRatio");if(r)r.value="orig";
  loadVals();upd();
}
async function doExport(){
  if(S.busy)return;
  if(!native()){msg(t("onlyApp"));return}
  if(!S.v){msg(t("needVideo"));return}
  if(!(await gate("export")))return;
  S.busy=true;
  const dur=S.v.durationMs;
  const sMs=Math.round(S.start*1000),eMs=Math.round(S.end*1000);
  const p={src:S.v.path,width:S.v.width,height:S.v.height,startMs:sMs,endMs:(eMs>=dur-50)?0:eMs,
    ratio:S.ratio,brightness:S.br/100,contrast:S.ct/100,saturation:S.sat,gray:S.gray,volume:S.vol/100,wm:WM};
  if(S.a)p.music={path:S.a.path,volume:S.mvol/100,startMs:0};
  const o=$("vsOut");if(o)o.style.display="none";
  setProg(0);msg(t("working"));
  let r=null;
  try{r=await nat("vedExport",JSON.stringify(p))}catch(e){r={ok:false,error:String(e)}}
  S.busy=false;
  if(r&&r.ok){
    setProg(100);
    let m=r.saved?t("done"):t("doneNoSave");
    if(r.skipped&&r.skipped.length){
      const names=[];
      for(let i=0;i<r.skipped.length;i++){names.push(r.skipped[i]==="music"?t("s_music"):t("s_effects"))}
      m+=" "+t("skipped")+names.join(", ");
    }
    msg(m);
    if(o&&r.url){o.style.display="block";o.src=r.url}
  }else if(r&&r.cancelled){
    msg(t("cancelled"));
  }else{
    msg(t("fail")+((r&&r.error)?String(r.error).slice(0,120):""));
  }
}
function setProg(n){
  const b=$("vsBar"),g=$("vsPg");
  if(b)b.style.width=n+"%";
  if(g)g.textContent=t("prog")+n+"%";
}
window.__vedProgress=function(n){setProg(n)};

function bind(){
  const sec=$("pg_vstudio");
  $("vsLang").onchange=function(){
    lang=this.value==="en"?"en":"bn";lsS("vs_lang",lang);
    sec.innerHTML=html();bind();loadVals();upd();speak(t("title"));
  };
  $("vsHear").onclick=function(){speak(t("title")+". "+t("intro"))};
  $("vsPick").onclick=pickVideo;
  $("vsRec").onclick=recVideo;
  $("vsMus").onclick=pickMusic;
  $("vsMDel").onclick=function(){S.a=null;upd()};
  $("vsExp").onclick=doExport;
  $("vsCan").onclick=function(){if(native())nat("vedCancel").catch(function(){})};
  $("vsReset").onclick=resetAll;
  $("vsRatio").onchange=function(){S.ratio=this.value};
  $("vsGray").onchange=function(){S.gray=this.checked};
  $("vsSt").oninput=function(){
    S.start=parseFloat(this.value);
    if(S.end-S.start<0.2){S.end=Math.min(S.start+0.2,S.v?S.v.durationMs/1000:S.start+0.2);$("vsEn").value=S.end}
    upd();
  };
  $("vsEn").oninput=function(){
    S.end=parseFloat(this.value);
    if(S.end-S.start<0.2){S.start=Math.max(0,S.end-0.2);$("vsSt").value=S.start}
    upd();
  };
  $("vsSetS").onclick=function(){
    const p=$("vsPrev");if(!p||!S.v)return;
    S.start=Math.min(p.currentTime,S.end-0.2);if(S.start<0)S.start=0;
    $("vsSt").value=S.start;upd();speak(t("st")+fmt(S.start));
  };
  $("vsSetE").onclick=function(){
    const p=$("vsPrev");if(!p||!S.v)return;
    S.end=Math.max(p.currentTime,S.start+0.2);
    $("vsEn").value=S.end;upd();speak(t("en")+fmt(S.end));
  };
  bindRange("vsBr","br");bindRange("vsCt","ct");bindRange("vsSat","sat");
  bindRange("vsVol","vol");bindRange("vsMVol","mvol");
}

let tries=0;
function build(){
  const app=$("lzApp"),home=$("pg_home");
  if(!app||!home)return false;
  if($("pg_vstudio"))return true;
  const ex=home.querySelector('[data-go="explore"]');if(!ex)return false;
  const b=document.createElement("button");
  b.className="lzBig";b.id="lzVsBtn";b.setAttribute("data-go","vstudio");b.textContent=T.bn.btn+" (Video Studio)";
  ex.insertAdjacentElement("afterend",b);
  const sec=document.createElement("section");
  sec.className="lzPg";sec.id="pg_vstudio";sec.hidden=true;
  sec.innerHTML=html();app.appendChild(sec);
  bind();loadVals();upd();
  let first=true;
  new MutationObserver(function(){
    if(sec.hidden){
      const p=$("vsPrev");if(p){try{p.pause()}catch(e){}}
      return;
    }
    upd();
    speak(first?(t("title")+". "+t("intro")):t("title"));first=false;
  }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  return true;
}
(function wait(){
  if(tries++>200)return;
  if($("pg_home")&&$("lzApp")){
    if(build())return;
  }
  setTimeout(wait,250);
})();
})();
