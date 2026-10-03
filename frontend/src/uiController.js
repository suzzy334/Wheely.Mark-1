import gsap from 'gsap';
import confetti from 'canvas-confetti';

export class UIController {
  constructor(scene, camera, controls, wheelchairBase, electricComponents, kinematics) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.base = wheelchairBase;
    this.components = electricComponents;
    this.kinematics = kinematics;

    // Component details for interactive inspector based on user Research Document
    this.componentDatabase = {
      motors: {
        title: "Dual 24V 250W MY1016Z Geared DC Motors",
        tag: "Powertrain",
        specs: [
          { label: "Rated Voltage", value: "24V DC" },
          { label: "Rated Power", value: "250W (x2 = 500W total)" },
          { label: "Rated Speed", value: "330 RPM (geared from 3000 RPM)" },
          { label: "Reduction Ratio", value: "9.78:1 Internal Spur Gearbox" },
          { label: "Output Sprocket", value: "9-Tooth (Compatible with #410 chain)" },
          { label: "Rated Current", value: "13.4A (28A peak stall per motor)" },
          { label: "Stall Torque", value: "9.8 Nm per motor (~17.4 Nm at wheel)" }
        ],
        mountingGuide: "Positioned forward of the rear axle, mounted to the custom slotted L-bracket. Slotted foot allows 25mm fore/aft travel for adjusting #410 chain tension. Ensure motor shaft is strictly parallel to the rear axle to eliminate chain twist.",
        fasteners: "4x M6 x 20mm Grade 8.8 hex bolts with spring washers and nyloc nuts per motor.",
        objectGroup: this.components.motorsGroup,
        cameraTarget: { x: 0.58, y: 0.42, z: 0.35, lookAt: { x: 0.20, y: 0.22, z: 0.05 } }
      },
      brackets: {
        title: "Custom Frame Clamp Motor Brackets",
        tag: "Fabrication",
        specs: [
          { label: "Material", value: "3.5mm Cold-Rolled Mild Steel (CRCA)" },
          { label: "Mounting Style", value: "Dual Tube Clamp (Non-destructive)" },
          { label: "Tube Diameters", value: "25mm Lower Rail & 25mm Rear Upright" },
          { label: "Tension Travel", value: "28mm horizontal adjustment slots" },
          { label: "Finish", value: "Black Powder-coat / Zinc Plating" }
        ],
        mountingGuide: "Clamps firmly around the wheelchair frame without requiring any welding on the thin-wall frame tubing. This preserves the structural integrity and temper of the original Healthshine frame.",
        fasteners: "2x 25mm heavy-duty U-bolts or CNC aluminum split collar clamps with M8 locknuts.",
        objectGroup: this.components.bracketsGroup,
        cameraTarget: { x: 0.58, y: 0.38, z: 0.35, lookAt: { x: 0.20, y: 0.20, z: 0.05 } }
      },
      chains: {
        title: "Heavy-Duty #410 Roller Drive Chains",
        tag: "Transmission",
        specs: [
          { label: "Chain Standard", value: "#410 / 1/2\" Pitch (12.7mm)" },
          { label: "Roller Width", value: "1/8\" (3.18mm)" },
          { label: "Drive Ratio", value: "16T (Wheel) / 9T (Motor) = 1.78:1" },
          { label: "Overall Ratio", value: "17.4:1 (Motor Armature to Wheel)" },
          { label: "Wheel Speed", value: "185 RPM (~12.8 km/h max theoretical)" },
          { label: "Chain Length", value: "54 links per side with master quick-link" }
        ],
        mountingGuide: "Pass chain around motor 9T sprocket and wheel 16T freewheel. Use the bracket slots to set 10-15mm vertical chain slack. Laser coplanar guide must show zero lateral twist.",
        fasteners: "Standard #410 spring clip connector master link.",
        objectGroup: this.components.chainsGroup,
        cameraTarget: { x: 0.68, y: 0.40, z: 0.12, lookAt: { x: 0.25, y: 0.26, z: -0.05 } }
      },
      freewheels: {
        title: "16-Tooth Wheel Hub Freewheel Sprockets",
        tag: "Rear Hub Drive",
        specs: [
          { label: "Teeth Count", value: "16 Teeth (Single-speed bicycle thread)" },
          { label: "Thread Standard", value: "1.375\" x 24 TPI Right-Hand" },
          { label: "Material", value: "Heat-treated Chromoly Steel & Bronze Plated" },
          { label: "Freewheel Action", value: "One-way ratcheting (Manual push freewheel)" },
          { label: "Hub Interface", value: "Threaded sleeve bolted to composite wheel hub" }
        ],
        mountingGuide: "Threaded adapter collar is secured to the inner hub of the Healthshine 24\" 6-spoke composite wheel. The freewheel allows the wheelchair to be rolled forward manually without motor resistance when powered off.",
        fasteners: "M12 extended axle spindle rod with welded internal collar and locking jamb nut.",
        objectGroup: this.base.leftRearWheel,
        cameraTarget: { x: 0.68, y: 0.45, z: -0.22, lookAt: { x: 0.26, y: 0.30, z: -0.16 } }
      },
      mainBattery: {
        title: "24V 30Ah 7S Li-ion Battery & Daly 40A BMS",
        tag: "Energy Storage",
        specs: [
          { label: "Configuration", value: "7S Lithium-ion (7 x 3.7V nominal = 25.9V)" },
          { label: "Full Charge Voltage", value: "29.4V (7 x 4.2V)" },
          { label: "Nominal Capacity", value: "30 Ah (777 Watt-hours Wh)" },
          { label: "Battery Management", value: "Daly 7S 40A Li-ion BMS with Cell Balancing" },
          { label: "Charger", value: "29.4V, 3A CC/CV Li-ion Smart Charger" },
          { label: "Mounting Style", value: "Hinged split tray (Folding) / Welded deck (Rigid)" }
        ],
        mountingGuide: "Mounted in the lowest central subframe zone beneath the seat to maintain the lowest possible Center of Gravity (CoG). For the folding chair, split hinged trays swing away to allow full 23 cm collapse without disconnecting cells.",
        fasteners: "Dual 38mm heavy-duty velcro cinch straps with M6 vibration rubber dampeners.",
        objectGroup: this.components.mainBatteryGroup,
        cameraTarget: { x: 0.55, y: 0.40, z: 0.15, lookAt: { x: 0, y: 0.20, z: -0.01 } }
      },
      contactor: {
        title: "24V DC Contactor & Emergency Stop System",
        tag: "Safety System",
        specs: [
          { label: "Contactor Type", value: "24V DC Heavy-Duty Solenoid Contactor" },
          { label: "Continuous Current", value: "100A Rated Main Copper Contacts" },
          { label: "E-Stop Switch", value: "Red Mushroom Twist-to-Reset NC Contact" },
          { label: "Coil Control", value: "ESP32 GPIO21 via Logic N-MOSFET (100Ω + 10kΩ)" },
          { label: "Flyback Diode", value: "1N5408 across coil for inductive spike suppression" },
          { label: "Safety Isolation", value: "Physical battery-to-motor disconnect (<15ms)" }
        ],
        mountingGuide: "Positioned directly between the main 40A battery fuse and the motor power bus. When the E-Stop is pressed or ESP32 drops GPIO21, the contactor coil de-energizes, physically disconnecting 24V power from the motor drivers. Substantially safer than software-only shutdown.",
        fasteners: "2x M5 chassis mount screws on under-seat electrical backplane.",
        objectGroup: this.components.contactorSafetyGroup,
        cameraTarget: { x: 0.45, y: 0.55, z: 0.25, lookAt: { x: 0.12, y: 0.44, z: 0.02 } }
      },
      fuses: {
        title: "Main 40A DC Fuse & 2x 20A Motor Branch Fuses",
        tag: "Electrical Protection",
        specs: [
          { label: "Main Fuse", value: "40A Automotive Maxi Blade Fuse" },
          { label: "Branch Fuses", value: "2x 20A Blade Fuses (Left & Right Motor Buses)" },
          { label: "Cable Gauge", value: "6 mm² High-Temperature Flexible Copper Wire" },
          { label: "Protection", value: "Instant short-circuit and motor-stall burnout isolation" }
        ],
        mountingGuide: "Main 40A fuse is placed within 10cm of the BMS P+ terminal. Motor branch 20A fuses sit downstream of the contactor, protecting each individual H-bridge driver.",
        fasteners: "Snap-in weatherproof inline fuse holder blocks.",
        objectGroup: this.components.fusesGroup,
        cameraTarget: { x: 0.35, y: 0.55, z: 0.20, lookAt: { x: -0.04, y: 0.44, z: 0.02 } }
      },
      motorDrivers: {
        title: "Dual >=36V H-Bridge Motor Drivers (Upgraded BTS7960)",
        tag: "Motor Drive",
        specs: [
          { label: "Rated Voltage", value: ">=36V DC Class (Required for 29.4V full 7S battery!)" },
          { label: "Continuous Current", value: "30A - 43A per channel" },
          { label: "Peak Current", value: "70A Surge" },
          { label: "Bulk Capacitance", value: "1000 µF / 35V Low-ESR Electrolytic per driver" },
          { label: "Decoupling", value: "100 nF High-Frequency Ceramic per driver" },
          { label: "Logic Interface", value: "3.3V ESP32 Compatible (RPWM, LPWM, R_EN, L_EN)" }
        ],
        mountingGuide: "CRITICAL FIX: The stock BTS7960 IC specifies a 27.5V max operating limit, whereas a 7S Li-ion battery reaches 29.4V at full charge. An upgraded >=36V class driver is installed with dual 1000µF/35V bulk caps to eliminate destructive voltage transient spikes during rapid regenerative braking.",
        fasteners: "4x M3 standoffs on aluminum heatsink plate with thermal compound.",
        objectGroup: this.components.motorDriversGroup,
        cameraTarget: { x: 0.40, y: 0.60, z: 0.32, lookAt: { x: 0, y: 0.45, z: 0.12 } }
      },
      esp32: {
        title: "ESP32-S3 DevKitC-1 Autonomous Robotic Controller",
        tag: "Brain & Navigation",
        specs: [
          { label: "Processor", value: "Xtensa 32-bit LX7 Dual-Core @ 240 MHz" },
          { label: "Memory", value: "16MB Quad-SPI Flash + 8MB Octal PSRAM" },
          { label: "Vector Extension", value: "Accelerated AI inference for point cloud processing" },
          { label: "Power Supply", value: "5V from LM2596 Buck (GPIO matrix 3.3V)" },
          { label: "Peripherals", value: "UART (LiDAR), I2C (IMU & Cliff ToF), PWM (Motors)" }
        ],
        mountingGuide: "Centered under the seat on an insulated anti-vibration carrier plate. Connects to LDROBOT STL-19P LiDAR via UART (GPIO18 @ 230400 bps) and MPU6050 + VL53L1X via I2C (GPIO4 SDA, GPIO5 SCL).",
        fasteners: "M2.5 nylon standoffs with silicone vibration isolation grommets.",
        objectGroup: this.components.controllerBrainGroup,
        cameraTarget: { x: 0.30, y: 0.65, z: 0.15, lookAt: { x: 0, y: 0.46, z: -0.04 } }
      },
      lidar: {
        title: "LDROBOT STL-19P (D500) 360° 2D LiDAR",
        tag: "Obstacle Avoidance",
        specs: [
          { label: "Technology", value: "Direct Time-of-Flight (DTOF) Triangulation" },
          { label: "Field of View", value: "360° Omnidirectional Horizontal Plane" },
          { label: "Detection Range", value: "0.05m to 12.0m (8m on dark targets)" },
          { label: "Scan Frequency", value: "10 Hz default (600 RPM)" },
          { label: "Baud Rate", value: "230400 bps, 8-N-1 (ESP32 GPIO18 RX)" },
          { label: "Supply Voltage", value: "5V DC (PWM grounded for constant 10Hz speed)" }
        ],
        mountingGuide: "In Chair 1 (Folding), mounted on a forward footrest arch with quick-release so it stays clear during folding. In Chair 2 (Rigid Platform), mounted on the central rigid front sensor mast at 0.74m height for unobstructed 360° environment mapping.",
        fasteners: "3x M2.5 socket head screws on rigid dampening pedestal.",
        objectGroup: this.components.lidarGroup,
        cameraTarget: { x: 0.45, y: 0.65, z: 0.60, lookAt: { x: 0, y: 0.50, z: 0.40 } }
      },
      vl53l1x: {
        title: "Adafruit VL53L1X Downward Cliff & Drop Sensor",
        tag: "Drop / Stair Safety",
        specs: [
          { label: "Sensor Type", value: "Time-of-Flight (ToF) Infrared VCSEL Laser" },
          { label: "Range", value: "Up to 4.0 meters (Millimeter precision)" },
          { label: "I2C Address", value: "0x29 (Coexists with MPU6050 0x68 on GPIO4/5)" },
          { label: "Orientation", value: "Angled 45° downward toward ground ahead of casters" },
          { label: "Safety Action", value: "Drops contactor & halts drive when floor distance > 55cm" }
        ],
        mountingGuide: "Mounted at the front caster bridge angled 45° downward. Continuously samples distance to the floor. If a downward step, cliff, or missing ramp edge is encountered, distance abruptly increases (>55cm), triggering an immediate emergency stop interlock before front wheels drop.",
        fasteners: "2x M2.5 nylon bolts on 45° angled bracket.",
        objectGroup: this.components.vl53l1xGroup,
        cameraTarget: { x: 0.30, y: 0.35, z: 0.48, lookAt: { x: 0, y: 0.18, z: 0.36 } }
      },
      auxHorn: {
        title: "Auxiliary 4S Battery, 12V Buck & Disc Horn",
        tag: "Acoustic Warning",
        specs: [
          { label: "Auxiliary Battery", value: "4S1P Li-ion (14.8V nominal, 16.8V max, 2600 mAh)" },
          { label: "Aux Charger", value: "16.8V 4S Smart Charger" },
          { label: "Buck Converter", value: "14.8V-16.8V -> 12V Step-Down Converter" },
          { label: "Horn Unit", value: "12V High-Decibel Disc Horn (105 dB)" },
          { label: "Driver Circuit", value: "Logic N-MOSFET (Gate GPIO17 via 100Ω + 10kΩ pulldown)" },
          { label: "Protection", value: "1N5408 Flyback Diode across horn terminals" }
        ],
        mountingGuide: "Dedicated auxiliary domain prevents noisy horn pulses from causing voltage sags on the ESP32 brain. Controlled electronically via GPIO17 through an N-MOSFET switch with flyback suppression. No mechanical relay required.",
        fasteners: "M8 bracket stud on chassis crossmember.",
        objectGroup: this.components.auxHornGroup,
        cameraTarget: { x: 0.40, y: 0.48, z: 0.35, lookAt: { x: 0.12, y: 0.32, z: 0.24 } }
      },
      controlConsole: {
        title: "Autonomous Control Console & SPDT Switches",
        tag: "User Interface",
        specs: [
          { label: "Console Type", value: "Autonomous Switch Hub (STRICTLY NO JOYSTICK)" },
          { label: "Switch 1 (GPIO6)", value: "SPDT Toggle: AUTO (SLAM/Nav) / MANUAL Mode" },
          { label: "Switch 2 (GPIO7)", value: "SPDT Toggle: ECO (4 km/h) / SPORT (8 km/h)" },
          { label: "Horn Button (GPIO16)", value: "Momentary Push Button with internal pull-up" },
          { label: "Wiring", value: "Low-voltage shielded control loom to ESP32-S3" }
        ],
        mountingGuide: "Clamps to right armrest for accessible mode switching. Digital inputs use ESP32 internal pullups so toggling connects to GND, ensuring noise-immune switching without drawing excessive current.",
        fasteners: "Split tube clamp with ergonomic knurled thumb screw.",
        objectGroup: this.components.controlConsoleGroup,
        cameraTarget: { x: -0.55, y: 0.90, z: 0.30, lookAt: { x: -0.25, y: 0.72, z: 0.12 } }
      }
    };

    // Step-by-step mounting guide state
    this.currentStep = 0;
    this.mountingSteps = [
      {
        stepNum: 1,
        title: "Phase 1: Rear Wheel 16T Freewheel Sprocket Installation",
        componentKey: "freewheels",
        action: "Inspect & Secure Wheel Sprockets",
        description: "Install 16T freewheel adapter onto the inner hub of each 24-inch composite wheel. Thread the M12 high-tensile axle rod through frame upright collar, lock with welded inner nut, and verify smooth zero-play freewheeling rotation.",
        tips: "Use threadlocker (Loctite 242) on axle jamb nuts. Verify freewheel ratchets smoothly when rotated backwards."
      },
      {
        stepNum: 2,
        title: "Phase 2: Slotted Motor Mounts & Dual MY1016Z 24V Motors + #410 Chains",
        componentKey: "motors",
        action: "Mount Motors & Tension Chains",
        description: "Attach the 3.5mm slotted steel brackets to frame tubes. Bolt dual MY1016Z 24V geared motors with 9T sprockets. Wrap #410 roller chains and adjust horizontal slots to achieve 12mm chain slack with zero lateral twist.",
        tips: "Ensure motor shaft is strictly parallel with the rear axle. Use laser guide line to confirm coplanar alignment."
      },
      {
        stepNum: 3,
        title: "Phase 3: 24V 30Ah 7S Li-ion Battery, Daly 40A BMS & 24V Contactor",
        componentKey: "mainBattery",
        action: "Install Main Power & Safety Contactor",
        description: "Suspend the 24V 30Ah 7S battery and Daly 40A BMS in the low-slung cradle. Wire BMS P+ through 40A Maxi blade fuse to 24V DC Contactor. Wire NC E-Stop switch on left armrest in series with contactor coil and GPIO21 MOSFET driver.",
        tips: "7S Li-ion reaches 29.4V full charge. Contactor ensures physical power cutoff during safety alerts."
      },
      {
        stepNum: 4,
        title: "Phase 4: Dual >=36V H-Bridge Drivers with 1000µF Bulk Capacitors",
        componentKey: "motorDrivers",
        action: "Mount Drivers & Decoupling Caps",
        description: "Mount dual >=36V rated H-bridge motor drivers. Connect 1000µF/35V bulk capacitors across B+/B- power rails and 100nF ceramic caps near logic pins. Wire each driver through its dedicated 20A branch fuse to the contactor output bus.",
        tips: "BTS7960 max rating is 27.5V. Upgraded >=36V class drivers prevent burnout at 29.4V full charge."
      },
      {
        stepNum: 5,
        title: "Phase 5: Autonomous Sensors: LDROBOT STL-19P LiDAR & VL53L1X Cliff ToF",
        componentKey: "lidar",
        action: "Mount SLAM & Cliff Sensor Array",
        description: "Mount LDROBOT STL-19P 360° LiDAR on forward arch (or rigid mast). Wire UART TX to ESP32 GPIO18 and 5V power from LM2596 buck. Install Adafruit VL53L1X angled 45° downward at front caster bridge and MPU6050 IMU on I2C (GPIO4/5).",
        tips: "Ground LiDAR PWM line for constant 10Hz rotational scanning. VL53L1X provides cliff drop protection."
      },
      {
        stepNum: 6,
        title: "Phase 6: ESP32-S3 Brain, SPDT Mode Switches & Autonomous Commissioning",
        componentKey: "controlConsole",
        action: "Final Wiring & Autonomous Validation",
        description: "Wire ESP32-S3-DevKitC-1 with SPDT Mode Switch 1 (AUTO/MANUAL), Switch 2 (ECO/SPORT), Horn push button (GPIO16), and 12V horn MOSFET (GPIO17). Test autonomous obstacle avoidance and emergency stop contactor drop with wheels off ground.",
        tips: "Perform first motor spin with wheels suspended in air to verify differential steering direction and deadband."
      }
    ];

    this.activeInput = { throttle: 0, steer: 0 };
    this.isDriveMode = false;
    this.keyState = {};

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keyState[e.key.toLowerCase()] = true;
      this.handleKeyDrive();
    });

    window.addEventListener('keyup', (e) => {
      this.keyState[e.key.toLowerCase()] = false;
      this.handleKeyDrive();
    });
  }

  handleKeyDrive() {
    let throttle = 0;
    let steer = 0;

    if (this.keyState['w'] || this.keyState['arrowup']) throttle += 1.0;
    if (this.keyState['s'] || this.keyState['arrowdown']) throttle -= 0.8;
    if (this.keyState['a'] || this.keyState['arrowleft']) steer -= 0.9;
    if (this.keyState['d'] || this.keyState['arrowright']) steer += 0.9;

    this.activeInput.throttle = throttle;
    this.activeInput.steer = steer;
  }

  // Camera presets
  setCameraPreset(presetName) {
    const targets = {
      isometric: { pos: { x: 1.25, y: 0.95, z: 1.35 }, look: { x: 0, y: 0.35, z: 0 } },
      side: { pos: { x: 1.45, y: 0.45, z: 0.05 }, look: { x: 0.25, y: 0.32, z: -0.05 } },
      rear: { pos: { x: 0.0, y: 0.45, z: -1.45 }, look: { x: 0, y: 0.35, z: -0.10 } },
      underseat: { pos: { x: 0.65, y: 0.20, z: 0.35 }, look: { x: 0.05, y: 0.28, z: 0.0 } },
      top: { pos: { x: 0.01, y: 1.85, z: 0.01 }, look: { x: 0, y: 0.25, z: 0 } },
      sensors: { pos: { x: 0.45, y: 0.70, z: 0.70 }, look: { x: 0, y: 0.45, z: 0.35 } }
    };

    const target = targets[presetName] || targets.isometric;

    gsap.to(this.camera.position, {
      x: target.pos.x,
      y: target.pos.y,
      z: target.pos.z,
      duration: 1.1,
      ease: "power2.inOut"
    });

    gsap.to(this.controls.target, {
      x: target.look.x,
      y: target.look.y,
      z: target.look.z,
      duration: 1.1,
      ease: "power2.inOut"
    });
  }

  // Focus on specific component
  focusComponent(componentKey) {
    const data = this.componentDatabase[componentKey];
    if (!data) return;

    this.showComponentCard(data);

    if (data.cameraTarget) {
      gsap.to(this.camera.position, {
        x: data.cameraTarget.x,
        y: data.cameraTarget.y,
        z: data.cameraTarget.z,
        duration: 1.2,
        ease: "power2.inOut"
      });
      gsap.to(this.controls.target, {
        x: data.cameraTarget.lookAt.x,
        y: data.cameraTarget.lookAt.y,
        z: data.cameraTarget.lookAt.z,
        duration: 1.2,
        ease: "power2.inOut"
      });
    }
  }

  showComponentCard(data) {
    const card = document.getElementById('component-inspector-card');
    if (!card) return;

    card.classList.remove('hidden');
    card.classList.add('animate-slide-in');

    const titleEl = document.getElementById('inspector-title');
    const tagEl = document.getElementById('inspector-tag');
    if (titleEl) titleEl.textContent = data.title;
    if (tagEl) tagEl.textContent = data.tag;

    const specsContainer = document.getElementById('inspector-specs');
    if (specsContainer) {
      specsContainer.innerHTML = '';
      data.specs.forEach(s => {
        const row = document.createElement('div');
        row.className = 'spec-row';
        row.innerHTML = `<span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span>`;
        specsContainer.appendChild(row);
      });
    }

    const guideEl = document.getElementById('inspector-guide');
    if (guideEl) guideEl.textContent = data.mountingGuide;
    const fastEl = document.getElementById('inspector-fasteners');
    if (fastEl) fastEl.textContent = data.fasteners;
  }

  // Initial step setup
  initStepDisplay(stepIndex = 0) {
    this.currentStep = stepIndex;
    const step = this.mountingSteps[this.currentStep];
    const elIndicator = document.getElementById('step-indicator');
    if (elIndicator) elIndicator.textContent = `Step ${step.stepNum} of 6`;
    const elTitle = document.getElementById('step-title');
    if (elTitle) elTitle.textContent = step.title;
    const elDesc = document.getElementById('step-desc');
    if (elDesc) elDesc.textContent = step.description;
    const elTip = document.getElementById('step-tip');
    if (elTip) elTip.textContent = step.tips;
  }

  goToStep(stepIndex) {
    if (stepIndex < 0) stepIndex = 0;
    if (stepIndex >= this.mountingSteps.length) stepIndex = this.mountingSteps.length - 1;
    this.currentStep = stepIndex;

    const step = this.mountingSteps[this.currentStep];

    const elIndicator = document.getElementById('step-indicator');
    if (elIndicator) elIndicator.textContent = `Step ${step.stepNum} of 6`;
    const elTitle = document.getElementById('step-title');
    if (elTitle) elTitle.textContent = step.title;
    const elDesc = document.getElementById('step-desc');
    if (elDesc) elDesc.textContent = step.description;
    const elTip = document.getElementById('step-tip');
    if (elTip) elTip.textContent = step.tips;

    this.focusComponent(step.componentKey);

    this.kinematics.mountComponent(step.componentKey, (name) => {
      if (step.stepNum === 6) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    });
  }

  nextStep() {
    this.goToStep(this.currentStep + 1);
  }

  prevStep() {
    this.goToStep(this.currentStep - 1);
  }
}
