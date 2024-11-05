export class LoadingUI {
  constructor() {
    this.indicator = null;
  }

  show() {
    if (!this.indicator) {
      this.indicator = document.createElement('div');
      this.indicator.id = 'map-loading-indicator';
      this.indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
      `;
      document.body.appendChild(this.indicator);
    }
    this.indicator.style.display = 'block';
  }

  updateProgress(loaded, total) {
    if (this.indicator) {
      const percentage = Math.floor((loaded / total) * 100);
      this.indicator.textContent = `Loading tiles: ${percentage}%`;
    }
  }

  hide() {
    if (this.indicator) {
      this.indicator.style.display = 'none';
    }
  }
}