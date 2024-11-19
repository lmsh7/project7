export class TemperatureLegend {
    constructor() {
      this.element = null;
    }
  
    create() {
      this.element = document.createElement('div');
      this.element.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 5px;
        color: white;
        font-family: Arial, sans-serif;
        z-index: 1000;
      `;
  
      const title = document.createElement('div');
      title.style.cssText = `
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
      `;
      title.textContent = 'Temperature';
  
      const gradient = document.createElement('div');
      gradient.style.cssText = `
        width: 200px;
        height: 20px;
        background: linear-gradient(to right, 
          hsl(240, 100%, 50%),
          hsl(180, 100%, 50%),
          hsl(60, 100%, 50%),
          hsl(0, 100%, 50%)
        );
        margin-bottom: 10px;
        border-radius: 3px;
      `;
  
      const labels = document.createElement('div');
      labels.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      `;
      labels.innerHTML = '<span>-30°C</span><span>0°C</span><span>+40°C</span>';
  
      const updateTime = document.createElement('div');
      updateTime.style.cssText = `
        font-size: 10px;
        text-align: center;
        margin-top: 5px;
        opacity: 0.8;
      `;
      updateTime.textContent = 'Updates every 10 minutes';
  
      this.element.appendChild(title);
      this.element.appendChild(gradient);
      this.element.appendChild(labels);
      this.element.appendChild(updateTime);
      document.body.appendChild(this.element);
    }
  
    remove() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }