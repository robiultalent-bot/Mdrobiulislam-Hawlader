(function(){
"use strict";
if(window.__LOM_AST)return;window.__LOM_AST=1;

const API="https://script.google.com/macros/s/AKfycbx1MJw7ZPlxD9oY9L7xz-QrxUYIWPXrElFNPdy-wXzqC6VlGLJ05Y5auSI9o4dc7gr_/exec";

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
    const to=setTimeout(function(){ctl.abort()},25000);
    const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},signal:ctl.signal,
      body:JSON.stringify({messages:H.slice(-8)})});
    clearTimeout(to);
    const d=await r.json();
    if(d&&d.reply)reply=String(d.reply);
  }catch(e){}
  H.push({role:"model",text:reply});
  busy=false;note("");render();speak(reply);
}

function build(){
  const app=$("lzApp"),home=$("pg_home");
  if(!app||!home)return false;
  if($("pg_assistant"))return true;
  const ex=home.querySelector('[data-go="explore"]');if(!ex)return false;
  const b=document.createElement("button");
  b.className="lzBig";b.id="lzAiBtn";b.setAttribute("data-go","assistant");
  b.textContent="🤖 মনের আলো সহকারী (Assistant)";
  ex.insertAdjacentElement("afterend",b);
  const sec=document.createElement("section");
  sec.className="lzPg";sec.id="pg_assistant";sec.hidden=true;
  sec.innerHTML='<div class="lzBar"><button class="lzBtn s lzBack" aria-label="ব্যাক, আগের পেজে ফিরে যাও">← ব্যাক (Back)</button><h2>🤖 সহকারী</h2></div>'
   +'<div class="lzCard"><h3>মনের আলো সহকারী</h3>'
   +'<p class="lzSm">আমি মনের আলো অ্যাপের সহকারী এআই। অ্যাপ, আমাদের টিম ও চ্যানেল নিয়ে প্রশ্ন করতে পারো। আমি ভুল করতে পারি, তাই দরকারি বিষয় যাচাই করে নিও।</p>'
   +'<div id="aiChat" aria-live="polite" style="max-height:40vh;overflow:auto"></div>'
   +'<textarea id="aiTxt" placeholder="তোমার প্রশ্ন লেখো" aria-label="তোমার প্রশ্ন" maxlength="500"></textarea>'
   +'<div class="lzRow"><button class="lzBtn" id="aiSend">📤 পাঠাও</button><button class="lzBtn r" id="aiClr">🗑 মুছো</button></div>'
   +'<p class="lzSm" id="aiNote" role="status" aria-live="polite"></p></div>';
  app.appendChild(sec);
  $("aiSend").onclick=send;
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
