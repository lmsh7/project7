import * as THREE from 'three';
import { TextureLoader } from './TextureLoader';

export class Earth {
  constructor() {
    this.geometry = this.createMercatorSphere(1, 64, 64);
    const tempMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      shininess: 30,
      specular: 0x444444,
    });
    this.mesh = new THREE.Mesh(this.geometry, tempMaterial);

    this.currentZoom = 2;
    this.isLoading = false;
    this.lastDistance = null;
    this.textureCache = new Map(); // Cache for storing loaded textures
  }

  fixUVSeam(geometry) {
    // 获取索引数组
    const indices = geometry.getIndex().array;
    const uvs = geometry.attributes.uv.array;

    // 遍历所有三角形
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 2;
      const i1 = indices[i + 1] * 2;
      const i2 = indices[i + 2] * 2;

      // 获取三角形的UV坐标
      const u0 = uvs[i0];
      const u1 = uvs[i1];
      const u2 = uvs[i2];

      // 检查是否跨越0/1边界(差值大于0.5表示可能跨越边界)
      if (
        Math.abs(u1 - u0) > 0.5 ||
        Math.abs(u2 - u0) > 0.5 ||
        Math.abs(u2 - u1) > 0.5
      ) {
        // 修复UV坐标 - 将小于0.5的UV值加1
        if (u0 < 0.5) uvs[i0] += 1;
        if (u1 < 0.5) uvs[i1] += 1;
        if (u2 < 0.5) uvs[i2] += 1;
      }
    }

    geometry.attributes.uv.needsUpdate = true;
  }

  createMercatorSphere(radius, widthSegments, heightSegments) {
    const geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments,
      0, // phiStart
      Math.PI * 2, // phiLength (0 到 π)
      0, // thetaStart
      Math.PI * 2 // thetaLength (0 到 2π)
    );
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;

    for (let i = 0; i < uvs.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const longitude = Math.atan2(x, z);
      const latitude = Math.asin(y / radius);

      let u = (longitude + Math.PI) / (2 * Math.PI);
      let v =
        0.5 + Math.log(Math.tan(Math.PI / 4 + latitude / 2)) / (2 * Math.PI);

      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));
      uvs.setXY(i, u, v);
    }
    this.fixUVSeam(geometry);
    geometry.attributes.uv.needsUpdate = true;
    return geometry;
  }

  async initialize() {
    await this.loadTextureForZoom(this.currentZoom);
    return this.mesh;
  }

  async loadTextureForZoom(zoom) {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // Check if texture is already in cache
      if (this.textureCache.has(zoom)) {
        const cachedTexture = this.textureCache.get(zoom);
        this.updateMaterial(cachedTexture);
        this.isLoading = false;
        return;
      }

      const textureLoader = new TextureLoader();
      const texture = await this.loadOSMTexture(textureLoader, zoom);

      // Store texture in cache
      this.textureCache.set(zoom, texture);
      this.updateMaterial(texture);
    } catch (error) {
      console.error('Failed to load Earth texture:', error);
    } finally {
      this.isLoading = false;
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

  async loadOSMTexture(textureLoader, zoom) {
    const texture = await this.createOSMTexture(zoom);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    return texture;
  }

  createOSMTexture(zoom) {
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

      this.showLoadingIndicator();

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
            this.updateLoadingProgress(loadedTiles, totalTiles);

            if (loadedTiles === totalTiles) {
              const texture = new THREE.CanvasTexture(canvas);
              this.hideLoadingIndicator();
              resolve(texture);
              loadedImages.clear();
            }
          };

          img.onerror = (error) => {
            console.error(
              `Failed to load tile at zoom ${zoom}, x: ${x}, y: ${y}`,
              error
            );
            loadedTiles++;
            this.updateLoadingProgress(loadedTiles, totalTiles);

            if (loadedTiles === totalTiles) {
              const texture = new THREE.CanvasTexture(canvas);
              this.hideLoadingIndicator();
              resolve(texture);
              loadedImages.clear();
            }
          };
        }
      }
    });
  }

  showLoadingIndicator() {
    let indicator = document.getElementById('map-loading-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'map-loading-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
      `;
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
  }

  updateLoadingProgress(loaded, total) {
    const indicator = document.getElementById('map-loading-indicator');
    if (indicator) {
      const percentage = Math.floor((loaded / total) * 100);
      indicator.textContent = `Loading tiles: ${percentage}%`;
    }
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('map-loading-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  updateZoomLevel(cameraDistance) {
    if (this.isLoading) return;

    if (
      this.lastDistance &&
      Math.abs(cameraDistance - this.lastDistance) < 0.5
    ) {
      return;
    }
    this.lastDistance = cameraDistance;

    let newZoom;
    if (cameraDistance > 10) {
      newZoom = 1;
    } else if (cameraDistance > 6) {
      newZoom = 2;
    } else if (cameraDistance > 4) {
      newZoom = 3;
    } else if (cameraDistance > 3) {
      newZoom = 4;
    } else if (cameraDistance > 1.8) {
      newZoom = 5;
    } else {
      newZoom = 6;
    }

    if (newZoom !== this.currentZoom) {
      this.currentZoom = newZoom;
      this.loadTextureForZoom(newZoom);
    }
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
