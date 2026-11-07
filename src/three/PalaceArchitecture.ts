import * as THREE from 'three';

export function createPalaceCourtyard(): THREE.Group {
  const palaceGroup = new THREE.Group();

  // 1. Courtyard Floor (Polished Deep Burgundy & Midnight Sandstone)
  const floorGeo = new THREE.PlaneGeometry(60, 60, 16, 16);
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a080f),
    roughness: 0.35,
    metalness: 0.3,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  palaceGroup.add(floor);

  // Courtyard Border Walkway Ring
  const borderRingGeo = new THREE.RingGeometry(10, 24, 32);
  const borderRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x280e18),
    roughness: 0.45,
    metalness: 0.2,
  });
  const borderRing = new THREE.Mesh(borderRingGeo, borderRingMat);
  borderRing.rotation.x = -Math.PI / 2;
  borderRing.position.y = 0.01;
  palaceGroup.add(borderRing);

  // 2. Central Raised Octagonal Marble Plinth
  const plinthGeo = new THREE.CylinderGeometry(5.8, 6.2, 0.45, 8);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x38121f),
    roughness: 0.25,
    metalness: 0.45,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.225;
  plinth.receiveShadow = true;
  palaceGroup.add(plinth);

  // Plinth Golden Brass Edge Rim
  const plinthRimGeo = new THREE.TorusGeometry(5.8, 0.08, 12, 8);
  const goldRimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4af37),
    roughness: 0.2,
    metalness: 0.9,
  });
  const plinthRim = new THREE.Mesh(plinthRimGeo, goldRimMat);
  plinthRim.rotation.x = Math.PI / 2;
  plinthRim.position.y = 0.45;
  palaceGroup.add(plinthRim);

  // 3. Central Sacred Rangoli Disc with Procedural Canvas Texture
  const rangoliTexture = createRangoliTexture();
  const rangoliGeo = new THREE.CircleGeometry(5.2, 32);
  const rangoliMat = new THREE.MeshStandardMaterial({
    map: rangoliTexture,
    transparent: true,
    roughness: 0.5,
    metalness: 0.2,
  });
  const rangoliMesh = new THREE.Mesh(rangoliGeo, rangoliMat);
  rangoliMesh.rotation.x = -Math.PI / 2;
  rangoliMesh.position.y = 0.455;
  palaceGroup.add(rangoliMesh);

  // 4. Palace Pillars & Indian Multifoil Arches
  const pillarCount = 8;
  const palaceRadius = 14;

  const pillarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x421825),
    roughness: 0.38,
    metalness: 0.25,
  });

  const goldDetailMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd9b66f),
    roughness: 0.25,
    metalness: 0.85,
  });

  for (let i = 0; i < pillarCount; i++) {
    const angle = (i * Math.PI * 2) / pillarCount;
    const x = Math.sin(angle) * palaceRadius;
    const z = Math.cos(angle) * palaceRadius;

    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(x, 0, z);

    // Fluted Column Shaft
    const colShaftGeo = new THREE.CylinderGeometry(0.55, 0.6, 9.5, 16);
    const colShaft = new THREE.Mesh(colShaftGeo, pillarMat);
    colShaft.position.y = 4.75;
    pillarGroup.add(colShaft);

    // Column Base
    const colBaseGeo = new THREE.BoxGeometry(1.6, 0.8, 1.6);
    const colBase = new THREE.Mesh(colBaseGeo, pillarMat);
    colBase.position.y = 0.4;
    pillarGroup.add(colBase);

    // Column Capital (Indian temple stepped lotus capital)
    const colCapGeo = new THREE.CylinderGeometry(1.2, 0.6, 1.0, 8);
    const colCap = new THREE.Mesh(colCapGeo, pillarMat);
    colCap.position.y = 9.8;
    pillarGroup.add(colCap);

    // Gold rings on pillar
    const goldRingGeo = new THREE.TorusGeometry(0.65, 0.05, 8, 16);
    const ring1 = new THREE.Mesh(goldRingGeo, goldDetailMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 2.0;
    pillarGroup.add(ring1);

    const ring2 = ring1.clone();
    ring2.position.y = 7.5;
    pillarGroup.add(ring2);

    palaceGroup.add(pillarGroup);

    // 5. Connect adjacent pillars with cusped arch and marigold swag
    const nextAngle = ((i + 1) * Math.PI * 2) / pillarCount;
    const nextX = Math.sin(nextAngle) * palaceRadius;
    const nextZ = Math.cos(nextAngle) * palaceRadius;

    // Cross beam above arch
    const midX = (x + nextX) / 2;
    const midZ = (z + nextZ) / 2;
    const dist = Math.hypot(nextX - x, nextZ - z);

    const beamGeo = new THREE.BoxGeometry(dist, 1.2, 1.2);
    const beam = new THREE.Mesh(beamGeo, pillarMat);
    beam.position.set(midX, 10.4, midZ);
    beam.lookAt(nextX, 10.4, nextZ);
    beam.rotateY(Math.PI / 2);
    palaceGroup.add(beam);

    // Marigold Garland Catenary Swag
    const garland = createMarigoldGarland(
      new THREE.Vector3(x, 9.2, z),
      new THREE.Vector3(nextX, 9.2, nextZ)
    );
    palaceGroup.add(garland);
  }

  // 6. Background Palace Walls & Jali Screens
  const backWallGeo = new THREE.CylinderGeometry(26, 26, 18, 32, 1, true, 0, Math.PI * 2);
  const backWallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x13050a),
    roughness: 0.7,
    side: THREE.BackSide,
  });
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.y = 9;
  palaceGroup.add(backWall);

  return palaceGroup;
}

// Procedural Marigold Garland hanging in catenary curve
function createMarigoldGarland(p1: THREE.Vector3, p2: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();
  const flowerCount = 14;

  const orangeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xff8c19),
    roughness: 0.6,
  });
  const yellowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffc83b),
    roughness: 0.6,
  });

  const sphereGeo = new THREE.SphereGeometry(0.18, 6, 6);

  for (let i = 0; i <= flowerCount; i++) {
    const t = i / flowerCount;
    // Catenary dip
    const dip = Math.sin(t * Math.PI) * 1.6;

    const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
    pos.y -= dip;

    const flower = new THREE.Mesh(sphereGeo, i % 2 === 0 ? orangeMat : yellowMat);
    flower.position.copy(pos);
    group.add(flower);
  }

  return group;
}

// Procedural Canvas Texture for Sacred Rangoli Mandala
function createRangoliTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 512;
  const cy = 512;

  // Background subtle dark wine
  ctx.fillStyle = '#200812';
  ctx.beginPath();
  ctx.arc(cx, cy, 510, 0, Math.PI * 2);
  ctx.fill();

  // Sacred concentric gold borders
  ctx.strokeStyle = '#D9B66F';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.strokeStyle = '#F3D99A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 470, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 380, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 260, 0, Math.PI * 2);
  ctx.stroke();

  // 16-Petal Lotus in Gold & Crimson
  const petals = 16;
  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Lotus petal
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(60, 200, 0, 360);
    ctx.quadraticCurveTo(-60, 200, 0, 0);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(185, 120, 131, 0.45)' : 'rgba(217, 182, 111, 0.45)';
    ctx.fill();
    ctx.strokeStyle = '#FFF5E6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Petal tip diya dot
    ctx.beginPath();
    ctx.arc(0, 380, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#F3D99A';
    ctx.fill();

    ctx.restore();
  }

  // Center golden jewel
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140);
  grad.addColorStop(0, '#FFF5E6');
  grad.addColorStop(0.5, '#F3D99A');
  grad.addColorStop(1, '#8A3416');

  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#D9B66F';
  ctx.lineWidth = 4;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
