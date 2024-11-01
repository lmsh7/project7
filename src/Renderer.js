import * as THREE from 'three';

export class Renderer {
  constructor() {
    this.renderer = this.createRenderer();
    this.setupRenderer();
  }

  createRenderer() {
    if (!this.isWebGLAvailable()) {
      this.showWebGLError();
      throw new Error('WebGL not available');
    }
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });

    // 启用shadow maps
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 设置输出编码
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    return renderer;
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // 透明背景
    document.body.appendChild(this.renderer.domElement);
  }

  showWebGLError() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.1);
      padding: 20px;
      border: 1px solid red;
      border-radius: 5px;
    `;
    message.textContent = 'WebGL is not available in your browser. Please try a different browser or enable WebGL.';
    document.body.appendChild(message);
  }

  get domElement() {
    return this.renderer.domElement;
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }
}