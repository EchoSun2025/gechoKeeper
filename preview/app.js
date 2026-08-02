const $ = (s) => document.querySelector(s);
const screens = [...document.querySelectorAll('.screen')];
const dots = [...document.querySelectorAll('.dot')];
const pageOrder = ['home', 'create', 'checklist', 'report'];
let active = 'home', timerSeconds = 1458, timerRunning = false, startX = 0;

function show(name) {
  active = name;
  screens.forEach(s => s.classList.toggle('active', s.dataset.screen === name));
  dots.forEach(d => d.classList.toggle('active', d.dataset.page === name));
  if (name === 'focus') timerRunning = true;
}
document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => show(el.dataset.go)));
dots.forEach(d => d.addEventListener('click', () => show(d.dataset.page)));

$('#soundToggle').addEventListener('click', () => { const audio=$('#birdAudio'), volume=document.querySelector('.volume'); if(audio.paused){audio.play();volume.classList.add('show');$('#soundToggle').textContent='♪'}else{audio.pause();volume.classList.remove('show');$('#soundToggle').textContent='♬'} });
$('#volume').addEventListener('input', e => $('#birdAudio').volume=e.target.value);
document.querySelectorAll('.tag').forEach(tag => tag.addEventListener('click', () => { document.querySelectorAll('.tag').forEach(t=>t.classList.remove('selected'));tag.classList.add('selected') }));
$('#newTag').addEventListener('click', () => { const name=prompt('新标签名称');if(name){const b=document.createElement('button');b.type='button';b.className='tag selected';b.textContent=name;document.querySelectorAll('.tag').forEach(t=>t.classList.remove('selected'));$('#tagList').append(b);b.addEventListener('click',()=>{document.querySelectorAll('.tag').forEach(t=>t.classList.remove('selected'));b.classList.add('selected')})} });
$('#taskForm').addEventListener('submit', e => {e.preventDefault();$('#focusTask').textContent=$('#taskName').value.trim()||'未命名专注任务';show('focus')});
$('#finishFocus').addEventListener('click',()=>{timerRunning=false;show('report')});
setInterval(()=>{if(!timerRunning)return;timerSeconds++;const h=String(Math.floor(timerSeconds/3600)).padStart(2,'0'),m=String(Math.floor(timerSeconds%3600/60)).padStart(2,'0'),s=String(timerSeconds%60).padStart(2,'0');$('#timer').textContent=`${h}:${m}:${s}`},1000);
['water','move'].forEach(id=>$('#'+id).addEventListener('click',()=>$('#'+id).classList.toggle('flash')));
$('#checkList').addEventListener('click',e=>{const item=e.target.closest('.check-item');if(!item)return;item.classList.toggle('done');const count=document.querySelectorAll('.check-item.done').length;$('#checkCount').textContent=count;$('#progress').style.width=(count/6*100)+'%'});
let touchX=0;$('#app').addEventListener('touchstart',e=>touchX=e.changedTouches[0].screenX,{passive:true});$('#app').addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchX;if(Math.abs(dx)<50||active==='focus')return;const i=pageOrder.indexOf(active),next=dx<0?pageOrder[i+1]:pageOrder[i-1];if(next)show(next)},{passive:true});
$('#app').addEventListener('mousedown',e=>startX=e.clientX);$('#app').addEventListener('mouseup',e=>{const dx=e.clientX-startX;if(Math.abs(dx)<75||active==='focus')return;const i=pageOrder.indexOf(active),next=dx<0?pageOrder[i+1]:pageOrder[i-1];if(next)show(next)});
function updateClock(){const now=new Date();$('#clock').textContent=now.toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit',hour12:false})} updateClock();setInterval(updateClock,30000);
