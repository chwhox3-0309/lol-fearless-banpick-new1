/* Google H5 Games Ad Placement bridge. No reward is granted without adViewed. */
(function(){
 const config=window.WEB_ADS_CONFIG||{},id=String(config.publisherId||'').trim();
 let status='unconfigured',active=null;
 const valid=/^ca-pub-\d{16}$/.test(id);
 if(valid&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  status='loading';window.adsbygoogle=window.adsbygoogle||[];window.adBreak=window.adBreak||function(options){window.adsbygoogle.push(options);};window.adConfig=window.adConfig||function(options){window.adsbygoogle.push(options);};
  const script=document.createElement('script');script.async=true;script.crossOrigin='anonymous';script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(id);if(config.testMode===true)script.setAttribute('data-adbreak-test','on');
  script.onerror=()=>{status='unavailable';};script.onload=()=>{try{window.adConfig({preloadAdBreaks:'on',sound:'off',onReady:()=>{status='ready';}});}catch{status='unavailable';}};document.head.appendChild(script);
 }
 window.WebRewardedAds={
  getStatus:()=>status,
  prepare(onReady,onDone,placementName='continue-once'){
   if(status!=='ready'||active){onDone(status==='unconfigured'?'unconfigured':'unavailable');return ()=>{};}
   const token={cancelled:false,viewed:false,shown:false};active=token;
   const finish=result=>{if(active===token)active=null;if(!token.cancelled)onDone(result);};
   try{window.adBreak({type:'reward',name:placementName,beforeReward:show=>{if(token.cancelled){if(active===token)active=null;return;}onReady(()=>{if(token.cancelled||token.shown)return;token.shown=true;show();});},adViewed:()=>{if(!token.cancelled)token.viewed=true;},adDismissed:()=>{},adBreakDone:info=>finish(token.viewed?'viewed':(info?.breakStatus==='viewed'?'unavailable':info?.breakStatus||'unavailable'))});}catch{finish('error');}
   return ()=>{token.cancelled=true;if(active===token)active=null;};
  }
 };
})();
