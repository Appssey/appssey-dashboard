// Usage: node puppeteerReferoToSupabase.cjs
// Requires: npm install puppeteer @supabase/supabase-js dotenv readline-sync fs path cloudinary

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline-sync');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const downloadPath = path.resolve(__dirname, '../downloads');
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath);
}

async function scrapeRefero() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    executablePath: process.platform === 'darwin' 
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined
  });
  
  // ... rest of your scraping code ...
}

async function extractReferoData(url) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    userDataDir: '/Users/sudeeps/Library/Application Support/BraveSoftware/Brave-Browser/Default',
    args: [
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();

  // Set a real user-agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

  await page.goto(url, { waitUntil: 'networkidle2' });
  // Add a shorter delay after page load to allow JS to render and for login
  await new Promise(res => setTimeout(res, 5000));
  try {
    await page.waitForSelector('h1.hxl4h', { timeout: 10000 });
  } catch (e) {
    console.warn('h1.hxl4h not found after 10s, continuing anyway...');
  }

  // Wait for the screenshot container to appear (not the images)
  await page.waitForSelector('.WKgwi .C6rGp .xXJr_ .nXGsG', { timeout: 30000 });

  // Scroll the container and page multiple times to trigger lazy loading
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const el = document.querySelector('.nXGsG');
      if (el) el.scrollIntoView();
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(res => setTimeout(res, 1000)); // 1s between scrolls
  }
  // Wait longer for images to load
  await new Promise(res => setTimeout(res, 15000)); // 15 seconds

  // Take a debug screenshot
  await page.screenshot({ path: 'debug.png', fullPage: true });

  // Extract data including all screenshot urls (don't throw if none)
  const data = await page.evaluate(() => {
    const name = document.querySelector('h1.hxl4h')?.textContent?.trim() || '';
    const description = document.querySelector('div.FEoMk')?.textContent?.trim() || '';
    const tagline = description;
    // Try multiple selectors for category
    let category = '';
    category = document.querySelector('li.hHh8R.iqHsa')?.textContent?.trim() ||
               document.querySelector('div.hHh8R.iqHsa')?.textContent?.trim() ||
               document.querySelector('.hHh8R.iqHsa')?.textContent?.trim() || '';
    const logo_url = document.querySelector('img.zrXK2')?.src || '';
    const screenshot_urls = Array.from(
      document.querySelectorAll('.WKgwi .C6rGp .xXJr_ .nXGsG img.fy_Gc')
    ).map(img => img.src).filter(Boolean);
    return { name, description, tagline, category, logo_url, screenshot_urls };
  });

  await browser.close();
  return data;
}

async function uploadToCloudinary(fileOrUrl, folder = 'refero') {
  try {
    if (!fileOrUrl) return '';
    if (fileOrUrl.startsWith('http')) {
      // Remote image
      const res = await cloudinary.uploader.upload(fileOrUrl, { folder });
      return res.secure_url;
    } else if (fs.existsSync(fileOrUrl)) {
      // Local file
      const res = await cloudinary.uploader.upload(fileOrUrl, { folder });
      return res.secure_url;
    }
    return '';
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return '';
  }
}

async function getCategoryIdOrCreate(categoryName) {
  if (!categoryName) return null;
  // Try to find the category first
  let { data, error } = await supabase.from('categories').select('id, name');
  if (error) {
    console.error('Error fetching categories:', error);
    return null;
  }
  let match = data.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  if (match) return match.id;
  // Not found, insert new category
  const { data: newCat, error: insertErr } = await supabase
    .from('categories')
    .insert([{ name: categoryName }])
    .select();
  if (insertErr) {
    console.error('Error inserting new category:', insertErr);
    return null;
  }
  return newCat && newCat[0] && newCat[0].id;
}

async function insertToSupabase(appData, logoUrl, screenshotUrls, categoryId) {
  // Insert app
  const { data, error } = await supabase
    .from('apps')
    .insert([{
      name: appData.name,
      description: appData.description,
      tagline: appData.tagline,
      logo_url: logoUrl,
      category_id: categoryId
    }])
    .select();

  if (error) {
    throw error;
  }

  // Insert all screenshots
  if (screenshotUrls && screenshotUrls.length && data[0]) {
    await supabase.from('screens').insert(
      screenshotUrls.map(url => ({ app_id: data[0].id, url }))
    );
  }

  // Fetch the app with its related screens
  const { data: appWithScreens, error: fetchError } = await supabase
    .from('apps')
    .select('*, screens(*)')
    .eq('id', data[0].id)
    .single();

  if (fetchError) {
    console.warn('Could not fetch app with screens:', fetchError);
    return data[0];
  }

  return appWithScreens;
}

(async () => {
  // Read URLs from urls.txt
  const urlsPath = path.resolve(__dirname, 'urls.txt');
  if (!fs.existsSync(urlsPath)) {
    console.error('Please create a urls.txt file with one refero.design URL per line.');
    process.exit(1);
  }
  const urls = fs.readFileSync(urlsPath, 'utf-8').split('\n').map(u => u.trim()).filter(Boolean);
  if (!urls.length) {
    console.error('No URLs found in urls.txt.');
    process.exit(1);
  }

  // Launch browser once
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    userDataDir: '/Users/sudeeps/Library/Application Support/BraveSoftware/Brave-Browser/Default',
    args: [
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

  for (const url of urls) {
    if (!url.startsWith('http')) {
      console.error('Skipping invalid URL:', url);
      continue;
    }
    try {
      console.log('Extracting data from:', url);
      // Use the shared browser/page for extraction
      const appData = await (async function extractReferoDataWithPage(url, page) {
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(res => setTimeout(res, 5000));
        try {
          await page.waitForSelector('h1.hxl4h', { timeout: 10000 });
        } catch (e) {
          console.warn('h1.hxl4h not found after 10s, continuing anyway...');
        }
        await page.waitForSelector('.WKgwi .C6rGp .xXJr_ .nXGsG', { timeout: 30000 });
        await page.evaluate(() => {
          const el = document.querySelector('.nXGsG');
          if (el) el.scrollIntoView();
        });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(res => setTimeout(res, 2000));
        await page.screenshot({ path: 'debug.png', fullPage: true });
        const data = await page.evaluate(() => {
          const name = document.querySelector('h1.hxl4h')?.textContent?.trim() || '';
          const description = document.querySelector('div.FEoMk')?.textContent?.trim() || '';
          const tagline = description;
          let category = '';
          category = document.querySelector('li.hHh8R.iqHsa')?.textContent?.trim() ||
                     document.querySelector('div.hHh8R.iqHsa')?.textContent?.trim() ||
                     document.querySelector('.hHh8R.iqHsa')?.textContent?.trim() || '';
          const logo_url = document.querySelector('img.zrXK2')?.src || '';
          const screenshot_urls = Array.from(
            document.querySelectorAll('.WKgwi .C6rGp .xXJr_ .nXGsG img.fy_Gc')
          ).map(img => img.src).filter(Boolean);
          return { name, description, tagline, category, logo_url, screenshot_urls };
        });
        return data;
      })(url, page);
      console.log('Extracted:', appData);

      // Upload logo to Cloudinary
      const logoUrl = await uploadToCloudinary(appData.logo_url, 'refero/logos');
      let screenshotUrls = [];
      if (appData.screenshot_urls && appData.screenshot_urls.length) {
        for (const ssUrl of appData.screenshot_urls) {
          const uploaded = await uploadToCloudinary(ssUrl, 'refero/screenshots');
          if (uploaded) screenshotUrls.push(uploaded);
        }
        if (screenshotUrls.length) {
          console.log('Uploaded screenshots:', screenshotUrls);
        } else {
          console.log('No screenshots found or uploaded for this app.');
        }
      } else {
        console.log('No screenshots present in extracted data, skipping screenshot upload.');
      }

      // Get or create category id
      const categoryId = await getCategoryIdOrCreate(appData.category);
      if (!categoryId && appData.category) {
        console.warn('Category could not be created or found:', appData.category);
      }

      // Auto-insert into Supabase (no prompt)
      const inserted = await insertToSupabase(appData, logoUrl, screenshotUrls, categoryId);
      console.log('Inserted app:', inserted);
    } catch (err) {
      console.error('Error processing URL:', url, err);
    }
  }
  await browser.close();
  console.log('Batch processing complete.');
})(); 