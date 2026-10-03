import * as THREE from 'three';

// Exact Flipkart Healthshine / Drive Medical Silver Sport 2 Spec & Dimensions:
// Open Width: 0.66m (66 cm)
// Folded Width: 0.23m (23 cm)
// Seat Width: 0.46m (46 cm), Seat Depth: 0.46m (46 cm)
// Seat Height: 0.48m (48 cm)
// Total Height: 0.88m (88 cm)
// Total Length: 1.04m (104 cm)
// Rear Wheel: 24" (radius 0.305m) 6-spoke composite mag wheel with outer handrim & inner 16T sprocket
// Front Caster: 8" (radius 0.100m) composite 5-spoke wheel with heavy-duty steel fork

// ============================================================================
// PROCEDURAL PBR TEXTURES (GTA 6 / SUBSTANCE PAINTER QUALITY)
// ============================================================================

// 1. Procedural Diamond / Chevron Tire Tread Bump Map
function createTireTreadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080'; // neutral height
  ctx.fillRect(0, 0, 512, 128);

  // Longitudinal groove channels
  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 36, 512, 6);
  ctx.fillRect(0, 60, 512, 8); // center groove
  ctx.fillRect(0, 86, 512, 6);

  // Chevron angled sipes
  ctx.strokeStyle = '#202020';
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 16) {
    // Upper shoulder chevron
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x + 12, 36);
    ctx.stroke();

    // Center chevron
    ctx.beginPath();
    ctx.moveTo(x, 42);
    ctx.lineTo(x + 10, 60);
    ctx.lineTo(x, 86);
    ctx.stroke();

    // Lower shoulder chevron
    ctx.beginPath();
    ctx.moveTo(x, 120);
    ctx.lineTo(x + 12, 92);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(16, 1);
  return tex;
}

// 2. Procedural Ballistic Nylon Fabric Weave & Seam Stitch Bump Map
function createCanvasFabricTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Micro-weave cross-hatching
  ctx.fillStyle = '#909090';
  for (let x = 0; x < 256; x += 4) {
    for (let y = 0; y < 256; y += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // Double perimeter stitch lines
  ctx.fillStyle = '#ffffff';
  for (let x = 8; x < 248; x += 6) {
    ctx.fillRect(x, 8, 3, 2);
    ctx.fillRect(x, 14, 3, 2);
    ctx.fillRect(x, 240, 3, 2);
    ctx.fillRect(x, 246, 3, 2);
  }
  for (let y = 8; y < 248; y += 6) {
    ctx.fillRect(8, y, 2, 3);
    ctx.fillRect(14, y, 2, 3);
    ctx.fillRect(240, y, 2, 3);
    ctx.fillRect(246, y, 2, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

// 3. Procedural Faux-Leather Grain Texture for Armrest Cushions
function createLeatherTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, 256, 256);

  // Irregular cellular leather grain
  ctx.fillStyle = '#8f8f8f';
  for (let i = 0; i < 1200; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const rad = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// 4. Procedural Healthshine Embroidered Logo Canvas
function createHealthshineLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Deep black canvas background
  ctx.fillStyle = '#14161a';
  ctx.fillRect(0, 0, 512, 128);

  // Embroidered border patch
  ctx.strokeStyle = '#222832';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  // Healthshine Brand Logo Mark (Cyan medical swirl)
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(100, 64, 28, -Math.PI / 2, Math.PI);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(100, 64, 18, Math.PI / 2, Math.PI * 2);
  ctx.stroke();

  // "healthshine" Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('health', 150, 64);

  ctx.fillStyle = '#00f0ff';
  ctx.fillText('shine', 285, 64);

  // Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('LIVING IN GOOD HEALTH', 155, 96);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Cached textures
let cachedTreadTex = null;
let cachedCanvasTex = null;
let cachedLeatherTex = null;
let cachedLogoTex = null;

export function createMaterials(finishMode = 'black') {
  if (!cachedTreadTex) cachedTreadTex = createTireTreadTexture();
  if (!cachedCanvasTex) cachedCanvasTex = createCanvasFabricTexture();
  if (!cachedLeatherTex) cachedLeatherTex = createLeatherTexture();
  if (!cachedLogoTex) cachedLogoTex = createHealthshineLogoTexture();

  // Primary Frame Finish
  let frameColor = 0x121418;
  let frameRoughness = 0.26;
  let frameMetalness = 0.75;

  if (finishMode === 'chrome') {
    frameColor = 0xe8eaed;
    frameRoughness = 0.08;
    frameMetalness = 0.98;
  } else if (finishMode === 'gunmetal') {
    frameColor = 0x242a34;
    frameRoughness = 0.18;
    frameMetalness = 0.88;
  }

  const framePaint = new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: frameRoughness,
    metalness: frameMetalness,
  });

  const frameChrome = new THREE.MeshStandardMaterial({
    color: 0xf3f5f8,
    roughness: 0.06,
    metalness: 0.98,
  });

  const blackComposite = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.38,
    metalness: 0.22,
  });

  const tireRubber = new THREE.MeshStandardMaterial({
    color: 0x0e0f12,
    roughness: 0.84,
    metalness: 0.04,
    bumpMap: cachedTreadTex,
    bumpScale: 0.045,
  });

  // Precision CNC Sprocket - Anodized Golden Bronze / Hardened Chromoly Steel
  // Matching user's Sketchfab reference https://skfb.ly/pxROq and real photo 11.37.01
  const sprocketBronze = new THREE.MeshStandardMaterial({
    color: 0xd48b42,
    roughness: 0.22,
    metalness: 0.92,
  });

  const sprocketSteel = new THREE.MeshStandardMaterial({
    color: 0x2e333d,
    roughness: 0.25,
    metalness: 0.88,
  });

  const steelHardware = new THREE.MeshStandardMaterial({
    color: 0xabb4c2,
    roughness: 0.18,
    metalness: 0.94,
  });

  const goldBrass = new THREE.MeshStandardMaterial({
    color: 0xdeb836,
    roughness: 0.22,
    metalness: 0.92,
  });

  const upholsteryCanvas = new THREE.MeshStandardMaterial({
    color: 0x151619,
    roughness: 0.92,
    metalness: 0.03,
    bumpMap: cachedCanvasTex,
    bumpScale: 0.035,
    side: THREE.DoubleSide,
  });

  const armrestPadLeather = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.48,
    metalness: 0.12,
    bumpMap: cachedLeatherTex,
    bumpScale: 0.025,
  });

  const skirtGuardMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.35,
    metalness: 0.22,
    side: THREE.DoubleSide,
  });

  const brakeGalvanized = new THREE.MeshStandardMaterial({
    color: 0x9099a8,
    roughness: 0.28,
    metalness: 0.90,
  });

  const rubberGripMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d10,
    roughness: 0.82,
    metalness: 0.08,
  });

  const badgeSilver = new THREE.MeshStandardMaterial({
    color: 0xe2e6ee,
    roughness: 0.14,
    metalness: 0.95,
  });

  const brandCyan = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    roughness: 0.20,
    metalness: 0.70,
  });

  const logoMaterial = new THREE.MeshBasicMaterial({
    map: cachedLogoTex,
    transparent: true,
    side: THREE.DoubleSide
  });

  return {
    framePaint,
    frameChrome,
    blackComposite,
    tireRubber,
    sprocketBronze,
    sprocketSteel,
    steelHardware,
    goldBrass,
    upholsteryCanvas,
    armrestPadLeather,
    skirtGuardMat,
    brakeGalvanized,
    rubberGripMat,
    badgeSilver,
    brandCyan,
    logoMaterial,
  };
}

// ============================================================================
// 1. PRECISION WHEEL HUB SPROCKET MODEL
// (Directly modeled after Sketchfab https://skfb.ly/pxROq & WhatsApp Photo 11.37.01)
// 16-tooth precision cut profile, 6 circular CNC lightening holes, hub adapter,
// lockring notches, M5 mounting hex bolts, and threaded M12 axle stud.
// ============================================================================
export function createPrecisionSprocket(materials, numTeeth = 16, pitchRadius = 0.040) {
  const sprocketGroup = new THREE.Group();
  sprocketGroup.name = "Wheel_Hub_Sprocket_Assembly";

  const discThickness = 0.0035; // 3.5mm thick hardened steel sprocket plate

  // A. Sprocket Disc Plate (Bronze / Chromoly)
  const rootRadius = pitchRadius - 0.005;
  const outerRadius = pitchRadius + 0.006;

  // Main body ring
  const discGeom = new THREE.CylinderGeometry(rootRadius, rootRadius, discThickness, 36);
  discGeom.rotateZ(Math.PI / 2);
  const discMesh = new THREE.Mesh(discGeom, materials.sprocketBronze);
  discMesh.castShadow = true;
  sprocketGroup.add(discMesh);

  // B. 16 Precision Cut Teeth with Involute / Chamfered Flanks
  const toothWidth = (2 * Math.PI * pitchRadius) / (numTeeth * 2.1);
  const toothHeight = outerRadius - rootRadius;

  for (let i = 0; i < numTeeth; i++) {
    const angle = (i * Math.PI * 2) / numTeeth;
    const toothGroup = new THREE.Group();
    toothGroup.rotation.x = angle;

    // Base tooth block
    const toothBase = new THREE.Mesh(
      new THREE.BoxGeometry(discThickness, toothHeight, toothWidth),
      materials.sprocketBronze
    );
    toothBase.position.set(0, rootRadius + toothHeight / 2, 0);
    toothBase.castShadow = true;
    toothGroup.add(toothBase);

    // Chamfered tooth tip (narrower at the tip for smooth #410 roller chain engagement)
    const toothTip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.001, toothWidth / 2, 0.003, 4),
      materials.sprocketBronze
    );
    toothTip.rotation.z = Math.PI / 2;
    toothTip.position.set(0, outerRadius - 0.0015, 0);
    toothGroup.add(toothTip);

    sprocketGroup.add(toothGroup);
  }

  // C. 6 Circular CNC Weight-Reduction Lightening Holes
  const holeRadius = 0.0045;
  const holeCenterDist = (rootRadius + 0.016) / 2;
  for (let h = 0; h < 6; h++) {
    const holeAngle = (h * Math.PI * 2) / 6 + (Math.PI / 12);
    // Dark recessed cavity simulating through-hole
    const holeRim = new THREE.Mesh(
      new THREE.TorusGeometry(holeRadius, 0.0008, 8, 16),
      materials.sprocketSteel
    );
    holeRim.rotation.y = Math.PI / 2;
    holeRim.position.set(
      discThickness / 2 + 0.0005,
      Math.cos(holeAngle) * holeCenterDist,
      Math.sin(holeAngle) * holeCenterDist
    );
    sprocketGroup.add(holeRim);

    const holeCavity = new THREE.Mesh(
      new THREE.CylinderGeometry(holeRadius * 0.9, holeRadius * 0.9, discThickness + 0.001, 16),
      materials.sprocketSteel
    );
    holeCavity.rotation.z = Math.PI / 2;
    holeCavity.position.set(
      0,
      Math.cos(holeAngle) * holeCenterDist,
      Math.sin(holeAngle) * holeCenterDist
    );
    sprocketGroup.add(holeCavity);
  }

  // D. Center Adapter Collar & Threaded Freewheel Hub Boss (Photo 11.37.01)
  const hubBoss = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.016, 28),
    materials.sprocketSteel
  );
  hubBoss.rotation.z = Math.PI / 2;
  hubBoss.position.set(-0.006, 0, 0);
  hubBoss.castShadow = true;
  sprocketGroup.add(hubBoss);

  // Bronze threaded freewheel bearing body
  const fwBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.008, 28),
    materials.sprocketBronze
  );
  fwBody.rotation.z = Math.PI / 2;
  fwBody.position.set(-0.002, 0, 0);
  sprocketGroup.add(fwBody);

  // E. Lockring with Dual Tool Slots (exact detail seen in WhatsApp photo 11.37.01)
  const lockRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.005, 24),
    materials.steelHardware
  );
  lockRing.rotation.z = Math.PI / 2;
  lockRing.position.set(0.003, 0, 0);
  sprocketGroup.add(lockRing);

  [-1, 1].forEach((dir) => {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.003, 0.004),
      materials.sprocketSteel
    );
    slot.position.set(0.003, dir * 0.014, 0);
    sprocketGroup.add(slot);
  });

  // F. 6 M5 Socket Head Bolts Securing Sprocket to Wheel Hub Flange
  for (let b = 0; b < 6; b++) {
    const boltAngle = (b * Math.PI * 2) / 6;
    const boltRadius = 0.0165;
    const boltHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0025, 0.0025, 0.004, 12),
      materials.steelHardware
    );
    boltHead.rotation.z = Math.PI / 2;
    boltHead.position.set(
      0.0035,
      Math.cos(boltAngle) * boltRadius,
      Math.sin(boltAngle) * boltRadius
    );

    // Hex socket recess inside bolt head
    const hexSocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0013, 0.0013, 0.002, 6),
      materials.sprocketSteel
    );
    hexSocket.rotation.z = Math.PI / 2;
    hexSocket.position.set(
      0.005,
      Math.cos(boltAngle) * boltRadius,
      Math.sin(boltAngle) * boltRadius
    );

    sprocketGroup.add(boltHead);
    sprocketGroup.add(hexSocket);
  }

  // G. Heavy Steel Hex Jam Nut & Axle Spindle
  const hexNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.010, 6),
    materials.steelHardware
  );
  hexNut.rotation.z = Math.PI / 2;
  hexNut.position.set(-0.015, 0, 0);
  sprocketGroup.add(hexNut);

  // Threaded M12 axle stud
  const axleThread = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0065, 0.0065, 0.055, 20),
    materials.steelHardware
  );
  axleThread.rotation.z = Math.PI / 2;
  axleThread.position.set(-0.035, 0, 0);
  sprocketGroup.add(axleThread);

  return sprocketGroup;
}

// ============================================================================
// 2. ULTRA-DETAILED REAR 24" MAG WHEEL
// (Composite 6-Spoke Star Mag Rim, Solid Rubber Tire with Tread Grooves,
//  Outer Push Handrim with 6 Standoffs, Valve Stem, and Inner Hub Sprocket)
// ============================================================================
export function createHighDetailRearWheel(materials, isLeft = true) {
  const wheelAssembly = new THREE.Group();
  wheelAssembly.name = `Rear_Mag_Wheel_24in_${isLeft ? 'L' : 'R'}`;
  const sideSign = isLeft ? 1 : -1;

  const WHEEL_RADIUS = 0.305; // 24" diameter = 0.610m (radius 0.305m)
  const RIM_RADIUS = 0.270;
  const HUB_RADIUS = 0.052;

  // Wheel Rotational Pivot Subgroup (allows physics rotation around local X axis!)
  const spinGroup = new THREE.Group();
  spinGroup.name = `Wheel_SpinGroup_${isLeft ? 'L' : 'R'}`;
  wheelAssembly.add(spinGroup);

  // A. Solid Rubber 24" Tire with Tread Grooves
  const tireGroup = new THREE.Group();
  const mainTire = new THREE.Mesh(
    new THREE.TorusGeometry(0.284, 0.024, 24, 64),
    materials.tireRubber
  );
  mainTire.rotation.y = Math.PI / 2;
  mainTire.castShadow = true;
  tireGroup.add(mainTire);

  // Directional tread ribs along outer contact patch
  [-0.007, 0.0, 0.007].forEach((xOffset) => {
    const treadRib = new THREE.Mesh(
      new THREE.TorusGeometry(0.306, 0.0016, 8, 64),
      materials.tireRubber
    );
    treadRib.rotation.y = Math.PI / 2;
    treadRib.position.x = xOffset;
    tireGroup.add(treadRib);
  });

  // Cross tread blocks (chevron tread pattern around tire)
  for (let t = 0; t < 48; t++) {
    const tAngle = (t * Math.PI * 2) / 48;
    const treadBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, 0.002, 0.0035),
      materials.tireRubber
    );
    treadBlock.position.set(0, Math.cos(tAngle) * 0.306, Math.sin(tAngle) * 0.306);
    treadBlock.rotation.x = -tAngle;
    treadBlock.rotation.y = (t % 2 === 0 ? 1 : -1) * 0.35; // chevron angle
    tireGroup.add(treadBlock);
  }
  spinGroup.add(tireGroup);

  // B. 6-Spoke Composite Mag Rim (Drop-Center Rim + Airfoil I-Beam Spokes)
  const rimGroup = new THREE.Group();

  // Outer cylindrical rim hoop with inner drop-center well
  const rimHoop = new THREE.Mesh(
    new THREE.CylinderGeometry(RIM_RADIUS, RIM_RADIUS, 0.038, 48, 1, true),
    materials.blackComposite
  );
  rimHoop.rotation.z = Math.PI / 2;
  rimHoop.castShadow = true;
  rimGroup.add(rimHoop);

  // Inner rim flanges
  [-0.018, 0.018].forEach((offset) => {
    const rimFlange = new THREE.Mesh(
      new THREE.TorusGeometry(RIM_RADIUS, 0.004, 12, 48),
      materials.blackComposite
    );
    rimFlange.rotation.y = Math.PI / 2;
    rimFlange.position.x = offset;
    rimGroup.add(rimFlange);
  });

  // Central composite hub barrel with inner reinforcing ribs (Photo 11.37.01)
  const hubBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(HUB_RADIUS, HUB_RADIUS, 0.056, 36),
    materials.blackComposite
  );
  hubBarrel.rotation.z = Math.PI / 2;
  hubBarrel.castShadow = true;
  rimGroup.add(hubBarrel);

  // Inner hub radial stiffening ribs (8 gusset webs seen inside hub in 11.37.01)
  for (let r = 0; r < 8; r++) {
    const rAngle = (r * Math.PI * 2) / 8;
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.022, 0.004),
      materials.blackComposite
    );
    rib.position.set(-sideSign * 0.018, Math.cos(rAngle) * 0.038, Math.sin(rAngle) * 0.038);
    rib.rotation.x = -rAngle;
    rimGroup.add(rib);
  }

  // C. 6 Composite Airfoil Mag Spokes with Recessed I-Beam Pockets
  // Exactly matching user's photo 11.36.45, 11.37.01, and 11.38.38
  const spokeLength = RIM_RADIUS - HUB_RADIUS + 0.012;
  const spokeMidRadius = (RIM_RADIUS + HUB_RADIUS) / 2;

  for (let s = 0; s < 6; s++) {
    const spokeAngle = (s * Math.PI * 2) / 6;
    const spokeGroup = new THREE.Group();
    spokeGroup.rotation.x = spokeAngle;

    // Main structural spoke body (tapered from hub to rim)
    const spokeBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, spokeLength, 0.038),
      materials.blackComposite
    );
    spokeBody.position.set(0, spokeMidRadius, 0);
    spokeBody.castShadow = true;
    spokeGroup.add(spokeBody);

    // Recessed side pockets on both faces creating authentic molded I-beam rib
    [-0.011, 0.011].forEach((pocketSide) => {
      const pocketCavity = new THREE.Mesh(
        new THREE.BoxGeometry(0.004, spokeLength * 0.82, 0.024),
        materials.blackComposite
      );
      pocketCavity.position.set(pocketSide, spokeMidRadius, 0);
      spokeGroup.add(pocketCavity);
    });

    // Spoke-to-rim fillet gusset
    const rimFillet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.016, 0.028, 8),
      materials.blackComposite
    );
    rimFillet.rotation.z = Math.PI / 2;
    rimFillet.position.set(0, RIM_RADIUS - 0.004, 0);
    spokeGroup.add(rimFillet);

    rimGroup.add(spokeGroup);
  }

  // D. Outer Molded Center Dust Cap & Axle Nut
  const dustCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.028, 0.010, 24),
    materials.blackComposite
  );
  dustCap.rotation.z = Math.PI / 2;
  dustCap.position.x = sideSign * 0.030;
  rimGroup.add(dustCap);

  const centerNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.008, 6),
    materials.steelHardware
  );
  centerNut.rotation.z = Math.PI / 2;
  centerNut.position.x = sideSign * 0.035;
  rimGroup.add(centerNut);

  // E. Brass Schrader Air Valve Stem
  const valveStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.022, 12),
    materials.goldBrass
  );
  valveStem.position.set(0, RIM_RADIUS + 0.008, 0.025);
  valveStem.rotation.x = Math.PI / 6;
  rimGroup.add(valveStem);

  const valveCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.008, 12),
    materials.rubberGripMat
  );
  valveCap.position.set(0, RIM_RADIUS + 0.017, 0.030);
  valveCap.rotation.x = Math.PI / 6;
  rimGroup.add(valveCap);

  spinGroup.add(rimGroup);

  // F. Outer Push Handrim with 6 Standoff Mounting Posts (Photo 11.38.38)
  const handrimGroup = new THREE.Group();
  const HANDRIM_RADIUS = 0.252;
  const handrimTube = new THREE.Mesh(
    new THREE.TorusGeometry(HANDRIM_RADIUS, 0.010, 16, 64),
    materials.framePaint
  );
  handrimTube.rotation.y = Math.PI / 2;
  handrimTube.position.x = sideSign * 0.048;
  handrimTube.castShadow = true;
  handrimGroup.add(handrimTube);

  // 6 Cylindrical Standoff Posts connecting Handrim to Rim Spokes
  for (let s = 0; s < 6; s++) {
    const postAngle = (s * Math.PI * 2) / 6;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.032, 12),
      materials.framePaint
    );
    post.rotation.z = Math.PI / 2;
    post.position.set(
      sideSign * 0.032,
      Math.cos(postAngle) * HANDRIM_RADIUS,
      Math.sin(postAngle) * HANDRIM_RADIUS
    );
    post.castShadow = true;
    handrimGroup.add(post);

    // M6 Hex Socket Screw head on handrim
    const screwHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.003, 12),
      materials.steelHardware
    );
    screwHead.rotation.z = Math.PI / 2;
    screwHead.position.set(
      sideSign * 0.054,
      Math.cos(postAngle) * HANDRIM_RADIUS,
      Math.sin(postAngle) * HANDRIM_RADIUS
    );
    handrimGroup.add(screwHead);
  }
  spinGroup.add(handrimGroup);

  // G. FIXED INNER HUB SPROCKET (Reference: https://skfb.ly/pxROq & WhatsApp Photo 11.37.01)
  // Attached to the inner face of the wheel hub - SPINS WITH THE WHEEL!
  const hubSprocket = createPrecisionSprocket(materials, 16, 0.040);
  hubSprocket.name = `Inner_Hub_Sprocket_${isLeft ? 'L' : 'R'}`;
  hubSprocket.position.set(-sideSign * 0.034, 0, 0);
  if (!isLeft) {
    hubSprocket.rotation.y = Math.PI; // Face inwards on both sides
  }
  spinGroup.add(hubSprocket);

  wheelAssembly.userData.spinGroup = spinGroup;
  wheelAssembly.userData.sprocket = hubSprocket;

  return wheelAssembly;
}

// ============================================================================
// 3. SCISSOR-LOCK MANUAL PARKING BRAKE ASSEMBLY (Photo 11.38.38)
// Stamped steel clamp, toggle scissor linkage, ergonomic handle, and serrated shoe
// ============================================================================
export function createHighDetailParkingBrake(materials, isLeft = true) {
  const brakeGroup = new THREE.Group();
  brakeGroup.name = `Parking_Brake_${isLeft ? 'L' : 'R'}`;
  const sideSign = isLeft ? 1 : -1;

  // Frame clamp bracket
  const clamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.035, 16),
    materials.brakeGalvanized
  );
  clamp.rotation.z = Math.PI / 2;
  brakeGroup.add(clamp);

  const clampBolt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.028, 12),
    materials.steelHardware
  );
  clampBolt.position.set(0, 0.016, 0);
  brakeGroup.add(clampBolt);

  // Pivot Arm Subgroup (Animates when parking brake engaged/disengaged!)
  const brakeLeverGroup = new THREE.Group();
  brakeLeverGroup.name = `Brake_Lever_Pivot_${isLeft ? 'L' : 'R'}`;

  // Scissor linkage pivot plates
  const scissorArm1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.045, 0.012),
    materials.brakeGalvanized
  );
  scissorArm1.position.set(sideSign * 0.014, 0.022, -0.015);
  scissorArm1.rotation.x = Math.PI / 5;
  brakeLeverGroup.add(scissorArm1);

  const scissorArm2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.038, 0.012),
    materials.brakeGalvanized
  );
  scissorArm2.position.set(sideSign * 0.014, 0.010, -0.032);
  scissorArm2.rotation.x = -Math.PI / 4;
  brakeLeverGroup.add(scissorArm2);

  // Chrome pivot rivet pins
  [-0.015, -0.032].forEach((zPos) => {
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0035, 0.0035, 0.016, 12),
      materials.steelHardware
    );
    pin.rotation.z = Math.PI / 2;
    pin.position.set(sideSign * 0.014, 0.020, zPos);
    brakeLeverGroup.add(pin);
  });

  // Ergonomic brake handle lever angled upward
  const leverRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0045, 0.090, 12),
    materials.brakeGalvanized
  );
  leverRod.rotation.x = -Math.PI / 3.2;
  leverRod.position.set(sideSign * 0.020, 0.055, 0.010);
  brakeLeverGroup.add(leverRod);

  // Contoured vinyl rubber handle grip
  const gripHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.008, 0.055, 16),
    materials.rubberGripMat
  );
  gripHandle.rotation.x = -Math.PI / 3.2;
  gripHandle.position.set(sideSign * 0.020, 0.082, 0.026);
  brakeLeverGroup.add(gripHandle);

  // Curved serrated steel brake shoe pressing against 24" tire
  const brakeShoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.024, 0.016, 0.014),
    materials.brakeGalvanized
  );
  brakeShoe.position.set(sideSign * 0.018, 0.002, -0.046);
  brakeLeverGroup.add(brakeShoe);

  // Serrated ridges on brake shoe
  for (let r = 0; r < 3; r++) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.002, 0.002),
      materials.sprocketSteel
    );
    ridge.position.set(sideSign * 0.018, 0.005 - r * 0.004, -0.052);
    brakeLeverGroup.add(ridge);
  }

  brakeGroup.add(brakeLeverGroup);
  brakeGroup.userData.leverPivot = brakeLeverGroup;

  // Toggle parking brake method
  brakeGroup.userData.setBrakeLocked = function(locked) {
    brakeLeverGroup.rotation.x = locked ? 0.35 : 0;
  };

  return brakeGroup;
}

// ============================================================================
// 4. FRONT 8" CASTER WHEEL ASSEMBLY (Photos 11.36.46 & 11.38.41)
// Stamped Steel Fork, 5-Spoke Composite Core, Solid Tire, Swivel Headset Bearing
// Supports physical steering trail castoring around the kingpin axis!
// ============================================================================
export function createHighDetailFrontCaster(materials, isLeft = true) {
  const casterGroup = new THREE.Group();
  casterGroup.name = `Front_Caster_Assembly_${isLeft ? 'L' : 'R'}`;

  const CASTER_RADIUS = 0.100; // 8" diameter (radius 100mm)
  const FORK_OFFSET = -0.024; // caster trail offset for realistic steering

  // Swivel Headset & Kingpin (mounts through frame sleeve)
  const headset = new THREE.Group();
  const kingpinStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.12, 16),
    materials.steelHardware
  );
  kingpinStem.position.y = 0.06;
  headset.add(kingpinStem);

  // Top Chrome Castle Nut & Washer
  const topNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.012, 6),
    materials.steelHardware
  );
  topNut.position.y = 0.115;
  headset.add(topNut);

  // Upper & Lower Ball Bearing Dust Ring Seals
  [0.012, 0.095].forEach((yPos) => {
    const seal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.019, 0.006, 24),
      materials.blackComposite
    );
    seal.position.y = yPos;
    headset.add(seal);
  });
  casterGroup.add(headset);

  // Swivel Fork Pivot (Rotates around Y axis for true castoring physics!)
  const swivelFork = new THREE.Group();
  swivelFork.name = `Caster_Swivel_Fork_${isLeft ? 'L' : 'R'}`;
  swivelFork.position.set(0, 0, 0);

  // Fork crown plate
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(0.052, 0.014, 0.040),
    materials.framePaint
  );
  crown.position.set(0, 0.007, 0);
  crown.castShadow = true;
  swivelFork.add(crown);

  // Left & Right Fork Blades offset backward by FORK_OFFSET
  [-0.024, 0.024].forEach((xSide) => {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.007, 0.096, 0.022),
      materials.framePaint
    );
    blade.position.set(xSide, -0.045, FORK_OFFSET);
    blade.castShadow = true;
    swivelFork.add(blade);

    // Axle dropout boss with hole
    const dropout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.008, 16),
      materials.framePaint
    );
    dropout.rotation.z = Math.PI / 2;
    dropout.position.set(xSide, -0.092, FORK_OFFSET);
    swivelFork.add(dropout);
  });

  // 8" Caster Wheel with 5-Spoke Composite Hub (Spins on local X axis!)
  const wheelSpinGroup = new THREE.Group();
  wheelSpinGroup.position.set(0, -0.092, FORK_OFFSET);

  // Solid Rubber Tire (Radius 100mm)
  const casterTire = new THREE.Mesh(
    new THREE.TorusGeometry(0.082, 0.018, 18, 40),
    materials.tireRubber
  );
  casterTire.rotation.y = Math.PI / 2;
  casterTire.castShadow = true;
  wheelSpinGroup.add(casterTire);

  // Composite 5-Spoke Core
  const casterHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.024, 0.034, 24),
    materials.blackComposite
  );
  casterHub.rotation.z = Math.PI / 2;
  wheelSpinGroup.add(casterHub);

  for (let s = 0; s < 5; s++) {
    const sAngle = (s * Math.PI * 2) / 5;
    const casterSpoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.068, 0.009),
      materials.blackComposite
    );
    casterSpoke.position.set(0, Math.cos(sAngle) * 0.042, Math.sin(sAngle) * 0.042);
    casterSpoke.rotation.x = -sAngle;
    wheelSpinGroup.add(casterSpoke);
  }

  // Steel axle bolt with locknut
  const axleBolt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.064, 16),
    materials.steelHardware
  );
  axleBolt.rotation.z = Math.PI / 2;
  wheelSpinGroup.add(axleBolt);

  const axleNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6),
    materials.steelHardware
  );
  axleNut.rotation.z = Math.PI / 2;
  axleNut.position.x = 0.032;
  wheelSpinGroup.add(axleNut);

  swivelFork.add(wheelSpinGroup);
  casterGroup.add(swivelFork);

  casterGroup.userData.swivelFork = swivelFork;
  casterGroup.userData.wheelSpinGroup = wheelSpinGroup;

  return casterGroup;
}

// ============================================================================
// 5. SWING-AWAY FOOTREST & TEXTURED FOOTPLATE (Photos 11.36.46 & 11.38.41)
// Connects firmly to front frame, flip-up footplates extend inward toward center!
// ============================================================================
export function createHighDetailFootrest(materials, isLeft = true) {
  const footrestGroup = new THREE.Group();
  footrestGroup.name = `Footrest_Assembly_${isLeft ? 'L' : 'R'}`;
  const sideSign = isLeft ? 1 : -1;

  // Upper swing-away mounting collar clamped to front frame
  const hingeCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.045, 16),
    materials.framePaint
  );
  footrestGroup.add(hingeCollar);

  const releaseLatch = new THREE.Mesh(
    new THREE.BoxGeometry(0.010, 0.024, 0.014),
    materials.blackComposite
  );
  releaseLatch.position.set(sideSign * 0.018, 0.010, 0.005);
  footrestGroup.add(releaseLatch);

  // Chrome Telescoping Hanger Extension Tube (reaches from frame down toward floor)
  const hangerTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.28, 20),
    materials.frameChrome
  );
  hangerTube.position.set(0, -0.13, 0.05);
  hangerTube.rotation.x = Math.PI / 8.5; // forward rake
  hangerTube.castShadow = true;
  footrestGroup.add(hangerTube);

  // Telescoping height adjustment holes (4 visible holes with silver hardware)
  for (let h = 0; h < 4; h++) {
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0028, 0.0028, 0.024, 10),
      materials.blackComposite
    );
    hole.rotation.z = Math.PI / 2;
    hole.position.set(0, -0.09 - h * 0.026, 0.05 + h * 0.009);
    footrestGroup.add(hole);
  }

  // Height adjustment clamp star knob
  const starKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.016, 6),
    materials.blackComposite
  );
  starKnob.rotation.z = Math.PI / 2;
  starKnob.position.set(sideSign * 0.016, -0.21, 0.08);
  footrestGroup.add(starKnob);

  // Lower Adjustment Collar
  const clampCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.020, 16),
    materials.framePaint
  );
  clampCollar.position.set(0, -0.21, 0.08);
  clampCollar.rotation.x = Math.PI / 8.5;
  footrestGroup.add(clampCollar);

  // Footplate Pivot Joint (rests 5cm above floor)
  const platePivot = new THREE.Group();
  platePivot.position.set(0, -0.25, 0.10);

  // Flip-Up Composite Footplate - Extends INWARD toward center (Healthshine HS809 Spec)
  const plateGeom = new THREE.BoxGeometry(0.14, 0.014, 0.17);
  const footplate = new THREE.Mesh(plateGeom, materials.blackComposite);
  // Negative sideSign moves it inward toward wheelchair centerline!
  footplate.position.set(-sideSign * 0.065, 0, 0.04);
  footplate.rotation.x = -Math.PI / 24;
  footplate.castShadow = true;
  platePivot.add(footplate);

  // Diamond Traction Grid Knurls on Footplate Top (Healthshine HS809 Spec)
  for (let gx = -2; gx <= 2; gx++) {
    for (let gz = -2; gz <= 2; gz++) {
      const knurl = new THREE.Mesh(
        new THREE.ConeGeometry(0.0035, 0.0025, 4),
        materials.blackComposite
      );
      knurl.position.set(
        -sideSign * 0.065 + gx * 0.022,
        0.008,
        0.04 + gz * 0.026
      );
      knurl.rotation.y = Math.PI / 4;
      platePivot.add(knurl);
    }
  }

  // Heel-retaining raised perimeter lip
  const heelLip = new THREE.Mesh(
    new THREE.BoxGeometry(0.136, 0.016, 0.008),
    materials.blackComposite
  );
  heelLip.position.set(-sideSign * 0.065, 0.009, -0.04);
  platePivot.add(heelLip);

  // Authentic Flexible Woven Nylon Heel Loop Strap (catches back of patient shoe)
  const heelLoopGeom = new THREE.TorusGeometry(0.045, 0.0035, 8, 20, Math.PI);
  const heelLoop = new THREE.Mesh(heelLoopGeom, materials.upholsteryCanvas);
  heelLoop.position.set(-sideSign * 0.065, 0.038, -0.04);
  heelLoop.rotation.x = Math.PI / 10;
  platePivot.add(heelLoop);

  footrestGroup.add(platePivot);
  footrestGroup.userData.platePivot = platePivot;

  return footrestGroup;
}

// ============================================================================
// 6. MASTER FLIPKART HEALTHSHINE WHEELCHAIR 3D CHASSIS
// (Exact replica with all details, drop-down backrest, double-X brace,
//  desk armrests, clothes guard skirts, Healthshine badge, and folding logic)
// ============================================================================
export function buildWheelchairChassis(materials) {
  const root = new THREE.Group();
  root.name = "Healthshine_Wheelchair_Master";

  // Flipkart Dimensions (in meters)
  const OPEN_WIDTH = 0.66; // 66 cm
  const FOLDED_WIDTH = 0.23; // 23 cm
  const SEAT_WIDTH = 0.46; // 46 cm
  const HALF_W = SEAT_WIDTH / 2; // 0.23m
  const FOLDED_HALF_W = 0.082; // folded frame half-width

  const REAR_AXLE_X = 0.33; // 66cm / 2
  const REAR_AXLE_Y = 0.305; // 24" wheel radius = 305mm
  const REAR_AXLE_Z = -0.18;

  const FRONT_CASTER_X = 0.25;
  const FRONT_CASTER_Y = 0.100; // 8" caster radius = 100mm
  const FRONT_CASTER_Z = 0.32;

  // Pitch and Roll Dynamic Suspension Parent (tilts under acceleration & braking!)
  const dynamicBody = new THREE.Group();
  dynamicBody.name = "Dynamic_Suspension_Chassis";
  root.add(dynamicBody);

  // Left & Right Side Frame Assemblies (Move inward smoothly during folding)
  const leftSideGroup = new THREE.Group();
  leftSideGroup.name = "Chassis_Side_Frame_Left";

  const rightSideGroup = new THREE.Group();
  rightSideGroup.name = "Chassis_Side_Frame_Right";

  // Build each side frame with photographic accuracy
  [-1, 1].forEach((side) => {
    const isLeft = side > 0;
    const sideGroup = isLeft ? leftSideGroup : rightSideGroup;

    // 1. Lower Longitudinal Frame Tube (Mandrel bent steel tube)
    const lowerTubeGeom = new THREE.CylinderGeometry(0.013, 0.013, FRONT_CASTER_Z - (REAR_AXLE_Z - 0.08), 24);
    const lowerTube = new THREE.Mesh(lowerTubeGeom, materials.framePaint);
    lowerTube.rotation.x = Math.PI / 2;
    lowerTube.position.set(0, 0.18, (FRONT_CASTER_Z + (REAR_AXLE_Z - 0.08)) / 2);
    lowerTube.castShadow = true;
    sideGroup.add(lowerTube);

    // Front Caster Headset Sleeve Tube (Welded vertically at front)
    const casterSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.10, 24),
      materials.framePaint
    );
    casterSleeve.position.set(0, 0.23, FRONT_CASTER_Z);
    casterSleeve.castShadow = true;
    sideGroup.add(casterSleeve);

    // Chrome Headset Dust Cap on top of Caster Sleeve
    const sleeveCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0175, 0.0175, 0.008, 20),
      materials.frameChrome
    );
    sleeveCap.position.set(0, 0.282, FRONT_CASTER_Z);
    sideGroup.add(sleeveCap);

    // Front curved connector between lower tube and caster sleeve
    const frontElbow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.08, 16),
      materials.framePaint
    );
    frontElbow.rotation.x = Math.PI / 4;
    frontElbow.position.set(0, 0.20, FRONT_CASTER_Z - 0.03);
    sideGroup.add(frontElbow);

    // Front protective domed rubber bumper plug at tip of lower tube (Healthshine HS809 Spec)
    const frontBumperPlug = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      materials.blackComposite
    );
    frontBumperPlug.rotation.x = Math.PI / 2;
    frontBumperPlug.position.set(0, 0.18, FRONT_CASTER_Z + 0.02);
    sideGroup.add(frontBumperPlug);

    // 2. Upper Side Frame Horizontal Tube & Molded Nylon Saddle Cradles
    // Rigid chassis tube connecting rear upright post to front caster headset
    const upperSideTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.46, 24),
      materials.framePaint
    );
    upperSideTube.rotation.x = Math.PI / 2;
    upperSideTube.position.set(0, 0.455, 0.07);
    upperSideTube.castShadow = true;
    sideGroup.add(upperSideTube);

    // Molded Nylon Saddle Cradles (Front & Rear)
    // In real wheelchairs, the Seat Guide Rods sit nested inside these concave cradles.
    // When folded, the rods lift upwards out of these cradles by +23.1 cm!
    const saddleGroup = new THREE.Group();
    saddleGroup.name = `Saddle_Cradles_${isLeft ? 'L' : 'R'}`;

    [-0.12, 0.26].forEach((zPos) => {
      const cradleBlock = new THREE.Group();
      cradleBlock.position.set(0, 0.465, zPos);

      // Base bracket clamping onto frame tube
      const cradleBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.026, 0.016, 0.038),
        materials.blackComposite
      );
      cradleBase.castShadow = true;
      cradleBlock.add(cradleBase);

      // Contoured concave cradle lips (forming a U-channel for the Ø22mm seat rod)
      const leftLip = new THREE.Mesh(
        new THREE.BoxGeometry(0.005, 0.016, 0.038),
        materials.blackComposite
      );
      leftLip.position.set(0.011, 0.008, 0);
      cradleBlock.add(leftLip);

      const rightLip = new THREE.Mesh(
        new THREE.BoxGeometry(0.005, 0.016, 0.038),
        materials.blackComposite
      );
      rightLip.position.set(-0.011, 0.008, 0);
      cradleBlock.add(rightLip);

      // Steel attachment through-bolt underneath
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0035, 0.028, 12),
        materials.steelHardware
      );
      bolt.position.set(0, -0.010, 0);
      cradleBlock.add(bolt);

      saddleGroup.add(cradleBlock);
    });
    sideGroup.add(saddleGroup);
    sideGroup.userData.saddleGroup = saddleGroup;

    // 3. Vertical Rear Upright Lower Tube
    const rearLowerUpright = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.35, 24),
      materials.framePaint
    );
    rearLowerUpright.position.set(0, 0.325, REAR_AXLE_Z);
    rearLowerUpright.castShadow = true;
    sideGroup.add(rearLowerUpright);

    // Welded Axle Mounting Boss Plate (holds axle bolt firmly)
    const axlePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.065, 0.045),
      materials.framePaint
    );
    axlePlate.position.set(side * 0.010, REAR_AXLE_Y, REAR_AXLE_Z);
    sideGroup.add(axlePlate);

    const axleBushing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.017, 0.038, 24),
      materials.steelHardware
    );
    axleBushing.rotation.z = Math.PI / 2;
    axleBushing.position.set(side * 0.018, REAR_AXLE_Y, REAR_AXLE_Z);
    sideGroup.add(axleBushing);

    // 4. Rear Anti-Tip Extension / Tipping Lever (for step curbs)
    const antiTipTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.24, 20),
      materials.framePaint
    );
    antiTipTube.rotation.x = Math.PI / 2.3;
    antiTipTube.position.set(0, 0.11, REAR_AXLE_Z - 0.11);
    sideGroup.add(antiTipTube);

    const antiTipRubber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.045, 16),
      materials.rubberGripMat
    );
    antiTipRubber.rotation.x = Math.PI / 2.3;
    antiTipRubber.position.set(0, 0.042, REAR_AXLE_Z - 0.20);
    sideGroup.add(antiTipRubber);

    // 5. Diagonal Truss Reinforcement Strut
    const diagStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.38, 20),
      materials.framePaint
    );
    diagStrut.rotation.x = -Math.PI / 4.2;
    diagStrut.position.set(0, 0.33, FRONT_CASTER_Z - 0.12);
    diagStrut.castShadow = true;
    sideGroup.add(diagStrut);

    // 6. Folding Backrest Drop-Down Upper Post (Folds forward 80° for transport)
    const backrestPostGroup = new THREE.Group();
    backrestPostGroup.name = `Backrest_Post_${isLeft ? 'L' : 'R'}`;
    backrestPostGroup.position.set(0, 0.50, REAR_AXLE_Z);

    // Die-cast folding hinge knuckle & silver release lever (Photo 11.38.41)
    const hingeKnuckle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.036, 20),
      materials.steelHardware
    );
    hingeKnuckle.rotation.z = Math.PI / 2;
    backrestPostGroup.add(hingeKnuckle);

    const hingeReleaseLever = new THREE.Mesh(
      new THREE.BoxGeometry(0.010, 0.032, 0.014),
      materials.badgeSilver
    );
    hingeReleaseLever.position.set(-side * 0.018, 0.012, -0.012);
    backrestPostGroup.add(hingeReleaseLever);

    // Upper backrest tube extending up to push handle (Height 0.88m)
    const backrestUpperTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.38, 20),
      materials.framePaint
    );
    backrestUpperTube.position.set(0, 0.19, 0);
    backrestUpperTube.castShadow = true;
    backrestPostGroup.add(backrestUpperTube);

    // Push Handle Bend (angled backward ~35°)
    const handleBend = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.14, 20),
      materials.framePaint
    );
    handleBend.rotation.x = -Math.PI / 3.2;
    handleBend.position.set(0, 0.39, -0.055);
    backrestPostGroup.add(handleBend);

    // Ergonomic Contoured Rubber Finger-Grip with Flange
    const handleGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.015, 0.11, 24),
      materials.rubberGripMat
    );
    handleGrip.rotation.x = -Math.PI / 3.2;
    handleGrip.position.set(0, 0.42, -0.095);
    backrestPostGroup.add(handleGrip);

    // Grip safety flange
    const gripFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.006, 24),
      materials.rubberGripMat
    );
    gripFlange.rotation.x = -Math.PI / 3.2;
    gripFlange.position.set(0, 0.38, -0.05);
    backrestPostGroup.add(gripFlange);

    sideGroup.add(backrestPostGroup);
    sideGroup.userData.backrestPost = backrestPostGroup;

    // 7. Desk-Length Armrest & Molded Clothes-Guard Skirt (Photos 11.38.38 & 11.38.41)
    const armrestGroup = new THREE.Group();
    armrestGroup.name = `Armrest_Desk_${isLeft ? 'L' : 'R'}`;

    // Armrest tubular uprights
    const armFront = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.22, 16), materials.framePaint);
    armFront.position.set(0, 0.59, 0.16);
    const armRear = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.22, 16), materials.framePaint);
    armRear.position.set(0, 0.59, -0.10);
    const armRail = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.28, 16), materials.framePaint);
    armRail.rotation.x = Math.PI / 2;
    armRail.position.set(0, 0.70, 0.03);

    armrestGroup.add(armFront);
    armrestGroup.add(armRear);
    armrestGroup.add(armRail);

    // Padded Faux-Leather Desk-Length Cushion (Desk cut-away style)
    const armPadGeom = new THREE.BoxGeometry(0.055, 0.032, 0.27);
    const armPad = new THREE.Mesh(armPadGeom, materials.armrestPadLeather);
    armPad.position.set(0, 0.72, 0.03);
    armPad.castShadow = true;
    armrestGroup.add(armPad);

    // Molded Black ABS Clothes-Guard / Skirt Splash Guard (Photo 11.38.41)
    const skirtShape = new THREE.Shape();
    skirtShape.moveTo(-0.16, -0.13);
    skirtShape.lineTo(0.16, -0.13);
    skirtShape.lineTo(0.16, 0.08);
    skirtShape.lineTo(-0.16, 0.12);
    skirtShape.closePath();

    const skirtGeom = new THREE.ShapeGeometry(skirtShape);
    const skirtMesh = new THREE.Mesh(skirtGeom, materials.skirtGuardMat);
    skirtMesh.rotation.y = Math.PI / 2;
    skirtMesh.position.set(side * 0.016, 0.58, 0.03);
    armrestGroup.add(skirtMesh);

    // Oval Healthshine Brand Emblem Badge on Skirt Guard (Photo 11.38.41)
    const badgeGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.003, 24);
    badgeGeom.scale(1.8, 1, 1);
    const badgeMesh = new THREE.Mesh(badgeGeom, materials.badgeSilver);
    badgeMesh.rotation.z = Math.PI / 2;
    badgeMesh.position.set(side * 0.019, 0.56, -0.04);
    armrestGroup.add(badgeMesh);

    const badgeDot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16),
      materials.brandCyan
    );
    badgeDot.rotation.z = Math.PI / 2;
    badgeDot.position.set(side * 0.020, 0.56, -0.04);
    armrestGroup.add(badgeDot);

    sideGroup.add(armrestGroup);

    // 8. Front 8" Caster Assembly (Aligned firmly with caster sleeve)
    const frontCaster = createHighDetailFrontCaster(materials, isLeft);
    frontCaster.position.set(0, FRONT_CASTER_Y + 0.092, FRONT_CASTER_Z);
    sideGroup.add(frontCaster);
    sideGroup.userData.casterAssembly = frontCaster;

    // 9. Swing-Away Footrest & Inward Diamond Traction Footplate (Photos 11.36.46 & 11.38.41)
    const footrest = createHighDetailFootrest(materials, isLeft);
    footrest.position.set(0, 0.28, FRONT_CASTER_Z + 0.02);
    sideGroup.add(footrest);
    sideGroup.userData.footrest = footrest;

    // 10. Manual tire friction brake removed as requested:
    // Motorized autonomous wheelchair uses dual BTS7960 dynamic regenerative electronic braking.
    sideGroup.userData.parkingBrake = null;

    // 11. Ultra-Detailed Rear 24" Mag Wheel Assembly (With 16T Sprocket)
    const rearWheel = createHighDetailRearWheel(materials, isLeft);
    rearWheel.position.set(side * 0.075, REAR_AXLE_Y, REAR_AXLE_Z);
    sideGroup.add(rearWheel);
    sideGroup.userData.rearWheel = rearWheel;
  });

  // Position left and right side frames at 66 cm open width
  leftSideGroup.position.set(HALF_W, 0, 0);
  rightSideGroup.position.set(-HALF_W, 0, 0);

  dynamicBody.add(leftSideGroup);
  dynamicBody.add(rightSideGroup);

  // ==========================================================================
  // CENTRAL LINKAGE: DOUBLE-X FOLDING SCISSOR BRACE & RISING SEAT RODS
  // (Photos 11.36.45 & 11.36.46 + YouTube Reference 2Sh5vy-yHYw)
  // Scissor cross-brace lifts the tubular seat rods UPWARD out of the side frame
  // nylon saddle cradles by +23.1 cm, forming an authentic inverted-V canvas tent-fold!
  // ==========================================================================
  const centerStructure = new THREE.Group();
  centerStructure.name = "Central_Folding_Linkage";

  // Scissor Kinematic Constants (Exact Pythagorean constraints)
  const BASE_Y = 0.18; // bottom pivot height on lower longitudinal side rails
  const REST_SEAT_Y = 0.48; // open position seat rod height resting in nylon cradles
  const REST_SPAN_Y = REST_SEAT_Y - BASE_Y; // 0.30m vertical span when open
  const SCISSOR_L = Math.hypot(SEAT_WIDTH, REST_SPAN_Y); // 0.54918m fixed bar length

  // Double-X Tubular Scissor Bracing (Dual parallel bars front & rear)
  const xBraceGroup = new THREE.Group();
  xBraceGroup.name = "Double_X_Folding_Mechanism";
  xBraceGroup.position.set(0, 0.33, 0); // resting central pivot at 0.33m

  const braceBars = [];
  [-0.08, 0.08].forEach((zOffset) => {
    // Scissor Bar 1 (slopes left-to-right)
    const b1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, SCISSOR_L, 20),
      materials.framePaint
    );
    b1.position.set(0, 0, zOffset);
    b1.castShadow = true;
    xBraceGroup.add(b1);
    braceBars.push(b1);

    // Scissor Bar 2 (slopes right-to-left)
    const b2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, SCISSOR_L, 20),
      materials.framePaint
    );
    b2.position.set(0, 0, zOffset);
    b2.castShadow = true;
    xBraceGroup.add(b2);
    braceBars.push(b2);

    // Hardened central pivot bolt with chrome nut
    const pivotBolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.038, 16),
      materials.steelHardware
    );
    pivotBolt.rotation.x = Math.PI / 2;
    pivotBolt.position.set(0, 0, zOffset);
    xBraceGroup.add(pivotBolt);
  });
  centerStructure.add(xBraceGroup);

  // --------------------------------------------------------------------------
  // DYNAMIC RISING SEAT GUIDE RODS (Left & Right)
  // Pinned directly to the top tips of the X-scissor cross braces!
  // These sit resting inside the nylon saddle cradles when open, and LIFT UP
  // by +23.1 cm when folded!
  // --------------------------------------------------------------------------
  function buildSeatRailGroup(isLeft) {
    const railGroup = new THREE.Group();
    railGroup.name = isLeft ? "Seat_Guide_Rod_L" : "Seat_Guide_Rod_R";

    // Chrome Seat Rail Tube (Ø22mm x 480mm long)
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.48, 24),
      materials.frameChrome
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.set(0, 0, 0.07);
    rail.castShadow = true;
    railGroup.add(rail);

    // Molded Plastic End Caps on Seat Rail (front and back)
    [-0.17, 0.31].forEach((zEnd) => {
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0125, 0.0125, 0.018, 16),
        materials.blackComposite
      );
      cap.rotation.x = Math.PI / 2;
      cap.position.set(0, 0, zEnd);
      railGroup.add(cap);
    });

    // Scissor Hinge Clevis Brackets (underneath rail at z = -0.08, +0.08)
    [-0.08, 0.08].forEach((zBrk) => {
      const clevis = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, 0.018, 0.022),
        materials.steelHardware
      );
      clevis.position.set(0, -0.014, zBrk);
      railGroup.add(clevis);

      const clevisPin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.028, 12),
        materials.steelHardware
      );
      clevisPin.rotation.x = Math.PI / 2;
      clevisPin.position.set(0, -0.018, zBrk);
      railGroup.add(clevisPin);
    });

    // Grommet Eyelets along Seat Rails
    for (let g = 0; g < 6; g++) {
      const zGrommet = -0.12 + g * 0.075;
      const grommet = new THREE.Mesh(
        new THREE.TorusGeometry(0.005, 0.0018, 8, 16),
        materials.steelHardware
      );
      grommet.rotation.x = Math.PI / 2;
      grommet.position.set(isLeft ? -0.008 : 0.008, 0.004, zGrommet);
      railGroup.add(grommet);
    }

    return railGroup;
  }

  const leftSeatRail = buildSeatRailGroup(true);
  leftSeatRail.position.set(HALF_W, REST_SEAT_Y, 0);
  centerStructure.add(leftSeatRail);

  const rightSeatRail = buildSeatRailGroup(false);
  rightSeatRail.position.set(-HALF_W, REST_SEAT_Y, 0);
  centerStructure.add(rightSeatRail);

  // --------------------------------------------------------------------------
  // CENTER "LIFT TO FOLD" WEBBING GRAB STRAP
  // Heavy-duty webbing strap pulled upward to initiate wheelchair folding!
  // --------------------------------------------------------------------------
  const liftStrapGroup = new THREE.Group();
  liftStrapGroup.name = "Lift_To_Fold_Grab_Strap";

  const strapWebbing = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.005, 0.040),
    materials.blackComposite
  );
  liftStrapGroup.add(strapWebbing);

  // Center High-Visibility Woven Warning Tag
  const strapTag = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.007, 0.026),
    materials.brandCyan
  );
  strapTag.position.y = 0.002;
  liftStrapGroup.add(strapTag);

  // Chrome reinforcement rivets
  [-0.075, 0.075].forEach((rx) => {
    const rivet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.008, 12),
      materials.steelHardware
    );
    rivet.position.set(rx, 0.003, 0);
    liftStrapGroup.add(rivet);
  });

  liftStrapGroup.position.set(0, REST_SEAT_Y + 0.006, 0.07);
  centerStructure.add(liftStrapGroup);

  // --------------------------------------------------------------------------
  // DYNAMIC THICK SEAT CANVAS (Inverted-V Tent Fold with Realistic Thickness)
  // Dual-ply ballistic padded nylon with stitched perimeter edge welting:
  // - Top fabric surface + Bottom fabric surface (separated by 7mm padded thickness)
  // - Open: gentle 16mm parabolic sag under gravity
  // - Folding: central ridge rises +5.5cm forming authentic inverted-V tent peak
  // --------------------------------------------------------------------------
  const SEAT_X_SEGS = 24;
  const SEAT_Y_SEGS = 12;
  const seatSlingGeom = new THREE.PlaneGeometry(1.0, 0.45, SEAT_X_SEGS, SEAT_Y_SEGS);
  const seatSling = new THREE.Mesh(seatSlingGeom, materials.upholsteryCanvas);
  seatSling.castShadow = true;
  centerStructure.add(seatSling);

  // Bottom fabric ply for realistic 7mm padded thickness
  const seatBottomGeom = new THREE.PlaneGeometry(1.0, 0.45, SEAT_X_SEGS, SEAT_Y_SEGS);
  const seatBottom = new THREE.Mesh(seatBottomGeom, materials.upholsteryCanvas);
  centerStructure.add(seatBottom);

  // Front & rear perimeter welt edge beading (thick sewn canvas hem)
  const seatFrontHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0045, 1.0, 16),
    materials.blackComposite
  );
  seatFrontHem.rotation.z = Math.PI / 2;
  centerStructure.add(seatFrontHem);

  const seatRearHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.0045, 1.0, 16),
    materials.blackComposite
  );
  seatRearHem.rotation.z = Math.PI / 2;
  centerStructure.add(seatRearHem);

  function updateSeatCanvasVertices(p, currentHalfW, seatY) {
    const posTop = seatSlingGeom.attributes.position;
    const posBottom = seatBottomGeom.attributes.position;
    let idx = 0;
    for (let iy = 0; iy <= SEAT_Y_SEGS; iy++) {
      const vY = 0.225 - (iy / SEAT_Y_SEGS) * 0.45;
      const zPos = 0.07 + vY;

      for (let ix = 0; ix <= SEAT_X_SEGS; ix++) {
        const u = -1.0 + (ix / SEAT_X_SEGS) * 2.0; // -1 at right (-currentHalfW), +1 at left (+currentHalfW)
        const xPos = u * currentHalfW;

        const tentFactor = 1.0 - Math.abs(u); // 0 at rails, 1 at center ridge
        const sag = (1.0 - u * u) * 0.016 * (1.0 - p);
        const tentRise = tentFactor * (p * 0.055);
        const yTop = seatY + tentRise - sag;
        const yBottom = yTop - 0.007; // 7mm thick padded canvas core

        posTop.setXYZ(idx, xPos, yTop, zPos);
        posBottom.setXYZ(idx, xPos, yBottom, zPos);
        idx++;
      }
    }
    posTop.needsUpdate = true;
    posBottom.needsUpdate = true;
    seatSlingGeom.computeVertexNormals();
    seatBottomGeom.computeVertexNormals();

    // Scale and position front & rear edge hem welts
    const spanW = currentHalfW * 2;
    seatFrontHem.scale.set(1, spanW, 1);
    seatFrontHem.position.set(0, seatY + p * 0.028 - 0.003, 0.07 + 0.225);
    seatRearHem.scale.set(1, spanW, 1);
    seatRearHem.position.set(0, seatY + p * 0.028 - 0.003, 0.07 - 0.225);
  }

  // Initialize seat canvas in open resting position
  updateSeatCanvasVertices(0, HALF_W, REST_SEAT_Y);

  // --------------------------------------------------------------------------
  // DYNAMIC THICK BACKREST CANVAS (Vertical V-Fold Crease Bending)
  // Dual-ply heavy ballistic nylon canvas with internal high-density foam padding:
  // - Front fabric layer + Rear fabric layer (separated by 6mm thickness)
  // - Vertical posts remain solidly UPRIGHT (no forward 80° drop)
  // - As posts slide inward from 46cm to 14cm, the fixed 46cm fabric physically
  //   bends backward along its vertical center axis forming an authentic V-pleat!
  // --------------------------------------------------------------------------
  const BACK_X_SEGS = 24;
  const BACK_Y_SEGS = 16;
  const backFrontGeom = new THREE.PlaneGeometry(1.0, 0.42, BACK_X_SEGS, BACK_Y_SEGS);
  const backFrontMesh = new THREE.Mesh(backFrontGeom, materials.upholsteryCanvas);
  backFrontMesh.castShadow = true;
  centerStructure.add(backFrontMesh);

  const backRearGeom = new THREE.PlaneGeometry(1.0, 0.42, BACK_X_SEGS, BACK_Y_SEGS);
  const backRearMesh = new THREE.Mesh(backRearGeom, materials.upholsteryCanvas);
  centerStructure.add(backRearMesh);

  // Top & bottom thick reinforced seam piping
  const backTopHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1.0, 16),
    materials.blackComposite
  );
  backTopHem.rotation.z = Math.PI / 2;
  centerStructure.add(backTopHem);

  const backBottomHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1.0, 16),
    materials.blackComposite
  );
  backBottomHem.rotation.z = Math.PI / 2;
  centerStructure.add(backBottomHem);

  // High-Resolution Embroidered Healthshine Brand Patch
  const logoPatchMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.07),
    materials.logoMaterial
  );
  logoPatchMesh.position.set(0, 0.72, REAR_AXLE_Z + 0.004);
  centerStructure.add(logoPatchMesh);

  // Rear Document / Storage Pouch on back face of backrest
  const rearPocketGeom = new THREE.PlaneGeometry(0.36, 0.24, 16, 8);
  const rearPocket = new THREE.Mesh(rearPocketGeom, materials.upholsteryCanvas);
  centerStructure.add(rearPocket);

  const pocketFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.028, 0.012),
    materials.blackComposite
  );
  pocketFlap.position.set(0, 0.765, REAR_AXLE_Z - 0.010);
  centerStructure.add(pocketFlap);

  // Safety Lap Seatbelt with Side-Squeeze Buckle lying across seat
  const seatbelt = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.003, 0.036),
    materials.blackComposite
  );
  seatbelt.position.set(0, 0.488, 0.05);
  centerStructure.add(seatbelt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.010, 0.040),
    materials.blackComposite
  );
  buckle.position.set(0, 0.493, 0.05);
  centerStructure.add(buckle);

  // Woven Calf Support Band across Front Hangers
  const calfBand = new THREE.Mesh(
    new THREE.BoxGeometry(SEAT_WIDTH, 0.065, 0.004),
    materials.upholsteryCanvas
  );
  calfBand.position.set(0, 0.22, FRONT_CASTER_Z + 0.04);
  centerStructure.add(calfBand);

  function updateBackCanvasVertices(p, currentHalfW) {
    const posFront = backFrontGeom.attributes.position;
    const posRear = backRearGeom.attributes.position;
    const posPock = rearPocketGeom.attributes.position;

    // Pythagorean backward fold displacement of fabric centerline:
    // Fixed half-width 0.23m bends backward as post moves from 0.23m to currentHalfW (0.07m):
    const foldDepth = Math.sqrt(Math.max(0, HALF_W * HALF_W - currentHalfW * currentHalfW));

    let idx = 0;
    for (let iy = 0; iy <= BACK_Y_SEGS; iy++) {
      const vY = (iy / BACK_Y_SEGS) * 0.42;
      const yPos = 0.48 + vY; // Spans 0.48m to 0.90m height

      for (let ix = 0; ix <= BACK_X_SEGS; ix++) {
        const u = -1.0 + (ix / BACK_X_SEGS) * 2.0; // -1 at right (-currentHalfW), +1 at left (+currentHalfW)
        const xPos = u * currentHalfW;

        // Smooth V-crease profile bending backward
        const bend = Math.pow(1.0 - Math.abs(u), 1.25);
        const naturalHollow = (1.0 - u * u) * 0.008 * (1.0 - p);
        const zMid = REAR_AXLE_Z - naturalHollow - bend * foldDepth;

        // 6mm thick padded fabric separation
        posFront.setXYZ(idx, xPos, yPos, zMid + 0.003);
        posRear.setXYZ(idx, xPos, yPos, zMid - 0.003);
        idx++;
      }
    }
    posFront.needsUpdate = true;
    posRear.needsUpdate = true;
    backFrontGeom.computeVertexNormals();
    backRearGeom.computeVertexNormals();

    // Update rear pocket vertices to conform to the backward fold
    let pIdx = 0;
    for (let py = 0; py <= 8; py++) {
      const yP = 0.52 + (py / 8) * 0.24;
      for (let px = 0; px <= 16; px++) {
        const uP = -1.0 + (px / 16) * 2.0;
        const xP = uP * (currentHalfW * 0.85);
        const bendP = Math.pow(1.0 - Math.abs(uP), 1.25);
        const zP = REAR_AXLE_Z - bendP * (foldDepth * 0.85) - 0.008;
        posPock.setXYZ(pIdx, xP, yP, zP);
        pIdx++;
      }
    }
    posPock.needsUpdate = true;
    rearPocketGeom.computeVertexNormals();

    // Logo patch and top/bottom seam welts
    const spanW = currentHalfW * 2;
    const centerFoldZ = REAR_AXLE_Z - foldDepth;

    logoPatchMesh.position.set(0, 0.72, centerFoldZ + 0.006);
    logoPatchMesh.scale.x = THREE.MathUtils.lerp(1.0, 0.35, p);

    pocketFlap.position.set(0, 0.765, centerFoldZ - 0.008);
    pocketFlap.scale.x = THREE.MathUtils.lerp(1.0, 0.35, p);

    backTopHem.scale.set(1, spanW, 1);
    backTopHem.position.set(0, 0.90, REAR_AXLE_Z - foldDepth * 0.5);

    backBottomHem.scale.set(1, spanW, 1);
    backBottomHem.position.set(0, 0.48, REAR_AXLE_Z - foldDepth * 0.5);
  }

  // Initialize backrest canvas in open position
  updateBackCanvasVertices(0, HALF_W);

  dynamicBody.add(centerStructure);

  // ==========================================================================
  // FOLDING KINEMATICS ANIMATION (0 = 66cm Open, 1 = 25.5cm Fully Folded)
  // Exact scissor lift: seat rods lift UP out of nylon frame cradles by +23.1 cm!
  // Backrest posts remain solidly UPRIGHT; backrest canvas V-pleats backward.
  // Footplates flip UP 90°.
  // ==========================================================================
  function setFoldingProgress(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);

    // 1. Move left and right side frames inward
    const currentHalfW = THREE.MathUtils.lerp(HALF_W, FOLDED_HALF_W, p);
    leftSideGroup.position.x = currentHalfW;
    rightSideGroup.position.x = -currentHalfW;

    // 2. Exact Pythagorean Scissor Lift Trigonometry
    const currentWidth = currentHalfW * 2;
    const spanY = Math.sqrt(Math.max(0.01, SCISSOR_L * SCISSOR_L - currentWidth * currentWidth));
    const seatY = BASE_Y + spanY; // Rises from 0.480m to 0.711m (+23.1 cm lift!)
    const pivotY = BASE_Y + spanY / 2; // Rises from 0.330m to 0.446m
    const theta = Math.atan2(currentWidth, spanY); // Strut angle steepens from 56.9° to 14.8°

    // Move central scissor pivot vertically
    xBraceGroup.position.y = pivotY;

    // Rotate scissor struts to keep tips pinned exactly to base and seat rods
    braceBars.forEach((bar, idx) => {
      bar.rotation.z = (idx % 2 === 0 ? -1 : 1) * theta;
    });

    // 3. Dynamic Rising Seat Guide Rods (Lifting out of frame nylon cradles!)
    leftSeatRail.position.set(currentHalfW, seatY, 0);
    rightSeatRail.position.set(-currentHalfW, seatY, 0);

    // 4. Center "LIFT TO FOLD" Grab Strap (rises with center canvas tent peak)
    liftStrapGroup.position.set(0, seatY + p * 0.055 + 0.005, 0.07);

    // 5. Dynamic Inverted-V Canvas Tent-Fold Vertex Morph (Thick Dual-Ply Fabric)
    updateSeatCanvasVertices(p, currentHalfW, seatY);

    // 6. Dynamic Thick Backrest Fabric V-Fold (Vertical crease bends backward)
    updateBackCanvasVertices(p, currentHalfW);

    // 7. Backrest posts remain solidly UPRIGHT (no forward drop)
    if (leftSideGroup.userData.backrestPost) {
      leftSideGroup.userData.backrestPost.rotation.x = 0;
    }
    if (rightSideGroup.userData.backrestPost) {
      rightSideGroup.userData.backrestPost.rotation.x = 0;
    }

    // 8. Flip Footplates UP 90° during initial folding phase (p: 0 -> 0.4)
    const footplateFlip = Math.min(1.0, p * 2.5) * (Math.PI / 2);
    if (leftSideGroup.userData.footrest && leftSideGroup.userData.footrest.userData.platePivot) {
      leftSideGroup.userData.footrest.userData.platePivot.rotation.z = footplateFlip;
    }
    if (rightSideGroup.userData.footrest && rightSideGroup.userData.footrest.userData.platePivot) {
      rightSideGroup.userData.footrest.userData.platePivot.rotation.z = -footplateFlip;
    }

    // 9. Lap Seatbelt and Calf Band adjust to folding span
    seatbelt.scale.x = THREE.MathUtils.lerp(1.0, 0.30, p);
    seatbelt.position.y = seatY + 0.01;
    calfBand.scale.x = THREE.MathUtils.lerp(1.0, 0.30, p);
    calfBand.position.y = 0.22 - p * 0.045; // Real natural sagging drape as hangers move inward!
  }

  return {
    root,
    wheelchairGroup: root,
    dynamicBody,
    leftSideGroup,
    rightSideGroup,
    centerStructure,
    leftRearWheel: leftSideGroup.userData.rearWheel,
    rightRearWheel: rightSideGroup.userData.rearWheel,
    leftWheelSpin: leftSideGroup.userData.rearWheel.userData.spinGroup,
    rightWheelSpin: rightSideGroup.userData.rearWheel.userData.spinGroup,
    leftSprocket: leftSideGroup.userData.rearWheel.userData.sprocket,
    rightSprocket: rightSideGroup.userData.rearWheel.userData.sprocket,
    leftCaster: leftSideGroup.userData.casterAssembly,
    rightCaster: rightSideGroup.userData.casterAssembly,
    leftCasterSwivel: leftSideGroup.userData.casterAssembly.userData.swivelFork,
    rightCasterSwivel: rightSideGroup.userData.casterAssembly.userData.swivelFork,
    leftCasterSpin: leftSideGroup.userData.casterAssembly.userData.wheelSpinGroup,
    rightCasterSpin: rightSideGroup.userData.casterAssembly.userData.wheelSpinGroup,
    leftBrake: leftSideGroup.userData.parkingBrake,
    rightBrake: rightSideGroup.userData.parkingBrake,
    leftSeatRail,
    rightSeatRail,
    liftStrapGroup,
    setFoldingProgress,
    dimensions: {
      openWidth: OPEN_WIDTH,
      foldedWidth: FOLDED_WIDTH,
      seatWidth: SEAT_WIDTH,
      rearAxleX: REAR_AXLE_X,
      rearAxleY: REAR_AXLE_Y,
      rearAxleZ: REAR_AXLE_Z,
      frontCasterX: FRONT_CASTER_X,
      frontCasterY: FRONT_CASTER_Y,
      frontCasterZ: FRONT_CASTER_Z,
    }
  };
}
