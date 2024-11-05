import * as THREE from 'three';
import { EarthGeometry } from './EarthGeometry';
import { TextureManager } from './TextureManager';
import { LoadingUI } from './LoadingUI';

export class Earth {
  constructor() {
    this.geometry = new EarthGeometry(1, 64, 64).create();
    const tempMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      shininess: 30,
      specular: 0x444444,
    });
    this.mesh = new THREE.Mesh(this.geometry, tempMaterial);

    this.currentZoom = 2;
    this.lastDistance = null;
    this.textureManager = new TextureManager();
    this.loadingUI = new LoadingUI();
  }

  async initialize() {
    await this.loadTextureForZoom(this.currentZoom);
    return this.mesh;
  }

  async loadTextureForZoom(zoom) {
    if (this.textureManager.isLoading) return;

    try {
      const texture = await this.textureManager.getTextureForZoom(zoom, this.loadingUI);
      if (texture) {
        this.updateMaterial(texture);
      }
    } catch (error) {
      console.error('Failed to load Earth texture:', error);
    }
  }

  updateMaterial(texture) {
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      displacementScale: 0.1,
      shininess: 300,
      specular: 0x444444,
      bumpScale: 0.02,
    });

    this.mesh.material = material;
    this.mesh.rotation.y = Math.PI;
    this.mesh.rotation.x = THREE.MathUtils.degToRad(23.5);
  }

  updateZoomLevel(cameraDistance) {
    if (this.textureManager.isLoading) return;

    if (this.lastDistance && Math.abs(cameraDistance - this.lastDistance) < 0.5) {
      return;
    }
    this.lastDistance = cameraDistance;

    let newZoom = this.calculateZoomLevel(cameraDistance);

    if (newZoom !== this.currentZoom) {
      this.currentZoom = newZoom;
      this.loadTextureForZoom(newZoom);
    }
  }

  calculateZoomLevel(distance) {
    if (distance > 10) return 1;
    if (distance > 6) return 2;
    if (distance > 4) return 3;
    if (distance > 3) return 4;
    if (distance > 1.8) return 5;
    return 6;
  }

  updateRotation(mouseX, mouseY) {
    if (!this.mesh) return;
    this.mesh.rotation.x += (mouseY * 0.05 - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (mouseX * 0.05 - this.mesh.rotation.y) * 0.05;
  }

  autoRotate() {
    if (!this.mesh) return;
    this.mesh.rotation.y += 0.001;
  }
}