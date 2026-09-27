import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sun,
  CloudRain,
  Wind,
  Eye,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Boxes,
  MapPin,
  Layers,
  Thermometer,
  Droplets,
  Radio,
  Maximize2,
  Leaf
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FarmCanvas3DProps {
  language: Language;
  rainProbability?: number;
}

export const FarmCanvas3D: React.FC<FarmCanvas3DProps> = ({ language, rainProbability = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'aerial'>('3d');
  const [weatherMode, setWeatherMode] = useState<'sunny' | 'rain'>(rainProbability > 50 ? 'rain' : 'sunny');
  const [cropVitality, setCropVitality] = useState<'normal' | 'stressed'>('normal');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<'all' | 'moisture' | 'ndvi'>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const t = TRANSLATIONS[language].threeD;

  useEffect(() => {
    if (rainProbability > 50) {
      setWeatherMode('rain');
    }
  }, [rainProbability]);

  // Three.js 3D Setup with ACES Filmic Tone Mapping and Crisp Anti-Aliasing
  useEffect(() => {
    if (viewMode !== '3d') return;

    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 9, 15);
    camera.lookAt(0, 0.5, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (glErr) {
      console.warn('WebGL initialization fallback:', glErr);
      setViewMode('aerial');
      return;
    }

    // 2. High-Definition Lighting
    const hemiLight = new THREE.HemisphereLight(
      weatherMode === 'rain' ? 0x94a3b8 : 0xf0fdf4,
      weatherMode === 'rain' ? 0x334155 : 0x451a03,
      weatherMode === 'rain' ? 1.0 : 1.4
    );
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(
      weatherMode === 'rain' ? 0x64748b : 0xfef9c3,
      weatherMode === 'rain' ? 0.8 : 1.1
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      weatherMode === 'rain' ? 0x94a3b8 : 0xfffbeb,
      weatherMode === 'rain' ? 0.9 : 2.5
    );
    sunLight.position.set(14, 22, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // 3. Ground / Soil Bed with Crisp Agricultural Furrows
    const groundGeo = new THREE.PlaneGeometry(26, 26, 48, 48);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const ridge = Math.sin(x * 2.5) * 0.22 + Math.cos(y * 0.9) * 0.12;
      posAttr.setZ(i, ridge);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: weatherMode === 'rain' ? 0x2b1d14 : 0x5a3e2b,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. Procedural High-Vibrancy Crops
    const cropGroup = new THREE.Group();
    const rows = 10;
    const cols = 15;
    const spacingX = 1.25;
    const spacingZ = 1.25;

    const stalks: Array<{ mesh: THREE.Mesh; initialX: number; phase: number }> = [];
    const stalkGeo = new THREE.CylinderGeometry(0.045, 0.075, 1.8, 7);
    const earGeo = new THREE.ConeGeometry(0.16, 0.65, 7);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isStressedLeaf = cropVitality === 'stressed' && (r + c) % 3 === 0;
        const stalkColor = isStressedLeaf
          ? (c % 2 === 0 ? 0xd97706 : 0xb45309)
          : 0x16a34a; // Vibrant crisp emerald green

        const earColor = isStressedLeaf ? 0xb45309 : 0xf59e0b; // Golden amber ripe ear

        const stalkMat = new THREE.MeshStandardMaterial({
          color: stalkColor,
          roughness: 0.5,
          metalness: 0.1,
        });

        const earMat = new THREE.MeshStandardMaterial({
          color: earColor,
          roughness: 0.6,
        });

        const singleCrop = new THREE.Group();
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.y = 0.9;
        stalk.castShadow = true;
        singleCrop.add(stalk);

        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.y = 1.95;
        ear.castShadow = true;
        singleCrop.add(ear);

        const posX = (c - cols / 2) * spacingX + (Math.random() - 0.5) * 0.18;
        const posZ = (r - rows / 2) * spacingZ + (Math.random() - 0.5) * 0.18;
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

    // 5. Smart Center Telemetry Station
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0, 0);

    const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 3.4, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.7;
    pole.castShadow = true;
    sensorGroup.add(pole);

    const panelGeo = new THREE.BoxGeometry(0.9, 0.05, 0.65);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.15 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 3.3, 0);
    panel.rotation.x = 0.35;
    sensorGroup.add(panel);

    const beaconGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: weatherMode === 'rain' ? 0x38bdf8 : 0x10b981,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 3.5, 0);
    sensorGroup.add(beacon);

    const ringGeo = new THREE.RingGeometry(0.35, 0.5, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const radarRing = new THREE.Mesh(ringGeo, ringMat);
    radarRing.rotation.x = -Math.PI / 2;
    radarRing.position.y = 0.12;
    sensorGroup.add(radarRing);

    scene.add(sensorGroup);

    // 6. Precipitation or Floating Sunlit Pollen
    let rainParticles: THREE.Points | null = null;
    let pollenParticles: THREE.Points | null = null;

    if (weatherMode === 'rain') {
      const rainCount = 1500;
      const rainGeo = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 24;
        rainPositions[i + 1] = Math.random() * 15 + 1;
        rainPositions[i + 2] = (Math.random() - 0.5) * 24;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      const rainMat = new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.09,
        transparent: true,
        opacity: 0.8,
      });
      rainParticles = new THREE.Points(rainGeo, rainMat);
      scene.add(rainParticles);
    } else {
      const pollenCount = 200;
      const pollenGeo = new THREE.BufferGeometry();
      const pollenPositions = new Float32Array(pollenCount * 3);
      for (let i = 0; i < pollenCount * 3; i += 3) {
        pollenPositions[i] = (Math.random() - 0.5) * 22;
        pollenPositions[i + 1] = Math.random() * 7 + 0.5;
        pollenPositions[i + 2] = (Math.random() - 0.5) * 22;
      }
      pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));
      const pollenMat = new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.08,
        transparent: true,
        opacity: 0.7,
      });
      pollenParticles = new THREE.Points(pollenGeo, pollenMat);
      scene.add(pollenParticles);
    }

    // 7. Mouse & Touch Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationAngle = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      rotationAngle += deltaX * 0.006;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      rotationAngle += deltaX * 0.007;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        rotationAngle += 0.0025;
      }

      const radius = 17;
      camera.position.x = radius * Math.sin(rotationAngle);
      camera.position.z = radius * Math.cos(rotationAngle);
      camera.position.y = 8 + Math.sin(elapsedTime * 0.5) * 0.3;
      camera.lookAt(0, 0.6, 0);

      stalks.forEach((item) => {
        const sway = Math.sin(elapsedTime * 2.2 + item.phase) * 0.07;
        item.mesh.rotation.z = sway;
      });

      const pulseScale = 1 + Math.sin(elapsedTime * 3) * 0.35;
      radarRing.scale.set(pulseScale, pulseScale, 1);
      (radarRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, 0.7 - (pulseScale - 1));

      if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.38;
          if (positions[i] < 0) {
            positions[i] = 14;
          }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      if (pollenParticles) {
        const positions = pollenParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(elapsedTime + i) * 0.01;
          positions[i + 1] += Math.cos(elapsedTime + i) * 0.008;
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
  }, [viewMode, weatherMode, cropVitality, isRotating]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950 text-white shadow-xl border border-emerald-500/20">
      {/* View Mode Toggle: 3D vs Crystal Clear Aerial Photo */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-emerald-300">
            {language === 'hi' ? 'फील्डनर्व स्मार्ट फार्म विज़ुअलाइज़र' : 'FieldNerve Smart Farm Visualizer'}
          </span>
        </div>

        {/* 3D vs Aerial Toggle Bar */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '🎮 3D इंटरैक्टिव खेत' : '🎮 3D Interactive'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('aerial')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'aerial'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'hi' ? '📸 अल्ट्रा-क्लियर एरियल फोटो' : '📸 Crystal Clear Aerial'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === '3d' ? (
        /* 3D Three.js Canvas Container */
        <div className="relative">
          <div
            ref={containerRef}
            className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing select-none touch-none"
            title="Click and drag to rotate field in 3D"
          />

          {/* Top 3D Control Pills */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 pointer-events-auto">
              <span className="text-xs font-semibold text-emerald-300">
                {t.title} (HD 3D)
              </span>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={() => setWeatherMode(weatherMode === 'sunny' ? 'rain' : 'sunny')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 border backdrop-blur-md cursor-pointer ${
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
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 border backdrop-blur-md cursor-pointer ${
                  cropVitality === 'stressed'
                    ? 'bg-amber-500/90 text-slate-950 font-bold border-amber-300'
                    : 'bg-emerald-600/80 text-white border-emerald-400'
                }`}
                title="Toggle normal healthy crops vs infected crop stress"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {cropVitality === 'stressed'
                    ? (language === 'hi' ? 'तनावग्रस्त' : 'Stressed')
                    : (language === 'hi' ? 'स्वस्थ' : 'Healthy')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsRotating(!isRotating)}
                className="p-1.5 rounded-lg bg-slate-800/85 text-slate-200 hover:text-white border border-slate-600 backdrop-blur-md cursor-pointer"
                title="Toggle 3D auto rotation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Crystal Clear High-Resolution Aerial Visual Mode with Precision Telemetry Overlays */
        <div className="relative w-full h-80 sm:h-96 overflow-hidden group">
          {/* Photorealistic Aerial Agriculture Image with vivid natural illumination */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85"
            alt="Crystal Clear Crop Farm Aerial Field View"
            className="w-full h-full object-cover object-center filter saturate-110 contrast-105"
            loading="eager"
          />

          {/* Precision Agriculture Coordinate & Telemetry Grid Lines */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none" />

          {/* Interactive IoT Sensor Node Hotspots on the Clear Aerial Image */}
          <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-auto">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{language === 'hi' ? 'अल्ट्रा-एचडी सैटेलाइट व ड्रोन एरियल दृश्य' : 'Ultra-HD Drone Field Aerial View'}</span>
              </div>

              {/* Layer Selection */}
              <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveLayer('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeLayer === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'hi' ? 'सभी सेंसर्स' : 'All Sensors'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayer('moisture')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeLayer === 'moisture' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'hi' ? 'मिट्टी नमी' : 'Moisture'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayer('ndvi')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeLayer === 'ndvi' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NDVI
                </button>
              </div>
            </div>

            {/* Interactive Pins on Field */}
            <div className="relative w-full h-full flex items-center justify-around">
              {/* Hotspot 1: North Sector */}
              {(activeLayer === 'all' || activeLayer === 'moisture') && (
                <button
                  type="button"
                  onClick={() => setSelectedHotspot('north')}
                  className="group/pin relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-500/90 border-2 border-white text-white flex items-center justify-center shadow-lg animate-bounce">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-sky-200 border border-sky-400/50 shadow-xs">
                    {language === 'hi' ? 'उत्तर ब्लॉक: 58% नमी' : 'North: 58% Moisture'}
                  </span>
                </button>
              )}

              {/* Hotspot 2: Central Hub */}
              {activeLayer === 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedHotspot('central')}
                  className="group/pin relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/90 border-2 border-white text-white flex items-center justify-center shadow-xl ring-4 ring-emerald-400/30">
                    <Radio className="w-4.5 h-4.5" />
                  </div>
                  <span className="mt-1 px-2.5 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-emerald-300 border border-emerald-400/50 shadow-xs">
                    {language === 'hi' ? 'केंद्रीय IoT स्टेशन: सक्रिय' : 'Hub Node: Active'}
                  </span>
                </button>
              )}

              {/* Hotspot 3: South Sector Canopy */}
              {(activeLayer === 'all' || activeLayer === 'ndvi') && (
                <button
                  type="button"
                  onClick={() => setSelectedHotspot('south')}
                  className="group/pin relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-500/90 border-2 border-white text-white flex items-center justify-center shadow-lg">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-teal-200 border border-teal-400/50 shadow-xs">
                    {language === 'hi' ? 'कैनोपी स्वास्थ्य: 0.84' : 'NDVI Health: 0.84'}
                  </span>
                </button>
              )}
            </div>

            {/* Hotspot Detail Modal / Popover */}
            {selectedHotspot && (
              <div className="p-3 bg-slate-950/95 backdrop-blur-md rounded-xl border border-emerald-500/40 text-xs flex items-center justify-between gap-3 shadow-xl">
                <div>
                  <span className="font-bold text-emerald-300">
                    {selectedHotspot === 'north' && (language === 'hi' ? 'उत्तर ब्लॉक सेंसर (Soil Moisture Sensor):' : 'North Block Sensor:')}
                    {selectedHotspot === 'central' && (language === 'hi' ? 'फील्डनर्व मुख्य मौसम स्टेशन (Main Station):' : 'FieldNerve Primary IoT Station:')}
                    {selectedHotspot === 'south' && (language === 'hi' ? 'दक्षिण ब्लॉक कैनोपी इंडेक्स (Vegetation Scan):' : 'South Canopy Vegetation Scan:')}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {selectedHotspot === 'north' && (language === 'hi' ? 'मिट्टी में 58% संतुलित नमी, सिंचाई की आवश्यकता 3-4 दिन बाद होगी।' : 'Soil moisture at 58% (optimal). Next irrigation scheduled in 3-4 days.')}
                    {selectedHotspot === 'central' && (language === 'hi' ? 'तापमान 26.4°C, धूप 840 W/m², हवा 9 किमी/घंटा पश्चिम से।' : 'Temp 26.4°C, Solar radiation 840 W/m², Wind 9 km/h West.')}
                    {selectedHotspot === 'south' && (language === 'hi' ? 'क्लोरोफिल घनत्व उच्च (0.84), नाइट्रोजन पोषण संतुलित है।' : 'Chlorophyll density high (0.84 NDVI), nitrogen nutrition is well-balanced.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Telemetry Bar (Shared across both modes) */}
      <div className="p-3 bg-slate-950/95 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.vitality}</p>
              <p className="font-bold text-emerald-300">{cropVitality === 'stressed' ? '74%' : '98%'}</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-sky-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.moisture}</p>
              <p className="font-bold text-sky-300">{weatherMode === 'rain' ? '82%' : '54%'}</p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-amber-300" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.sunlight}</p>
              <p className="font-bold text-amber-300">{weatherMode === 'rain' ? 'Overcast' : 'Optimal (840 W/m²)'}</p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-300/80 hidden sm:block">
          {viewMode === '3d' ? `👆 ${t.hint}` : '🛰️ GPS Grid: 28.6139° N, 77.2090° E • Calibration: Optimal'}
        </div>
      </div>
    </div>
  );
};
