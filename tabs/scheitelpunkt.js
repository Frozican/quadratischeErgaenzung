/* Extra Übung: Scheitelpunktform bestimmen, mit sofortigem Feedback und lokalem Fortschritt. */
(function(){
'use strict';
const L=window.Lernseite;
L.registerTab({id:'scheitelpunkt',title:'Scheitelpunkt',order:2,mount(panel,{store,h,math:M,util}) {
 const css=`
 .sp-wrap{display:grid;gap:1rem}.sp-card{padding:1rem;border:1px solid var(--line);border-radius:12px;background:var(--surface-2)}
 .sp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}
 .sp-grid label{display:grid;gap:.35rem;font-weight:600}.sp-grid input{min-width:0;padding:.65rem;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font:inherit}
 .sp-feedback{padding:.8rem;border-radius:10px}.sp-good{background:var(--ok-bg);color:var(--ok)}.sp-bad{background:var(--bad-bg);color:var(--bad)}
 .sp-graph{width:100%;height:240px;display:block;border:1px solid var(--line);border-radius:10px;background:var(--surface)}`;
 if(!document.getElementById('sp-css')){const style=h('style',{id:'sp-css'},css);document.head.append(style)}
 let a,b,c,vertex,attempted=false;
 const score=store.get('score',0), solved=store.get('solved',0);
 const status=h('p',{class:'muted'} ,'');
 const scoreEl=h('strong',null,'Richtig gelöst: '+solved+' · Punkte: '+score);
 const question=h('div',{class:'sp-card'});
 const inputs={x:h('input',{type:'text',inputmode:'decimal',placeholder:'z. B. -2'}),y:h('input',{type:'text',inputmode:'decimal',placeholder:'z. B. 5'})};
 const form=h('div',{class:'sp-grid'});
 form.append(h('label',null,'xₛ (Scheitel-x)',inputs.x),h('label',null,'yₛ (Scheitel-y)',inputs.y));
 const feedback=h('div',{class:'sp-feedback',hidden:true});
 const graph=h('div');
 function generate(){
  a=util.pick([-3,-2,-1,1,2,3]); b=util.rand(-8,8); c=util.rand(-8,8);
  vertex={x:-b/(2*a),y:c-b*b/(4*a)};
  question.innerHTML='<h3>Bestimme den Scheitelpunkt</h3><div class="expr" style="font-size:1.7rem">f(x) = '+a+'x² '+(b>=0?'+ ':'− ')+Math.abs(b)+'x '+(c>=0?'+ ':'− ')+Math.abs(c)+'</div><p>Berechne xₛ und anschließend yₛ. Gib beide Werte ein.</p>';
  inputs.x.value='';inputs.y.value='';feedback.hidden=true;attempted=false;graph.innerHTML='';draw();
 }
 function draw(){
  const w=500,ht=240, scale=24, ox=w/2,oy=ht/2;
  let path='';for(let i=0;i<=w;i++){let x=(i-ox)/scale,y=a*x*x+b*x+c, py=oy-y*scale;path+=(i?'L':'M')+i+','+py;}
  const vx=ox+vertex.x*scale,vy=oy-vertex.y*scale;
  graph.innerHTML='<svg class="sp-graph" viewBox="0 0 500 240" role="img" aria-label="Parabelgrafik"><g stroke="var(--line)" stroke-width="1">'+Array.from({length:21},(_,i)=>'<line x1="'+(i*25)+'" y1="0" x2="'+(i*25)+'" y2="240"/>').join('')+Array.from({length:11},(_,i)=>'<line x1="0" y1="'+(i*24)+'" x2="500" y2="'+(i*24)+'"/>').join('')+'</g><line x1="'+ox+'" y1="0" x2="'+ox+'" y2="240" stroke="var(--muted)"/><line x1="0" y1="'+oy+'" x2="500" y2="'+oy+'" stroke="var(--muted)"/><path d="'+path+'" fill="none" stroke="var(--accent)" stroke-width="3"/><circle cx="'+vx+'" cy="'+vy+'" r="5" fill="var(--ok)"/></svg>';
 }
 const check=h('button',{class:'btn primary',type:'button'},'Prüfen');
 check.addEventListener('click',()=>{
  const qx=M.parse(inputs.x.value),qy=M.parse(inputs.y.value);
  if(!qx||!qy){feedback.className='sp-feedback sp-bad';feedback.textContent='Bitte gib zwei gültige Zahlen oder Brüche ein.';feedback.hidden=false;return;}
  const targetX=M.Q(Math.round(vertex.x*100000),100000),targetY=M.Q(Math.round(vertex.y*100000),100000);
  const ok=Math.abs(M.toNumber(qx)-vertex.x)<1e-5&&Math.abs(M.toNumber(qy)-vertex.y)<1e-5;
  feedback.hidden=false;feedback.className='sp-feedback '+(ok?'sp-good':'sp-bad');
  feedback.textContent=ok?'Richtig! S('+vertex.x.toFixed(2).replace('.',',')+' | '+vertex.y.toFixed(2).replace('.',',')+')':'Noch nicht. Tipp: xₛ = −b/(2a), dann yₛ = f(xₛ).';
  if(ok&&!attempted){attempted=true;store.set('score',store.get('score',0)+10);store.set('solved',store.get('solved',0)+1);scoreEl.textContent='Richtig gelöst: '+store.get('solved',0)+' · Punkte: '+store.get('score',0);}
 });
 const next=h('button',{class:'btn',type:'button'},'Neue Aufgabe');
 next.addEventListener('click',generate);
 panel.append(h('div',{class:'sp-wrap'},h('p',null,'Finde den Scheitel S(xₛ | yₛ) einer Funktion in Normalform.'),scoreEl,question,form,check,next,feedback,graph));
 generate();draw();
}});})();