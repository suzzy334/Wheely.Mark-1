import * as THREE from 'three';

// -------------------------------------------------------------
// Component Staging & Dynamic Kinematic Powertrain Engine
// Enables free drag & drop, snapping, live chain kinematics,
// dynamic wire routing, and material customization
// -------------------------------------------------------------

export function buildElectricComponents(materials, wheelchairDims, mode = 'folding') {
  const componentsGroup = new THREE.Group();
  componentsGroup.name = "Autonomous_Robotic_Wheelchair_Components";

  const { rearAxleX, rearAxleY, rearAxleZ, seatWidth, frontCasterZ } = wheelchairDims;
  const HALF_W = seatWidth / 2; // 0.23m

  // Component registry stores every movable component, its metadata, nominal pos, and staged pos
  const componentRegistry = {};

  // -------------------------------------------------------------
  // SIDE WORKBENCH / STAGING AREA TABLE
  // Illuminated high-tech workbench next to wheelchair where staged items sit
  // -------------------------------------------------------------
  const workbenchGroup = new THREE.Group();
  workbenchGroup.name = "Staging_Workbench_Pedestal";
  const WB_X = -1.15;
  const WB_Y = 0.16;
  const WB_Z = 0.05;

  // Staging table surface (0.50m W x 1.10m L)
  const wbTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.024, 1.15),
    materials.rigidChassisMat
  );
  wbTop.position.set(WB_X, WB_Y, WB_Z);
  wbTop.castShadow = true;
  wbTop.receiveShadow = true;
  workbenchGroup.add(wbTop);

  // Glowing neon cyan perimeter edge on workbench
  const wbEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.53, 0.005, 1.16),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 })
  );
  wbEdge.position.set(WB_X, WB_Y + 0.012, WB_Z);
  workbenchGroup.add(wbEdge);

  // Table support legs
  [-0.22, 0.22].forEach(lx => {
    [-0.50, 0.50].forEach(lz => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, WB_Y, 16),
        materials.framePaint
      );
      leg.position.set(WB_X + lx, WB_Y / 2, WB_Z + lz);
      workbenchGroup.add(leg);
    });
  });

  // Laser-etched workbench header label
  const wCanvas = document.createElement('canvas');
  wCanvas.width = 512;
  wCanvas.height = 128;
  const wctx = wCanvas.getContext('2d');
  wctx.fillStyle = '#0a0d14';
  wctx.fillRect(0, 0, 512, 128);
  wctx.fillStyle = '#00f0ff';
  wctx.font = 'bold 28px monospace';
  wctx.fillText('COMPONENT STAGING DECK', 40, 55);
  wctx.fillStyle = '#94a3b8';
  wctx.font = '20px monospace';
  wctx.fillText('Drag items freely or click to snap', 40, 95);
  const wTex = new THREE.CanvasTexture(wCanvas);
  const wLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.12),
    new THREE.MeshBasicMaterial({ map: wTex })
  );
  wLabel.rotation.x = -Math.PI / 2;
  wLabel.position.set(WB_X, WB_Y + 0.013, WB_Z);
  workbenchGroup.add(wLabel);

  componentsGroup.add(workbenchGroup);
  componentRegistry.workbench = workbenchGroup;

  // -------------------------------------------------------------
  // FIXED WHEEL SPROCKETS (STRICTLY FIXED ON WHEEL HUBS)
  // Wheel freewheel sprockets do not move with the motors!
  // -------------------------------------------------------------
  const FIXED_WHEEL_LEFT = new THREE.Vector3(rearAxleX - 0.035, rearAxleY, rearAxleZ);
  const FIXED_WHEEL_RIGHT = new THREE.Vector3(-(rearAxleX - 0.035), rearAxleY, rearAxleZ);

  // -------------------------------------------------------------
  // 1. LEFT & RIGHT MY1016Z 24V GEARED MOTORS (FREELY MOVABLE!)
  // -------------------------------------------------------------
  const MOTOR_NOMINAL_LEFT = new THREE.Vector3(HALF_W - 0.025, 0.21, rearAxleZ + 0.17);
  const MOTOR_NOMINAL_RIGHT = new THREE.Vector3(-(HALF_W - 0.025), 0.21, rearAxleZ + 0.17);

  function createMotorAssembly(side, name) {
    const isLeft = side > 0;
    const motorGroup = new THREE.Group();
    motorGroup.name = isLeft ? "Motor_Assembly_Left" : "Motor_Assembly_Right";

    // Cylindrical Canister
    const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.095, 24), materials.blackComposite);
    canister.rotation.z = Math.PI / 2;
    canister.position.set(-side * 0.04, 0, 0);
    canister.castShadow = true;
    motorGroup.add(canister);

    // Motor Label
    const labelGeom = new THREE.CylinderGeometry(0.0485, 0.0485, 0.045, 16, 1, true, 0, Math.PI);
    const label = new THREE.Mesh(labelGeom, materials.frameChrome);
    label.rotation.z = Math.PI / 2;
    label.rotation.x = Math.PI / 2;
    label.position.set(-side * 0.04, 0, 0);
    motorGroup.add(label);

    // Gearbox
    const gearbox = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.038, 24), materials.steelAxle);
    gearbox.rotation.z = Math.PI / 2;
    gearbox.position.set(side * 0.015, 0, 0);
    gearbox.castShadow = true;
    motorGroup.add(gearbox);

    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.018, 20), materials.steelAxle);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(side * 0.04, 0, 0);
    motorGroup.add(snout);

    // Motor Base Foot
    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.006, 0.11), materials.steelAxle);
    basePlate.position.set(-side * 0.01, -0.052, 0);
    motorGroup.add(basePlate);

    // Output Shaft & 9T Sprocket
    const sprocketGroup = new THREE.Group();
    sprocketGroup.name = `Sprocket_${name}`;
    sprocketGroup.position.set(side * 0.065, 0, 0);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.025, 12), materials.steelAxle);
    shaft.rotation.z = Math.PI / 2;
    sprocketGroup.add(shaft);

    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.004, 20), materials.steelAxle);
    disk.rotation.z = Math.PI / 2;
    sprocketGroup.add(disk);

    for (let t = 0; t < 9; t++) {
      const angle = (t * Math.PI * 2) / 9;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.007, 0.005), materials.steelAxle);
      tooth.position.set(0, Math.cos(angle) * 0.023, Math.sin(angle) * 0.023);
      tooth.rotation.x = -angle;
      sprocketGroup.add(tooth);
    }

    const lockNut = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), materials.steelAxle);
    lockNut.rotation.z = Math.PI / 2;
    lockNut.position.set(side * 0.01, 0, 0);
    sprocketGroup.add(lockNut);

    motorGroup.add(sprocketGroup);
    motorGroup.userData.sprocket = sprocketGroup;

    return motorGroup;
  }

  const leftMotorAssembly = createMotorAssembly(1, 'left');
  leftMotorAssembly.position.copy(MOTOR_NOMINAL_LEFT);
  componentsGroup.add(leftMotorAssembly);

  const rightMotorAssembly = createMotorAssembly(-1, 'right');
  rightMotorAssembly.position.copy(MOTOR_NOMINAL_RIGHT);
  componentsGroup.add(rightMotorAssembly);

  // Motor Brackets (Slotted L-Plates that adapt to motor placement)
  const bracketsGroup = new THREE.Group();
  bracketsGroup.name = "Motor_Mount_Brackets";

  function createBracket(side) {
    const isLeft = side > 0;
    const bracket = new THREE.Group();
    bracket.name = isLeft ? "Bracket_Left" : "Bracket_Right";

    const mainPlate = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.12, 0.16), materials.framePaint);
    mainPlate.position.set(side * (HALF_W + 0.008), 0.21, rearAxleZ + 0.17);
    mainPlate.castShadow = true;
    bracket.add(mainPlate);

    // 4 Adjustment Slots
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        const boltSlot = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.009, 0.024), materials.steelAxle);
        boltSlot.position.set(side * (HALF_W + 0.008), 0.21 + (i * 0.035), rearAxleZ + 0.17 + (j * 0.045));
        bracket.add(boltSlot);
      }
    }

    // Clamp collars around frame tubes
    const lowerClamp = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.035, 16), materials.framePaint);
    lowerClamp.rotation.x = Math.PI / 2;
    lowerClamp.position.set(side * HALF_W, 0.18, rearAxleZ + 0.13);
    bracket.add(lowerClamp);

    return bracket;
  }

  const leftBracket = createBracket(1);
  const rightBracket = createBracket(-1);
  bracketsGroup.add(leftBracket);
  bracketsGroup.add(rightBracket);
  componentsGroup.add(bracketsGroup);

  // Equipment Mounting Plates (Under-Seat Carrier Tray & Sensor Arch)
  const mountingPlatesGroup = new THREE.Group();
  mountingPlatesGroup.name = "Equipment_Mounting_Plates";
  const underSeatPlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.005, 0.40), materials.framePaint);
  underSeatPlate.position.set(0, 0.22, 0.02);
  underSeatPlate.castShadow = true;
  underSeatPlate.receiveShadow = true;
  mountingPlatesGroup.add(underSeatPlate);

  // CNC lightening and ventilation slots
  for (let zSlot = -0.12; zSlot <= 0.12; zSlot += 0.08) {
    const slotM = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.007, 0.02), materials.blackComposite);
    slotM.position.set(0, 0.22, 0.02 + zSlot);
    mountingPlatesGroup.add(slotM);
  }
  componentsGroup.add(mountingPlatesGroup);

  // -------------------------------------------------------------
  // 2. DYNAMIC LIVE CHAIN KINEMATICS ENGINE
  // Computes tangent roller chain loop from ANY motor position
  // to the FIXED 16T freewheel on the wheelchair wheel hub!
  // -------------------------------------------------------------
  const chainsGroup = new THREE.Group();
  chainsGroup.name = "Dynamic_Roller_Drive_Chains";

  const chainSideLeft = new THREE.Group();
  chainSideLeft.name = "Chain_Side_Left";
  const chainSideRight = new THREE.Group();
  chainSideRight.name = "Chain_Side_Right";

  chainsGroup.add(chainSideLeft);
  chainsGroup.add(chainSideRight);
  componentsGroup.add(chainsGroup);

  // Texture for realistic roller links
  const chainCanvas = document.createElement('canvas');
  chainCanvas.width = 128;
  chainCanvas.height = 32;
  const cctx = chainCanvas.getContext('2d');
  cctx.fillStyle = '#8b939e';
  cctx.fillRect(0, 0, 128, 32);
  for (let l = 0; l < 128; l += 16) {
    cctx.fillStyle = '#22272e';
    cctx.fillRect(l + 2, 4, 12, 24);
    cctx.fillStyle = '#e6edf3';
    cctx.beginPath();
    cctx.arc(l + 8, 16, 3, 0, Math.PI * 2);
    cctx.fill();
  }
  const chainTex = new THREE.CanvasTexture(chainCanvas);
  chainTex.wrapS = THREE.RepeatWrapping;
  chainTex.wrapT = THREE.RepeatWrapping;
  chainTex.repeat.set(22, 1);

  const chainMat = new THREE.MeshStandardMaterial({
    map: chainTex,
    metalness: 0.85,
    roughness: 0.35,
  });

  // Dynamic chain builder function
  function buildTangentChainMesh(motorPos, fixedWheelPos, side) {
    const r1 = 0.021; // 9T sprocket radius
    const r2 = 0.036; // 16T freewheel radius

    // Motor sprocket world position
    const mSprocketX = motorPos.x + (side * 0.065);
    const mY = motorPos.y;
    const mZ = motorPos.z;

    const wX = fixedWheelPos.x;
    const wY = fixedWheelPos.y;
    const wZ = fixedWheelPos.z;

    const dZ = wZ - mZ;
    const dY = wY - mY;
    const c = Math.hypot(dZ, dY);

    if (c < 0.065) {
      // Motor is positioned right on top of the wheel axle (too close to route chain)
      return { mesh: null, centerDistMm: c * 1000, links: 0, status: "TOO CLOSE" };
    }

    const phi = Math.atan2(dY, dZ);
    const beta = Math.asin(Math.min(0.99, Math.max(-0.99, (r2 - r1) / c)));

    const alpha1 = phi + beta + Math.PI / 2;
    const alpha2 = phi + beta + Math.PI / 2;
    const gamma1 = phi - beta - Math.PI / 2;
    const gamma2 = phi - beta - Math.PI / 2;

    const points = [];
    const steps = 14;

    // 1. Top strand (motor top tangent -> wheel top tangent)
    const pMTop = new THREE.Vector3(mSprocketX, mY + r1 * Math.sin(alpha1), mZ + r1 * Math.cos(alpha1));
    const pWTop = new THREE.Vector3(wX, wY + r2 * Math.sin(alpha2), wZ + r2 * Math.cos(alpha2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push(new THREE.Vector3(
        mSprocketX + (wX - mSprocketX) * t,
        pMTop.y + (pWTop.y - pMTop.y) * t,
        pMTop.z + (pWTop.z - pMTop.z) * t
      ));
    }

    // 2. Arc around wheel freewheel sprocket (away from motor)
    const wheelArcSpan = Math.PI - 2 * beta;
    for (let i = 1; i <= 12; i++) {
      const ang = alpha2 + (i / 12) * wheelArcSpan;
      points.push(new THREE.Vector3(
        wX,
        wY + r2 * Math.sin(ang),
        wZ + r2 * Math.cos(ang)
      ));
    }

    // 3. Bottom strand (wheel bottom tangent -> motor bottom tangent)
    const pWBot = new THREE.Vector3(wX, wY + r2 * Math.sin(gamma2), wZ + r2 * Math.cos(gamma2));
    const pMBot = new THREE.Vector3(mSprocketX, mY + r1 * Math.sin(gamma1), mZ + r1 * Math.cos(gamma1));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      points.push(new THREE.Vector3(
        wX + (mSprocketX - wX) * t,
        pWBot.y + (pMBot.y - pWBot.y) * t,
        pWBot.z + (pMBot.z - pWBot.z) * t
      ));
    }

    // 4. Arc around motor 9T sprocket (away from wheel)
    const motorArcSpan = Math.PI + 2 * beta;
    for (let i = 1; i < 12; i++) {
      const ang = gamma1 + (i / 12) * motorArcSpan;
      points.push(new THREE.Vector3(
        mSprocketX,
        mY + r1 * Math.sin(ang),
        mZ + r1 * Math.cos(ang)
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);
    const geom = new THREE.TubeGeometry(curve, 96, 0.0045, 8, true);
    const mesh = new THREE.Mesh(geom, chainMat);
    mesh.castShadow = true;

    // Laser Coplanar Line from motor sprocket to wheel sprocket
    const laserGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(mSprocketX, mY, mZ),
      new THREE.Vector3(wX, wY, wZ)
    ]);
    const laserLine = new THREE.Line(laserGeom, new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 }));

    const chainSub = new THREE.Group();
    chainSub.add(mesh);
    chainSub.add(laserLine);

    // Theoretical links calculation (#410 chain pitch 12.7mm = 0.5 in)
    const pitch = 0.0127;
    const cDist = c;
    const linkCount = Math.round(2 * (cDist / pitch) + (9 + 16) / 2 + (Math.pow(16 - 9, 2) * pitch) / (4 * Math.PI * Math.PI * cDist));

    return {
      group: chainSub,
      centerDistMm: (cDist * 1000).toFixed(1),
      links: linkCount % 2 === 0 ? linkCount : linkCount + 1, // chains require even count with master link
      status: Math.abs(cDist - 0.203) < 0.04 ? "IDEAL TENSION (10-15mm Slack)" : "CUSTOM TENSION"
    };
  }

  // Live updater method
  function updateDynamicChains() {
    // Clear old meshes
    while (chainSideLeft.children.length > 0) chainSideLeft.remove(chainSideLeft.children[0]);
    while (chainSideRight.children.length > 0) chainSideRight.remove(chainSideRight.children[0]);

    const resLeft = buildTangentChainMesh(leftMotorAssembly.position, FIXED_WHEEL_LEFT, 1);
    if (resLeft.group) chainSideLeft.add(resLeft.group);

    const resRight = buildTangentChainMesh(rightMotorAssembly.position, FIXED_WHEEL_RIGHT, -1);
    if (resRight.group) chainSideRight.add(resRight.group);

    return {
      leftDistMm: resLeft.centerDistMm,
      leftLinks: resLeft.links,
      leftStatus: resLeft.status,
      rightDistMm: resRight.centerDistMm,
      rightLinks: resRight.links,
      rightStatus: resRight.status
    };
  }

  // -------------------------------------------------------------
  // 3. MAIN 24V 30Ah 7S LI-ION BATTERY PACK & DALY 40A BMS
  // (Freely Movable / Draggable in 3D!)
  // -------------------------------------------------------------
  const mainBatteryGroup = new THREE.Group();
  mainBatteryGroup.name = "Main_24V_30Ah_Battery";
  const BATT_NOMINAL = new THREE.Vector3(-0.06, 0.19, -0.01);
  mainBatteryGroup.position.copy(BATT_NOMINAL);

  // Blue shrink pack
  const battPack = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.14), materials.liIonBlue);
  battPack.position.set(0, 0.045, 0);
  battPack.castShadow = true;
  mainBatteryGroup.add(battPack);

  // Battery spec label
  const bCanvas = document.createElement('canvas');
  bCanvas.width = 256;
  bCanvas.height = 128;
  const bctx = bCanvas.getContext('2d');
  bctx.fillStyle = '#0f172a';
  bctx.fillRect(0, 0, 256, 128);
  bctx.fillStyle = '#38bdf8';
  bctx.font = 'bold 22px monospace';
  bctx.fillText('7S Li-ion 24V / 30Ah', 10, 38);
  bctx.fillStyle = '#f59e0b';
  bctx.font = '16px monospace';
  bctx.fillText('Nominal 25.9V / Max 29.4V', 10, 68);
  bctx.fillStyle = '#94a3b8';
  bctx.font = '14px monospace';
  bctx.fillText('Capacity: 777 Wh', 10, 96);
  const bLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.06),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bCanvas) })
  );
  bLabel.position.set(0, 0.045, 0.071);
  mainBatteryGroup.add(bLabel);

  componentsGroup.add(mainBatteryGroup);

  // Daly 7S 40A BMS (Separate Movable Module)
  const dalyBmsGroup = new THREE.Group();
  dalyBmsGroup.name = "Daly_7S_40A_BMS";
  const BMS_NOMINAL = new THREE.Vector3(0.09, 0.21, -0.01);
  dalyBmsGroup.position.copy(BMS_NOMINAL);

  const bmsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.12), materials.dalyBmsRed);
  bmsMesh.castShadow = true;
  dalyBmsGroup.add(bmsMesh);

  const bmsHarness = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.008, 0.06), materials.frameChrome);
  bmsHarness.position.set(-0.04, 0, 0);
  dalyBmsGroup.add(bmsHarness);

  componentsGroup.add(dalyBmsGroup);

  // -------------------------------------------------------------
  // 4. MAIN 40A DC FUSE & MOTOR 20A FUSES
  // -------------------------------------------------------------
  const fusesGroup = new THREE.Group();
  fusesGroup.name = "DC_Fuses_Protection";
  const FUSES_NOMINAL = new THREE.Vector3(0, 0.42, 0.02);
  fusesGroup.position.copy(FUSES_NOMINAL);

  const mainFuseHolder = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.02), materials.blackComposite);
  mainFuseHolder.position.set(-0.08, 0, 0);
  const mainFuseBody = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.018, 0.01), materials.fuseAmber);
  mainFuseBody.position.set(-0.08, 0.01, 0);
  fusesGroup.add(mainFuseHolder);
  fusesGroup.add(mainFuseBody);

  [-0.02, 0.03].forEach(fX => {
    const mHolder = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.02, 0.016), materials.blackComposite);
    mHolder.position.set(fX, 0, 0);
    const mBody = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.014, 0.008), materials.fuseBlue);
    mBody.position.set(fX, 0.008, 0);
    fusesGroup.add(mHolder);
    fusesGroup.add(mBody);
  });

  componentsGroup.add(fusesGroup);

  // -------------------------------------------------------------
  // 5. 24V DC CONTACTOR & EMERGENCY STOP
  // -------------------------------------------------------------
  const contactorGroup = new THREE.Group();
  contactorGroup.name = "DC_Contactor_24V";
  const CONTACTOR_NOMINAL = new THREE.Vector3(0.12, 0.44, 0.02);
  contactorGroup.position.copy(CONTACTOR_NOMINAL);

  const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.055, 0.065), materials.contactorBlack);
  cBody.castShadow = true;
  contactorGroup.add(cBody);

  [-0.018, 0.018].forEach(sx => {
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.014, 12), materials.freewheelBronze);
    stud.position.set(sx, 0.032, 0);
    contactorGroup.add(stud);
  });

  componentsGroup.add(contactorGroup);

  // Red Mushroom Emergency Stop Switch
  const eStopGroup = new THREE.Group();
  eStopGroup.name = "Emergency_Stop_Switch";
  const ESTOP_NOMINAL = new THREE.Vector3(HALF_W + 0.025, 0.71, 0.08);
  eStopGroup.position.copy(ESTOP_NOMINAL);

  const eBox = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.05), materials.blackComposite);
  const eCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 16), materials.glowingAmber);
  eCollar.position.set(0, 0.025, 0);
  const eMushroom = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.016, 20), materials.glowingRed);
  eMushroom.position.set(0, 0.038, 0);
  eStopGroup.add(eBox);
  eStopGroup.add(eCollar);
  eStopGroup.add(eMushroom);
  componentsGroup.add(eStopGroup);

  // -------------------------------------------------------------
  // 6. DUAL >=36V H-BRIDGE MOTOR DRIVERS & BULK CAPACITORS
  // -------------------------------------------------------------
  const motorDriversGroup = new THREE.Group();
  motorDriversGroup.name = "Dual_HBridge_Motor_Drivers";
  const DRIVERS_NOMINAL = new THREE.Vector3(0, 0.44, 0.12);
  motorDriversGroup.position.copy(DRIVERS_NOMINAL);

  [-0.08, 0.08].forEach((dX, idx) => {
    const isLeft = idx === 0;
    const dGroup = new THREE.Group();
    dGroup.name = isLeft ? "Driver_Left" : "Driver_Right";

    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.03, 0.08), materials.heatsinkAlum);
    heatsink.position.set(dX, 0.015, 0);
    dGroup.add(heatsink);

    for (let f = -0.025; f <= 0.025; f += 0.012) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.012, 0.076), materials.steelAxle);
      fin.position.set(dX + f, 0.032, 0);
      dGroup.add(fin);
    }

    // 1000 µF / 35V Bulk Electrolytic Caps
    [-0.012, 0.012].forEach(cz => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.022, 16), materials.blackComposite);
      cap.position.set(dX + 0.02, 0.035, cz);
      dGroup.add(cap);
    });

    const ceramicCap = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 8), materials.glowingAmber);
    ceramicCap.position.set(dX - 0.02, 0.032, 0);
    dGroup.add(ceramicCap);

    motorDriversGroup.add(dGroup);
  });

  componentsGroup.add(motorDriversGroup);

  // -------------------------------------------------------------
  // 7. BUCK CONVERTER (24V -> 5V LM2596 >=2A)
  // -------------------------------------------------------------
  const buck5vGroup = new THREE.Group();
  buck5vGroup.name = "Buck_Converter_24V_to_5V";
  const BUCK5V_NOMINAL = new THREE.Vector3(-0.14, 0.44, 0.12);
  buck5vGroup.position.copy(BUCK5V_NOMINAL);

  const buckPcb = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.004, 0.025), materials.esp32PcbMat);
  const inductor = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.003, 12, 20), materials.freewheelBronze);
  inductor.rotation.x = Math.PI / 2;
  inductor.position.set(0, 0.008, 0);
  buck5vGroup.add(buckPcb);
  buck5vGroup.add(inductor);
  componentsGroup.add(buck5vGroup);

  // -------------------------------------------------------------
  // 8. ESP32-S3 DevKitC-1 AUTONOMOUS BRAIN & MPU6050 IMU
  // -------------------------------------------------------------
  const esp32BrainGroup = new THREE.Group();
  esp32BrainGroup.name = "ESP32S3_Brain_Unit";
  const ESP32_NOMINAL = new THREE.Vector3(0, 0.46, -0.04);
  esp32BrainGroup.position.copy(ESP32_NOMINAL);

  const espPcb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.003, 0.065), materials.esp32PcbMat);
  espPcb.castShadow = true;
  esp32BrainGroup.add(espPcb);

  const rfShield = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.004, 0.025), materials.rfShieldMat);
  rfShield.position.set(0, 0.003, -0.008);
  esp32BrainGroup.add(rfShield);

  const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 8), materials.glowingCyan);
  statusLed.position.set(-0.008, 0.004, 0.008);
  esp32BrainGroup.add(statusLed);

  componentsGroup.add(esp32BrainGroup);

  // MPU6050 6-DoF IMU
  const mpuGroup = new THREE.Group();
  mpuGroup.name = "MPU6050_IMU";
  const MPU_NOMINAL = new THREE.Vector3(0.045, 0.46, -0.04);
  mpuGroup.position.copy(MPU_NOMINAL);

  const mpuPcb = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.003, 0.018), materials.fuseBlue);
  const mpuChip = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.002, 0.006), materials.blackComposite);
  mpuChip.position.set(0, 0.002, 0);
  mpuGroup.add(mpuPcb);
  mpuGroup.add(mpuChip);
  componentsGroup.add(mpuGroup);

  // -------------------------------------------------------------
  // 9. LDROBOT STL-19P 360° 2D LiDAR SENSOR
  // -------------------------------------------------------------
  const lidarGroup = new THREE.Group();
  lidarGroup.name = "LDROBOT_STL19P_LiDAR";
  const LIDAR_NOMINAL = new THREE.Vector3(
    0,
    mode === 'folding' ? 0.42 : 0.74,
    mode === 'folding' ? frontCasterZ + 0.16 : frontCasterZ + 0.12
  );
  lidarGroup.position.copy(LIDAR_NOMINAL);

  const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.022, 24), materials.blackComposite);
  lBase.castShadow = true;
  lidarGroup.add(lBase);

  const lWaist = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 24), materials.fuseBlue);
  lWaist.position.set(0, 0.015, 0);
  lidarGroup.add(lWaist);

  const lHead = new THREE.Group();
  lHead.name = "LiDAR_Rotating_Turret";
  lHead.position.set(0, 0.024, 0);
  const tCap = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.01, 24), materials.blackComposite);
  lHead.add(tCap);

  const lLens = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 12), materials.sensorCyan);
  lLens.rotation.x = Math.PI / 2;
  lLens.position.set(0.008, 0, 0.02);
  lHead.add(lLens);

  lidarGroup.add(lHead);
  lidarGroup.userData.head = lHead;

  // 360° Laser Scan Disc
  const laserPlane = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), materials.laserScanningPlane);
  laserPlane.rotation.x = -Math.PI / 2;
  laserPlane.position.set(0, 0.024, 0);
  lidarGroup.add(laserPlane);
  lidarGroup.userData.laserPlane = laserPlane;

  componentsGroup.add(lidarGroup);

  // -------------------------------------------------------------
  // 10. ADAFRUIT VL53L1X DOWNWARD CLIFF SENSOR
  // -------------------------------------------------------------
  const vl53l1xGroup = new THREE.Group();
  vl53l1xGroup.name = "Adafruit_VL53L1X_Cliff_Sensor";
  const TOF_NOMINAL = new THREE.Vector3(0, 0.22, frontCasterZ + 0.04);
  vl53l1xGroup.position.copy(TOF_NOMINAL);

  const tPcb = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.003, 0.02), materials.fuseBlue);
  tPcb.rotation.x = Math.PI / 4;
  vl53l1xGroup.add(tPcb);

  // Downward amber ToF detection cone
  const tCone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 16, 1, true), materials.tofBeamMat);
  tCone.position.set(0, -0.11, 0.11);
  tCone.rotation.x = Math.PI / 4;
  vl53l1xGroup.add(tCone);

  componentsGroup.add(vl53l1xGroup);

  // -------------------------------------------------------------
  // 11. AUXILIARY 4S 14.8V BATTERY & 12V DISC HORN
  // -------------------------------------------------------------
  const auxHornGroup = new THREE.Group();
  auxHornGroup.name = "Auxiliary_12V_Horn_System";
  const AUX_NOMINAL = new THREE.Vector3(0, 0.38, 0.15);
  auxHornGroup.position.copy(AUX_NOMINAL);

  const auxBatt = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.07), materials.auxBattGreen);
  auxBatt.position.set(-0.12, 0.05, 0.07);
  auxHornGroup.add(auxBatt);

  const b12v = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.006, 0.024), materials.esp32PcbMat);
  b12v.position.set(-0.12, 0.075, 0.07);
  auxHornGroup.add(b12v);

  const hDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.016, 24), materials.hornDiscMat);
  hDisc.rotation.x = Math.PI / 2;
  hDisc.position.set(0.12, -0.06, 0.08);
  auxHornGroup.add(hDisc);

  componentsGroup.add(auxHornGroup);

  // -------------------------------------------------------------
  // 12. AUTONOMOUS SWITCH HUB & HORN BUTTON (RIGHT ARMREST)
  // -------------------------------------------------------------
  const controlConsoleGroup = new THREE.Group();
  controlConsoleGroup.name = "Autonomous_Control_Console";
  const CONSOLE_NOMINAL = new THREE.Vector3(-HALF_W - 0.025, 0.72, 0.12);
  controlConsoleGroup.position.copy(CONSOLE_NOMINAL);

  const cBox = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.04, 0.11), materials.blackComposite);
  cBox.castShadow = true;
  controlConsoleGroup.add(cBox);

  // SW1 (AUTO/MANUAL) & SW2 (ECO/SPORT) Levers
  [-0.015, 0.015].forEach((swX, idx) => {
    const swBase = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 12), materials.steelAxle);
    swBase.position.set(swX, 0.022, -0.025);
    const swLev = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.003, 0.016, 12), materials.frameChrome);
    swLev.position.set(swX, 0.032, -0.025);
    swLev.rotation.x = idx === 0 ? -Math.PI / 10 : Math.PI / 10;
    controlConsoleGroup.add(swBase);
    controlConsoleGroup.add(swLev);
  });

  // Horn Button
  const hBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 16), materials.glowingAmber);
  hBtn.position.set(0, 0.027, 0.025);
  controlConsoleGroup.add(hBtn);

  componentsGroup.add(controlConsoleGroup);

  // -------------------------------------------------------------
  // 13. DYNAMIC REAL-TIME WIRING HARNESS ENGINE
  // Updates CatmullRom splines dynamically between live positions!
  // -------------------------------------------------------------
  const wiringGroup = new THREE.Group();
  wiringGroup.name = "Dynamic_Wiring_Harness";
  componentsGroup.add(wiringGroup);

  const wireMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const wireMatBlack = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  const wireMatYellow = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const wireMatCyan = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.5 });

  function createSplineMesh(points, radius, mat) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    return new THREE.Mesh(geom, mat);
  }

  function updateDynamicWires() {
    while (wiringGroup.children.length > 0) wiringGroup.remove(wiringGroup.children[0]);

    // 1. Battery to BMS
    const pBatt = mainBatteryGroup.position;
    const pBms = dalyBmsGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pBatt.x, pBatt.y + 0.06, pBatt.z),
      new THREE.Vector3((pBatt.x + pBms.x) / 2, Math.max(pBatt.y, pBms.y) + 0.04, (pBatt.z + pBms.z) / 2),
      new THREE.Vector3(pBms.x, pBms.y + 0.02, pBms.z)
    ], 0.004, wireMatRed));

    // 2. BMS to 40A Fuse
    const pFuses = fusesGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pBms.x, pBms.y + 0.02, pBms.z),
      new THREE.Vector3(pBms.x, 0.34, pBms.z),
      new THREE.Vector3(pFuses.x - 0.08, pFuses.y, pFuses.z)
    ], 0.004, wireMatRed));

    // 3. 40A Fuse to 24V Contactor
    const pContactor = contactorGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pFuses.x - 0.08, pFuses.y + 0.01, pFuses.z),
      new THREE.Vector3((pFuses.x + pContactor.x) / 2, pFuses.y + 0.03, pFuses.z),
      new THREE.Vector3(pContactor.x - 0.02, pContactor.y + 0.03, pContactor.z)
    ], 0.004, wireMatRed));

    // 4. Contactor to Motor Drivers
    const pDrivers = motorDriversGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pContactor.x + 0.02, pContactor.y + 0.03, pContactor.z),
      new THREE.Vector3(pDrivers.x, pDrivers.y + 0.01, pDrivers.z - 0.02),
      new THREE.Vector3(pDrivers.x, pDrivers.y + 0.01, pDrivers.z)
    ], 0.0035, wireMatRed));

    // 5. Left Driver to Left Motor
    const pLeftMotor = leftMotorAssembly.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pDrivers.x - 0.08, pDrivers.y + 0.01, pDrivers.z),
      new THREE.Vector3(pLeftMotor.x, pDrivers.y, (pDrivers.z + pLeftMotor.z) / 2),
      new THREE.Vector3(pLeftMotor.x, pLeftMotor.y, pLeftMotor.z)
    ], 0.004, wireMatBlack));

    // 6. Right Driver to Right Motor
    const pRightMotor = rightMotorAssembly.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pDrivers.x + 0.08, pDrivers.y + 0.01, pDrivers.z),
      new THREE.Vector3(pRightMotor.x, pDrivers.y, (pDrivers.z + pRightMotor.z) / 2),
      new THREE.Vector3(pRightMotor.x, pRightMotor.y, pRightMotor.z)
    ], 0.004, wireMatBlack));

    // 7. Buck 5V to ESP32 Brain
    const pBuck5 = buck5vGroup.position;
    const pEsp = esp32BrainGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pBuck5.x, pBuck5.y + 0.01, pBuck5.z),
      new THREE.Vector3((pBuck5.x + pEsp.x) / 2, pEsp.y + 0.02, (pBuck5.z + pEsp.z) / 2),
      new THREE.Vector3(pEsp.x - 0.01, pEsp.y + 0.004, pEsp.z)
    ], 0.0025, wireMatCyan));

    // 8. ESP32 to STL-19P LiDAR
    const pLidar = lidarGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pEsp.x, pEsp.y + 0.004, pEsp.z + 0.02),
      new THREE.Vector3(0, 0.35, (pEsp.z + pLidar.z) / 2),
      new THREE.Vector3(pLidar.x, pLidar.y - 0.01, pLidar.z)
    ], 0.0025, wireMatCyan));

    // 9. ESP32 to VL53L1X ToF
    const pTof = vl53l1xGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pEsp.x + 0.01, pEsp.y + 0.004, pEsp.z),
      new THREE.Vector3(pTof.x, 0.32, (pEsp.z + pTof.z) / 2),
      new THREE.Vector3(pTof.x, pTof.y + 0.01, pTof.z)
    ], 0.002, wireMatYellow));

    // 10. ESP32 to Autonomous Console
    const pConsole = controlConsoleGroup.position;
    wiringGroup.add(createSplineMesh([
      new THREE.Vector3(pEsp.x - 0.01, pEsp.y + 0.004, pEsp.z),
      new THREE.Vector3(-HALF_W + 0.05, 0.52, (pEsp.z + pConsole.z) / 2),
      new THREE.Vector3(pConsole.x, pConsole.y - 0.01, pConsole.z)
    ], 0.0025, wireMatBlack));
  }

  // -------------------------------------------------------------
  // 14. COMPONENT REGISTRY (METADATA, ANCHORS, STAGING SLOTS)
  // -------------------------------------------------------------
  componentRegistry.leftMotor = {
    title: "Left MY1016Z Geared Motor",
    group: leftMotorAssembly,
    nominalPos: MOTOR_NOMINAL_LEFT.clone(),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.08, -0.32),
    isStaged: false,
    anchors: [
      { name: "Forward Frame Rail (Nominal)", pos: MOTOR_NOMINAL_LEFT.clone() },
      { name: "Rear-Slung Axle", pos: new THREE.Vector3(HALF_W - 0.025, 0.26, rearAxleZ - 0.16) },
      { name: "High-Clearance Upper", pos: new THREE.Vector3(HALF_W - 0.025, 0.28, rearAxleZ + 0.12) }
    ]
  };

  componentRegistry.rightMotor = {
    title: "Right MY1016Z Geared Motor",
    group: rightMotorAssembly,
    nominalPos: MOTOR_NOMINAL_RIGHT.clone(),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.08, -0.16),
    isStaged: false,
    anchors: [
      { name: "Forward Frame Rail (Nominal)", pos: MOTOR_NOMINAL_RIGHT.clone() },
      { name: "Rear-Slung Axle", pos: new THREE.Vector3(-(HALF_W - 0.025), 0.26, rearAxleZ - 0.16) },
      { name: "High-Clearance Upper", pos: new THREE.Vector3(-(HALF_W - 0.025), 0.28, rearAxleZ + 0.12) }
    ]
  };

  componentRegistry.mainBattery = {
    title: "24V 30Ah 7S Li-ion Battery",
    group: mainBatteryGroup,
    nominalPos: BATT_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.06, 0.04),
    isStaged: false,
    anchors: [
      { name: "Under-Seat Low-CG Cradle", pos: BATT_NOMINAL.clone() },
      { name: "Rear-Hung Backrest Pocket", pos: new THREE.Vector3(0, 0.58, rearAxleZ - 0.12) },
      { name: "Mid-Chassis Upper Tray", pos: new THREE.Vector3(0, 0.32, 0.05) }
    ]
  };

  componentRegistry.dalyBms = {
    title: "Daly 7S 40A Li-ion BMS",
    group: dalyBmsGroup,
    nominalPos: BMS_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.03, 0.22),
    isStaged: false,
    anchors: [
      { name: "Battery Side Deck", pos: BMS_NOMINAL.clone() },
      { name: "Under-Seat Carrier Plate", pos: new THREE.Vector3(0.08, 0.42, -0.01) }
    ]
  };

  componentRegistry.fuses = {
    title: "40A Main & 2x 20A Motor Fuses",
    group: fusesGroup,
    nominalPos: FUSES_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.03, 0.38),
    isStaged: false,
    anchors: [
      { name: "Electrical Distribution Rail", pos: FUSES_NOMINAL.clone() },
      { name: "Lower Battery Tray Front", pos: new THREE.Vector3(-0.06, 0.24, 0.06) }
    ]
  };

  componentRegistry.contactor = {
    title: "24V DC Contactor & Safety Relay",
    group: contactorGroup,
    nominalPos: CONTACTOR_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X + 0.14, WB_Y + 0.04, -0.32),
    isStaged: false,
    anchors: [
      { name: "Under-Seat Electrical Backplane", pos: CONTACTOR_NOMINAL.clone() },
      { name: "Chassis Cross-Beam", pos: new THREE.Vector3(0.12, 0.28, 0.05) }
    ]
  };

  componentRegistry.motorDrivers = {
    title: "Dual >=36V H-Bridge Motor Drivers",
    group: motorDriversGroup,
    nominalPos: DRIVERS_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X + 0.14, WB_Y + 0.04, -0.12),
    isStaged: false,
    anchors: [
      { name: "Central Heatsink Plate", pos: DRIVERS_NOMINAL.clone() },
      { name: "Split Lateral Rail Mount", pos: new THREE.Vector3(0, 0.32, 0.10) }
    ]
  };

  componentRegistry.esp32 = {
    title: "ESP32-S3 DevKitC-1 Brain",
    group: esp32BrainGroup,
    nominalPos: ESP32_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X + 0.14, WB_Y + 0.02, 0.08),
    isStaged: false,
    anchors: [
      { name: "Protected Under-Seat Center", pos: ESP32_NOMINAL.clone() },
      { name: "Right Armrest Sub-Console", pos: new THREE.Vector3(-HALF_W, 0.64, 0.10) }
    ]
  };

  componentRegistry.lidar = {
    title: "LDROBOT STL-19P 360° LiDAR",
    group: lidarGroup,
    nominalPos: LIDAR_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X + 0.14, WB_Y + 0.04, 0.26),
    isStaged: false,
    anchors: [
      { name: "Forward Footrest Arch (0.42m)", pos: new THREE.Vector3(0, 0.42, frontCasterZ + 0.16) },
      { name: "Elevated Rigid Sensor Mast (0.74m)", pos: new THREE.Vector3(0, 0.74, frontCasterZ + 0.12) },
      { name: "Under-Seat Forward Lip", pos: new THREE.Vector3(0, 0.35, 0.22) }
    ]
  };

  componentRegistry.vl53l1x = {
    title: "Adafruit VL53L1X Cliff Drop ToF",
    group: vl53l1xGroup,
    nominalPos: TOF_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X + 0.14, WB_Y + 0.02, 0.42),
    isStaged: false,
    anchors: [
      { name: "Front Caster Cross-Tie (45°)", pos: TOF_NOMINAL.clone() },
      { name: "Forward Footplate Bridge", pos: new THREE.Vector3(0, 0.14, frontCasterZ + 0.22) }
    ]
  };

  componentRegistry.controlConsole = {
    title: "Autonomous Switch Hub (SW1/SW2/Horn)",
    group: controlConsoleGroup,
    nominalPos: CONSOLE_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X - 0.14, WB_Y + 0.04, -0.22),
    isStaged: false,
    anchors: [
      { name: "Right Armrest Forward", pos: CONSOLE_NOMINAL.clone() },
      { name: "Left Armrest Alternative", pos: new THREE.Vector3(HALF_W + 0.025, 0.72, 0.12) }
    ]
  };

  componentRegistry.eStop = {
    title: "Emergency Stop NC Mushroom Switch",
    group: eStopGroup,
    nominalPos: ESTOP_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X - 0.14, WB_Y + 0.04, 0.0),
    isStaged: false,
    anchors: [
      { name: "Left Armrest Reach", pos: ESTOP_NOMINAL.clone() },
      { name: "Right Armrest Companion", pos: new THREE.Vector3(-HALF_W - 0.025, 0.71, -0.02) }
    ]
  };

  componentRegistry.buck5v = {
    title: "24V to 5V DC Buck Converter (LM2596)",
    group: buck5vGroup,
    nominalPos: BUCK5V_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X - 0.14, WB_Y + 0.02, 0.18),
    isStaged: false,
    anchors: [
      { name: "Under-Seat Electronics Plate", pos: BUCK5V_NOMINAL.clone() },
      { name: "Battery Tray Front Wall", pos: new THREE.Vector3(-0.10, 0.26, 0.05) }
    ]
  };

  componentRegistry.mpu6050 = {
    title: "MPU6050 6-DoF Gyro / IMU",
    group: mpuGroup,
    nominalPos: MPU_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X - 0.14, WB_Y + 0.02, 0.32),
    isStaged: false,
    anchors: [
      { name: "Chassis Center of Mass (CoM)", pos: MPU_NOMINAL.clone() },
      { name: "Lower Cross-Beam Center", pos: new THREE.Vector3(0, 0.28, -0.04) }
    ]
  };

  componentRegistry.auxHorn = {
    title: "12V Disc Horn & 4S Aux Battery Pack",
    group: auxHornGroup,
    nominalPos: AUX_NOMINAL.clone(),
    stagedPos: new THREE.Vector3(WB_X - 0.14, WB_Y + 0.04, -0.06),
    isStaged: false,
    anchors: [
      { name: "Front Subframe Auxiliary Deck", pos: AUX_NOMINAL.clone() },
      { name: "Lower Seat Cross-Tube", pos: new THREE.Vector3(0, 0.26, 0.10) }
    ]
  };

  componentRegistry.brackets = {
    title: "Slotted Motor Clamp Brackets (Pair)",
    group: bracketsGroup,
    nominalPos: new THREE.Vector3(0, 0, 0),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.03, -0.42),
    isStaged: false,
    anchors: [
      { name: "Dual Tube Clamp (Nominal)", pos: new THREE.Vector3(0, 0, 0) },
      { name: "Rear Slung Truss Position", pos: new THREE.Vector3(0, 0.04, -0.22) }
    ]
  };

  componentRegistry.mountingPlates = {
    title: "6061-T6 Under-Seat Equipment Plate",
    group: mountingPlatesGroup,
    nominalPos: new THREE.Vector3(0, 0, 0),
    stagedPos: new THREE.Vector3(WB_X, WB_Y + 0.01, 0.0),
    isStaged: false,
    anchors: [
      { name: "Nominal Chassis Bed", pos: new THREE.Vector3(0, 0, 0) },
      { name: "Lower Rail Slung (24cm Clearance)", pos: new THREE.Vector3(0, -0.04, 0) }
    ]
  };

  // -------------------------------------------------------------
  // 15. PRESET LOADOUTS / SKINS DISPATCHER
  // -------------------------------------------------------------
  function applyPreset(presetKey) {
    if (presetKey === 'optimal') {
      // Balanced Low-CG setup
      leftMotorAssembly.position.copy(MOTOR_NOMINAL_LEFT);
      rightMotorAssembly.position.copy(MOTOR_NOMINAL_RIGHT);
      mainBatteryGroup.position.copy(BATT_NOMINAL);
      dalyBmsGroup.position.copy(BMS_NOMINAL);
      fusesGroup.position.copy(FUSES_NOMINAL);
      contactorGroup.position.copy(CONTACTOR_NOMINAL);
      motorDriversGroup.position.copy(DRIVERS_NOMINAL);
      buck5vGroup.position.copy(BUCK5V_NOMINAL);
      esp32BrainGroup.position.copy(ESP32_NOMINAL);
      mpuGroup.position.copy(MPU_NOMINAL);
      lidarGroup.position.copy(LIDAR_NOMINAL);
      vl53l1xGroup.position.copy(TOF_NOMINAL);
      auxHornGroup.position.copy(AUX_NOMINAL);
      controlConsoleGroup.position.copy(CONSOLE_NOMINAL);
      eStopGroup.position.copy(ESTOP_NOMINAL);
      bracketsGroup.position.set(0, 0, 0);
      mountingPlatesGroup.position.set(0, 0, 0);

      Object.values(componentRegistry).forEach(c => { if (c.isStaged !== undefined) c.isStaged = false; });
    } else if (presetKey === 'rearSlung') {
      // Motors placed behind rear axle, battery in rear-hung bracket
      leftMotorAssembly.position.set(HALF_W - 0.025, 0.26, rearAxleZ - 0.16);
      rightMotorAssembly.position.set(-(HALF_W - 0.025), 0.26, rearAxleZ - 0.16);
      mainBatteryGroup.position.set(0, 0.58, rearAxleZ - 0.12);
      dalyBmsGroup.position.set(0.12, 0.58, rearAxleZ - 0.12);
      lidarGroup.position.set(0, 0.74, frontCasterZ + 0.12);
      Object.values(componentRegistry).forEach(c => { if (c.isStaged !== undefined) c.isStaged = false; });
    } else if (presetKey === 'highClearance') {
      // Motors elevated, battery raised
      leftMotorAssembly.position.set(HALF_W - 0.025, 0.28, rearAxleZ + 0.12);
      rightMotorAssembly.position.set(-(HALF_W - 0.025), 0.28, rearAxleZ + 0.12);
      mainBatteryGroup.position.set(0, 0.32, 0.05);
      dalyBmsGroup.position.set(0.12, 0.32, 0.05);
      lidarGroup.position.set(0, 0.74, frontCasterZ + 0.12);
      Object.values(componentRegistry).forEach(c => { if (c.isStaged !== undefined) c.isStaged = false; });
    } else if (presetKey === 'staged') {
      // Moves ALL components aside onto the workbench table!
      Object.keys(componentRegistry).forEach(key => {
        const item = componentRegistry[key];
        if (item.stagedPos && item.group) {
          item.group.position.copy(item.stagedPos);
          item.isStaged = true;
        }
      });
    }

    // Refresh dynamic chains and dynamic wires
    const chainMetrics = updateDynamicChains();
    updateDynamicWires();
    return chainMetrics;
  }

  // Toggle stage aside for an individual component
  function setComponentStaged(key, stageAside = true) {
    const item = componentRegistry[key];
    if (!item) return;

    item.isStaged = stageAside;
    if (stageAside) {
      item.group.position.copy(item.stagedPos);
    } else {
      item.group.position.copy(item.nominalPos);
    }

    const chainMetrics = updateDynamicChains();
    updateDynamicWires();
    return chainMetrics;
  }

  // Snap component to a specific anchor index
  function snapComponentToAnchor(key, anchorIndex) {
    const item = componentRegistry[key];
    if (!item || !item.anchors || !item.anchors[anchorIndex]) return;

    item.group.position.copy(item.anchors[anchorIndex].pos);
    item.isStaged = false;

    const chainMetrics = updateDynamicChains();
    updateDynamicWires();
    return chainMetrics;
  }

  // Material switcher for mounting plates and brackets
  function setPlateMaterial(materialType) {
    let targetColor = 0xd4d8df; // 6061-T6 Aluminum default
    let targetMetal = 0.9;
    let targetRough = 0.22;
    let targetOpacity = 1.0;
    let targetTransparent = false;

    if (materialType === 'aluminum') {
      targetColor = 0xd4d8df; // 6061-T6 Aluminum brushed
      targetMetal = 0.9;
      targetRough = 0.22;
    } else if (materialType === 'steel') {
      targetColor = 0x22262e; // CRCA Cold-Rolled Steel powdercoated
      targetMetal = 0.7;
      targetRough = 0.4;
    } else if (materialType === 'carbon') {
      targetColor = 0x111317; // 3K Twill Carbon Fiber
      targetMetal = 0.35;
      targetRough = 0.45;
    } else if (materialType === 'acrylic') {
      targetColor = 0x38bdf8; // Transparent High-Impact Polycarbonate/Acrylic
      targetMetal = 0.1;
      targetRough = 0.1;
      targetOpacity = 0.55;
      targetTransparent = true;
    }

    materials.framePaint.color.setHex(targetColor);
    materials.framePaint.metalness = targetMetal;
    materials.framePaint.roughness = targetRough;
    materials.framePaint.opacity = targetOpacity;
    materials.framePaint.transparent = targetTransparent;
    materials.framePaint.needsUpdate = true;

    if (materials.rigidChassisMat) {
      materials.rigidChassisMat.color.setHex(targetColor);
      materials.rigidChassisMat.metalness = targetMetal;
      materials.rigidChassisMat.roughness = targetRough;
      materials.rigidChassisMat.opacity = targetOpacity;
      materials.rigidChassisMat.transparent = targetTransparent;
      materials.rigidChassisMat.needsUpdate = true;
    }
  }

  // Initial calculation
  updateDynamicChains();
  updateDynamicWires();

  return {
    componentsGroup,
    componentRegistry,
    leftMotorAssembly,
    rightMotorAssembly,
    bracketsGroup,
    mountingPlatesGroup,
    chainsGroup,
    mainBatteryGroup,
    dalyBmsGroup,
    fusesGroup,
    contactorGroup,
    eStopGroup,
    motorDriversGroup,
    buck5vGroup,
    esp32BrainGroup,
    mpuGroup,
    lidarGroup,
    vl53l1xGroup,
    auxHornGroup,
    controlConsoleGroup,
    wiringGroup,
    workbenchGroup,
    updateDynamicChains,
    updateDynamicWires,
    applyPreset,
    setComponentStaged,
    snapComponentToAnchor,
    // Aliases for compatibility
    motorsGroup: leftMotorAssembly,
    controllerBrainGroup: esp32BrainGroup,
    contactorSafetyGroup: contactorGroup,
    anchors: { batteryTrayY: 0.19, driverY: 0.44 },
    fixedWheelLeft: FIXED_WHEEL_LEFT,
    fixedWheelRight: FIXED_WHEEL_RIGHT
  };
}
