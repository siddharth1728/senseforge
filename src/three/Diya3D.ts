import * as THREE from 'three';

export interface Diya3DData {
  id: number;
  group: THREE.Group;
  bowl: THREE.Mesh;
  flameMesh: THREE.Mesh;
  flameCore: THREE.Mesh;
  light: THREE.PointLight;
  isLit: boolean;
  baseY: number;
}

export function createDiya3D(id: number, position: THREE.Vector3, scale = 1): Diya3DData {
  const group = new THREE.Group();
  group.position.copy(position);
  group.scale.set(scale, scale, scale);

  // 1. Traditional Brass / Terracotta Clay Diya Bowl
  // Create an authentic traditional lathe profile for Indian Diya
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.35, 0.05));
  points.push(new THREE.Vector2(0.65, 0.15));
  points.push(new THREE.Vector2(0.85, 0.35));
  points.push(new THREE.Vector2(0.95, 0.55));
  points.push(new THREE.Vector2(0.85, 0.65));
  points.push(new THREE.Vector2(0.65, 0.6));
  points.push(new THREE.Vector2(0.35, 0.45));
  points.push(new THREE.Vector2(0.1, 0.35));
  points.push(new THREE.Vector2(0, 0.3));

  const bowlGeo = new THREE.LatheGeometry(points, 32);

  // Polished Indian Brass Material with Gold Luster
  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4af37),
    roughness: 0.28,
    metalness: 0.85,
    bumpScale: 0.05,
  });

  const bowl = new THREE.Mesh(bowlGeo, brassMat);
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  bowl.userData = { diyaId: id };
  group.add(bowl);

  // 2. Oil Pool (Ghee / Mustard Oil reflective surface)
  const oilGeo = new THREE.CircleGeometry(0.68, 32);
  const oilMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x3a1705),
    roughness: 0.1,
    metalness: 0.4,
  });
  const oilMesh = new THREE.Mesh(oilGeo, oilMat);
  oilMesh.rotation.x = -Math.PI / 2;
  oilMesh.position.y = 0.5;
  group.add(oilMesh);

  // 3. Cotton Wick Tip
  const wickGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8);
  const wickMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a0a03),
    roughness: 0.9,
  });
  const wick = new THREE.Mesh(wickGeo, wickMat);
  wick.position.set(0.42, 0.55, 0);
  wick.rotation.z = -0.4;
  group.add(wick);

  // 4. Procedural 3D Flame
  // Outer teardrop flame
  const flameGeo = new THREE.ConeGeometry(0.26, 0.85, 16, 8);
  // Shift cone origin to its base
  flameGeo.translate(0, 0.42, 0);

  const flameMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffaa22),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.set(0.48, 0.65, 0);
  flameMesh.scale.set(0.001, 0.001, 0.001);
  group.add(flameMesh);

  // Inner white/canary core flame
  const coreGeo = new THREE.ConeGeometry(0.12, 0.45, 16, 4);
  coreGeo.translate(0, 0.22, 0);
  const coreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flameCore = new THREE.Mesh(coreGeo, coreMat);
  flameCore.position.set(0.48, 0.65, 0);
  flameCore.scale.set(0.001, 0.001, 0.001);
  group.add(flameCore);

  // 5. Dynamic Warm Point Light
  const light = new THREE.PointLight(0xffa238, 0, 8, 1.8);
  light.position.set(0.48, 0.95, 0);
  light.castShadow = false; // Keep false for mobile performance
  group.add(light);

  return {
    id,
    group,
    bowl,
    flameMesh,
    flameCore,
    light,
    isLit: false,
    baseY: position.y,
  };
}
