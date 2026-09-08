import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:30000,retries:0,reporter:[['list'],['json',{outputFile:'artifacts/e2e-results.json'}]],
 use:{baseURL:'http://127.0.0.1:5173',browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge',headless:true,viewport:{width:1440,height:1000},trace:'retain-on-failure'},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000},
});
