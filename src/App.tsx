import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { useStore } from './context';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Product } from './pages/Product';
import { About, CartPage, Contact, Delivery, FAQPage, NotFound, Privacy } from './pages/Info';
const positions = new Map<string, number>();
function RouteEffects(){const location=useLocation();const type=useNavigationType();const {config}=useStore();useEffect(()=>{if(!location.pathname.startsWith('/product/')){const name=location.pathname==='/'?config.tagline:location.pathname.split('/').filter(Boolean)[0].replace(/^./,c=>c.toUpperCase());document.title=`${name} | ${config.brand}`;}const key=location.key;const timer=setTimeout(()=>{if(location.hash){document.querySelector(location.hash)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}else window.scrollTo({top:type==='POP'?positions.get(key)??0:0,behavior:'instant'});},60);return()=>{positions.set(key,window.scrollY);clearTimeout(timer);};},[location.key,location.pathname,location.hash,type,config.brand,config.tagline]);return null;}
export default function App(){return <><RouteEffects/><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="shop" element={<Shop/>}/><Route path="category/:category" element={<Shop/>}/><Route path="category/:category/:subcategory" element={<Shop/>}/><Route path="product/:slug" element={<Product/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="delivery" element={<Delivery/>}/><Route path="faq" element={<FAQPage/>}/><Route path="privacy" element={<Privacy/>}/><Route path="cart" element={<CartPage/>}/><Route path="*" element={<NotFound/>}/></Route></Routes></>;}
