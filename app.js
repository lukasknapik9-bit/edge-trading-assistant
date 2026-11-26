const map={BTCUSD:{tv:"BINANCE:BTCUSDT",name:"Binance BTCUSDT reference"},XAUUSD:{tv:"OANDA:XAUUSD",name:"OANDA XAUUSD"},EURUSD:{tv:"FX:EURUSD",name:"FX EURUSD"},NAS100:{tv:"FOREXCOM:NSXUSD",name:"FOREX.com US 100 (NSXUSD)"}};
const chart=document.getElementById("tv");let sym="BTCUSD",tf="1";
function update(){chart.setAttribute("symbol",map[sym].tv);chart.setAttribute("interval",tf);document.getElementById("symbol").innerHTML=sym+" <i></i>";document.getElementById("source").textContent=map[sym].name}
document.querySelectorAll(".markets button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".markets button").forEach(x=>x.classList.remove("active"));b.classList.add("active");sym=b.dataset.s;update()});
document.querySelectorAll(".tfs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tfs button").forEach(x=>x.classList.remove("chosen"));b.classList.add("chosen");tf=b.dataset.t;update()});
document.querySelectorAll(".modes button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".modes button").forEach(x=>x.classList.remove("chosen"));b.classList.add("chosen");tf=b.dataset.mode==="scalping"?"1":"15";document.querySelectorAll(".tfs button").forEach(x=>x.classList.toggle("chosen",x.dataset.t===tf));update()});
const ids=["entry","sl","tp"],els=ids.map(x=>document.getElementById(x)),rr=document.getElementById("rr");
function calc(){let [e,s,t]=els.map(x=>Number(x.value));rr.value=e>0&&s>0&&t>0&&(e-s)*(t-e)>0?"1:"+(Math.abs(t-e)/Math.abs(e-s)).toFixed(2):""}els.forEach(x=>x.addEventListener("input",calc));
function read(){try{return JSON.parse(localStorage.getItem("edgePlans")||"[]")}catch{return[]}}
function render(){let p=read(),el=document.getElementById("plans");el.innerHTML=p.length?p.map(x=>`<div class="plan"><b>${x.sym} · ${x.dir}</b><span>E ${x.e} / SL ${x.s} / TP ${x.t} · ${x.rr}</span></div>`).join(""):"Zatím tu nejsou žádné uložené plány."}
document.getElementById("save").onclick=()=>{let dir=document.getElementById("direction").value;if(!els.every(x=>x.value)&&dir==="Čekám"){document.getElementById("feedback").textContent="Doplň směr, Entry, SL a TP.";return}if(!els.every(x=>x.value)||dir==="Čekám"){document.getElementById("feedback").textContent="Doplň směr, Entry, SL a TP.";return}let p=read();p.unshift({sym,dir,e:els[0].value,s:els[1].value,t:els[2].value,rr:rr.value});localStorage.setItem("edgePlans",JSON.stringify(p.slice(0,25)));render();document.getElementById("feedback").textContent="Plán uložen v tomto zařízení."};
document.getElementById("clear").onclick=()=>{localStorage.removeItem("edgePlans");render()};
document.getElementById("file").onchange=e=>{let f=e.target.files[0];if(!f)return;let u=URL.createObjectURL(f);document.getElementById("preview").innerHTML=`<img src="${u}" alt="Náhled screenshotu">`};
let deferred;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e});document.getElementById("install").onclick=async()=>{if(deferred){deferred.prompt();deferred=null}else alert("Na iPhonu otevři web v Safari → Sdílet → Přidat na plochu. Web musí běžet přes HTTPS.")};
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});update();render();


// EDGE screenshot analysis via Puter.js. Manual review only; no trade execution.
const imageInput=document.getElementById("file");
const analyzeButton=document.getElementById("analyze");
const aiFeedback=document.getElementById("aiFeedback");
const aiResult=document.getElementById("aiResult");
const aiStatus=document.getElementById("aiStatus");
let selectedChartImage=null;
imageInput.addEventListener("change",e=>{
  selectedChartImage=e.target.files&&e.target.files[0]||null;
  analyzeButton.disabled=!selectedChartImage;
  aiResult.hidden=true;
  aiFeedback.textContent=selectedChartImage?"Screenshot je připravený. Stiskni tlačítko pro analýzu.":"Nahraj screenshot grafu.";
});
analyzeButton.addEventListener("click",async()=>{
  if(!selectedChartImage)return;
  if(!window.puter||!puter.ai||typeof puter.ai.chat!=="function"){
    aiFeedback.textContent="Puter.js se nepodařilo načíst. Obnov stránku a zkus to znovu.";return;
  }
  analyzeButton.disabled=true;
  analyzeButton.textContent="Analyzuji…";
  aiStatus.textContent="ANALÝZA…";
  aiFeedback.textContent="Připojuji Puter AI. Pokud nejsi přihlášený, Puter tě vyzve k přihlášení a potvrzení přístupu.";
  aiResult.hidden=true;
  const mode=document.querySelector('.modes button.chosen')?.dataset.mode||"scalping";
  const timeframe=document.querySelector('.tfs button.chosen')?.textContent||"1m";
  const symbol=document.getElementById("symbol")?.textContent?.trim()||"Neznámý instrument";
  const prompt=`Jsi konzervativní tradingový analytik EDGE. Analyzuj pouze přiložený screenshot. Instrument: ${symbol}. Režim: ${mode}. Timeframe: ${timeframe}.
Vrať POUZE validní JSON bez markdownu a bez textu před/za JSON. Buď velmi stručný. Nikdy nevymýšlej ceny. Pokud nejsou přesné úrovně jasně čitelné nebo chybí kontext, nastav verdict na NO TRADE a entry/sl/tp1/tp2/rr na "—".
Použij přesně tuto strukturu:
{
 "verdict":"LONG | SHORT | NO TRADE",
 "quality":"LOW | MEDIUM | HIGH",
 "entry":"konkrétní cena/zóna nebo —",
 "sl":"konkrétní cena nebo —",
 "tp1":"konkrétní cena nebo —",
 "tp2":"konkrétní cena nebo —",
 "rr":"např. 1:2.0 nebo —",
 "reasons":["max 3 krátké body, každý max 8 slov"],
 "structure":"max 12 slov",
 "trigger":"co musí nastat pro vstup, max 12 slov",
 "invalidation":"co setup ruší, max 12 slov",
 "risk":"jedna krátká věta"
}
LONG/SHORT použij pouze při jasném potvrzení. Jinak NO TRADE. Entry, SL, TP a R:R musí být logicky konzistentní se směrem obchodu. Ceny uváděj v cenové škále zobrazené na grafu. Pokud screenshot neukazuje dostatečný left context nebo čitelné ceny, zvol NO TRADE. Žádné dlouhé odstavce. Nejde o jistou predikci ani pokyn k obchodu; neprováděj obchody.`;
  try{
    const response=await puter.ai.chat(prompt,selectedChartImage);
    const content=response?.message?.content??response?.text??response;
    let raw=typeof content==="string"?content:JSON.stringify(content);
    raw=raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/," ").trim();
    let data;
    try { data=JSON.parse(raw); } catch { data=null; }
    const esc=v=>String(v??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
    if(data && typeof data==="object"){
      const verdict=String(data.verdict||"NO TRADE").toUpperCase();
      const cls=verdict==="LONG"?"long":verdict==="SHORT"?"short":"neutral";
      const levels=[["ENTRY",data.entry],["STOP LOSS",data.sl],["TAKE PROFIT 1",data.tp1],["TAKE PROFIT 2",data.tp2],["RISK / REWARD",data.rr]];
      const reasons=Array.isArray(data.reasons)?data.reasons.slice(0,3):[];
      aiResult.innerHTML=`<div class="result-top"><span class="verdict ${cls}">${esc(verdict)}</span><span class="quality">KVALITA: ${esc(data.quality||"—")}</span></div><div class="levels">${levels.map(([k,v])=>`<div class="level"><small>${k}</small><b>${esc(v)}</b></div>`).join("")}</div><div class="result-section"><small>DŮVODY</small><ul>${reasons.map(x=>`<li>${esc(x)}</li>`).join("")||"<li>Bez potvrzených důvodů</li>"}</ul></div><div class="result-section"><small>STRUKTURA</small><p>${esc(data.structure)}</p><small>VSTUPNÍ PODMÍNKA</small><p>${esc(data.trigger)}</p><small>INVALIDACE</small><p>${esc(data.invalidation)}</p><small>RIZIKO</small><p>${esc(data.risk)}</p></div>`;
    } else {
      aiResult.textContent=raw||"AI nevrátila čitelný výsledek. Zkus analýzu znovu.";
    }
    aiResult.hidden=false;
    aiFeedback.textContent="Hotovo. Úrovně vždy ověř přímo v grafu — AI může ceny přečíst chybně.";
    aiStatus.textContent="AI PŘIPOJENA";
  }catch(err){
    const message=err?.message||String(err);
    aiFeedback.textContent="Analýza se nepodařila: "+message+". Zkontroluj přihlášení, oprávnění a dostupné Puter kredity.";
    aiStatus.textContent="CHYBA AI";
  }finally{
    analyzeButton.disabled=!selectedChartImage;
    analyzeButton.textContent="Analyzovat screenshot pomocí AI";
  }
});
