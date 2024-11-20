import * as THREE from 'three';

export class SearchBar {
  constructor(camera, controls, locationPin, cameraController) {
    this.camera = camera;
    this.controls = controls;
    this.locationPin = locationPin;
    this.cameraController = cameraController;
    this.element = this.createSearchBar();
    this.resultsContainer = this.createResultsContainer();
    document.body.appendChild(this.element);
    document.body.appendChild(this.resultsContainer);
  }

  createSearchBar() {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: 20px;
      top: 20px;
      width: 300px;
      z-index: 1000;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search locations...';
    input.style.cssText = `
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 14px;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    `;

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.search(input.value), 500);
    });

    container.appendChild(input);
    return container;
  }

  createResultsContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: 20px;
      top: 80px;
      width: 300px;
      max-height: 400px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      display: none;
    `;
    return container;
  }

  async search(query) {
    if (!query.trim()) {
      this.resultsContainer.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      this.displayResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  displayResults(results) {
    this.resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      this.resultsContainer.style.display = 'none';
      return;
    }

    results.forEach(result => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 12px;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      `;

      item.innerHTML = `
        <div style="font-weight: bold;">${result.display_name.split(',')[0]}</div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">${result.display_name}</div>
      `;

      item.addEventListener('mouseover', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });

      item.addEventListener('mouseout', () => {
        item.style.backgroundColor = 'transparent';
      });

      item.addEventListener('click', () => {
        this.handleLocationSelect(result);
        this.resultsContainer.style.display = 'none';
      });

      this.resultsContainer.appendChild(item);
    });

    this.resultsContainer.style.display = 'block';
  }

  handleLocationSelect(result) {
    const { lat, lon, display_name } = result;
    this.locationPin.removeAllPins();
    this.locationPin.createPin(lat, lon, display_name.split(',')[0]);
    this.cameraController.flyToLocation(lat, lon);
  }
}