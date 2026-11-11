(()=>{
 const el=id=>document.getElementById(id);
 let registration,installPrompt,activating=false;
 const status=text=>el('updateStatus').textContent=text;
 function home(){document.getElementById('settingsDialog')?.close();el('omAppTab').click();el('allTab').click();window.scrollCatalogView?.(false,el('allTab'))}
 function offer(){if(registration?.waiting){home();el('updateNotice').hidden=false;status('Eine neue Version ist bereit.')}}
 function track(worker){if(!worker)return;worker.addEventListener('statechange',()=>{
  if(worker.state==='installed'){if(registration.waiting)offer();else status('Offline-Kopie wird aktiviert …');}
  if(worker.state==='redundant')status('Update konnte nicht vollständig geladen werden. Bitte erneut prüfen.');
 });}
 async function offlineReady(){if(!registration)return;const ready=await caches.has('om-pwa:'+registration.scope+':15.22');el('offlineStatus').classList.toggle('is-ready',ready);el('offlineStatus').textContent=ready?'Offline-Kopie auf diesem Gerät bereit':'Offline-Kopie wird eingerichtet …';}
 async function check(manual=false){
  if(!navigator.onLine){status('Du bist offline. Updates können mit Internet geprüft werden.');return;}
  if(!registration){status('Update-Dienst wird noch eingerichtet. Bitte gleich erneut versuchen.');return;}
  if(manual)status('Suche nach Updates …');
  try{await registration.update();if(registration.waiting)offer();else if(registration.installing)status('Neue Version wird heruntergeladen …');else if(manual)status('Die neueste Version ist bereits installiert (15.22).');}
  catch{status('Update-Prüfung fehlgeschlagen. Bitte später erneut versuchen.');}
 }
 el('checkUpdate').onclick=()=>check(true);
 el('laterUpdate').onclick=()=>el('updateNotice').hidden=true;
 el('applyUpdate').onclick=()=>{if(!registration?.waiting)return;activating=true;el('applyUpdate').disabled=true;status('Update wird übernommen …');registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
 window.addEventListener('appinstalled',()=>{installPrompt=null;el('installApp').textContent='App installiert';});
 el('installApp').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else el('installHelp').hidden=false;};
 if(!('serviceWorker' in navigator)||!window.isSecureContext||location.protocol==='file:'||location.protocol==='content:'){
  el('offlineStatus').textContent='Installation und Updates erst über die HTTPS-App-Adresse verfügbar';status('Bitte die veröffentlichte App-Adresse öffnen.');return;
 }
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(activating)location.reload();else offlineReady().catch(()=>{});});
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
  registration=reg;offer();track(reg.installing);reg.addEventListener('updatefound',()=>track(reg.installing));
  navigator.serviceWorker.ready.then(()=>offlineReady()).catch(()=>{});check();
 }).catch(()=>{el('offlineStatus').textContent='Offline-Kopie nicht verfügbar';status('Installation des Offline-Modus fehlgeschlagen. Bitte mit Internet erneut öffnen.');});
 window.addEventListener('online',()=>check());
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();});
})();
