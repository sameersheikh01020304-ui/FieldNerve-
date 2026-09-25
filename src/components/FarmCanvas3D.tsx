import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, CloudRain, Wind, Eye, Sparkles, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FarmCanvas3DProps {
  language: Language;
  rainProbability?: number;
}

export const FarmCanvas3D: React.FC<FarmCanvas3DProps> = ({ language, rainProbability = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [weatherMode, setWeatherMode] = useState<'sunny' | 'rain'>(rainProbability > 50 ? 'rain' : 'sunny');
  const [cropVitality, setCropVitality] = useState<'normal' | 'stressed'>('normal');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const t = TRANSLATIONS[language].threeD;

  useEffect(() => {
    if (rainProbability > 50) {
      setWeatherMode('rain');
    }
  }, [rainProbability]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (glErr) {
      console.warn('WebGL initialization fallback:', glErr);
      container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px;gap:8px;"><span>🌾 3D Farm Visualizer</span><span style="font-size:11px;opacity:0.8;">WebGL hardware acceleration not available</span></div>';
      return;
    }

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(
      weatherMode === 'rain' ? 0x64748b : 0xfef08a,
      weatherMode === 'rain' ? 0.9 : 1.2
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      weatherMode === 'rain' ? 0x94a3b8 : 0xffedd5,
      weatherMode === 'rain' ? 0.8 : 2.2
    );
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 3. Ground / Soil Bed (Furrows)
    const groundGeo = new THREE.PlaneGeometry(24, 24, 32, 32);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Create agricultural soil ridge/furrow waves
      const ridge = Math.sin(x * 2.2) * 0.2 + Math.cos(y * 0.8) * 0.15;
      posAttr.setZ(i, ridge);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: weatherMode === 'rain' ? 0x3d2719 : 0x543d2b, // Dark wet soil vs rich loam
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. Procedural Crops (Rows of stalks with swaying wheat ears)
    const cropGroup = new THREE.Group();
    const rows = 9;
    const cols = 14;
    const spacingX = 1.3;
    const spacingZ = 1.3;

    const stalks: Array<{ mesh: THREE.Mesh; initialX: number; phase: number }> = [];

    const stalkGeo = new THREE.CylinderGeometry(0.04, 0.07, 1.8, 6);
    const earGeo = new THREE.ConeGeometry(0.14, 0.6, 6);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Stalk color reflects vitality
        const isStressedLeaf = cropVitality === 'stressed' && (r + c) % 3 === 0;
        const stalkColor = isStressedLeaf
          ? (c % 2 === 0 ? 0xd97706 : 0xca8a04) // Rust/yellowing
          : 0x22c55e; // Healthy green

        const stalkMat = new THREE.MeshStandardMaterial({
          color: stalkColor,
          roughness: 0.6,
        });

        const earColor = isStressedLeaf ? 0xb45309 : 0xeab308;
        const earMat = new THREE.MeshStandardMaterial({
          color: earColor,
          roughness: 0.7,
        });

        const singleCrop = new THREE.Group();
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.y = 0.9;
        stalk.castShadow = true;
        singleCrop.add(stalk);

        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.y = 1.9;
        ear.castShadow = true;
        singleCrop.add(ear);

        // Position on field with slight organic jitter
        const posX = (c - cols / 2) * spacingX + (Math.random() - 0.5) * 0.2;
        const posZ = (r - rows / 2) * spacingZ + (Math.random() - 0.5) * 0.2;
        singleCrop.position.set(posX, 0, posZ);

        cropGroup.add(singleCrop);
        stalks.push({
          mesh: singleCrop as any,
          initialX: posX,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    scene.add(cropGroup);

    // 5. 3D "FieldNerve" Smart Sensor Node (Center Station)
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0, 0);

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.6;
    pole.castShadow = true;
    sensorGroup.add(pole);

    // Solar Panel on Sensor
    const panelGeo = new THREE.BoxGeometry(0.8, 0.05, 0.6);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 3.1, 0);
    panel.rotation.x = 0.3;
    sensorGroup.add(panel);

    // Glowing telemetry beacon
    const beaconGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: weatherMode === 'rain' ? 0x38bdf8 : 0x10b981,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 3.3, 0);
    sensorGroup.add(beacon);

    // Pulsing radar ring
    const ringGeo = new THREE.RingGeometry(0.3, 0.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const radarRing = new THREE.Mesh(ringGeo, ringMat);
    radarRing.rotation.x = -Math.PI / 2;
    radarRing.position.y = 0.1;
    sensorGroup.add(radarRing);

    scene.add(sensorGroup);

    // 6. Particle system: Rain vs Floating Pollen
    let rainParticles: THREE.Points | null = null;
    let pollenParticles: THREE.Points | null = null;

    if (weatherMode === 'rain') {
      const rainCount = 1400;
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 22;
        rainPositions[i + 1] = Math.random() * 14 + 1;
        rainPositions[i + 2] = (Math.random() - 0.5) * 22;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: 0.08,
        transparent: true,
        opacity: 0.75,
      });
      rainParticles = new THREE.Points(rainGeo, rainMat);
      scene.add(rainParticles);
    } else {
      const pollenCount = 180;
      const pollenGeo = new THREE.BufferGeometry();
      const pollenPositions = new Float32Array(pollenCount * 3);
      for (let i = 0; i < pollenCount * 3; i += 3) {
        pollenPositions[i] = (Math.random() - 0.5) * 20;
        pollenPositions[i + 1] = Math.random() * 6 + 0.5;
        pollenPositions[i + 2] = (Math.random() - 0.5) * 20;
      }
      pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));
      const pollenMat = new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
      });
      pollenParticles = new THREE.Points(pollenGeo, pollenMat);
      scene.add(pollenParticles);
    }

    // 7. Interactive mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocity = 0.002;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      scene.rotation.y += deltaX * 0.006;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch controls for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      scene.rotation.y += deltaX * 0.008;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasDom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 8. ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto rotation if active and not dragging
      if (isRotating && !isDragging) {
        scene.rotation.y += 0.0018;
      }

      // Wind sway for crops (trigonometric wave simulation)
      const windFrequency = weatherMode === 'rain' ? 3.5 : 1.8;
      const windAmplitude = weatherMode === 'rain' ? 0.12 : 0.06;

      for (let i = 0; i < stalks.length; i++) {
        const item = stalks[i];
        const sway = Math.sin(elapsedTime * windFrequency + item.phase) * windAmplitude;
        item.mesh.rotation.z = sway;
        item.mesh.rotation.x = Math.cos(elapsedTime * (windFrequency * 0.8) + item.phase) * (windAmplitude * 0.5);
      }

      // Radar pulse
      const pulseScale = (elapsedTime * 1.5) % 3 + 1;
      radarRing.scale.set(pulseScale, pulseScale, 1);
      (radarRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - pulseScale * 0.2);

      // Rain animation
      if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.35; // fall speed
          if (positions[i] < 0) {
            positions[i] = 14; // loop back to cloud height
          }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Pollen motes floating
      if (pollenParticles) {
        const pPositions = pollenParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < pPositions.length; i += 3) {
          pPositions[i] += Math.sin(elapsedTime + i) * 0.008;
          pPositions[i + 1] += Math.cos(elapsedTime * 0.5 + i) * 0.004;
          if (pPositions[i + 1] > 6) pPositions[i + 1] = 0.5;
        }
        pollenParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvasDom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasDom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [weatherMode, cropVitality, isRotating]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-900 via-emerald-950 to-amber-950 text-white shadow-xl border border-emerald-700/30">
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing select-none touch-none"
        title="Click and drag to rotate field in 3D"
      />

      {/* Top Floating Overlay - Title & Controls */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-300">
            {t.title}
          </span>
        </div>

        {/* 3D Interactive Mode Switches */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setWeatherMode(weatherMode === 'sunny' ? 'rain' : 'sunny')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 border backdrop-blur-md ${
              weatherMode === 'rain'
                ? 'bg-blue-600/90 text-white border-blue-400 shadow-sm'
                : 'bg-amber-600/80 text-white border-amber-400 shadow-sm'
            }`}
          >
            {weatherMode === 'rain' ? <CloudRain className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{weatherMode === 'rain' ? t.statusRain : t.statusSunny}</span>
          </button>

          <button
            type="button"
            onClick={() => setCropVitality(cropVitality === 'normal' ? 'stressed' : 'normal')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 border backdrop-blur-md ${
              cropVitality === 'stressed'
                ? 'bg-amber-500/90 text-slate-950 font-bold border-amber-300'
                : 'bg-emerald-600/80 text-white border-emerald-400'
            }`}
            title="Toggle normal healthy crops vs infected crop stress"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {cropVitality === 'stressed'
                ? (language === 'hi' ? 'तनावग्रस्त फसल' : 'Stressed Field')
                : (language === 'hi' ? 'स्वस्थ फसल' : 'Healthy Field')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-200 hover:text-white border border-slate-600 backdrop-blur-md"
            title="Toggle 3D auto rotation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom Floating Telemetry Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.vitality}</p>
              <p className="text-xs font-bold text-emerald-300">{cropVitality === 'stressed' ? '74%' : '98%'}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.moisture}</p>
            <p className="text-xs font-bold text-sky-300">{weatherMode === 'rain' ? '82%' : '48%'}</p>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-amber-300" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.sunlight}</p>
              <p className="text-xs font-bold text-amber-300">{weatherMode === 'rain' ? 'Overcast' : 'Optimal'}</p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-300/90 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 pointer-events-auto hidden sm:block">
          👆 {t.hint}
        </div>
      </div>
    </div>
  );
};
