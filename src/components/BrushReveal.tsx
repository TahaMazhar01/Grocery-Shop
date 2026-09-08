import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function BrushReveal({ first, second, hold, showSecond, motion, onReady }: {first:string;second:string;hold:number;showSecond:boolean;motion:boolean;onReady:(ready:boolean)=>void}) {
 const area=useRef<HTMLDivElement>(null), canvasRef=useRef<HTMLCanvasElement>(null), cursor=useRef<HTMLDivElement>(null);
 const [loaded,setLoaded]=useState(false);const [failed,setFailed]=useState(false);const readyRef=useRef(onReady);readyRef.current=onReady;
 useEffect(()=>{setFailed(false);},[first,second]);
 useEffect(()=>{
  const node=area.current,canvas=canvasRef.current;if(!node||!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  const base=new Image(),reveal=new Image();base.src=first;reveal.src=second;
  const mask=document.createElement('canvas'),layer=document.createElement('canvas'),brush=document.createElement('canvas');const mc=mask.getContext('2d')!,lc=layer.getContext('2d')!;brush.width=240;brush.height=240;const bc=brush.getContext('2d')!;
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9,x=120+Math.cos(a)*18,y=120+Math.sin(a)*16,r=88+(i%3)*8;const gradient=bc.createRadialGradient(x,y,r*.3,x,y,r);gradient.addColorStop(0,'rgba(0,0,0,.82)');gradient.addColorStop(.6,'rgba(0,0,0,.65)');gradient.addColorStop(1,'transparent');bc.fillStyle=gradient;bc.fillRect(0,0,240,240);}
  let frame=0,visible=true,disposed=false,ready=false,w=0,h=0;let last:{x:number;y:number}|null=null;let autoStart=0;let autoDone=false;
  const points:{x:number;y:number;t:number}[]=[];const reduce=matchMedia('(prefers-reduced-motion: reduce)');const fine=matchMedia('(pointer:fine)');
  function contain(target:CanvasRenderingContext2D,img:HTMLImageElement){const scale=Math.min(w/img.width,h/img.height);const iw=img.width*scale,ih=img.height*scale;target.drawImage(img,(w-iw)/2,(h-ih)/2,iw,ih);}
  function draw(now:number,force=false){frame=0;if(!ready||disposed||(!visible&&!force))return;ctx!.clearRect(0,0,w,h);ctx!.globalCompositeOperation='source-over';contain(ctx!,base);mc.clearRect(0,0,w,h);
   if(autoStart&&!autoDone&&motion&&!reduce.matches){const elapsed=now-autoStart;if(elapsed>1300&&elapsed<2300){const t=(elapsed-1300)/1000;points.push({x:w*(.26+t*.46),y:h*(.53+Math.sin(t*5)*.07),t:now});}if(elapsed>=2300)autoDone=true;}
   while(points.length&&now-points[0].t>hold+800)points.shift();if(points.length>65)points.splice(0,points.length-65);
   const radius=Math.max(65,w*.13);for(const p of points){mc.globalAlpha=Math.min(1,Math.max(0,1-(now-p.t-hold)/800));mc.drawImage(brush,p.x-radius,p.y-radius,radius*2,radius*2);}mc.globalAlpha=1;
   ctx!.globalCompositeOperation='destination-out';ctx!.drawImage(mask,0,0);ctx!.globalCompositeOperation='source-over';lc.clearRect(0,0,w,h);lc.globalCompositeOperation='source-over';contain(lc,reveal);lc.globalCompositeOperation='destination-in';lc.drawImage(mask,0,0);ctx!.drawImage(layer,0,0);
   if(visible&&motion&&!reduce.matches&&(points.length||(!autoDone&&autoStart)))frame=requestAnimationFrame(draw);
  }
  function resize(){const rect=node!.getBoundingClientRect();const dpr=Math.min(devicePixelRatio,1.3);w=Math.max(1,Math.round(rect.width*dpr));h=Math.max(1,Math.round(rect.height*dpr));for(const c of[canvas!,mask,layer]){c.width=w;c.height=h;}points.length=0;if(ready)draw(performance.now(),true);}
  function move(e:PointerEvent){if(!ready||!motion||reduce.matches||!fine.matches||showSecond)return;autoDone=true;const rect=node!.getBoundingClientRect();const x=(e.clientX-rect.left)*w/rect.width,y=(e.clientY-rect.top)*h/rect.height,t=performance.now();if(last){const steps=Math.min(8,Math.max(1,Math.ceil(Math.hypot(x-last.x,y-last.y)/22)));for(let i=1;i<=steps;i++)points.push({x:last.x+(x-last.x)*i/steps,y:last.y+(y-last.y)*i/steps,t});}else points.push({x,y,t});last={x,y};if(cursor.current){cursor.current.style.transform=`translate(${e.clientX-rect.left}px,${e.clientY-rect.top}px)`;cursor.current.style.opacity='1';}if(!frame)frame=requestAnimationFrame(draw);}
  function leave(){last=null;if(cursor.current)cursor.current.style.opacity='0';}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(node);const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&!document.hidden;if(!visible){cancelAnimationFrame(frame);frame=0;}else if(ready&&!frame)frame=requestAnimationFrame(draw);});observer.observe(node);
  const visibility=()=>{visible=!document.hidden&&node!.getBoundingClientRect().bottom>0&&node!.getBoundingClientRect().top<innerHeight;if(visible&&ready&&!frame)frame=requestAnimationFrame(draw);else if(!visible){cancelAnimationFrame(frame);frame=0;}};document.addEventListener('visibilitychange',visibility);
  Promise.all([base.decode(),reveal.decode()]).then(()=>{if(disposed)return;ready=true;setLoaded(true);readyRef.current(true);autoStart=performance.now();resize();}).catch(()=>{if(!disposed){setLoaded(false);readyRef.current(false);}});
  node.addEventListener('pointermove',move);node.addEventListener('pointerleave',leave);
  return()=>{disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);node.removeEventListener('pointermove',move);node.removeEventListener('pointerleave',leave);};
 },[first,second,hold,motion,showSecond]);
 return <div className="hero-image-area hero-cutout-area" ref={area}>
  <img className="hero-photo hero-cutout-photo" data-second={showSecond} style={{opacity:loaded&&!showSecond?0:1}} src={failed?'/images/hero-market.webp':showSecond?second:first} alt={showSecond?'A colourful platter of vegetables, salad, and toasted bread':'A grocery tote overflowing with fresh vegetables, fruit, and bread'} width="1024" height="1024" fetchPriority="high" onError={()=>setFailed(true)}/>
  <canvas ref={canvasRef} aria-hidden="true" style={{opacity:loaded&&!showSecond?1:0}}/>
  <div className="paint-cursor" ref={cursor} aria-hidden="true"><Sparkles size={21}/><span>make something good</span></div>
 </div>;
}
