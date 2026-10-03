import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createMaterials, buildWheelchairChassis } from './wheelchairModel.js';
import { createAutonomousKit } from './autonomousKit.js';
import { WheelchairPhysics } from './wheelchairPhysics.js';

// Setup Application & Container
const container = document.getElementById('canvas-container');

// 1. Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080a0f);
scene.fog = new THREE.FogExp2(0x080a0f, 0.025);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.02, 100);
camera.position.set(1.45, 1.05, 1.55);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

// 2. OrbitControls (Extreme Close-Up Zoom Down to 15cm)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.01; // Stay above ground
controls.minDistance = 0.15; // 15 cm - zoom right up against sprocket teeth and hub bolts
controls.maxDistance = 12.0;
controls.target.set(0, 0.40, 0.02);

// 3. GTA 6 Automotive Studio 5-Point Lighting Rig
// Key Directional Light (Warm sunlight/studio key with crisp contact shadows)
const keyLight = new THREE.DirectionalLight(0xfffaee, 2.5);
keyLight.position.set(2.8, 4.2, 2.2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.2;
keyLight.shadow.camera.far = 20;
keyLight.shadow.bias = -0.0003;
const shadowDist = 2.2;
keyLight.shadow.camera.left = -shadowDist;
keyLight.shadow.camera.right = shadowDist;
keyLight.shadow.camera.top = shadowDist;
keyLight.shadow.camera.bottom = -shadowDist;
scene.add(keyLight);

// Fill Light (Soft cool diffuse fill)
const fillLight = new THREE.DirectionalLight(0xd2e4f8, 1.15);
fillLight.position.set(-3.0, 2.6, 2.0);
scene.add(fillLight);

// GTA 6 Specular Rim Light 1 (Cyan Neon Backlight - Highlights frame curvature, mag spokes, handrim)
const rimLightCyan = new THREE.DirectionalLight(0x00f0ff, 3.2);
rimLightCyan.position.set(-3.2, 2.2, -3.2);
scene.add(rimLightCyan);

// GTA 6 Specular Rim Light 2 (Warm Amber Backlight - Glints off bronze sprocket teeth and hardware)
const rimLightAmber = new THREE.DirectionalLight(0xff9f33, 2.2);
rimLightAmber.position.set(3.0, 1.8, -3.0);
scene.add(rimLightAmber);

// Overhead Studio Softbox (Even illumination across seat canvas, armrests, and grips)
const softboxLight = new THREE.DirectionalLight(0xffffff, 1.0);
softboxLight.position.set(0, 5.0, 0);
scene.add(softboxLight);

// Hemisphere Ambient Bounce (Rich contrast without muddy black shadow clipping)
const hemiLight = new THREE.HemisphereLight(0x283548, 0x080a0f, 0.85);
scene.add(hemiLight);

// 4. GTA 6 Ground Grid & Expansive Driving Arena (80m x 80m)
const groundGroup = new THREE.Group();
groundGroup.name = "GTA6_Studio_Ground_Environment";

// A. Reflective Studio Floor Plate
const floorGeom = new THREE.PlaneGeometry(80, 80);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x090b10,
  roughness: 0.36,
  metalness: 0.55,
});
const floorMesh = new THREE.Mesh(floorGeom, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
groundGroup.add(floorMesh);

// B. Dual-Frequency Glowing Cyber Grid (Expansive 60m Driving Grid)
// Major neon cyan grid (1.0m spacing)
const majorGrid = new THREE.GridHelper(60, 60, 0x00f0ff, 0x004455);
majorGrid.position.y = 0.001;
groundGroup.add(majorGrid);

// Fine high-density grid (0.2m spacing)
const fineGrid = new THREE.GridHelper(30, 150, 0x0088aa, 0x141e2a);
fineGrid.position.y = 0.0015;
fineGrid.material.opacity = 0.40;
fineGrid.material.transparent = true;
groundGroup.add(fineGrid);

// C. Concentric Measurement Distance Rings with Radii Ticks
const ringMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35 });
[1.0, 2.0, 3.0, 5.0, 10.0, 15.0].forEach((radius) => {
  const circleGeom = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0.002, Math.sin(theta) * radius));
  }
  circleGeom.setFromPoints(points);
  const circle = new THREE.Line(circleGeom, ringMat);
  groundGroup.add(circle);
});

// Central Axis Runway Strip
const runwayGeom = new THREE.PlaneGeometry(0.08, 30);
const runwayMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.25 });
const runwayStrip = new THREE.Mesh(runwayGeom, runwayMat);
runwayStrip.rotation.x = -Math.PI / 2;
runwayStrip.position.y = 0.0018;
groundGroup.add(runwayStrip);

scene.add(groundGroup);

// D. Soft Dynamic Ambient-Occlusion Contact Shadows Group (Pinned to Wheels while moving!)
function createContactShadowDisc(rx, rz, opacity = 0.6) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
  gradient.addColorStop(0.5, `rgba(0, 0, 0, ${opacity * 0.4})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  const geom = new THREE.PlaneGeometry(rx * 2, rz * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.0025;
  return mesh;
}

const contactShadowsGroup = new THREE.Group();
contactShadowsGroup.name = "Dynamic_Wheel_Contact_Shadows";

// Rear Wheel Contact Shadows (24" wheels at z = -0.18)
const shadowRearL = createContactShadowDisc(0.08, 0.16, 0.85);
shadowRearL.position.set(0.33, 0.0025, -0.18);
contactShadowsGroup.add(shadowRearL);

const shadowRearR = createContactShadowDisc(0.08, 0.16, 0.85);
shadowRearR.position.set(-0.33, 0.0025, -0.18);
contactShadowsGroup.add(shadowRearR);

// Front Caster Contact Shadows (8" casters at z = 0.32)
const shadowFrontL = createContactShadowDisc(0.06, 0.09, 0.75);
shadowFrontL.position.set(0.25, 0.0025, 0.32);
contactShadowsGroup.add(shadowFrontL);

const shadowFrontR = createContactShadowDisc(0.06, 0.09, 0.75);
shadowFrontR.position.set(-0.25, 0.0025, 0.32);
contactShadowsGroup.add(shadowFrontR);

// Central Undercarriage Ambient Shadow
const shadowCenter = createContactShadowDisc(0.35, 0.45, 0.55);
shadowCenter.position.set(0, 0.0022, 0.05);
contactShadowsGroup.add(shadowCenter);

scene.add(contactShadowsGroup);

// 5. Build Master Wheelchair Chassis & Initialize Physics Engine
let currentFinish = 'black';
let materials = createMaterials(currentFinish);
let wheelchair = buildWheelchairChassis(materials);
let autonomousKit = createAutonomousKit(materials, wheelchair);
scene.add(wheelchair.root);

// Instantiate Rigid-Body Differential Drive Physics Engine
const physics = new WheelchairPhysics(wheelchair, groundGroup, camera, controls);

// Function to update frame finish
function setWheelchairFinish(finish) {
  currentFinish = finish;
  materials = createMaterials(finish);
  const currentFold = parseFloat(document.getElementById('folding-slider')?.value || 0);

  scene.remove(wheelchair.root);
  wheelchair = buildWheelchairChassis(materials);
  autonomousKit = createAutonomousKit(materials, wheelchair);
  wheelchair.setFoldingProgress(currentFold);
  autonomousKit.setFoldingProgress(currentFold);
  scene.add(wheelchair.root);

  // Rebind physics engine to the new wheelchair instance
  physics.setWheelchair(wheelchair);

  document.querySelectorAll('.finish-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.finish === finish);
  });
}

// 6. Camera Animation Engine & Presets
let isAnimatingCamera = false;
let camStartPos = new THREE.Vector3();
let camEndPos = new THREE.Vector3();
let camStartTarget = new THREE.Vector3();
let camEndTarget = new THREE.Vector3();
let camAnimDuration = 900; // ms
let camAnimStartTime = 0;

function animateCameraTo(targetPos, targetLookAt, duration = 850) {
  isAnimatingCamera = true;
  physics.setCameraMode('orbit'); // return to orbit mode on preset click
  updateCamModeButtons('orbit');

  // Offset target relative to wheelchair's current world position!
  const worldTarget = targetLookAt.clone().add(physics.position);
  const worldPos = targetPos.clone().add(physics.position);

  camStartPos.copy(camera.position);
  camEndPos.copy(worldPos);
  camStartTarget.copy(controls.target);
  camEndTarget.copy(worldTarget);
  camAnimDuration = duration;
  camAnimStartTime = performance.now();
}

// Defined Camera Focus Presets:
const CAMERA_PRESETS = {
  showcase: {
    pos: new THREE.Vector3(1.35, 0.95, 1.45),
    target: new THREE.Vector3(0, 0.38, 0.02),
  },
  // Ultra close-up on the 16T bronze sprocket teeth, CNC holes, lockring & axle stud
  sprocket: {
    pos: new THREE.Vector3(0.20, 0.34, -0.02),
    target: new THREE.Vector3(0.25, 0.305, -0.18),
  },
  // Direct side profile of the 24" 6-spoke airfoil mag wheel, tire tread & outer handrim
  wheel: {
    pos: new THREE.Vector3(1.10, 0.32, -0.18),
    target: new THREE.Vector3(0.33, 0.305, -0.18),
  },
  // Close-up on 8" front caster wheel, stamped steel fork, and swivel headset
  caster: {
    pos: new THREE.Vector3(0.55, 0.24, 0.50),
    target: new THREE.Vector3(0.25, 0.11, 0.32),
  },
  // Top-down aerial view of seat canvas, desk armrests, and double-X brace
  top: {
    pos: new THREE.Vector3(0.01, 1.85, 0.05),
    target: new THREE.Vector3(0, 0.40, 0.02),
  },
  // Kinematic Seat Rods & Frame Saddle Cradles (shows tubular rods lifting +23.1cm out of nylon sockets)
  seat: {
    pos: new THREE.Vector3(0.52, 0.70, 0.38),
    target: new THREE.Vector3(0.12, 0.50, 0.07),
  },
  // Autonomous Drive Motors & Chains (Staggered MY1016Z motors, roller chains, 16T sprockets)
  autonomous: {
    pos: new THREE.Vector3(0.68, 0.42, 0.05),
    target: new THREE.Vector3(0.24, 0.22, -0.06),
  },
  // Autonomous Electronics Suite (Balanced Left Power Pod & Right Drive Pod on lower chassis rails)
  battery: {
    pos: new THREE.Vector3(0.88, 0.62, 0.28),
    target: new THREE.Vector3(0.00, 0.20, -0.02),
  },
  // Elevated LDROBOT 2D LiDAR & IMU
  lidar: {
    pos: new THREE.Vector3(0.55, 0.78, 0.65),
    target: new THREE.Vector3(0.23, 0.60, 0.36),
  },
};

function activateCameraPreset(presetKey) {
  const preset = CAMERA_PRESETS[presetKey];
  if (!preset) return;

  document.querySelectorAll('.cam-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.id === `cam-${presetKey}-btn`);
  });

  animateCameraTo(preset.pos, preset.target, 850);
}

// Wire Camera Preset Buttons
document.getElementById('cam-showcase-btn')?.addEventListener('click', () => activateCameraPreset('showcase'));
document.getElementById('cam-sprocket-btn')?.addEventListener('click', () => activateCameraPreset('sprocket'));
document.getElementById('cam-seat-btn')?.addEventListener('click', () => activateCameraPreset('seat'));
document.getElementById('cam-auto-btn')?.addEventListener('click', () => activateCameraPreset('autonomous'));
document.getElementById('cam-battery-btn')?.addEventListener('click', () => activateCameraPreset('battery'));
document.getElementById('cam-lidar-btn')?.addEventListener('click', () => activateCameraPreset('lidar'));
document.getElementById('cam-wheel-btn')?.addEventListener('click', () => activateCameraPreset('wheel'));
document.getElementById('cam-caster-btn')?.addEventListener('click', () => activateCameraPreset('caster'));
document.getElementById('cam-top-btn')?.addEventListener('click', () => activateCameraPreset('top'));

// Wire Finish Selector Buttons
document.getElementById('finish-black-btn')?.addEventListener('click', () => setWheelchairFinish('black'));
document.getElementById('finish-chrome-btn')?.addEventListener('click', () => setWheelchairFinish('chrome'));
document.getElementById('finish-gunmetal-btn')?.addEventListener('click', () => setWheelchairFinish('gunmetal'));

// Wire Auto-Rotate Turntable Button
let isTurntableActive = false;
const turntableBtn = document.getElementById('turntable-btn');
turntableBtn?.addEventListener('click', () => {
  isTurntableActive = !isTurntableActive;
  turntableBtn.classList.toggle('active', isTurntableActive);
  controls.autoRotate = isTurntableActive;
  controls.autoRotateSpeed = 2.0;
});

// Wire Pod Orientation Switcher (Horizontal Sub-Chassis vs Vertical Upright)
const podOrientBtn = document.getElementById('pod-orient-btn');
const podOrientLabel = document.getElementById('pod-orient-label');
podOrientBtn?.addEventListener('click', () => {
  const currentMode = autonomousKit.getPodOrientation();
  const nextMode = currentMode === 'horizontal' ? 'vertical' : 'horizontal';
  autonomousKit.setPodOrientation(nextMode);
  if (podOrientLabel) {
    podOrientLabel.textContent = nextMode === 'vertical' ? 'Mount: Vertical' : 'Mount: Horizontal';
  }
  podOrientBtn.classList.toggle('active', nextMode === 'vertical');
  activateCameraPreset('battery');
});

// Wire Zoom In / Out / Reset
document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
  const dir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
  const currentDist = camera.position.distanceTo(controls.target);
  if (currentDist > controls.minDistance + 0.1) {
    camera.position.addScaledVector(dir, 0.35);
  }
});

document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
  const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  camera.position.addScaledVector(dir, 0.45);
});

document.getElementById('zoom-reset-btn')?.addEventListener('click', () => {
  activateCameraPreset('showcase');
});

// 7. Folding Mechanism Kinematics (66cm Open to 25.5cm Folded, 140mm Frame Gap)
const foldingSlider = document.getElementById('folding-slider');
const foldingBadge = document.getElementById('folding-width-badge');
const autoFoldBtn = document.getElementById('auto-fold-btn');

let isAutoFolding = false;
let autoFoldStartTime = 0;
let autoFoldStartVal = 0;
let autoFoldTargetVal = 1;

autoFoldBtn?.addEventListener('click', () => {
  if (isAutoFolding) return;
  const currentVal = parseFloat(foldingSlider.value) || 0;
  autoFoldStartVal = currentVal;
  autoFoldTargetVal = currentVal < 0.5 ? 1.0 : 0.0;
  autoFoldStartTime = performance.now();
  isAutoFolding = true;
  if (autoFoldTargetVal > 0.5) {
    autoFoldBtn.innerHTML = '<span>⏸</span> Folding...';
    activateCameraPreset('seat');
  } else {
    autoFoldBtn.innerHTML = '<span>⏸</span> Opening...';
  }
});

foldingSlider?.addEventListener('input', (e) => {
  const progress = parseFloat(e.target.value);
  wheelchair.setFoldingProgress(progress);
  autonomousKit.setFoldingProgress(progress);

  // Update contact shadows position with folding frames
  const currentHalfW = THREE.MathUtils.lerp(0.33, 0.127, progress);
  shadowRearL.position.x = currentHalfW;
  shadowRearR.position.x = -currentHalfW;

  const currentFrontW = THREE.MathUtils.lerp(0.25, 0.09, progress);
  shadowFrontL.position.x = currentFrontW;
  shadowFrontR.position.x = -currentFrontW;

  // Real-time Healthshine specs: Overall width 66cm -> 25.5cm, frame gap 460mm -> 140mm, seat rod lift +231mm
  const currentWidthCm = (THREE.MathUtils.lerp(66, 25.5, progress)).toFixed(1);
  const frameGapMm = Math.round(THREE.MathUtils.lerp(460, 140, progress));
  const seatLiftMm = Math.round(progress * 231);
  if (foldingBadge) {
    if (progress < 0.03) {
      foldingBadge.textContent = `66 cm (Open) • Seat at 48 cm`;
    } else if (progress > 0.97) {
      foldingBadge.textContent = `25.5 cm (Folded) • Gap: 140 mm • Lift: +231 mm`;
    } else {
      foldingBadge.textContent = `${currentWidthCm} cm • Gap: ${frameGapMm}mm • Lift: +${seatLiftMm}mm`;
    }
  }
});

// 8. Wire Up Live Physics Telemetry HUD & Controls
const speedometerVal = document.getElementById('speedometer-val');
const speedometerBar = document.getElementById('speedometer-bar');
const rpmLeftVal = document.getElementById('rpm-left-val');
const rpmRightVal = document.getElementById('rpm-right-val');
const rpmCasterVal = document.getElementById('rpm-caster-val');
const distanceVal = document.getElementById('distance-val');
const motionBadge = document.getElementById('drive-motion-badge');
const brakeToggleBtn = document.getElementById('brake-toggle-btn');
const resetPosBtn = document.getElementById('reset-pos-btn');

// Handbrake Toggle
brakeToggleBtn?.addEventListener('click', () => {
  physics.toggleParkingBrakes();
});

// Reset Position
resetPosBtn?.addEventListener('click', () => {
  physics.resetPosition();
  contactShadowsGroup.position.set(0, 0.002, 0);
  contactShadowsGroup.rotation.y = 0;
});

// Camera Perspective Buttons
function updateCamModeButtons(activeMode) {
  document.querySelectorAll('.mode-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.id === `cam-mode-${activeMode}`);
  });
}

document.getElementById('cam-mode-orbit')?.addEventListener('click', () => {
  physics.setCameraMode('orbit');
  updateCamModeButtons('orbit');
});

document.getElementById('cam-mode-chase')?.addEventListener('click', () => {
  physics.setCameraMode('chase');
  updateCamModeButtons('chase');
});

document.getElementById('cam-mode-driver')?.addEventListener('click', () => {
  physics.setCameraMode('driver');
  updateCamModeButtons('driver');
});

// 9. Wire Virtual Driving D-Pad (Mouse & Touch Events)
function bindDpadButton(btnId, inputKey) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const startAction = (e) => {
    e.preventDefault();
    physics.inputs[inputKey] = true;
    btn.classList.add('pressed');
  };

  const endAction = (e) => {
    e.preventDefault();
    physics.inputs[inputKey] = false;
    btn.classList.remove('pressed');
  };

  btn.addEventListener('mousedown', startAction);
  btn.addEventListener('mouseup', endAction);
  btn.addEventListener('mouseleave', endAction);
  btn.addEventListener('touchstart', startAction, { passive: false });
  btn.addEventListener('touchend', endAction, { passive: false });
}

bindDpadButton('dpad-up', 'forward');
bindDpadButton('dpad-down', 'backward');
bindDpadButton('dpad-left', 'left');
bindDpadButton('dpad-right', 'right');

document.getElementById('dpad-brake')?.addEventListener('click', () => {
  physics.toggleParkingBrakes();
});

// CAD Modal Toggle & Copy CLI Command
const cadModal = document.getElementById('cad-modal');
const cadModalBtn = document.getElementById('cad-modal-btn');
const cadModalClose = document.getElementById('cad-modal-close');
const copyCadCmdBtn = document.getElementById('copy-cad-cmd-btn');
const cadCliInput = document.getElementById('cad-cli-input');

cadModalBtn?.addEventListener('click', () => {
  cadModal?.classList.remove('hidden');
});

cadModalClose?.addEventListener('click', () => {
  cadModal?.classList.add('hidden');
});

cadModal?.addEventListener('click', (e) => {
  if (e.target === cadModal) {
    cadModal.classList.add('hidden');
  }
});

copyCadCmdBtn?.addEventListener('click', () => {
  if (cadCliInput) {
    navigator.clipboard?.writeText(cadCliInput.value).then(() => {
      copyCadCmdBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyCadCmdBtn.textContent = 'Copy';
      }, 2000);
    }).catch(() => {
      cadCliInput.select();
      document.execCommand('copy');
      copyCadCmdBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyCadCmdBtn.textContent = 'Copy';
      }, 2000);
    });
  }
});

// 10. URL Query Parameter Initializer (Supports Deep-Linking & Mode Captures)
const urlParams = new URLSearchParams(window.location.search);
const initCad = urlParams.get('cad');
if (initCad === 'open' || initCad === 'true') {
  cadModal?.classList.remove('hidden');
}
const initPreset = urlParams.get('preset');
const initMode = urlParams.get('mode');
const initAction = urlParams.get('action');
const initFinish = urlParams.get('finish');
const initFold = urlParams.get('fold');

if (initFinish) {
  setWheelchairFinish(initFinish);
}

if (initFold) {
  const foldVal = parseFloat(initFold);
  if (foldingSlider) foldingSlider.value = foldVal;
  wheelchair.setFoldingProgress(foldVal);
  autonomousKit.setFoldingProgress(foldVal);
  if (foldingBadge) {
    const wCm = Math.round(THREE.MathUtils.lerp(66, 23, foldVal));
    foldingBadge.textContent = `${wCm} cm (${foldVal > 0.5 ? 'Folded' : 'Open'})`;
  }
}

if (initPreset && CAMERA_PRESETS[initPreset]) {
  const p = CAMERA_PRESETS[initPreset];
  camera.position.copy(p.pos);
  controls.target.copy(p.target);
  document.querySelectorAll('.cam-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.id === `cam-${initPreset}-btn`);
  });
}

if (initMode) {
  physics.setCameraMode(initMode);
  updateCamModeButtons(initMode);
}

if (initAction === 'drive') {
  physics.inputs.forward = true;
  physics.inputs.right = true;
  physics.linearVelocity = 2.4; // 8.6 km/h
  physics.angularVelocity = 0.8;
} else if (initAction === 'brake') {
  physics.toggleParkingBrakes();
}

// 11. Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 11. Main Physics & Render Loop
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  // Run Physics Update (Differential Kinematics, Wheel Angular Velocities, Caster Swivels, Pitch/Roll)
  const telemetry = physics.update(delta);

  // Update Autonomous Robotics Kit (LiDAR spin, drive sprockets & chains proportional to wheel RPM)
  autonomousKit.update(delta, telemetry.leftRpm, telemetry.rightRpm);

  // Update Dynamic Contact Shadows Position & Heading
  contactShadowsGroup.position.set(physics.position.x, 0.002, physics.position.z);
  contactShadowsGroup.rotation.y = physics.heading;

  // Update Real-Time Telemetry HUD Readouts
  if (speedometerVal) speedometerVal.textContent = telemetry.speedKmH;
  if (speedometerBar) {
    const speedPercent = Math.min(100, (parseFloat(telemetry.speedKmH) / 10.0) * 100);
    speedometerBar.style.width = `${speedPercent}%`;
  }
  if (rpmLeftVal) rpmLeftVal.textContent = `${telemetry.leftRpm} RPM`;
  if (rpmRightVal) rpmRightVal.textContent = `${telemetry.rightRpm} RPM`;
  if (rpmCasterVal) rpmCasterVal.textContent = `${telemetry.casterRpm} RPM`;
  if (distanceVal) distanceVal.textContent = `${telemetry.distanceM} m`;

  // Motion Status Badge
  if (motionBadge) {
    if (telemetry.isBraked) {
      motionBadge.textContent = 'BRAKED';
      motionBadge.className = 'motion-badge braked';
    } else if (telemetry.isMoving) {
      motionBadge.textContent = 'MOVING';
      motionBadge.className = 'motion-badge moving';
    } else {
      motionBadge.textContent = 'IDLE';
      motionBadge.className = 'motion-badge idle';
    }
  }

  // Auto-folding smooth animation cycle
  if (isAutoFolding && foldingSlider) {
    const elapsed = (now - autoFoldStartTime) / 2200; // 2.2s smooth cinematic fold
    if (elapsed >= 1.0) {
      foldingSlider.value = autoFoldTargetVal;
      foldingSlider.dispatchEvent(new Event('input'));
      isAutoFolding = false;
      if (autoFoldBtn) {
        autoFoldBtn.innerHTML = autoFoldTargetVal > 0.5 ? '<span>◀</span> Push & Open' : '<span>▶</span> Lift & Fold';
      }
    } else {
      // Smooth cubic ease-in-out
      const t = elapsed < 0.5 ? 4 * elapsed * elapsed * elapsed : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
      const val = THREE.MathUtils.lerp(autoFoldStartVal, autoFoldTargetVal, t);
      foldingSlider.value = val;
      foldingSlider.dispatchEvent(new Event('input'));
    }
  }

  // Smooth Camera Lerping during preset transitions
  if (isAnimatingCamera) {
    const elapsed = now - camAnimStartTime;
    const t = Math.min(elapsed / camAnimDuration, 1.0);
    // Smooth cubic ease out
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(camStartPos, camEndPos, ease);
    controls.target.lerpVectors(camStartTarget, camEndTarget, ease);

    if (t >= 1.0) {
      isAnimatingCamera = false;
    }
  }

  // Update OrbitControls
  controls.update();

  // Render Scene
  renderer.render(scene, camera);
}

animate();
