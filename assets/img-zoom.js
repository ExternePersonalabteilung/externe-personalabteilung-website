/* Bild-Lightbox mit Zoom: Klick oder Rad zoomt, Ziehen verschiebt, Zwei-Finger-Zoom auf
   Handy und Tablet. Aktiv für jedes Element mit [data-zoom] (enthält ein <img>). */
(function(){
  var ov,img,sc=1,tx=0,ty=0,MIN=1,MAX=5,lw=0,lh=0,l0=0,t0=0,lastFocus=null;
  function measure(){
    var pt=img.style.transform,tr=img.style.transition;
    img.style.transition='none';img.style.transform='none';
    var r=img.getBoundingClientRect();lw=r.width;lh=r.height;l0=r.left;t0=r.top;
    img.style.transform=pt;img.style.transition=tr;
  }
  function apply(){img.style.transform='translate('+tx+'px,'+ty+'px) scale('+sc+')';img.style.cursor=sc>1?'grab':'zoom-in';}
  function reset(){sc=1;tx=0;ty=0;img.style.transition='transform .18s ease';apply();}
  function clampPan(){
    if(!lw||!lh)measure();
    var ow=ov.clientWidth,oh=ov.clientHeight,w=lw*sc,h=lh*sc,left=l0+tx,top=t0+ty;
    if(w<=ow)tx=(ow-w)/2-l0;else{if(left>0)tx=-l0;else if(left+w<ow)tx=ow-w-l0;}
    if(h<=oh)ty=(oh-h)/2-t0;else{if(top>0)ty=-t0;else if(top+h<oh)ty=oh-h-t0;}
  }
  function zoomAt(cx,cy,next){
    next=Math.min(MAX,Math.max(MIN,next));
    if(next===sc)return;
    if(!lw||!lh)measure();
    var ix=(cx-(l0+tx))/sc,iy=(cy-(t0+ty))/sc;
    tx=cx-l0-ix*next;ty=cy-t0-iy*next;sc=next;clampPan();apply();
  }
  function build(hintText,closeLabel){
    if(ov)return;
    ov=document.createElement('div');
    ov.id='imgZoomOverlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
    ov.style.cssText='position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:clamp(12px,3vw,40px);background:rgba(8,5,2,.93);backdrop-filter:blur(4px);cursor:zoom-out';
    img=document.createElement('img');img.alt='';img.draggable=false;
    img.style.cssText='max-width:100%;max-height:100%;width:auto;height:auto;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6);transform-origin:0 0;transition:transform .18s ease;cursor:zoom-in;touch-action:none;user-select:none';
    var cl=document.createElement('button');
    cl.type='button';cl.setAttribute('aria-label',closeLabel||'Close');cl.innerHTML='&times;';
    cl.style.cssText='position:fixed;top:clamp(12px,3vw,26px);right:clamp(12px,3vw,26px);width:46px;height:46px;border-radius:50%;border:1px solid rgba(201,138,47,.6);background:linear-gradient(160deg,rgba(255,252,246,.95),rgba(250,239,213,.9));color:#3a2408;font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center';
    cl.addEventListener('click',close);
    var hint=document.createElement('div');
    hint.textContent=hintText||'';
    hint.style.cssText='position:fixed;left:50%;bottom:clamp(12px,3vw,24px);transform:translateX(-50%);padding:8px 16px;border-radius:12px;font:600 13px/1.3 Mulish,system-ui,sans-serif;color:#3a2408;background:linear-gradient(160deg,rgba(255,252,246,.94),rgba(250,239,213,.9));border:1px solid rgba(201,138,47,.55);pointer-events:none;text-align:center;max-width:calc(100% - 32px)';
    ov.appendChild(img);ov.appendChild(cl);ov.appendChild(hint);
    ov.addEventListener('click',function(ev){if(ev.target===ov)close();});
    document.body.appendChild(ov);
    wireZoom();
  }
  function open(src,alt){
    img.src=src;img.alt=alt||'';
    lw=lh=0;reset();
    ov.style.display='flex';
    document.documentElement.style.overflow='hidden';
    lastFocus=document.activeElement;
    ov.querySelector('button').focus();
    if(img.complete)measure();else img.addEventListener('load',measure,{once:true});
  }
  function close(){
    if(!ov)return;
    ov.style.display='none';reset();img.removeAttribute('src');
    document.documentElement.style.overflow='';
    if(lastFocus&&lastFocus.focus)try{lastFocus.focus();}catch(e){}
  }
  var wired=false;
  function wireZoom(){
    if(wired)return;wired=true;
    img.addEventListener('click',function(ev){
      ev.stopPropagation();img.style.transition='transform .18s ease';
      if(sc>1)reset();else zoomAt(ev.clientX,ev.clientY,2.5);
    });
    ov.addEventListener('wheel',function(ev){
      ev.preventDefault();img.style.transition='none';
      zoomAt(ev.clientX,ev.clientY,sc*(ev.deltaY<0?1.18:1/1.18));
    },{passive:false});
    var pts={},startD=0,startSc=1,startMid=null;
    img.addEventListener('pointerdown',function(ev){
      try{img.setPointerCapture(ev.pointerId);}catch(e){}
      pts[ev.pointerId]={x:ev.clientX,y:ev.clientY};
      var k=Object.keys(pts);
      if(k.length===2){var a=pts[k[0]],b=pts[k[1]];startD=Math.hypot(a.x-b.x,a.y-b.y);startSc=sc;startMid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
      img.style.transition='none';
    });
    img.addEventListener('pointermove',function(ev){
      if(!pts[ev.pointerId])return;
      var prev=pts[ev.pointerId],dx=ev.clientX-prev.x,dy=ev.clientY-prev.y;
      pts[ev.pointerId]={x:ev.clientX,y:ev.clientY};
      var k=Object.keys(pts);
      if(k.length===2&&startD){var a=pts[k[0]],b=pts[k[1]];zoomAt(startMid.x,startMid.y,startSc*(Math.hypot(a.x-b.x,a.y-b.y)/startD));return;}
      if(sc>1){tx+=dx;ty+=dy;clampPan();apply();}
    });
    function up(ev){delete pts[ev.pointerId];if(Object.keys(pts).length<2)startD=0;}
    img.addEventListener('pointerup',up);
    img.addEventListener('pointercancel',up);
    window.addEventListener('resize',function(){if(ov.style.display==='flex'){measure();clampPan();apply();}});
    document.addEventListener('keydown',function(ev){
      if(ov.style.display!=='flex')return;
      if(ev.key==='Escape')close();
      if(ev.key==='+'||ev.key==='=')zoomAt(ov.clientWidth/2,ov.clientHeight/2,sc*1.25);
      if(ev.key==='-')zoomAt(ov.clientWidth/2,ov.clientHeight/2,sc/1.25);
      if(ev.key==='0')reset();
    });
  }
  function init(){
    var zones=document.querySelectorAll('[data-zoom]');
    if(!zones.length)return;
    var hint=document.documentElement.getAttribute('data-zoom-hint')||'';
    var cls=document.documentElement.getAttribute('data-zoom-close')||'Close';
    build(hint,cls);
    zones.forEach(function(z){
      var im=z.querySelector('img');if(!im)return;
      z.addEventListener('click',function(ev){ev.preventDefault();open(im.currentSrc||im.src,im.alt);});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
