import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Scene {
  constructor() {
    try {
      this.scene = new THREE.Scene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLights();
      this.setupControls();
      this.handleResize();
    } catch (error) {
      console.error('Scene initialization failed:', error);
      throw error;
    }
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
  }

  setupRenderer() {
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: 'high-performance'
      });
      
      if (!this.renderer) {
        throw new Error('WebGL renderer creation failed');
      }

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      document.body.appendChild(this.renderer.domElement);
    } catch (error) {
      console.error('Renderer setup failed:', error);
      throw error;
    }
  }

  setupLights() {
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 3, 5);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    
    this.scene.add(mainLight, ambientLight);
  }

  setupControls() {
    if (!this.camera || !this.renderer) {
      throw new Error('Camera or renderer not initialized');
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 10;
  }

  handleResize() {
    window.addEventListener('resize', () => {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }

  add(object) {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }
    this.scene.add(object);
  }

  render() {
    if (!this.controls || !this.renderer || !this.scene || !this.camera) {
      return;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}