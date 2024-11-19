import { RSSContainer } from './RSSContainer';
import { RSSToggleButton } from './RSSToggleButton';
import { RSSFeedList } from './RSSFeedList';
import { RSSError } from './RSSError';
import { LocationExtractor } from './LocationExtractor';

export class RSSFeed {
  constructor() {
    this.isOpen = false;
    this.locationExtractor = new LocationExtractor();
    this.container = new RSSContainer();
    this.toggleButton = new RSSToggleButton(this.toggleDrawer.bind(this));
    this.feedList = [];
    this.error = new RSSError(this.container.element);
    this.feedListUI = new RSSFeedList(this.removeFeed.bind(this));
    this.createUI();
  }

  createUI() {
    const title = document.createElement('h2');
    title.textContent = 'RSS Feeds';
    title.style.cssText = 'margin: 0 0 20px 0; color: #fff; font-size: 24px;';

    const form = this.createSubscriptionForm();
    
    this.container.element.appendChild(title);
    this.container.element.appendChild(form);
    this.container.element.appendChild(this.feedListUI.element);
    document.body.appendChild(this.container.element);
  }

  createSubscriptionForm() {
    const form = document.createElement('form');
    form.style.cssText = 'margin-bottom: 20px;';

    const input = document.createElement('input');
    input.type = 'url';
    input.placeholder = 'Enter RSS feed URL';
    input.required = true;
    input.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      border: none;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      outline: none;
      transition: all 0.3s ease;
      font-size: 14px;
    `;

    const button = document.createElement('button');
    button.textContent = 'Subscribe';
    button.style.cssText = `
      width: 100%;
      padding: 12px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 600;
    `;

    form.appendChild(input);
    form.appendChild(button);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.addFeed(input.value);
      input.value = '';
    });

    return form;
  }

  async addFeed(url) {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const feed = {
          title: data.feed.title,
          url: url,
          items: data.items.map(item => ({
            ...item,
            locations: this.locationExtractor.extractLocations(item.title + ' ' + item.description)
          })),
          lastUpdate: new Date().toISOString()
        };
        
        this.feedList.push(feed);
        this.feedListUI.updateFeeds(this.feedList);
      } else {
        this.error.show('Invalid RSS feed URL');
      }
    } catch (error) {
      this.error.show('Error loading RSS feed');
      console.error('Feed loading error:', error);
    }
  }

  removeFeed(index) {
    this.feedList.splice(index, 1);
    this.feedListUI.updateFeeds(this.feedList);
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;
    this.container.toggle(this.isOpen);
    this.toggleButton.update(this.isOpen);
  }
}