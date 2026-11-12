/* Eight authored pixel-art frames: ignition, fireball, smoke and dissipation. */
(function(){
 const explosion=new Image();explosion.src='assets/boss-explosion-frames-v1.png';
 const frames=[[48,144],[194,356],[396,636],[654,958],[962,1334],[1342,1652],[1666,1922],[1944,2142]];
 function draw(ctx,elapsed){
  const centers=[[-38,-19],[31,-12],[-8,12],[49,16],[-50,16],[14,-20],[0,0]];
  for(let i=0;i<centers.length;i++){
   const t=(elapsed-i*.15)/.7;if(t<0||t>1)continue;const [x,y]=centers[i],index=Math.min(7,Math.floor(t*8)),[left,right]=frames[index],width=right-left,size=80+(i%3)*7;
   ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=t>.85?Math.max(0,(1-t)/.15):1;
   if(explosion.complete&&explosion.naturalWidth){const scale=size/372,dh=explosion.naturalHeight*scale,dw=width*scale;ctx.drawImage(explosion,left,0,width,explosion.naturalHeight,-dw/2,-dh/2,dw,dh);}
   else{ctx.fillStyle='#ffb84d';ctx.beginPath();ctx.arc(0,0,4+Math.sin(t*Math.PI)*12,0,Math.PI*2);ctx.fill();}
   ctx.restore();
  }
 }
 function drawMine(ctx,elapsed,duration){
  const t=Math.max(0,Math.min(1,elapsed/duration)),frame=t*7,index=Math.min(6,Math.floor(frame)),blend=frame-index;
  const scale=(.20+.12*(1-Math.exp(-t*10)))*(t>.72?1+(t-.72)*.12:1),alpha=t>.7?Math.max(0,(1-t)/.3):1;
  ctx.save();ctx.globalAlpha*=alpha;ctx.imageSmoothingEnabled=true;
  for(const [i,weight] of [[index,1-blend],[index+1,blend]]){if(weight<=0||!explosion.complete||!explosion.naturalWidth)continue;const [left,right]=frames[i],w=(right-left)*scale,h=explosion.naturalHeight*scale;ctx.save();ctx.globalAlpha*=weight;ctx.drawImage(explosion,left,0,right-left,explosion.naturalHeight,-w/2,-h/2,w,h);ctx.restore();}
  ctx.restore();
 }
 function drawFragments(ctx,image,elapsed){
  if(!image||!image.complete||!image.naturalWidth)return;const t=Math.max(0,elapsed-.18);if(t<=0)return;
  for(const side of [-1,1]){ctx.save();ctx.translate(side*(35+t*35),10+t*t*48);ctx.rotate(side*t*1.5);ctx.globalAlpha=Math.max(0,1-t*.65);const w=image.naturalWidth,h=image.naturalHeight,sx=side<0?.1:.68;ctx.drawImage(image,w*sx,h*.34,w*.22,h*.30,-18,-14,36,28);ctx.restore();}
 }
 window.BossExplosion={draw,drawMine,drawFragments,ready:()=>explosion.decode().catch(()=>{})};
})();
