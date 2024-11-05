import * as THREE from 'three';

export class TextureManager {
  constructor() {
    this.isLoading = false;
    this.textureCache = new Map();
    this.textureLoader = new THREE.TextureLoader();
  }

  async getTextureForZoom(zoom, loadingUI) {
    if (this.isLoading) return null;
    this.isLoading = true;

    try {
      if (this.textureCache.has(zoom)) {
        return this.textureCache.get(zoom);
      }

      const texture = await this.createOSMTexture(zoom, loadingUI);
      this.textureCache.set(zoom, texture);
      return texture;
    } finally {
      this.isLoading = false;
    }
  }

  async createOSMTexture(zoom, loadingUI) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const tileSize = 256;
      const tilesX = Math.pow(2, zoom);
      const tilesY = Math.pow(2, zoom);

      canvas.width = tileSize * tilesX;
      canvas.height = tileSize * tilesY;

      let loadedTiles = 0;
      const totalTiles = tilesX * tilesY;
      const loadedImages = new Set();

      loadingUI.show();

      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          const server = String.fromCharCode(97 + ((x + y) % 3));
          img.src = `https://${server}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

          loadedImages.add(img);

          img.onload = () => {
            ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
            loadedTiles++;
            loadingUI.updateProgress(loadedTiles, totalTiles);

            if (loadedTiles === totalTiles) {
              const texture = new THREE.CanvasTexture(canvas);
              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
              texture.minFilter = THREE.LinearFilter;
              texture.anisotropy = 16;
              
              loadingUI.hide();
              resolve(texture);
              loadedImages.clear();
            }
          };

          img.onerror = (error) => {
            console.error(`Failed to load tile at zoom ${zoom}, x: ${x}, y: ${y}`, error);
            loadedTiles++;
            loadingUI.updateProgress(loadedTiles, totalTiles);

            if (loadedTiles === totalTiles) {
              const texture = new THREE.CanvasTexture(canvas);
              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
              texture.minFilter = THREE.LinearFilter;
              texture.anisotropy = 16;
              
              loadingUI.hide();
              resolve(texture);
              loadedImages.clear();
            }
          };
        }
      }
    });
  }
}