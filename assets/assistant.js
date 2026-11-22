(function(){
"use strict";
if(window.__LOM_AST)return;window.__LOM_AST=1;

const API="https://script.google.com/macros/s/AKfycbygx8ZJzgNBctpjcXkConElGywXwD-_ukk1J87Syt_NMz5DgJWDxnnDgpSF-DSqTIiB/exec";

const $=function(i){return document.getElementById(i)};
const esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
const speak=function(txt){
  try{if(typeof cancelVoice==="function")cancelVoice()}catch(e){}
  try{if(typeof ntSpeak==="function")return ntSpeak(txt,0)}catch(e){}
};
const H=[];
let busy=false;

function ready(){return API.indexOf("https://")===0}
function render(){
  const box=$("aiChat");if(!box)return;
  let h="";
  for(let i=0;i<H.length;i++){
    const m=H[i];
    h+='<div class="lzMsg"><b>'+(m.role==="user"?"তুমি":"সহকারী")+':</b> '+esc(m.text)+'</div>';
  }
  box.innerHTML=h||'<p class="lzSm">নিচে প্রশ্ন লিখে "পাঠাও" চাপো। মনের আলো, আমাদের টিম ও চ্যানেল নিয়ে জানতে পারো।</p>';
  box.scrollTop=box.scrollHeight;
}
function note(x){const e=$("aiNote");if(e)e.textContent=x}

async function send(){
  if(busy)return;
  const inp=$("aiTxt");
  const q=(inp.value||"").trim();
  if(!q)return;
  if(!ready()){note("সহকারী এখনও চালু হয়নি।");speak("সহকারী এখনও চালু হয়নি।");return}
  busy=true;inp.value="";
  H.push({role:"user",text:q.slice(0,500)});render();
  note("সহকারী ভাবছে...");
  let reply="এখন উত্তর দিতে পারছি না। ইন্টারনেট ঠিক আছে কি না দেখো।";
  try{
    const ctl=new AbortController();
    const to=setTimeout(function(){ctl.abort()},40000);
    const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},signal:ctl.signal,
      body:JSON.stringify({messages:H.slice(-8)})});
    clearTimeout(to);
    const d=await r.json();
    if(d&&d.reply)reply=String(d.reply);
  }catch(e){}
  H.push({role:"model",text:reply});
  busy=false;note("");render();speak(reply);
}


let listening=false;
const sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
const NAT=function(){return !!(window.flutter_inappwebview&&window.AndroidTTS)};
function errMsg(code){
  if(code==="perm"||code==="e9")return "মাইক্রোফোনের অনুমতি দিন। অনুমতি দিয়ে আবার চাপো।";
  if(code==="na")return "এই ফোনে ভয়েস চেনার সুবিধা নেই। লিখে প্রশ্ন করো।";
  if(code==="e7"||code==="e6")return "কিছু শোনা যায়নি। আবার চাপো, তারপর স্পষ্ট করে বলো।";
  if(code==="e2"||code==="e1"||code==="e3"||code==="e5"||code==="e8")return "ভয়েস চেনায় সমস্যা হচ্ছে। ইন্টারনেট দেখে আবার চেষ্টা করো।";
  if(code==="unk")return "এই অ্যাপ সংস্করণে ভয়েসে প্রশ্ন করার সুবিধা নেই। অ্যাপের নতুন সংস্করণ নামাও।";
  return "ভয়েস চেনা যায়নি। আবার চেষ্টা করো।";
}
async function gotText(t){
  const inp=$("aiTxt");
  inp.value=String(t).slice(0,500);
  await Promise.resolve(speak("তুমি বলেছো: "+inp.value));
  send();
}
async function listen(lang){
  if(busy||listening)return;
  listening=true;
  try{
    if(NAT()){
      note("শুনছি...");
      await Promise.resolve(speak(lang==="en-US"?"Speak now.":"বলো।"));
      await sleep(300);
      let r=null;
      try{r=await window.flutter_inappwebview.callHandler("micListen",lang)}catch(e){r={err:"unk"}}
      if(typeof r==="string"){try{r=JSON.parse(r)}catch(e){r={err:"x"}}}
      note("");
      if(r&&r.text){await gotText(r.text)}
      else{const m=errMsg(r&&r.err);note(m);speak(m)}
    }else{
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){const m="এই ব্রাউজারে ভয়েসে প্রশ্ন করা যায় না। লিখে প্রশ্ন করো।";note(m);speak(m);return}
      note("শুনছি...");
      const t=await new Promise(function(res){
        const rec=new SR();rec.lang=lang;rec.maxAlternatives=1;
        rec.onresult=function(ev){res(ev.results[0][0].transcript)};
        rec.onerror=function(){res("")};rec.onend=function(){res("")};
        try{rec.start()}catch(e){res("")}
      });
      note("");
      if(t)await gotText(t);else{const m=errMsg("e7");note(m);speak(m)}
    }
  }catch(e){note("")}
  finally{listening=false}
}

function build(){
  const app=$("lzApp"),home=$("pg_home");
  if(!app||!home)return false;
  if($("pg_assistant"))return true;
  const ex=home.querySelector('[data-go="explore"]');if(!ex)return false;
  const b=document.createElement("button");
  b.className="lzBig";b.id="lzAiBtn";b.setAttribute("data-go","assistant");
  b.textContent="মনের আলো সহকারী";
  ex.insertAdjacentElement("afterend",b);
  const sec=document.createElement("section");
  sec.className="lzPg";sec.id="pg_assistant";sec.hidden=true;
  sec.innerHTML='<div class="lzBar"><button class="lzBtn s lzBack" aria-label="ব্যাক, আগের পেজে ফিরে যাও">ব্যাক</button><h2>সহকারী</h2></div>'
   +'<div class="lzCard"><h3>মনের আলো সহকারী</h3>'
   +'<p class="lzSm">আমি মনের আলো অ্যাপের সহকারী এআই। অ্যাপ, আমাদের টিম ও চ্যানেল নিয়ে প্রশ্ন করতে পারো। আমি ভুল করতে পারি, তাই দরকারি বিষয় যাচাই করে নিও।</p>'
   +'<div class="lzRow"><button class="lzBtn" id="aiMicBn">বাংলায় বলে প্রশ্ন করো</button><button class="lzBtn" id="aiMicEn">ইংরেজিতে বলে প্রশ্ন করো</button></div>'
   +'<div id="aiChat" aria-live="polite" style="max-height:40vh;overflow:auto"></div>'
   +'<textarea id="aiTxt" placeholder="তোমার প্রশ্ন লেখো" aria-label="তোমার প্রশ্ন" maxlength="500"></textarea>'
   +'<div class="lzRow"><button class="lzBtn" id="aiSend">পাঠাও</button><button class="lzBtn r" id="aiClr">মুছো</button></div>'
   +'<p class="lzSm" id="aiNote" role="status" aria-live="polite"></p></div>';
  app.appendChild(sec);
  $("aiSend").onclick=send;
  $("aiMicBn").onclick=function(){listen("bn-BD")};
  $("aiMicEn").onclick=function(){listen("en-US")};
  $("aiClr").onclick=function(){H.length=0;render()};
  render();
  let first=true;
  new MutationObserver(function(){
    if(sec.hidden)return;
    if(first){speak("মনের আলো সহকারী। আমাকে অ্যাপ, টিম ও চ্যানেল নিয়ে প্রশ্ন করো।");first=false}
  }).observe(sec,{attributes:true,attributeFilter:["hidden"]});
  return true;
}
let n=0;
(function wait(){
  if(n++>200)return;
  if(build())return;
  setTimeout(wait,250);
})();
})();

/* ===== পরিষ্কার-করা অংশ: ইমোজি, হেডিং, প্রিমিয়াম বোতাম, ভিডিওর ভুলের বার্তা ===== */
(function(){
"use strict";
if(window.__LOM_CLEAN)return;window.__LOM_CLEAN=1;
var P="[\\u{1F000}-\\u{1FAFF}\\u{2190}-\\u{21FF}\\u{2300}-\\u{23FF}\\u{2460}-\\u{24FF}\\u{25A0}-\\u{27BF}\\u{2B00}-\\u{2BFF}]";
var RE=new RegExp("(?:"+P+"[\\uFE0F\\u20E3]?(?:\\u200D"+P+"[\\uFE0F]?)*)+\\s*","gu");
var TEST=new RegExp(P,"u");
function clean(t){
  t=String(t==null?"":t);
  return TEST.test(t)?t.replace(RE,""):t;
}
window.lomClean=clean;
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,NOSCRIPT:1,INPUT:1};
function pass(){
  var b=document.body;if(!b)return;
  var w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode())){
    var p=n.parentNode;
    if(p&&SKIP[p.nodeName])continue;
    if(TEST.test(n.nodeValue))list.push(n);
  }
  for(var i=0;i<list.length;i++){list[i].nodeValue=clean(list[i].nodeValue)}
  var at=["aria-label","title","placeholder","alt"];
  var els=b.querySelectorAll("[aria-label],[title],[placeholder],[alt]");
  for(var j=0;j<els.length;j++){
    for(var k=0;k<at.length;k++){
      var v=els[j].getAttribute(at[k]);
      if(v&&TEST.test(v))els[j].setAttribute(at[k],clean(v));
    }
  }
  /* হেডিং: টকব্যাক আর "হেডিং" বলবে না, শুধু লেখা পড়বে */
  var hs=b.querySelectorAll("h1,h2,h3,h4,h5,h6,[role=heading]");
  for(var h=0;h<hs.length;h++){
    if(hs[h].getAttribute("role")!=="presentation")hs[h].setAttribute("role","presentation");
  }
  /* প্রিমিয়াম/শপের বোতাম আর পাতা লুকানো */
  var sh=b.querySelectorAll('[data-go="shop"],#pg_shop');
  for(var s=0;s<sh.length;s++){
    if(!sh[s].hidden){sh[s].hidden=true;sh[s].style.display="none";sh[s].setAttribute("aria-hidden","true");sh[s].tabIndex=-1}
  }
  if(document.title&&TEST.test(document.title))document.title=clean(document.title);
}
/* অ্যাপের নিজের কথা বলার সময়ও ইমোজি বাদ */
function wrapSpeak(){
  var o=window.ntSpeak;
  if(typeof o!=="function"||o.__lom)return;
  var f=function(t,en){return o.call(this,clean(t),en)};
  f.__lom=1;window.ntSpeak=f;
}
/* ভিডিওর অজানা কাজের বার্তা সহজ করা */
function wrapCall(){
  var fi=window.flutter_inappwebview;
  if(!fi||typeof fi.callHandler!=="function"||fi.callHandler.__lom)return;
  var o=fi.callHandler;
  var f=function(){
    var r=o.apply(fi,arguments);
    if(r&&r.catch){
      return r.catch(function(e){
        var m=String(e&&e.message?e.message:e);
        if(m.indexOf("unknown handler")>=0)return Promise.reject("এই অ্যাপে এই সুবিধা চালু নেই। অ্যাপের নতুন সংস্করণ নামাতে হবে।");
        return Promise.reject(e);
      });
    }
    return r;
  };
  f.__lom=1;fi.callHandler=f;
}
var pend=false;
function later(){if(pend)return;pend=true;setTimeout(function(){pend=false;try{pass()}catch(e){}},150)}
try{wrapSpeak()}catch(e){}
try{wrapCall()}catch(e){}
try{pass()}catch(e){}
try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}
})();
