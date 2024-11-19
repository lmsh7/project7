export class RSSFeed {
  constructor() {
    this.isOpen = false;
    this.container = this.createContainer();
    this.toggleButton = this.createToggleButton();
    this.feedList = [];
    this.createUI();
  }

  createContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      right: -350px;
      top: 0;
      width: 350px;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px;
      overflow-y: auto;
      z-index: 1000;
      font-family: Arial, sans-serif;
      transition: all 0.3s ease-in-out;
      backdrop-filter: blur(10px);
      opacity: 0;
      visibility: hidden;
      box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
    `;
    return container;
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.innerHTML = '📰';
    button.style.cssText = `
      position: fixed;
      right: 20px;
      top: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: none;
      cursor: pointer;
      z-index: 1001;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease-in-out;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;

    button.addEventListener('click', () => this.toggleDrawer());
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    });

    document.body.appendChild(button);
    return button;
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.container.style.right = '0';
      this.container.style.opacity = '1';
      this.container.style.visibility = 'visible';
      this.toggleButton.style.right = '370px';
      this.toggleButton.innerHTML = '✕';
    } else {
      this.container.style.right = '-350px';
      this.container.style.opacity = '0';
      this.container.style.visibility = 'hidden';
      this.toggleButton.style.right = '20px';
      this.toggleButton.innerHTML = '📰';
    }
  }

  createUI() {
    const title = document.createElement('h2');
    title.textContent = 'RSS Feeds';
    title.style.cssText = 'margin: 0 0 20px 0; color: #fff; font-size: 24px;';

    const form = this.createSubscriptionForm();
    const feedContainer = this.createFeedContainer();

    this.container.appendChild(title);
    this.container.appendChild(form);
    this.container.appendChild(feedContainer);
    document.body.appendChild(this.container);
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
    input.addEventListener('focus', () => {
      input.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    input.addEventListener('blur', () => {
      input.style.background = 'rgba(255, 255, 255, 0.1)';
    });

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
    button.addEventListener('mouseover', () => {
      button.style.background = '#45a049';
      button.style.transform = 'scale(1.02)';
    });
    button.addEventListener('mouseout', () => {
      button.style.background = '#4CAF50';
      button.style.transform = 'scale(1)';
    });

    form.appendChild(input);
    form.appendChild(button);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = input.value;
      await this.addFeed(url);
      input.value = '';
    });

    return form;
  }

  createFeedContainer() {
    const container = document.createElement('div');
    container.id = 'feed-container';
    container.style.cssText = `
      transition: opacity 0.3s ease;
    `;
    return container;
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

  async addFeed(url) {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        this.feedList.push({
          title: data.feed.title,
          items: data.items,
          lastUpdate: new Date().toISOString()
        });
        this.updateFeedDisplay();
      } else {
        this.showError('Invalid RSS feed URL');
      }
    } catch (error) {
      this.showError('Error loading RSS feed');
    }
  }

  updateFeedDisplay() {
    const container = document.getElementById('feed-container');
    container.style.opacity = '0';
    
    setTimeout(() => {
      container.innerHTML = '';

      this.feedList.forEach((feed, feedIndex) => {
        const feedElement = document.createElement('div');
        feedElement.style.cssText = `
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 15px;
          transition: all 0.3s ease;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        `;

        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'flex: 1;';

        const feedTitle = document.createElement('h3');
        feedTitle.textContent = feed.title;
        feedTitle.style.cssText = `
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

        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.style.cssText = `
          background: none;
          border: none;
          color: #ff4444;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
          transition: all 0.2s ease;
          margin-left: 10px;
        `;
        removeButton.addEventListener('mouseover', () => {
          removeButton.style.transform = 'scale(1.2)';
        });
        removeButton.addEventListener('mouseout', () => {
          removeButton.style.transform = 'scale(1)';
        });
        removeButton.onclick = () => {
          feedElement.style.transform = 'scale(0.9)';
          feedElement.style.opacity = '0';
          setTimeout(() => {
            this.feedList.splice(feedIndex, 1);
            this.updateFeedDisplay();
          }, 300);
        };

        titleContainer.appendChild(feedTitle);
        titleContainer.appendChild(updateTime);
        header.appendChild(titleContainer);
        header.appendChild(removeButton);
        feedElement.appendChild(header);

        feed.items.slice(0, 5).forEach(item => {
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

          const itemTitle = document.createElement('div');
          itemTitle.textContent = item.title;
          itemTitle.style.cssText = 'margin-bottom: 4px;';

          const itemDate = document.createElement('div');
          itemDate.textContent = this.formatDate(item.pubDate);
          itemDate.style.cssText = 'font-size: 12px; color: rgba(255, 255, 255, 0.5);';

          itemElement.appendChild(itemTitle);
          itemElement.appendChild(itemDate);

          itemElement.addEventListener('mouseover', () => {
            itemElement.style.background = 'rgba(255, 255, 255, 0.1)';
            itemElement.style.transform = 'translateX(5px)';
          });
          itemElement.addEventListener('mouseout', () => {
            itemElement.style.background = 'rgba(255, 255, 255, 0.03)';
            itemElement.style.transform = 'translateX(0)';
          });
          
          feedElement.appendChild(itemElement);
        });

        container.appendChild(feedElement);
      });

      container.style.opacity = '1';
    }, 300);
  }

  showError(message) {
    const error = document.createElement('div');
    error.textContent = message;
    error.style.cssText = `
      background: #ff4444;
      color: white;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      font-size: 14px;
    `;
    this.container.insertBefore(error, this.container.firstChild);
    
    setTimeout(() => {
      error.style.transform = 'translateX(0)';
      error.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      error.style.transform = 'translateX(100%)';
      error.style.opacity = '0';
      setTimeout(() => error.remove(), 300);
    }, 3000);
  }
}