import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AircraftTelemetry } from '../../types';
import { Box, Layers, Flame, Zap, Eye, RotateCw, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export type RenderMode = 'SOLID' | 'WIREFRAME' | 'XRAY' | 'THERMAL_STRESS';

interface Aircraft3DModelProps {
  telemetry: AircraftTelemetry;
  selectedSubsystemId: string | null;
  onSelectSubsystem: (subsystemId: string) => void;
  isExploded: boolean;
}

export const Aircraft3DModel: React.FC<Aircraft3DModelProps> = ({
  telemetry,
  selectedSubsystemId,
  onSelectSubsystem,
  isExploded
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('SOLID');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const fanLeftRef = useRef<THREE.Group | null>(null);
  const fanRightRef = useRef<THREE.Group | null>(null);
  const engineLeftMeshRef = useRef<THREE.Mesh | null>(null);
  const engineRightMeshRef = useRef<THREE.Mesh | null>(null);
  const fuselageMeshRef = useRef<THREE.Mesh | null>(null);
  const wingsMeshRef = useRef<THREE.Mesh | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040812);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 12, 24);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.4);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffb703, 0.8);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00ff88, 1.2, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f0ff, 0x112244);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // 5. Construct Procedural 3D Aircraft
    const aircraftGroup = new THREE.Group();
    groupRef.current = aircraftGroup;

    // Standard materials
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false
    });

    const liveryCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x003344
    });

    // A. Fuselage
    const fuselageGeom = new THREE.CylinderGeometry(1.6, 1.3, 22, 32);
    fuselageGeom.rotateZ(Math.PI / 2);
    const fuselageMesh = new THREE.Mesh(fuselageGeom, solidMat.clone());
    fuselageMeshRef.current = fuselageMesh;
    aircraftGroup.add(fuselageMesh);

    // Nose Cone
    const noseGeom = new THREE.ConeGeometry(1.3, 4, 32);
    noseGeom.rotateZ(-Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeom, solidMat.clone());
    noseMesh.position.set(13, 0, 0);
    aircraftGroup.add(noseMesh);

    // Cockpit Windshield (Glass)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6
    });
    const cockpitGeom = new THREE.BoxGeometry(2.2, 0.9, 1.8);
    const cockpitMesh = new THREE.Mesh(cockpitGeom, glassMat);
    cockpitMesh.position.set(11.5, 0.7, 0);
    cockpitMesh.rotation.z = -0.2;
    aircraftGroup.add(cockpitMesh);

    // B. Swept Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(-5, 14);
    wingShape.lineTo(-7, 14);
    wingShape.lineTo(-6, 0);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.35, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
    const wingGeom = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeom.rotateX(Math.PI / 2);
    wingGeom.rotateZ(-Math.PI / 2);
    wingGeom.center();

    // Left Wing
    const leftWing = new THREE.Mesh(wingGeom, solidMat.clone());
    leftWing.position.set(0, 0, 8);
    leftWing.rotation.x = -0.08;
    aircraftGroup.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(wingGeom, solidMat.clone());
    rightWing.position.set(0, 0, -8);
    rightWing.rotation.x = 0.08;
    rightWing.scale.z = -1;
    aircraftGroup.add(rightWing);
    wingsMeshRef.current = leftWing;

    // Sharklets / Winglets
    const sharkletGeom = new THREE.BoxGeometry(1.2, 2.2, 0.15);
    const sharkletLeft = new THREE.Mesh(sharkletGeom, liveryCyanMat);
    sharkletLeft.position.set(-3.5, 1.2, 15);
    sharkletLeft.rotation.z = -0.3;
    aircraftGroup.add(sharkletLeft);

    const sharkletRight = new THREE.Mesh(sharkletGeom, liveryCyanMat);
    sharkletRight.position.set(-3.5, 1.2, -15);
    sharkletRight.rotation.z = -0.3;
    aircraftGroup.add(sharkletRight);

    // C. Vertical Stabilizer (Tail Fin)
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(-4, 6);
    tailShape.lineTo(-6, 6);
    tailShape.lineTo(-4, 0);
    tailShape.closePath();

    const tailGeom = new THREE.ExtrudeGeometry(tailShape, extrudeSettings);
    tailGeom.center();
    const tailMesh = new THREE.Mesh(tailGeom, liveryCyanMat);
    tailMesh.position.set(-8.5, 4.2, 0);
    tailMesh.rotation.y = Math.PI / 2;
    aircraftGroup.add(tailMesh);

    // Horizontal Stabilizers
    const hStabGeom = new THREE.BoxGeometry(3, 0.2, 9);
    const hStabMesh = new THREE.Mesh(hStabGeom, solidMat.clone());
    hStabMesh.position.set(-10, 1.2, 0);
    aircraftGroup.add(hStabMesh);

    // D. Dual Turbofan Engines (Left & Right CFM LEAP / Trent Nacelles)
    const nacelleGeom = new THREE.CylinderGeometry(1.35, 1.25, 4.5, 32);
    nacelleGeom.rotateZ(Math.PI / 2);

    // Engine Left
    const engLeftMesh = new THREE.Mesh(nacelleGeom, solidMat.clone());
    engLeftMesh.position.set(2, -1.8, 5.5);
    aircraftGroup.add(engLeftMesh);
    engineLeftMeshRef.current = engLeftMesh;

    // Left Fan Blades
    const fanLeftGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const bladeGeom = new THREE.BoxGeometry(0.08, 1.1, 0.3);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.rotation.x = (i * Math.PI) / 8;
      blade.position.set(3.8, -1.8, 5.5);
      fanLeftGroup.add(blade);
    }
    aircraftGroup.add(fanLeftGroup);
    fanLeftRef.current = fanLeftGroup;

    // Engine Right
    const engRightMesh = new THREE.Mesh(nacelleGeom, solidMat.clone());
    engRightMesh.position.set(2, -1.8, -5.5);
    aircraftGroup.add(engRightMesh);
    engineRightMeshRef.current = engRightMesh;

    // Right Fan Blades
    const fanRightGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const bladeGeom = new THREE.BoxGeometry(0.08, 1.1, 0.3);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      blade.rotation.x = (i * Math.PI) / 8;
      blade.position.set(3.8, -1.8, -5.5);
      fanRightGroup.add(blade);
    }
    aircraftGroup.add(fanRightGroup);
    fanRightRef.current = fanRightGroup;

    scene.add(aircraftGroup);

    // 6. Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate fan blades according to N1 RPM
      if (fanLeftRef.current) {
        fanLeftRef.current.rotation.x += (telemetry.engine1.n1Percent / 100) * 0.4;
      }
      if (fanRightRef.current) {
        fanRightRef.current.rotation.x += (telemetry.engine2.n1Percent / 100) * 0.4;
      }

      // Auto rotation
      if (autoRotate && !isDraggingRef.current && groupRef.current) {
        groupRef.current.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Mouse Orbit Controls
    const domElem = mountRef.current;
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !groupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      groupRef.current.rotation.y += deltaX * 0.008;
      groupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(8, Math.min(60, cameraRef.current.position.z + e.deltaY * 0.03));
    };

    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update render mode materials
  useEffect(() => {
    if (!sceneRef.current) return;

    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (renderMode === 'WIREFRAME') {
          child.material.wireframe = true;
          child.material.color = new THREE.Color(0x00f0ff);
        } else if (renderMode === 'XRAY') {
          child.material.wireframe = false;
          child.material.transparent = true;
          child.material.opacity = 0.35;
          child.material.color = new THREE.Color(0x0088cc);
        } else if (renderMode === 'THERMAL_STRESS') {
          child.material.wireframe = false;
          child.material.transparent = false;
          child.material.opacity = 1;
          // Color engine 2 hot crimson if EGT > 750 or N2 vibration elevated
          if (child === engineRightMeshRef.current) {
            child.material.color = new THREE.Color(telemetry.engine2.egtDegC > 750 ? 0xff0055 : 0xffb703);
            child.material.emissive = new THREE.Color(telemetry.engine2.egtDegC > 750 ? 0x660022 : 0x332200);
          } else if (child === engineLeftMeshRef.current) {
            child.material.color = new THREE.Color(0x00ff88);
            child.material.emissive = new THREE.Color(0x002211);
          } else {
            child.material.color = new THREE.Color(0x1e3a8a);
          }
        } else {
          // SOLID
          child.material.wireframe = false;
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.color = new THREE.Color(0x1e293b);
          child.material.emissive = new THREE.Color(0x000000);
        }
        child.material.needsUpdate = true;
      }
    });
  }, [renderMode, telemetry]);

  // Handle Explode animation
  useEffect(() => {
    if (!engineLeftMeshRef.current || !engineRightMeshRef.current) return;

    const offset = isExploded ? 3.5 : 0;
    engineLeftMeshRef.current.position.z = 5.5 + offset;
    engineRightMeshRef.current.position.z = -5.5 - offset;
    if (fanLeftRef.current) fanLeftRef.current.position.z = 5.5 + offset;
    if (fanRightRef.current) fanRightRef.current.position.z = -5.5 - offset;
  }, [isExploded]);

  const resetView = () => {
    if (groupRef.current && cameraRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(18, 12, 24);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden glass-panel border border-hud-cyan/30 shadow-2xl">
      {/* Top 3D Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Render Modes */}
        <div className="flex items-center gap-1 bg-aerospace-900/90 border border-hud-cyan/30 rounded-xl p-1 backdrop-blur-md pointer-events-auto text-xs font-mono">
          <span className="px-2 text-hud-cyan font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            SHADING:
          </span>
          {(['SOLID', 'WIREFRAME', 'XRAY', 'THERMAL_STRESS'] as RenderMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setRenderMode(mode)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === mode
                  ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Orbit Controls & Reset */}
        <div className="flex items-center gap-1.5 bg-aerospace-900/90 border border-hud-cyan/30 rounded-xl p-1 backdrop-blur-md pointer-events-auto text-xs font-mono">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Disable Auto Rotation' : 'Enable Auto Rotation'}
            className={`p-1.5 rounded-lg transition-colors ${
              autoRotate ? 'bg-hud-cyan/20 text-hud-cyan' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            title="Reset Camera View"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time Subsystem Callouts Overlay */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-aerospace-900/80 border border-hud-cyan/30 rounded-xl p-3 backdrop-blur-md text-xs font-mono space-y-1.5">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">DIGITAL TWIN STATUS</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-hud-emerald animate-ping" />
          <span className="text-white font-bold">{telemetry.model} ({telemetry.tailNumber})</span>
        </div>
        <div className="text-[11px] text-slate-400">
          HEALTH: <span className="text-hud-emerald font-bold">{telemetry.overallHealthScore}%</span> • RISK: <span className={telemetry.riskScore > 40 ? 'text-hud-amber font-bold' : 'text-hud-emerald font-bold'}>{telemetry.riskScore}/100</span>
        </div>
        <div className="text-[10px] text-hud-cyan pt-1">
          💡 Click & drag to rotate 3D airframe • Scroll wheel to zoom
        </div>
      </div>

      {/* WebGL Mount Element */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
