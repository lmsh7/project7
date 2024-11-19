import * as THREE from 'three';
import axios from 'axios';

export class TemperatureOverlay {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.texture = null;
    this.data = null;
    this.initialized = false;
    this.width = 360;
    this.height = 180;
    this.apiKey = 'e1580aefafc9cf94ebdde57aa3d8cfcd'; // Replace with your API key
    this.gridSize = 10; // Degrees between each API call
  }

  async initialize() {
    await this.fetchTemperatureData();
    this.createOverlayTexture();
    this.startPeriodicUpdate();
    return this.texture;
  }

  async fetchTemperatureData() {
    this.data = new Float32Array(this.width * this.height);
    const requests = [];

    // Create a grid of API requests
    for (let lat = -90; lat <= 90; lat += this.gridSize) {
      for (let lon = -180; lon <= 180; lon += this.gridSize) {
        requests.push(this.fetchTemperatureForLocation(lat, lon));
      }
    }

    try {
      const responses = await Promise.all(requests);
      this.processTemperatureResponses(responses);
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      // Fallback to simulated data if API fails
      await this.generateSimulatedData();
    }
  }

  async fetchTemperatureForLocation(lat, lon) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
      );
      return {
        lat,
        lon,
        temp: response.data.main.temp,
        success: true
      };
    } catch (error) {
      console.error(`Error fetching data for lat=${lat}, lon=${lon}:`, error);
      return {
        lat,
        lon,
        temp: null,
        success: false
      };
    }
  }

  processTemperatureResponses(responses) {
    // Initialize the temperature grid
    const tempGrid = Array(this.height).fill().map(() => Array(this.width).fill(null));

    // Process successful API responses
    responses.forEach(response => {
      if (response.success) {
        const x = Math.floor((response.lon + 180) * (this.width / 360));
        const y = Math.floor((90 - response.lat) * (this.height / 180));
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          tempGrid[y][x] = response.temp;
        }
      }
    });

    // Interpolate missing values
    this.interpolateTemperatures(tempGrid);

    // Convert grid to flat array
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.data[y * this.width + x] = tempGrid[y][x];
      }
    }
  }

  interpolateTemperatures(tempGrid) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tempGrid[y][x] === null) {
          tempGrid[y][x] = this.interpolatePoint(tempGrid, x, y);
        }
      }
    }
  }

  interpolatePoint(grid, x, y) {
    const radius = 2;
    let sum = 0;
    let count = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const ny = y + dy;
        const nx = x + dx;

        if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
          const value = grid[ny][nx];
          if (value !== null) {
            sum += value;
            count++;
          }
        }
      }
    }

    return count > 0 ? sum / count : this.getEstimatedTemperature(y);
  }

  getEstimatedTemperature(y) {
    // Fallback temperature estimation based on latitude
    const lat = 90 - (y * 180) / this.height;
    return 30 * Math.cos((lat * Math.PI) / 180);
  }

  async generateSimulatedData() {
    for (let y = 0; y < this.height; y++) {
      const lat = 90 - (y * 180) / this.height;
      for (let x = 0; x < this.width; x++) {
        const baseTemp = 30 * Math.cos((lat * Math.PI) / 180);
        const variation = Math.random() * 5 - 2.5;
        this.data[y * this.width + x] = baseTemp + variation;
      }
    }
  }

  startPeriodicUpdate() {
    // Update temperature data every 10 minutes
    setInterval(async () => {
      await this.fetchTemperatureData();
      this.createOverlayTexture();
    }, 10 * 60 * 1000);
  }

  createOverlayTexture() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    for (let i = 0; i < this.data.length; i++) {
      const temp = this.data[i];
      const color = this.getColorForTemperature(temp);
      const idx = i * 4;
      data[idx] = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
      data[idx + 3] = 128; // 50% opacity
    }

    this.ctx.putImageData(imageData, 0, 0);
    
    if (!this.texture) {
      this.texture = new THREE.CanvasTexture(this.canvas);
      this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
    } else {
      this.texture.needsUpdate = true;
    }
    
    this.initialized = true;
  }

  getColorForTemperature(temp) {
    // Temperature range from -30°C to +40°C
    const normalized = (temp + 30) / 70;
    const hue = (1 - normalized) * 240; // 240° is blue, 0° is red
    return this.hslToRgb(hue / 360, 1, 0.5);
  }

  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
}