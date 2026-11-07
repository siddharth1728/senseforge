import * as THREE from 'three';

interface Particle3D {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
  decay: number;
  size: number;
}

export class Fireworks3D {
  private group: THREE.Group;
  private particles: Particle3D[] = [];
  private pointsMesh: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private lastLaunchTime: number = 0;
  private active: boolean = false;

  private colors = [
    new THREE.Color(0xf3d99a), // Warm gold
    new THREE.Color(0xd9b66f), // Champagne gold
    new THREE.Color(0xfff5e6), // Ivory
    new THREE.Color(0xffdf95), // Radiant gold
    new THREE.Color(0xb97883), // Muted rose
    new THREE.Color(0xe69b72), // Warm amber
  ];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const maxParticles = 600;
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(243,217,154,0.8)');
      grad.addColorStop(0.7, 'rgba(217,182,111,0.2)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 1.2,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.material);
    this.group.add(this.pointsMesh);
  }

  public setActive(active: boolean) {
    this.active = active;
    if (!active) {
      this.particles = [];
      this.updateGeometry();
    }
  }

  public explode(center: THREE.Vector3, count = 65) {
    const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 4.5 + 2.5;

      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 2.0,
        Math.cos(phi) * speed
      );

      this.particles.push({
        position: center.clone(),
        velocity,
        color: baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.05, 0, 0),
        alpha: 1.0,
        decay: Math.random() * 0.016 + 0.012,
        size: Math.random() * 1.5 + 0.8,
      });
    }
  }

  public update(delta: number, time: number) {
    if (this.active) {
      if (time - this.lastLaunchTime > 1.2) {
        // Launch a burst over the palace arches
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 12 + 4;
        const x = Math.sin(angle) * radius;
        const y = Math.random() * 6 + 14;
        const z = Math.cos(angle) * radius;

        this.explode(new THREE.Vector3(x, y, z), 70);
        this.lastLaunchTime = time;
      }
    }

    // Update existing particles
    const gravity = new THREE.Vector3(0, -3.8, 0);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.velocity.addScaledVector(gravity, delta);
      p.velocity.multiplyScalar(0.975); // air drag
      p.position.addScaledVector(p.velocity, delta);
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    this.updateGeometry();
  }

  private updateGeometry() {
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = this.geometry.getAttribute('color') as THREE.BufferAttribute;

    const count = this.particles.length;

    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
      colAttr.setXYZ(i, p.color.r * p.alpha, p.color.g * p.alpha, p.color.b * p.alpha);
    }

    // Zero out unused
    for (let i = count; i < posAttr.count; i++) {
      posAttr.setXYZ(i, 0, -1000, 0);
      colAttr.setXYZ(i, 0, 0, 0);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    this.geometry.setDrawRange(0, count);
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.group.clear();
  }
}
