import * as THREE from 'three';

export class LocationPin {
  constructor(earthMesh) {
    this.earthMesh = earthMesh;
    this.pins = new THREE.Group();
    this.earthMesh.add(this.pins);
    
    this.pinMaterial = new THREE.MeshPhongMaterial({
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.2,
      shininess: 100
    });
  }

  createPin(lat, lon, label) {
    const pinGeometry = new THREE.ConeGeometry(0.02, 0.08, 8);
    pinGeometry.rotateX(Math.PI);
    
    const pin = new THREE.Mesh(pinGeometry, this.pinMaterial);
    const position = this.latLonToVector3(parseFloat(lat), parseFloat(lon), 1.02);
    pin.position.copy(position);

    // Calculate the orientation to make the pin perpendicular to the surface
    const up = position.clone().normalize();
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(axis, up);
    pin.setRotationFromQuaternion(quaternion);

    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'pin-label';
    labelDiv.textContent = label;
    labelDiv.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 1000;
    `;
    document.body.appendChild(labelDiv);

    pin.userData = { label: labelDiv, text: label };
    this.pins.add(pin);
    return pin;
  }

  latLonToVector3(lat, lon, radius) {
    const latRad = THREE.MathUtils.degToRad(lat);
    const lonRad = THREE.MathUtils.degToRad(-lon + 90);

    return new THREE.Vector3(
      radius * Math.cos(latRad) * Math.cos(lonRad),
      radius * Math.sin(latRad),
      radius * Math.cos(latRad) * Math.sin(lonRad)
    );
  }

  updateLabels(camera, renderer) {
    this.pins.children.forEach(pin => {
      // Convert pin's world position to screen coordinates
      const worldPosition = new THREE.Vector3();
      pin.getWorldPosition(worldPosition);
      const screenPosition = worldPosition.clone().project(camera);
      
      const x = (screenPosition.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const y = (-screenPosition.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

      // Check if pin is facing the camera
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.earthMesh.matrixWorld);
      const pinNormal = pin.position.clone().normalize();
      pinNormal.applyMatrix3(normalMatrix);
      const isFacing = pinNormal.dot(camera.position.clone().normalize()) > 0;

      if (isFacing && screenPosition.z < 1) {
        pin.userData.label.style.opacity = '1';
        pin.userData.label.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
      } else {
        pin.userData.label.style.opacity = '0';
      }
    });
  }

  removeAllPins() {
    this.pins.children.forEach(pin => {
      if (pin.userData.label) {
        document.body.removeChild(pin.userData.label);
      }
    });
    this.pins.clear();
  }

  dispose() {
    this.removeAllPins();
    this.pinMaterial.dispose();
  }
}