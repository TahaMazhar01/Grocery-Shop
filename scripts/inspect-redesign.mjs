import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function load(){await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})));});await page.waitForTimeout(4500);}
await load();
const scene=page.locator('.daily-hero-photo');const first=await scene.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(650);const second=await scene.evaluate(e=>getComputedStyle(e).transform);
await page.screenshot({path:'artifacts/redesign-hero-desktop.png'});
await page.getByRole('button',{name:'Pause animation'}).click();const pausedBefore=await scene.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(500);const pausedAfter=await scene.evaluate(e=>getComputedStyle(e).transform);
await page.getByRole('button',{name:'Play animation'}).click();
await page.locator('.featured-section').scrollIntoViewIfNeeded();await page.waitForTimeout(1100);const card=page.locator('.product-card').first();await page.mouse.move(0,0);await page.waitForTimeout(650);const cardBefore=await card.evaluate(e=>getComputedStyle(e).transform);await card.hover();await page.waitForTimeout(600);const cardAfter=await card.evaluate(e=>getComputedStyle(e).transform);await page.screenshot({path:'artifacts/redesign-products-desktop.png'});
await page.locator('.footer').scrollIntoViewIfNeeded();await page.waitForTimeout(800);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1000);await page.screenshot({path:'artifacts/redesign-home-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await load();await page.screenshot({path:'artifacts/redesign-hero-mobile.png'});await page.screenshot({path:'artifacts/redesign-home-mobile.png',fullPage:true});
const report={errors,motionChanges:first!==second,pauseWorks:pausedBefore===pausedAfter,hoverChanges:cardBefore!==cardAfter,mobileOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),brokenImages:await page.evaluate(()=>Array.from(document.images).filter(i=>!i.naturalWidth).map(i=>i.src))};
await writeFile('artifacts/redesign-inspection.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
