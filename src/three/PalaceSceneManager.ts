import * as THREE from 'three';
import gsap from 'gsap';
import { createPalaceCourtyard } from './PalaceArchitecture';
import { createDiya3D, Diya3DData } from './Diya3D';
import { Fireworks3D } from './Fireworks3D';
import { SceneId } from '../types';

export class PalaceSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;

  private palaceGroup: THREE.Group;
  private diyas: Diya3DData[] = [];
  private fireworks: Fireworks3D;

  private ambientLight: THREE.AmbientLight;
  private moonLight: THREE.DirectionalLight;
  private courtyardGlowLight: THREE.PointLight;

  private particlesMesh: THREE.Points | null = null;
  private particleCount: number = 220;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onDiyaTapped?: (id: number) => void;

  // Camera animation target
  private cameraLookTarget = new THREE.Vector3(0, 0.8, 0);

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Setup Renderer with Mobile Capping & Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: window.innerWidth > 768,
      alpha: false,
    });
    this.renderer.setClearColor(0x09080d, 1);
    const maxDpr = window.innerWidth < 768 ? 1.2 : 1.8;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 2. Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x09080d, 0.032);

    const aspect = container.clientWidth / container.clientHeight;
    const initialFov = aspect < 1 ? 62 : 45;
    this.camera = new THREE.PerspectiveCamera(
      initialFov,
      aspect,
      0.1,
      120
    );
    // Initial camera: far back in dark entrance corridor
    this.camera.position.set(0, 3.8, aspect < 1 ? 30 : 26);
    this.camera.lookAt(this.cameraLookTarget);

    // 3. Ambient & Atmospheric Lighting
    this.ambientLight = new THREE.AmbientLight(0x280e18, 0.4);
    this.scene.add(this.ambientLight);

    // Subtle moon / night sky directional light with deep royal blue/gold tint
    this.moonLight = new THREE.DirectionalLight(0xd9b66f, 0.4);
    this.moonLight.position.set(8, 22, 10);
    this.scene.add(this.moonLight);

    // Central Warm Glow Point Light (illuminating the palace plinth)
    this.courtyardGlowLight = new THREE.PointLight(0xffa542, 0.2, 16, 1.8);
    this.courtyardGlowLight.position.set(0, 1.6, 0);
    this.scene.add(this.courtyardGlowLight);

    // 4. Construct Indian Palace Courtyard
    this.palaceGroup = createPalaceCourtyard();
    this.scene.add(this.palaceGroup);

    // 5. Build The 5 Interactive Brass Diyas in an Elegant Arc on Plinth
    this.setupDiyas();

    // 6. Floating 3D Golden Particles Motes
    this.setupParticles();

    // 7. 3D Fireworks System
    this.fireworks = new Fireworks3D(this.scene);

    // 8. Event Listeners
    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointerdown', this.onPointerDown);

    // 9. Start Render Loop
    this.animate();
  }

  private setupDiyas() {
    // 5 interactive brass diyas arranged symmetrically in an arc facing camera
    // Plinth center is at y: 0.455. Diya radius ~3.6 on plinth
    const diyaPositions = [
      new THREE.Vector3(-3.2, 0.46, 0.6), // 1. Happiness
      new THREE.Vector3(-1.7, 0.46, 1.6), // 2. Peace
      new THREE.Vector3(0, 0.46, 2.1),    // 3. Success (Apex center)
      new THREE.Vector3(1.7, 0.46, 1.6),  // 4. Beautiful Memories
      new THREE.Vector3(3.2, 0.46, 0.6),  // 5. Endless Love
    ];

    diyaPositions.forEach((pos, idx) => {
      const diya = createDiya3D(idx + 1, pos, 0.95);
      // Orient diya beak towards front
      diya.group.rotation.y = -Math.PI / 2 + (idx - 2) * 0.25;
      this.scene.add(diya.group);
      this.diyas.push(diya);
    });
  }

  private setupParticles() {
    const isMobile = window.innerWidth < 768;
    this.particleCount = isMobile ? 120 : 260;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = Math.random() * 12 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32;
      scales[i] = Math.random() * 0.8 + 0.4;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,245,230,1)');
      grad.addColorStop(0.4, 'rgba(243,217,154,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xf3d99a,
    });

    this.particlesMesh = new THREE.Points(geo, mat);
    this.scene.add(this.particlesMesh);
  }

  // Camera Choreography with GSAP
  public setSceneCamera(sceneId: SceneId) {
    const isMobile = window.innerWidth < 768;

    switch (sceneId) {
      case 'opening':
        // Glides forward from deep palace corridor towards central plinth
        this.animateCamera(
          new THREE.Vector3(0, isMobile ? 3.4 : 2.8, isMobile ? 13.5 : 11.2),
          new THREE.Vector3(0, 0.7, 0),
          3.2,
          'power2.out'
        );
        this.animatePalaceLighting(0.35, 0.6);
        this.fireworks.setActive(false);
        break;

      case 'reveal':
        // Medium wide regal shot framing the courtyard & palace arches
        this.animateCamera(
          new THREE.Vector3(0, isMobile ? 4.8 : 4.0, isMobile ? 14.0 : 12.0),
          new THREE.Vector3(0, 1.0, 0),
          2.4,
          'power2.inOut'
        );
        this.animatePalaceLighting(0.55, 1.4);
        this.fireworks.setActive(false);
        break;

      case 'diyas':
        // Close interactive perspective focused on the 5 diyas
        this.animateCamera(
          new THREE.Vector3(0, isMobile ? 3.2 : 2.6, isMobile ? 8.2 : 6.8),
          new THREE.Vector3(0, 0.65, 1.2),
          2.0,
          'power2.out'
        );
        this.animatePalaceLighting(0.7, 2.0);
        this.fireworks.setActive(false);
        break;

      case 'letter':
        // Focused intimate angle
        this.animateCamera(
          new THREE.Vector3(0, isMobile ? 2.8 : 2.3, isMobile ? 7.2 : 5.8),
          new THREE.Vector3(0, 0.55, 1.0),
          2.0,
          'power2.inOut'
        );
        this.animatePalaceLighting(0.6, 1.6);
        this.fireworks.setActive(false);
        break;

      case 'wishes':
        // Sweeping low-angle upward tilt past the plinth towards the starry arches
        this.animateCamera(
          new THREE.Vector3(0, 2.0, isMobile ? 9.5 : 8.2),
          new THREE.Vector3(0, 3.8, 0),
          2.2,
          'power2.inOut'
        );
        this.animatePalaceLighting(0.65, 1.8);
        this.fireworks.setActive(false);
        break;

      case 'finale':
        // Majestic high wide crane pullback revealing palace, fireworks and night sky
        this.animateCamera(
          new THREE.Vector3(0, isMobile ? 13.5 : 11.0, isMobile ? 24.0 : 20.0),
          new THREE.Vector3(0, 2.8, 0),
          3.5,
          'power2.out'
        );
        this.animatePalaceLighting(0.85, 2.8);
        this.fireworks.setActive(true);
        break;
    }
  }

  private animateCamera(
    targetPos: THREE.Vector3,
    lookTarget: THREE.Vector3,
    duration = 2.0,
    ease = 'power2.out'
  ) {
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.cameraLookTarget);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration,
      ease,
    });

    gsap.to(this.cameraLookTarget, {
      x: lookTarget.x,
      y: lookTarget.y,
      z: lookTarget.z,
      duration,
      ease,
      onUpdate: () => {
        this.camera.lookAt(this.cameraLookTarget);
      },
    });
  }

  private animatePalaceLighting(ambient: number, glow: number) {
    gsap.to(this.ambientLight, { intensity: ambient, duration: 2.0 });
    gsap.to(this.courtyardGlowLight, { intensity: glow, duration: 2.0 });
  }

  // Light up a 3D Diya with realistic flame expansion & point light bloom
  public lightDiya(id: number) {
    const diya = this.diyas.find((d) => d.id === id);
    if (!diya || diya.isLit) return;

    diya.isLit = true;

    // Animate flame scale and opacity
    (diya.flameMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
    (diya.flameCore.material as THREE.MeshBasicMaterial).opacity = 0.98;

    gsap.fromTo(
      diya.flameMesh.scale,
      { x: 0.001, y: 0.001, z: 0.001 },
      { x: 1.0, y: 1.0, z: 1.0, duration: 0.8, ease: 'back.out(1.7)' }
    );
    gsap.fromTo(
      diya.flameCore.scale,
      { x: 0.001, y: 0.001, z: 0.001 },
      { x: 1.0, y: 1.0, z: 1.0, duration: 0.8, ease: 'back.out(1.7)' }
    );

    // Animate point light
    gsap.to(diya.light, { intensity: 2.4, duration: 1.0, ease: 'power2.out' });

    // Focus camera gently towards this diya
    gsap.to(this.cameraLookTarget, {
      x: diya.group.position.x * 0.45,
      y: 0.65,
      z: diya.group.position.z * 0.45 + 1.0,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        this.camera.lookAt(this.cameraLookTarget);
      },
    });
  }

  // Light all diyas (for celebration or reveal)
  public lightAllDiyas() {
    this.diyas.forEach((d) => this.lightDiya(d.id));
  }

  // Reset all diyas for experience replay
  public resetDiyas() {
    this.diyas.forEach((diya) => {
      diya.isLit = false;
      gsap.to(diya.flameMesh.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5 });
      gsap.to(diya.flameCore.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5 });
      gsap.to(diya.light, { intensity: 0, duration: 0.5 });
    });
    this.fireworks.setActive(false);
  }

  // Pointer Click Interaction
  private onPointerDown = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const bowls = this.diyas.map((d) => d.bowl);
    const intersects = this.raycaster.intersectObjects(bowls, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const id = hit.userData.diyaId;
      if (id && this.onDiyaTapped) {
        this.onDiyaTapped(id);
      }
    }
  };

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? 62 : 45;
    this.camera.updateProjectionMatrix();

    const maxDpr = width < 768 ? 1.2 : 1.8;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    this.renderer.setSize(width, height);
  };

  // Main 60fps Render Loop
  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Natural flame flickering & organic flutter
    this.diyas.forEach((diya, i) => {
      if (diya.isLit) {
        const noise = Math.sin(time * 8 + i * 2.5) * 0.06 + Math.cos(time * 12 + i) * 0.04;
        const scaleNoise = 1 + noise;

        diya.flameMesh.scale.x = scaleNoise;
        diya.flameMesh.scale.z = scaleNoise;
        diya.flameMesh.scale.y = 1 + noise * 1.5;

        diya.flameMesh.rotation.z = Math.sin(time * 7 + i) * 0.06;
        diya.flameCore.rotation.z = Math.sin(time * 9 + i) * 0.08;

        // Subtle point light flicker
        diya.light.intensity = 2.4 + Math.sin(time * 14 + i * 3) * 0.25;
      }
    });

    // 2. Slow drifting floating golden particles
    if (this.particlesMesh) {
      const posAttr = this.particlesMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < this.particleCount; i++) {
        let y = posAttr.getY(i) + delta * 0.35;
        if (y > 14) y = 0.2;
        posAttr.setY(i, y);

        // Gentle horizontal sway
        const x = posAttr.getX(i) + Math.sin(time * 0.8 + i) * 0.003;
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }

    // 3. Fireworks update
    this.fireworks.update(delta, time);

    // 4. Subtle camera ambient drift
    this.camera.lookAt(this.cameraLookTarget);

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('pointerdown', this.onPointerDown);

    this.fireworks.dispose();
    if (this.particlesMesh) {
      this.particlesMesh.geometry.dispose();
      (this.particlesMesh.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
