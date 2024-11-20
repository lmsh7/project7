import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Earth } from './components/earth/Earth';
import { Renderer } from './Renderer';
import { CAMERA_SETTINGS, CONTROLS } from './constants';
import { RSSFeed } from './components/rss/RSSFeed';
import { SearchBar } from './components/search/SearchBar';
import { LocationPin } from './components/location/LocationPin';
import { CameraController } from './components/camera/CameraController';

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
      this.initializeRSSFeed();
      this.initializeLocationFeatures();
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

  initializeRSSFeed() {
    this.rssFeed = new RSSFeed();
  }

  initializeLocationFeatures() {
    this.locationPin = new LocationPin(this.earth.mesh);
    
    this.cameraController = new CameraController(this.camera, this.controls);
    this.searchBar = new SearchBar(
      this.camera,
      this.controls,
      this.locationPin,
      this.cameraController
    );
  }

  setupLights() {
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 3, 5);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    
    const hemisphereLight = new THREE.HemisphereLight(
      0xffffff,
      0x444444,
      0.8
    );
    
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
    if (this.cameraController) {
      this.cameraController.update();
    }
    if (this.locationPin && this.camera && this.renderer) {
      this.locationPin.updateLabels(this.camera, this.renderer.renderer);
    }
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});