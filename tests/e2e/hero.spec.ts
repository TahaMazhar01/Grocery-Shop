import {test,expect,type Page} from '@playwright/test';
// Trace snapshots can outlast the fading canvas trail; sample live pixels instead.
test.use({trace:'off'});
async function ready(page:Page,path='/'){await page.goto(path);await expect(page.locator('h1').first()).toBeVisible();await page.evaluate(()=>document.fonts.ready);}
async function screenshotAll(page:Page,name:string){await page.evaluate(async()=>{const imgs=Array.from(document.images);imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});await page.screenshot({path:`artifacts/${name}.png`,fullPage:true});}
test('desktop homepage loads, brush changes pixels, and the accessible toggle works',async({page})=>{
 test.setTimeout(60000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 const toggle=page.getByRole('button',{name:'A little grocery magic'});await expect(toggle).toBeEnabled();
 const canvas=page.locator('.hero-image-area canvas');
 await page.waitForLoadState('networkidle');
 await page.waitForTimeout(4400);
 const fingerprint=()=>canvas.evaluate((c:HTMLCanvasElement)=>{const tiny=document.createElement('canvas');tiny.width=32;tiny.height=32;const ctx=tiny.getContext('2d')!;ctx.drawImage(c,0,0,32,32);return Array.from(ctx.getImageData(0,0,32,32).data).reduce((sum,n,i)=>(sum+n*(i+1))%1000000007,0);});
 const before=await fingerprint();const box=(await canvas.boundingBox())!;
 await page.mouse.move(box.x+box.width*.35,box.y+box.height*.42);
 await page.mouse.move(box.x+box.width*.6,box.y+box.height*.43,{steps:12});
 await expect(page.locator('.paint-cursor')).toHaveCSS('opacity','1');
 await page.waitForTimeout(200);
 expect(await fingerprint()).not.toBe(before);
 await toggle.click();await expect(page.getByRole('button',{name:'Back to the basket'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Back to the basket'}).click();await screenshotAll(page,'home-desktop');expect(errors).toEqual([]);
});
