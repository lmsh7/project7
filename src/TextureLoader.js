import * as THREE from 'three';

export class TextureLoader {
  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(new Error(`Failed to load texture: ${error.message}`))
      );
    });
  }
}