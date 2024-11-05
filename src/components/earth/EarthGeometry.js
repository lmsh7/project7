import * as THREE from 'three';

export class EarthGeometry {
  constructor(radius, widthSegments, heightSegments) {
    this.radius = radius;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;
  }

  create() {
    const geometry = new THREE.SphereGeometry(
      this.radius,
      this.widthSegments,
      this.heightSegments,
      0,
      Math.PI * 2,
      0,
      Math.PI * 2
    );
    
    this.applyMercatorProjection(geometry);
    this.fixUVSeam(geometry);
    return geometry;
  }

  applyMercatorProjection(geometry) {
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;

    for (let i = 0; i < uvs.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const longitude = Math.atan2(x, z);
      const latitude = Math.asin(y / this.radius);

      let u = (longitude + Math.PI) / (2 * Math.PI);
      let v = 0.5 + Math.log(Math.tan(Math.PI / 4 + latitude / 2)) / (2 * Math.PI);

      u = Math.max(0, Math.min(1, u));
      v = Math.max(0, Math.min(1, v));
      uvs.setXY(i, u, v);
    }

    geometry.attributes.uv.needsUpdate = true;
  }

  fixUVSeam(geometry) {
    const indices = geometry.getIndex().array;
    const uvs = geometry.attributes.uv.array;

    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 2;
      const i1 = indices[i + 1] * 2;
      const i2 = indices[i + 2] * 2;

      const u0 = uvs[i0];
      const u1 = uvs[i1];
      const u2 = uvs[i2];

      if (Math.abs(u1 - u0) > 0.5 || Math.abs(u2 - u0) > 0.5 || Math.abs(u2 - u1) > 0.5) {
        if (u0 < 0.5) uvs[i0] += 1;
        if (u1 < 0.5) uvs[i1] += 1;
        if (u2 < 0.5) uvs[i2] += 1;
      }
    }

    geometry.attributes.uv.needsUpdate = true;
  }
}