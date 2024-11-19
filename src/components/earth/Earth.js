import * as THREE from 'three';
import { EarthGeometry } from './EarthGeometry';
import { TextureManager } from './TextureManager';
import { LoadingUI } from './LoadingUI';
import { TemperatureOverlay } from './TemperatureOverlay';
import { TemperatureLegend } from './TemperatureLegend';

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
    this.temperatureOverlay = new TemperatureOverlay();
    this.temperatureLegend = new TemperatureLegend();
  }

  async initialize() {
    await this.loadTextureForZoom(this.currentZoom);
    await this.initializeTemperatureOverlay();
    this.temperatureLegend.create();
    return this.mesh;
  }

  async initializeTemperatureOverlay() {
    const overlayTexture = await this.temperatureOverlay.initialize();
    // this.updateMaterialWithOverlay(this.mesh.material.map, overlayTexture);
  }

  async loadTextureForZoom(zoom) {
    if (this.textureManager.isLoading) return;

    try {
      const texture = await this.textureManager.getTextureForZoom(zoom, this.loadingUI);
      if (texture) {
        this.updateMaterialWithOverlay(texture, this.temperatureOverlay.texture);
      }
    } catch (error) {
      console.error('Failed to load Earth texture:', error);
    }
  }

  updateMaterialWithOverlay(baseTexture, overlayTexture) {
    if (!baseTexture) return;

    // Create custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: baseTexture },
        temperatureOverlay: { value: overlayTexture },
        ...THREE.UniformsLib.lights
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vViewPosition = -mvPosition.xyz;
          vNormal = normalMatrix * normal;
        }
      `,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D temperatureOverlay;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec4 baseColor = texture2D(baseTexture, vUv);
          vec4 overlayColor = texture2D(temperatureOverlay, vUv);
          
          // Blend the base texture with the temperature overlay
          vec3 finalColor = mix(baseColor.rgb, overlayColor.rgb, overlayColor.a * 0.5);
          
          // Basic lighting
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float diffuse = max(dot(normal, viewDir), 0.0);
          
          gl_FragColor = vec4(finalColor * (0.8 + 0.2 * diffuse), 1.0);
        }
      `,
      lights: true,
      transparent: true
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