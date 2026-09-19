/* Kontaktseite: Videohintergrund nachladen und Formular versenden.
   Texte kommen aus data-Attributen, damit die Datei für alle Sprachen gilt. */
(function(){
  /* Hintergrundvideo erst nach dem Seitenaufbau holen, bis dahin steht das Standbild. */
  var v=document.getElementById('ktHeroVideo');
  if(v&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    var src=v.getAttribute('data-src')||(location.pathname.split('/').length>3?'../../assets/hero-video.mp4':'assets/hero-video.mp4');
    var laden=function(){
      var s=document.createElement('source');
      s.src=src;s.type='video/mp4';
      v.appendChild(s);v.load();
      v.addEventListener('playing',function(){v.classList.add('is-ready');},{once:true});
      var p=v.play();if(p&&p.catch)p.catch(function(){});
    };
    if(document.readyState==='complete')setTimeout(laden,180);
    else window.addEventListener('load',function(){setTimeout(laden,180);});
  }

  var f=document.getElementById('kontaktForm');if(!f)return;
  var msg=f.querySelector('[data-msg]');
  var btn=f.querySelector('button[type=submit]');
  var endpoint=f.getAttribute('data-endpoint')||'kontakt-senden.php';
  var label=btn?(btn.getAttribute('data-label')||btn.textContent):'';
  var sending=btn?(btn.getAttribute('data-sending')||label):'';
  function zeige(t,farbe){msg.textContent=t;msg.style.color=farbe;}
  function mailtoErsatz(d){
    var body='Name: '+d.get('name')+'\nE-Mail: '+d.get('email')
      +(d.get('telefon')?'\nTelefon: '+d.get('telefon'):'')
      +'\n'+(d.get('anliegen')||'')+'\n\n'+d.get('nachricht')+'\n';
    var betreff=(msg.getAttribute('data-subject')||'Kontaktanfrage')+': '+(d.get('anliegen')||'')+' – '+d.get('name');
    window.location.href='mailto:kontakt@externe-personalabteilung.de'
      +'?subject='+encodeURIComponent(betreff)+'&body='+encodeURIComponent(body);
  }
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(!f.reportValidity())return;
    var d=new FormData(f);
    if(btn){btn.disabled=true;btn.textContent=sending;}
    zeige('','');
    fetch(endpoint,{method:'POST',body:d})
      .then(function(r){return r.json().catch(function(){throw new Error('kein JSON');}).then(function(j){
        if(!r.ok||!j.ok)throw new Error(j.fehler||'Fehler');return j;});})
      .then(function(){zeige(msg.getAttribute('data-ok')||'',' #2a9e50'.trim());f.reset();})
      .catch(function(){zeige(msg.getAttribute('data-fallback')||'','#a35a12');mailtoErsatz(d);})
      .then(function(){if(btn){btn.disabled=false;btn.textContent=label;}});
  });
})();
