import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class CameraController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
  }

  flyToLocation(lat, lon, duration = 1000) {
    const targetPosition = this.calculateTargetPosition(lat, lon);
    this.animateCamera(targetPosition, duration);
  }

  calculateTargetPosition(lat, lon) {
    // Convert latitude and longitude to radians
    const latRad = THREE.MathUtils.degToRad(parseFloat(lat));
    const lonRad = THREE.MathUtils.degToRad(-parseFloat(lon)); // Negate longitude to match Earth's rotation
    
    const distance = 2;

    // Calculate camera position using spherical coordinates
    return new THREE.Vector3(
      distance * Math.cos(latRad) * Math.cos(lonRad),
      distance * Math.sin(latRad),
      distance * Math.cos(latRad) * Math.sin(lonRad)
    );
  }

  animateCamera(targetPosition, duration) {
    const startPosition = this.camera.position.clone();
    
    new TWEEN.Tween(startPosition)
      .to(targetPosition, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.copy(startPosition);
        this.camera.lookAt(0, 0, 0);
        this.controls.update();
      })
      .start();
  }

  update() {
    TWEEN.update();
  }
}