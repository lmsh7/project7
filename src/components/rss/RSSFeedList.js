export class RSSFeedList {
  constructor(onRemove) {
    this.element = this.create();
    this.onRemove = onRemove;
    this.expandedFeeds = new Set(); // 跟踪哪些 feed 被展开
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

    const itemsContainer = document.createElement('div');
    const isExpanded = this.expandedFeeds.has(index);
    const itemsToShow = isExpanded ? feed.items : feed.items.slice(0, 5);

    itemsToShow.forEach(item => {
      itemsContainer.appendChild(this.createFeedItem(item));
    });

    // 只有当有超过5个项目时才显示"显示全部"按钮
    if (feed.items.length > 5) {
      const showAllButton = this.createShowAllButton(index, feed.items.length, itemsContainer, feed);
      feedElement.appendChild(showAllButton);
    }

    feedElement.appendChild(itemsContainer);
    this.element.appendChild(feedElement);
  }

  createShowAllButton(index, totalItems, itemsContainer, feed) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      text-align: center;
      margin: 10px 0;
    `;

    const button = document.createElement('button');
    const isExpanded = this.expandedFeeds.has(index);

    button.textContent = isExpanded ?
      `Show Less` :
      `Show All (${totalItems - 5} more items)`;

    button.style.cssText = `
      background: transparent;
      border: 1px solid #4CAF50;
      color: #4CAF50;
      padding: 5px 15px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
      margin: 5px 0;
    `;

    this.setupShowAllButtonEffects(button);

    button.addEventListener('click', () => {
      if (this.expandedFeeds.has(index)) {
        // 收起
        this.expandedFeeds.delete(index);
        itemsContainer.innerHTML = '';
        feed.items.slice(0, 5).forEach(item => {
          itemsContainer.appendChild(this.createFeedItem(item));
        });
        button.textContent = `Show All (${totalItems - 5} more items)`;
      } else {
        // 展开
        this.expandedFeeds.add(index);
        itemsContainer.innerHTML = '';
        feed.items.forEach(item => {
          itemsContainer.appendChild(this.createFeedItem(item));
        });
        button.textContent = 'Show Less';
      }
    });

    buttonContainer.appendChild(button);
    return buttonContainer;
  }

  setupShowAllButtonEffects(button) {
    button.addEventListener('mouseover', () => {
      button.style.background = 'rgba(76, 175, 80, 0.1)';
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseout', () => {
      button.style.background = 'transparent';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1.05)';
    });
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

    // 添加位置标签容器，并设置一个唯一的ID以便后续更新
    const locationTagsContainer = document.createElement('div');
    locationTagsContainer.className = 'location-tags-container';
    locationTagsContainer.style.cssText = 'margin-top: 4px;';

    const locationTags = this.createLocationTags(item.locations, item.locationLoading);
    locationTagsContainer.appendChild(locationTags);

    itemElement.appendChild(title);
    itemElement.appendChild(date);
    itemElement.appendChild(locationTagsContainer);

    this.setupItemHoverEffects(itemElement);

    // 保存引用以便后续更新
    itemElement.setAttribute('data-item-id', `${Date.now()}-${Math.random()}`);

    return itemElement;
  }

  createLocationTags(locations, isLoading = false) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-top: 4px;';

    if (isLoading) {
      // 创建加载动画
      const loadingTag = document.createElement('span');
      loadingTag.style.cssText = `
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        margin-right: 4px;
        margin-top: 4px;
        background: rgba(128, 128, 128, 0.2);
        color: #888;
        animation: pulse 1.5s infinite ease-in-out;
      `;
      loadingTag.textContent = 'Loading locations...';

      // 添加脉动动画样式
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);

      container.appendChild(loadingTag);
      return container;
    }

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
  
  updateItemLocations(feedIndex, itemIndex, locations) {
    const feedElements = this.element.children;
    if (feedElements[feedIndex]) {
      const itemElements = feedElements[feedIndex].querySelectorAll('a');
      if (itemElements[itemIndex]) {
        const locationContainer = itemElements[itemIndex].querySelector('.location-tags-container');
        if (locationContainer) {
          locationContainer.innerHTML = '';
          locationContainer.appendChild(this.createLocationTags(locations, false));
        }
      }
    }
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