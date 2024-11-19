export class RSSFeedList {
  constructor(onRemove) {
    this.element = this.create();
    this.onRemove = onRemove;
  }

  create() {
    const container = document.createElement('div');
    container.id = 'feed-container';
    container.style.cssText = 'transition: opacity 0.3s ease;';
    return container;
  }

  updateFeeds(feeds) {
    this.element.style.opacity = '0';
    
    setTimeout(() => {
      this.element.innerHTML = '';
      feeds.forEach((feed, index) => this.createFeedElement(feed, index));
      this.element.style.opacity = '1';
    }, 300);
  }

  createFeedElement(feed, index) {
    const feedElement = document.createElement('div');
    feedElement.style.cssText = `
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 15px;
      transition: all 0.3s ease;
    `;

    feedElement.appendChild(this.createFeedHeader(feed, index));
    feed.items.slice(0, 5).forEach(item => {
      feedElement.appendChild(this.createFeedItem(item));
    });

    this.element.appendChild(feedElement);
  }

  createFeedHeader(feed, index) {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    `;

    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = 'flex: 1;';

    const title = document.createElement('h3');
    title.textContent = feed.title;
    title.style.cssText = `
      color: #4CAF50;
      margin: 0 0 5px 0;
      font-size: 16px;
    `;

    const updateTime = document.createElement('div');
    updateTime.textContent = `Updated ${this.formatDate(feed.lastUpdate)}`;
    updateTime.style.cssText = `
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    `;

    titleContainer.appendChild(title);
    titleContainer.appendChild(updateTime);
    header.appendChild(titleContainer);
    header.appendChild(this.createRemoveButton(index));

    return header;
  }

  createRemoveButton(index) {
    const button = document.createElement('button');
    button.textContent = '×';
    button.style.cssText = `
      background: none;
      border: none;
      color: #ff4444;
      font-size: 24px;
      cursor: pointer;
      padding: 0 5px;
      transition: all 0.2s ease;
      margin-left: 10px;
    `;

    this.setupRemoveButtonEffects(button, index);
    return button;
  }

  setupRemoveButtonEffects(button, index) {
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.2)';
      button.style.color = '#ff6666';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
      button.style.color = '#ff4444';
    });

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.onRemove) {
        this.onRemove(index);
      }
    });
  }

  createFeedItem(item) {
    const itemElement = document.createElement('a');
    itemElement.href = item.link;
    itemElement.target = '_blank';
    itemElement.style.cssText = `
      display: block;
      color: #fff;
      text-decoration: none;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 5px;
      background: rgba(255, 255, 255, 0.03);
      transition: all 0.2s ease;
      font-size: 14px;
    `;

    const title = document.createElement('div');
    title.textContent = item.title;
    title.style.cssText = 'margin-bottom: 4px;';

    const date = document.createElement('div');
    date.textContent = this.formatDate(item.pubDate);
    date.style.cssText = 'font-size: 12px; color: rgba(255, 255, 255, 0.5);';

    const locationTags = this.createLocationTags(item.locations);

    itemElement.appendChild(title);
    itemElement.appendChild(date);
    itemElement.appendChild(locationTags);

    this.setupItemHoverEffects(itemElement);

    return itemElement;
  }

  createLocationTags(locations) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-top: 4px;';
    
    if (!locations || locations.length === 0) {
      const tag = this.createTag('Unknown Location', true);
      container.appendChild(tag);
      return container;
    }
    
    locations.forEach(location => {
      const tag = this.createTag(location, location === 'Unknown Location');
      container.appendChild(tag);
    });

    return container;
  }

  createTag(text, isUnknown) {
    const tag = document.createElement('span');
    tag.textContent = text;
    tag.style.cssText = `
      display: inline-block;
      background: ${isUnknown ? 'rgba(128, 128, 128, 0.2)' : 'rgba(76, 175, 80, 0.2)'};
      color: ${isUnknown ? '#888' : '#4CAF50'};
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      margin-right: 4px;
      margin-top: 4px;
      transition: all 0.2s ease;
    `;

    tag.addEventListener('mouseover', () => {
      tag.style.transform = 'scale(1.05)';
      tag.style.background = isUnknown ? 'rgba(128, 128, 128, 0.3)' : 'rgba(76, 175, 80, 0.3)';
    });

    tag.addEventListener('mouseout', () => {
      tag.style.transform = 'scale(1)';
      tag.style.background = isUnknown ? 'rgba(128, 128, 128, 0.2)' : 'rgba(76, 175, 80, 0.2)';
    });

    return tag;
  }

  setupItemHoverEffects(element) {
    element.addEventListener('mouseover', () => {
      element.style.background = 'rgba(255, 255, 255, 0.1)';
      element.style.transform = 'translateX(5px)';
    });
    
    element.addEventListener('mouseout', () => {
      element.style.background = 'rgba(255, 255, 255, 0.03)';
      element.style.transform = 'translateX(0)';
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}