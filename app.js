"use strict";
const $ = (id) => document.getElementById(id);
const DEFAULTS = {target:50,interval:10,mult:2,start:100,ath:100,initial:100,cap:10000};
const ids = Object.keys(DEFAULTS);
const money = (n) => Number.isFinite(n) ? '€'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}) : '—';
const num = (n,d=2) => Number.isFinite(n) ? n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}) : '—';
const pct = (n) => num(n)+'%';
let current = null;
function settings(){
  const s={}; for(const k of ids)s[k]=Number($(k).value);
  s.start=Number.isFinite(s.start)&&s.start>0?s.start:100;
  s.ath=Number.isFinite(s.ath)&&s.ath>0?s.ath:s.start;
  s.initial=Math.max(0,Number.isFinite(s.initial)?s.initial:0);
  s.cap=Math.max(0,Number.isFinite(s.cap)?s.cap:0);
  return s;
}
function simulate(s){
  let invested=0,shares=0,maxRisk=0, maxBefore=0;const rows=[],path=[];
  const count=Math.min(100,Math.floor((s.target+1e-9)/s.interval)+1);
  const measure=(price,capital,units)=>capital>0?100*(1-units*price/capital):0;
  for(let i=0;i<count;i++){
    const drop=i*s.interval, price=s.start*(1-drop/100);
    const before=measure(price,invested,shares);
    if(i){path.push({drop,loss:before,phase:'Before buy'});maxBefore=Math.max(maxBefore,before);}
    const planned=s.initial*Math.pow(s.mult,i);
    const buy=Math.max(0,Math.min(planned,s.cap-invested));
    invested+=buy;shares+=buy/price;
    const after=measure(price,invested,shares);
    path.push({drop,loss:after,phase:'After buy'});
    maxRisk=Math.max(maxRisk,before,after);
    rows.push({drop,price,planned,buy,invested,shares,before,after});
  }
  const bottomPrice=s.start*(1-s.target/100);
  const bottom=shares*bottomPrice;
  const bottomLoss=measure(bottomPrice,invested,shares);
  path.push({drop:s.target,loss:bottomLoss,phase:'Target'});
  maxRisk=Math.max(maxRisk,bottomLoss);
  const athValue=shares*s.ath;
  const profit=athValue-invested;
  const ret=invested>0?100*profit/invested:0;
  const avg=shares>0?invested/shares:0;
  const rebound=bottom>0?100*(athValue/bottom-1):0;
  return {rows,path,invested,shares,bottomPrice,bottom,bottomLoss,maxRisk,maxBefore,athValue,profit,ret,avg,rebound,used:s.cap?100*invested/s.cap:0,activeBuys:rows.filter(r=>r.buy>1e-9).length,capHit:rows.some(r=>r.buy+1e-9<r.planned)};
}
function renderBars(r){const values=[r.invested,r.bottom,r.athValue];const labels=['Capital invested','Value at bottom','Value at ATH'];const colors=['#7199c6','#e2b365','#4de2ac'];const max=Math.max(1,...values);$('barChart').innerHTML=values.map((v,i)=>`<div style="margin:12px 0"><div class="stat-line" style="margin:0 0 6px"><span class="label">${labels[i]}</span><strong>${money(v)}</strong></div><div class="track" style="height:14px;margin:0"><div style="height:100%;width:${Math.max(0,v/max*100)}%;background:${colors[i]};border-radius:99px"></div></div></div>`).join('')}
function svgEl(tag,attrs,txt=''){let attrsString=Object.entries(attrs).map(([k,v])=>`${k}="${String(v).replaceAll('"','&quot;')}"`).join(' ');return `<${tag} ${attrsString}>${txt}</${tag}>`}
function renderRiskChart(r,s){const w=640,h=300,l=48,rr=16,t=15,b=38,plotW=w-l-rr,plotH=h-t-b;let maxY=Math.max(12,Math.ceil(r.maxRisk/5)*5);const x=d=>l+d/s.target*plotW,y=v=>t+(maxY-v)/maxY*plotH;let svg='';for(let i=0;i<=4;i++){const tick=maxY*i/4,yy=y(tick);svg+=`<line x1="${l}" x2="${w-rr}" y1="${yy}" y2="${yy}" stroke="#2b4059" stroke-width="1"/><text x="${l-9}" y="${yy+4}" text-anchor="end" fill="#92a8c3" font-size="12">${num(tick,0)}%</text>`;}for(let i=0;i<=4;i++){const drop=s.target*i/4;svg+=`<text x="${x(drop)}" y="${h-12}" text-anchor="middle" fill="#92a8c3" font-size="12">−${num(drop,0)}%</text>`;}svg+=`<line x1="${l}" x2="${w-rr}" y1="${y(10)}" y2="${y(10)}" stroke="#ff8294" stroke-width="2" stroke-dasharray="7 6"/>`;
  svg+=`<polyline fill="none" stroke="#75adff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${r.path.map(p=>`${x(p.drop).toFixed(2)},${y(p.loss).toFixed(2)}`).join(' ')}"/>`;
  for(const p of r.path.filter(x=>x.phase==='After buy'||x.phase==='Target'))svg+=`<circle cx="${x(p.drop)}" cy="${y(p.loss)}" r="3" fill="#75adff"/>`;
  $('riskChart').innerHTML=svg;
}
function render(){const s=settings();const r=simulate(s);current={s,r};
  $('targetLabel').textContent=`−${s.target}%`;$('intervalLabel').textContent=`Every ${s.interval}%`;$('multLabel').textContent=`${num(s.mult)}×`;$('targetPill').textContent=`−${s.target}% price`;
  $('total').textContent=money(r.invested);$('bottom').textContent=money(r.bottom);$('loss').textContent=`${r.bottomLoss<0?'+':'−'}${pct(Math.abs(r.bottomLoss))}`;$('maxLoss').textContent=pct(r.maxRisk);$('maxLoss').className=`metric-val ${r.maxRisk>10+1e-8?'negative':'positive'}`;
  $('usedLabel').textContent=pct(r.used);$('capBar').style.width=`${Math.min(100,r.used)}%`;
  $('athReturn').textContent=`${r.ret>=0?'+':''}${pct(r.ret)}`;$('athReturn').className=r.ret>=0?'positive':'negative';$('athValue').textContent=money(r.athValue);$('profit').textContent=`${r.profit>=0?'+':'−'}${money(Math.abs(r.profit))}`;$('profit').className=`metric-val ${r.profit>=0?'positive':'negative'}`;$('rebound').textContent=`${r.rebound>=0?'+':''}${pct(r.rebound)}`;$('avg').textContent=money(r.avg);
  const breach=r.maxRisk>10+1e-8;const msg=breach?`<span class="em">⚠</span><span><b>10% loss limit breached</b><br>Peak contribution-basis loss is ${pct(r.maxRisk)} on this falling-price path.${r.capHit?' The capital budget also limits some purchases.':''}</span>`:`<span class="em">✓</span><span><b>Within 10% on the modeled path</b><br>Peak contribution-basis loss is ${pct(r.maxRisk)}. This is not a guaranteed stop-loss.</span>`;
  $('riskNotice').className=breach?'callout warning':'callout';$('riskNotice').innerHTML=msg;
  $('buysPill').textContent=`${r.activeBuys} buys`;
  $('scheduleBody').innerHTML=r.rows.map((b,i)=>`<tr><td>${i?'−'+num(b.drop,0)+'%':'Initial'}</td><td>${num(b.price)}</td><td>${num(b.buy)}</td><td>${num(b.invested)}</td><td class="${b.after>10?'negative':''}">${pct(b.after)}</td></tr>`).join('');
  renderBars(r);renderRiskChart(r,s);try{localStorage.setItem('dca-lab-settings',JSON.stringify(s))}catch(e){}
}
function saveCsv(){if(!current)return;const {s,r}=current;const header=['Drawdown (%)','Price (EUR)','Planned purchase (EUR)','Actual purchase (EUR)','Cumulative invested (EUR)','Shares held','Loss before buy (%)','Loss after buy (%)'];const csv=[header.join(','),...r.rows.map(a=>[a.drop,a.price,a.planned,a.buy,a.invested,a.shares,a.before,a.after].map(v=>Number(v).toFixed(6)).join(',')),``, `Total invested (EUR),${r.invested.toFixed(2)}`,`Value at target (EUR),${r.bottom.toFixed(2)}`,`Peak loss (%),${r.maxRisk.toFixed(4)}`,`ATH price (EUR),${s.ath.toFixed(2)}`,`Return at ATH (%),${r.ret.toFixed(4)}`,`Profit at ATH (EUR),${r.profit.toFixed(2)}`].join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='dca-scenario.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function share(){if(!current)return;const {s,r}=current;const str=`DCA Lab scenario: −${s.target}% target, every ${s.interval}% buy, ${s.mult}× step-up. Invested: ${money(r.invested)}. Maximum loss: ${pct(r.maxRisk)}. Return at ATH: ${pct(r.ret)}.`;if(navigator.share){try{await navigator.share({title:'DCA Lab scenario',text:str});return}catch(e){if(e.name==='AbortError')return}}try{await navigator.clipboard.writeText(str);$('share').textContent='Copied!';setTimeout(()=>$('share').textContent='Share plan',2000)}catch(e){alert(str)}}
for(const k of ids)$(k).addEventListener('input',render);
$('reset').addEventListener('click',()=>{for(const [k,v] of Object.entries(DEFAULTS))$(k).value=v;render()});
$('download').addEventListener('click',saveCsv);$('share').addEventListener('click',share);
for(const b of document.querySelectorAll('.nav-btn'))b.addEventListener('click',()=>{for(const n of document.querySelectorAll('.nav-btn'))n.classList.remove('active');b.classList.add('active');$(b.dataset.to).scrollIntoView({behavior:'smooth',block:'start'})});
try{const saved=JSON.parse(localStorage.getItem('dca-lab-settings')||'null');if(saved&&typeof saved==='object')for(const k of ids)if(Number.isFinite(Number(saved[k]))&&saved[k]!==null)$(k).value=saved[k]}catch(e){}
render();
let deferredInstall=null;window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredInstall=e;$('installBtn').style.display='block'});$('installBtn').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').style.display='none'}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
