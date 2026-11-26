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
  const prompt=`Jsi konzervativní analytický asistent EDGE. Analyzuj POUZE přiložený screenshot grafu. Instrument: ${symbol}. Režim: ${mode}. Zvolený timeframe: ${timeframe}. Nehádej neviditelné ceny ani timeframe; pokud nejsou čitelné, řekni to. Nezaměňuj technický názor za jistou predikci. Nejprve popiš viditelnou strukturu (HH/HL/LH/LL), případné BOS/CHOCH, support/resistance, likviditu, FVG a price action, ale uváděj jen to, co screenshot skutečně podporuje. Poté dej výsledek v tomto formátu: VERDIKT: LONG / SHORT / NO TRADE; KVALITA: nízká / střední / vysoká; DŮVODY:; ENTRY: cena nebo nelze určit; SL: cena nebo nelze určit; TP1: cena nebo nelze určit; TP2: cena nebo nelze určit; R:R: vypočítej jen pokud jsou ceny spolehlivě čitelné; CO CHYBÍ:; INVALIDACE:; RIZIKO: Upozorni, pokud screenshot neposkytuje dost kontextu — v takovém případě zvol NO TRADE a nevymýšlej úrovně. Nejde o investiční doporučení. Neprováděj žádné obchody.`;
  try{
    const response=await puter.ai.chat(prompt,selectedChartImage);
    const content=response?.message?.content??response?.text??response;
    aiResult.textContent=typeof content==="string"?content:JSON.stringify(content,null,2);
    aiResult.hidden=false;
    aiFeedback.textContent="Analýza dokončena. Zkontroluj úrovně přímo v grafu; AI může chybně číst ceny.";
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
