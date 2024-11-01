import * as THREE from 'three';
import { TextureLoader } from './TextureLoader';

export class Earth {

  createMercatorSphere(radius, widthSegments, heightSegments) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;

    for (let i = 0; i < uvs.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        // 计算球面坐标
        const longitude = Math.atan2(x, z);
        const latitude = Math.asin(y / radius);

        // 将经纬度转换为Web Mercator UV坐标
        let u = (longitude + Math.PI) / (2 * Math.PI);
        let v = 0.5 - Math.log(Math.tan((latitude + Math.PI/2) / 2)) / (2 * Math.PI);

        // 确保UV坐标在0-1范围内
        u = Math.max(0, Math.min(1, u));
        v = Math.max(0, Math.min(1, v));

        uvs.setXY(i, u, v);
    }

    geometry.attributes.uv.needsUpdate = true;
    return geometry;
  }
  
  constructor() {
    this.geometry = new THREE.SphereGeometry(1, 64, 64);
    // this.geometry = this.createMercatorSphere(1, 64, 64);
    const tempMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      shininess: 30, // Increased from 10 for better light response
      specular: 0x444444, // Added specular color for better highlights
    });
    this.mesh = new THREE.Mesh(this.geometry, tempMaterial);

    // 跟踪当前缩放级别
    this.currentZoom = 2;
    this.isLoading = false;
    this.lastDistance = null;
  }

  async initialize() {
    await this.loadTextureForZoom(this.currentZoom);
    return this.mesh;
  }

  async loadTextureForZoom(zoom) {
    if (this.isLoading) return;
    this.isLoading = true;

    const textureLoader = new TextureLoader();
    try {
      const material = new THREE.MeshPhongMaterial({
        map: await this.loadOSMTexture(textureLoader, zoom),
        displacementScale: 0.1,
        shininess: 300, // Increased shininess
        specular: 0x444444, // Added specular color
        bumpScale: 0.02, // Added subtle bump mapping
      });

      this.mesh.material = material;
      this.mesh.rotation.y = Math.PI;
      this.mesh.rotation.x = THREE.MathUtils.degToRad(23.5);
    } catch (error) {
      console.error('Failed to load Earth texture:', error);
    } finally {
      this.isLoading = false;
    }
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

      // 创建加载状态指示器
      this.showLoadingIndicator();

      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          // 使用多个服务器并添加用户代理
          const server = String.fromCharCode(97 + ((x + y) % 3));
          img.src = `https://${server}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

          loadedImages.add(img); // 跟踪加载的图片

          img.onload = () => {
            ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
            loadedTiles++;
            this.updateLoadingProgress(loadedTiles, totalTiles);

            if (loadedTiles === totalTiles) {
              const texture = new THREE.CanvasTexture(canvas);
              this.hideLoadingIndicator();
              resolve(texture);
              loadedImages.clear(); // 清理图片引用
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
              loadedImages.clear(); // 清理图片引用
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

  // 根据相机距离更新缩放级别
  updateZoomLevel(cameraDistance) {
    if (this.isLoading) return;

    // 避免频繁更新
    if (
      this.lastDistance &&
      Math.abs(cameraDistance - this.lastDistance) < 0.5
    ) {
      return;
    }
    this.lastDistance = cameraDistance;

    // 根据相机距离确定合适的缩放级别
    let newZoom;
    if (cameraDistance > 10) {
      newZoom = 2;
    } else if (cameraDistance > 6) {
      newZoom = 3;
    } else if (cameraDistance > 4) {
      newZoom = 4;
    } else {
      newZoom = 5;
    }

    // 只在缩放级别变化时重新加载纹理
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
