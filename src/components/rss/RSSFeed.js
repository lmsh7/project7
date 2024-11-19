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

  // 在 RSSFeed.js 中修改 addFeed 方法
  async addFeed(url) {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.status === 'ok') {
        // 先创建没有位置信息的feed
        const feed = {
          title: data.feed.title,
          url: url,
          items: data.items.map(item => ({
            ...item,
            locations: [], // 初始为空数组
            locationLoading: true // 添加加载状态标记
          })),
          lastUpdate: new Date().toISOString()
        };

        // 先添加feed并更新UI
        this.feedList.push(feed);
        this.feedListUI.updateFeeds(this.feedList);

        // 然后异步加载位置信息
        const feedIndex = this.feedList.length - 1;
        this.loadLocationsForFeed(feedIndex);
      } else {
        this.error.show('Invalid RSS feed URL');
      }
    } catch (error) {
      this.error.show('Error loading RSS feed');
      console.error('Feed loading error:', error);
    }
  }
  async loadLocationsForFeed(feedIndex) {
    const feed = this.feedList[feedIndex];

    // 并行处理所有items的位置提取
    const locationPromises = feed.items.map(async (item, itemIndex) => {
      try {
        const locations = await this.locationExtractor.extractLocations(item.title + ' ' + item.description);
        // 更新单个item的位置信息
        this.feedList[feedIndex].items[itemIndex].locations = locations;
        this.feedList[feedIndex].items[itemIndex].locationLoading = false;

        // 触发单个item的UI更新
        this.feedListUI.updateItemLocations(feedIndex, itemIndex, locations);
      } catch (error) {
        console.error('Error loading locations for item:', error);
        this.feedList[feedIndex].items[itemIndex].locations = ['Unknown Location'];
        this.feedList[feedIndex].items[itemIndex].locationLoading = false;
        this.feedListUI.updateItemLocations(feedIndex, itemIndex, ['Unknown Location']);
      }
    });

    // 等待所有位置信息加载完成
    await Promise.all(locationPromises);
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