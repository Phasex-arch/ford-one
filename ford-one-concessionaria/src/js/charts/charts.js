// @ts-check
'use strict';
/* ============================================================
   charts.js
   setupCanvas(), ctxt(), cgrid(), ccard(),
   drawLine(), drawBar(), drawPie(), showTip(), hideTip(),
   initDashCharts(), initReceitaCharts(), initDesempenhoCharts()
============================================================ */

// ─── CHARTS ──────────────────────────────────────────────────
function ctxt() {return getComputedStyle(document.documentElement).getPropertyValue('--chart-text').trim()||'#9CA3AF';}
function cgrid(){return getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim()||'#E5EAF2';}
function ccard(){return getComputedStyle(document.documentElement).getPropertyValue('--chart-card').trim()||'#fff';}

function setupCanvas(id){
  const c=$(id);if(!c)return null;
  const W=c.parentElement.clientWidth||400,H=210;
  c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';
  const ctx=c.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  return{ctx,W,H};
}

function drawLine(id,cfg){
  const s=setupCanvas(id);if(!s)return;
  const{ctx,W,H}=s;
  const P={t:18,r:18,b:26,l:44},pw=W-P.l-P.r,ph=H-P.t-P.b;
  const all=cfg.sets.flatMap(s=>s.data),mn=Math.min(...all)*.88,mx=Math.max(...all)*1.1;
  const tx=i=>P.l+i/(cfg.labels.length-1)*pw;
  const ty=v=>P.t+ph-(v-mn)/(mx-mn)*ph;
  const tclr=ctxt(),gclr=cgrid(),bclr=ccard();
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle=gclr;ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=P.t+i/4*ph;ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();ctx.fillStyle=tclr;ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.fillText(Math.round(mx-i/4*(mx-mn))+(cfg.unit||''),P.l-6,y+3.5);}
    ctx.fillStyle=tclr;ctx.font='10px Inter,sans-serif';ctx.textAlign='center';
    cfg.labels.forEach((l,i)=>ctx.fillText(l,tx(i),H-P.b+13));
    cfg.sets.forEach(ds=>{
      const pts=ds.data.map((v,i)=>[tx(i),ty(v)]);
      if(ds.fill){ctx.beginPath();ctx.moveTo(pts[0][0],ty(mn));pts.forEach(([x,y])=>ctx.lineTo(x,y));ctx.lineTo(pts[pts.length-1][0],ty(mn));ctx.closePath();const g=ctx.createLinearGradient(0,P.t,0,P.t+ph);g.addColorStop(0,ds.color+'24');g.addColorStop(1,ds.color+'03');ctx.fillStyle=g;ctx.fill();}
      ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.strokeStyle=ds.color;ctx.lineWidth=2.5;ctx.setLineDash(ds.dashed?[6,4]:[]);ctx.stroke();ctx.setLineDash([]);
      if(!ds.dashed)pts.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fillStyle=ds.color;ctx.fill();ctx.strokeStyle=bclr;ctx.lineWidth=2;ctx.stroke();});
    });
  }
  draw();
  const ce=$(id);
  ce.onmousemove=e=>{const r=ce.getBoundingClientRect(),mx2=e.clientX-r.left;let ni=0,nd=Infinity;cfg.labels.forEach((_,i)=>{const d2=Math.abs(tx(i)-mx2);if(d2<nd){nd=d2;ni=i;}});if(nd<38)showTip(id,e.clientX,e.clientY,`<strong>${cfg.labels[ni]}</strong><br>${cfg.sets.map(ds=>ds.data[ni]+(cfg.unit||'')).join(' / ')}`);else hideTip(id);};
  ce.onmouseleave=()=>hideTip(id);
}

function drawBar(id,cfg){
  const s=setupCanvas(id);if(!s)return;
  const{ctx,W,H}=s;
  const P={t:18,r:18,b:26,l:44},pw=W-P.l-P.r,ph=H-P.t-P.b;
  const mx=Math.max(...cfg.data)*1.15,bw=(pw/cfg.data.length)*.58,gap=(pw/cfg.data.length)*.21;
  const tclr=ctxt(),gclr=cgrid();
  function draw(hi){
    ctx.clearRect(0,0,W,H);ctx.strokeStyle=gclr;ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=P.t+i/4*ph;ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();ctx.fillStyle=tclr;ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.fillText(Math.round(mx-i/4*mx)+(cfg.unit||''),P.l-6,y+3.5);}
    cfg.data.forEach((v,i)=>{
      const x=P.l+i*(pw/cfg.data.length)+gap,bh=(v/mx)*ph,y=P.t+ph-bh,r=3,hov=hi===i;
      const g=ctx.createLinearGradient(0,y,0,y+bh);g.addColorStop(0,hov?cfg.color+'EE':cfg.color);g.addColorStop(1,cfg.color+'66');ctx.fillStyle=g;
      ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+bw-r,y);ctx.quadraticCurveTo(x+bw,y,x+bw,y+r);ctx.lineTo(x+bw,y+bh);ctx.lineTo(x,y+bh);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();
      if(hov){ctx.strokeStyle=cfg.color;ctx.lineWidth=2;ctx.stroke();}
      ctx.fillStyle=tclr;ctx.font=`${hov?'bold':'normal'} 10px Inter,sans-serif`;ctx.textAlign='center';
      ctx.fillText(v+(cfg.unit||''),x+bw/2,y-5);ctx.fillText(cfg.labels[i],x+bw/2,H-P.b+13);
    });
  }
  draw(-1);
  const ce=$(id);
  ce.onmousemove=e=>{const r=ce.getBoundingClientRect(),mx2=e.clientX-r.left;let hi=-1;cfg.data.forEach((_,i)=>{const x=P.l+i*(pw/cfg.data.length)+gap;if(mx2>=x&&mx2<=x+bw)hi=i;});draw(hi);if(hi>=0)showTip(id,e.clientX,e.clientY,`<strong>${cfg.labels[hi]}</strong><br>${cfg.data[hi]}${cfg.unit||''}`);else hideTip(id);};
  ce.onmouseleave=()=>{draw(-1);hideTip(id);};
}

function drawPie(id,cfg){
  const s=setupCanvas(id);if(!s)return;
  const{ctx,W,H}=s;
  const cx=W*.31,cy=H/2,r=Math.min(cx,cy)-13,ir=r*.54;
  const tot=cfg.data.reduce((a,b)=>a+b,0);let ang=-Math.PI/2;
  const slices=[];cfg.data.forEach((v,i)=>{const sl=(v/tot)*Math.PI*2;slices.push({start:ang,end:ang+sl,c:cfg.colors[i],v});ang+=sl;});
  const tclr=ctxt(),bclr=ccard();
  function draw(hi){
    ctx.clearRect(0,0,W,H);
    slices.forEach((sl,i)=>{const exp=hi===i?5:0,mid=(sl.start+sl.end)/2,ox=Math.cos(mid)*exp,oy=Math.sin(mid)*exp;ctx.beginPath();ctx.moveTo(cx+ox,cy+oy);ctx.arc(cx+ox,cy+oy,r,sl.start,sl.end);ctx.closePath();ctx.fillStyle=sl.c;ctx.fill();ctx.strokeStyle=bclr;ctx.lineWidth=2;ctx.stroke();});
    ctx.beginPath();ctx.arc(cx,cy,ir,0,Math.PI*2);ctx.fillStyle=bclr;ctx.fill();
    ctx.fillStyle=tclr;ctx.font='bold 13px Inter,sans-serif';ctx.textAlign='center';ctx.fillText(hi>=0?cfg.data[hi]+'%':'100%',cx,cy+4);
    const lx=W*.6;let ly=cy-(cfg.labels.length*21)/2+8;
    cfg.labels.forEach((l,i)=>{ctx.fillStyle=cfg.colors[i];ctx.fillRect(lx,ly-7,10,10);ctx.fillStyle=tclr;ctx.font=hi===i?'bold 10.5px Inter,sans-serif':'10.5px Inter,sans-serif';ctx.textAlign='left';ctx.fillText(`${l} (${cfg.data[i]}%)`,lx+14,ly+2);ly+=22;});
  }
  draw(-1);
  const ce=$(id);
  ce.onmousemove=e=>{const r2=ce.getBoundingClientRect(),mx2=e.clientX-r2.left,my2=e.clientY-r2.top,dx=mx2-cx,dy=my2-cy,dist=Math.sqrt(dx*dx+dy*dy);let hi=-1;if(dist<r&&dist>ir){let a=Math.atan2(dy,dx);if(a<-Math.PI/2)a+=Math.PI*2;slices.forEach((sl,i)=>{if(a>=sl.start&&a<sl.end)hi=i;});}draw(hi);if(hi>=0)showTip(id,e.clientX,e.clientY,`<strong>${cfg.labels[hi]}</strong><br>${cfg.data[hi]}%`);else hideTip(id);};
  ce.onmouseleave=()=>{draw(-1);hideTip(id);};
}

function showTip(id,x,y,html){let t=$('tip-'+id);if(!t){t=document.createElement('div');t.id='tip-'+id;t.className='ch-tip';document.body.appendChild(t);}t.innerHTML=html;t.style.left=(x+14)+'px';t.style.top=(y-10)+'px';t.classList.add('on');}
function hideTip(id){$('tip-'+id)?.classList.remove('on');}

function initDashCharts(){
  drawLine('revenueChart',{labels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],sets:[{data:[820,910,870,1050,980,1120,1080,1200,1150,1320,1280,1400],color:'#1700f4',fill:true},{data:[900,900,900,1000,1000,1000,1100,1100,1100,1200,1200,1200],color:'#F59E0B',dashed:true}],unit:'k'});
  drawBar('conversionChart',{labels:['Jan','Fev','Mar','Abr','Mai','Jun'],data:[28,31,29,34,32,34],color:'#1700f4',unit:'%'});
}
function initReceitaCharts(){
  const rKpis=[{ic:'ic-blue',fa:'ph-currency-dollar',lbl:'Receita',val:'R$ 1.248.000',delta:'este mes',cls:'pos',key:'receita'},{ic:'ic-green',fa:'ph-check-circle',lbl:'Confirmada',val:'R$ 874.320',delta:'+8.3%',cls:'pos',key:'receita'},{ic:'ic-orange',fa:'ph-users',lbl:'Ticket Médio',val:'R$ 48.600',delta:'+4.1%',cls:'pos',key:'receita'},{ic:'ic-purple',fa:'ph-trend-up',lbl:'Conversão',val:'34.2%',delta:'+2.1pp',cls:'pos',key:'conversao'}];
  $('receitaKpis').innerHTML=rKpis.map(k=>`<div class="kpi-card" onclick="openKpi('${k.key}')"><div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.fa}"></i></div><div class="kpi-body"><span class="kpi-lbl">${k.lbl}</span><span class="kpi-val">${k.val}</span><span class="kpi-delta ${k.cls}">${k.delta}</span></div></div>`).join('');
  drawPie('receitaCateg',{labels:['Vendas Novas','Seminovos','Serviços','Peças','F&I'],data:[52,18,16,9,5],colors:['#1700f4','#0a0f7a','#10B981','#F59E0B','#8B5CF6']});
  drawLine('receitaTrim',{labels:['Q1 2024','Q2 2024','Q3 2024','Q4 2024','Q1 2025'],sets:[{data:[2100,2450,2280,2900,3100],color:'#1700f4',fill:true}],unit:'k'});
}
function initDesempenhoCharts(){
  const dKpis=[{ic:'ic-blue',fa:'ph-users',lbl:'Retenção',val:'84%',delta:'+3pp',cls:'pos',key:'conversao'},{ic:'ic-orange',fa:'ph-car',lbl:'Giro',val:'28 dias',delta:'-4 dias',cls:'pos',key:'estoque'},{ic:'ic-green',fa:'ph-wrench',lbl:'Produtividade',val:'91%',delta:'Meta: 85%',cls:'pos',key:'sla'},{ic:'ic-purple',fa:'ph-phone',lbl:'Follow-up',val:'67%',delta:'-2pp vs meta',cls:'neg',key:'leads'}];
  $('desempKpis').innerHTML=dKpis.map(k=>`<div class="kpi-card" onclick="openKpi('${k.key}')"><div class="kpi-ic ${k.ic}"><i class="ph-bold ${k.fa}"></i></div><div class="kpi-body"><span class="kpi-lbl">${k.lbl}</span><span class="kpi-val">${k.val}</span><span class="kpi-delta ${k.cls}">${k.delta}</span></div></div>`).join('');
  drawBar('consultorChart',{labels:['Ricardo C.','Patrícia O.','Lucas M.','Amanda R.','Fernando B.'],data:[94,87,91,78,85],color:'#1700f4',unit:'%'});
  drawLine('retencaoChart',{labels:['Jan','Fev','Mar','Abr','Mai','Jun'],sets:[{data:[79,81,80,83,84,84],color:'#10B981',fill:true}],unit:'%'});
}

