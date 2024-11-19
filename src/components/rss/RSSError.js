export class RSSError {
  constructor(container) {
    this.container = container;
  }

  show(message) {
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