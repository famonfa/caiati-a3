import { chromium, Browser, Page } from 'playwright';
import * as dotenv from 'dotenv';
import { Mailer } from './mailer';

dotenv.config();

interface Credentials {
  username: string;
  password: string;
}

class PrenotamiScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await chromium.launch({
      headless: true, 
    });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
  }

  async scrape(credentials: Credentials): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto('https://prenotami.esteri.it/');

      await this.page.fill('#login-email', credentials.username);;
      await this.page.fill('#login-password', credentials.password);
      await this.page.click('text=AVANTI'),

      await this.page.waitForURL('**/UserArea'),
      await this.page.click('text=Prenota'),

      await this.page.waitForSelector('a[href="/Services/Booking/224"]', { timeout: 5000 });
      await this.page.click('a[href="/Services/Booking/224"] button');
      await this.page.waitForURL('**/Services/Booking/224');
    } catch (error) {
      console.error('Scrape failed:', error);
      return false;
    }
    return true;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

async function main() {
  const credentials: Credentials = {
    username: process.env.PRENOTAMI_USERNAME || '',
    password: process.env.PRENOTAMI_PASSWORD || '',
  };

  if (!credentials.username || !credentials.password) {
    console.error('Please set PRENOTAMI_USERNAME and PRENOTAMI_PASSWORD environment variables');
    process.exit(1);
  }

  const scraper = new PrenotamiScraper();
  const mailer = new Mailer();

  
  try {
    await scraper.init();
    const loginSuccess = await scraper.scrape(credentials);

    if (loginSuccess)  await mailer.sendNotification(true);
    else await mailer.sendNotification(false);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}