export class RSSContainer {
  constructor() {
    this.element = this.create();
  }

  create() {
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

  toggle(isOpen) {
    if (isOpen) {
      this.element.style.right = '0';
      this.element.style.opacity = '1';
      this.element.style.visibility = 'visible';
    } else {
      this.element.style.right = '-350px';
      this.element.style.opacity = '0';
      this.element.style.visibility = 'hidden';
    }
  }
}