export class RSSToggleButton {
  constructor(toggleCallback) {
    this.element = this.create(toggleCallback);
    document.body.appendChild(this.element);
  }

  create(toggleCallback) {
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

    button.addEventListener('click', toggleCallback);
    this.setupHoverEffects(button);
    
    return button;
  }

  setupHoverEffects(button) {
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    });
  }

  update(isOpen) {
    this.element.innerHTML = isOpen ? '✕' : '📰';
    this.element.style.right = isOpen ? '370px' : '20px';
  }
}