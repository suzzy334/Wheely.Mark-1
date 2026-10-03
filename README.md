# Wheely.Mark-1 ♿⚡

> **Precision 3D Kinematic Simulation & Autonomous Conversion Kit for Healthshine Manual Wheelchair**

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=flat&logo=threedotjs)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![FreeCAD](https://img.shields.io/badge/FreeCAD-0.21%2B-red?style=flat&logo=freecad)](https://www.freecad.org)

---

## 🌟 Overview

**Wheely.Mark-1** is a high-fidelity 3D digital twin and interactive physics simulator designed for retrofitting standard manual wheelchairs (such as the Healthshine manual folding wheelchair) into fully autonomous, electric-powered personal mobility devices.

### Key Capabilities:
- **Kinematic Folding Simulation (0% - 100%)**: Continuous scissor cross-brace linkage kinematics with dynamic fabric seat and backrest sag modeling.
- **Autonomous Sensor & Power Architecture**:
  - **Front Autonomous Navigation Arch**: 360° LiDAR rangefinder, forward ultrasonic array, wide-angle depth camera, and high-visibility status LED indicators.
  - **Drive System**: Dual 24V 350W geared brushless hub/planetary drive units mounted on heavy-duty cantilever clamp brackets driving the 24" rear wheels via #25 sprockets and roller chains.
  - **Power & BMS Module**: 24V 30Ah Li-ion battery pack with integrated 40A smart BMS, solid-state master power switch, and 30A automotive blade fuses.
  - **Control Electronics Enclosure**: ESP32-S3 dual-core microcontroller, MPU6050 6-DOF IMU, dual high-current H-bridge motor drivers, optical wheel speed encoders, and buck converters.
  - **Cockpit Human-Machine Interface**: Ergonomic 2-axis Hall-effect thumb joystick, emergency safety stop switch, and OLED telemetry display.
- **Physical Collision Clearance**: Validated through rigorous solid-intersection testing in FreeCAD with **$0.0000\text{ mm}^3$ intersection volume** across all 5 folding stages (0%, 25%, 50%, 75%, 100%).

---

## 📁 Repository Structure

```tree
Wheely.Mark-1/
├── frontend/                     # Web application for Vercel deployment
│   ├── index.html                # Main entry HTML with interactive 3D viewport & control panels
│   ├── package.json              # Web app dependencies (Three.js, GSAP, canvas-confetti, Vite)
│   ├── vercel.json               # Directory-level Vercel configuration
│   ├── public/
│   │   └── cad/                  # Downloadable CAD assemblies & STEP exports
│   │       ├── Wheelchair_Open_Full_Assembly.step
│   │       ├── Wheelchair_Folded_Assembly.step
│   │       ├── Wheelchair_Animation.FCMacro
│   │       └── exports_step/     # Individual STEP solid components
│   └── src/
│       ├── main.js               # Application orchestration & render loop
│       ├── wheelchairModel.js    # Healthshine wheelchair frame, wheels, rigging & fabrics
│       ├── autonomousKit.js      # LiDAR arch, motors, brackets, battery box, electronics
│       ├── kinematics.js         # Exact analytical scissor-linkage and fabric folding math
│       ├── wheelchairPhysics.js  # Differential-drive kinematic equations & joystick steering
│       ├── componentsModel.js    # Component inspection exploded views & detailed callouts
│       ├── uiController.js       # HUD, telemetry overlays, folding sliders & camera bookmarks
│       └── style.css             # Cyberpunk/industrial high-contrast dark theme HUD styling
├── vercel.json                   # Root Vercel configuration pointing to frontend/
├── .gitignore                    # Production git ignore rules
└── README.md                     # Project documentation & deployment guide
```

---

## 🚀 How to Host on Vercel

Hosting **Wheely.Mark-1** on Vercel takes less than a minute:

### Option A: Import via Vercel Web Dashboard (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account (`suzzy334`) and select the **`Wheely.Mark-1`** repository.
3. In the **Configure Project** screen:
   - **Project Name**: `wheely-mark-1` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`** (or leave default since root `vercel.json` already specifies `"rootDirectory": "frontend"`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**.
5. Once complete, Vercel will give you a live HTTPS domain (e.g., `https://wheely-mark-1.vercel.app`).

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# From the root of the repository
vercel
```

---

## 💻 Local Development

To run and preview the 3D application locally:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🎮 Interactive Web Controls

- **Left Mouse Click + Drag**: Orbit / Rotate 3D camera.
- **Right Mouse Click + Drag**: Pan camera.
- **Scroll Wheel**: Zoom in / out.
- **Fold / Unfold Slider**: Real-time kinematic simulation of scissor linkage folding from 0% (fully open) to 100% (fully compacted).
- **Drive / Steer Joystick**: On-screen virtual joystick and WASD / Arrow keys for differential drive physics control.
- **Autonomous Navigation**: Toggle LiDAR scan beam visualization, ultrasonic obstacle detection, and path trajectory preview.
- **CAD Downloads**: Download production STEP models directly from the HUD header menu.

---

## 📜 License

MIT License. Designed and engineered for open-source accessibility and assistive robotics innovation.
