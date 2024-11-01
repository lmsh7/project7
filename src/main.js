import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Earth } from './Earth';
import { Renderer } from './Renderer';
import { CAMERA_SETTINGS, CONTROLS } from './constants';

class App {
  constructor() {
    this.init();
  }

  async init() {
    try {
      this.initializeScene();
      this.initializeCamera();
      this.initializeRenderer();
      this.initializeControls();
      await this.initializeEarth();
      this.setupEventListeners();
      this.animate();
    } catch (error) {
      this.handleError(error);
    }
  }

  initializeScene() {
    this.scene = new THREE.Scene();
    this.setupLights();
  }

  initializeCamera() {
    const { FOV, NEAR, FAR, POSITION } = CAMERA_SETTINGS;
    this.camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      NEAR,
      FAR
    );
    this.camera.position.set(POSITION.x, POSITION.y, POSITION.z);
  }

  initializeRenderer() {
    this.renderer = new Renderer();
  }

  initializeControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = CONTROLS.DAMPING_FACTOR;
    this.controls.rotateSpeed = CONTROLS.ROTATE_SPEED;
    this.controls.minDistance = CONTROLS.MIN_DISTANCE;
    this.controls.maxDistance = CONTROLS.MAX_DISTANCE;

    // 添加控制器变化的监听
    this.controls.addEventListener('change', () => {
      if (this.earth && this.camera) {
        const distance = this.camera.position.length();
        this.earth.updateZoomLevel(distance);
      }
    });
  }

  async initializeEarth() {
    this.earth = new Earth();
    await this.earth.initialize();
    this.scene.add(this.earth.mesh);
  }

  setupLights() {
    // Main directional light (sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased intensity
    mainLight.position.set(5, 3, 5);
    
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased from 0.3
    
    // Add a hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // Sky color
      0x444444, // Ground color
      0.8 // Intensity
    );
    
    // Add a weak front light to reduce shadows
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.3);
    frontLight.position.set(0, 0, 5);
    
    this.scene.add(mainLight, ambientLight, hemisphereLight, frontLight);
  }

  setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  handleError(error) {
    console.error('Application initialization failed:', error);
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
    message.textContent = `Error: ${error.message}. Please refresh the page.`;
    document.body.appendChild(message);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    if (this.earth) {
      this.earth.autoRotate();
    }
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize application
window.addEventListener('DOMContentLoaded', () => {
  new App();
});