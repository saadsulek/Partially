import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { MathTex } from './FormulaCard';
import { SURFACE_PRESETS } from '../utils/mathEngine';

export default function SurfaceViewer({
  expression,
  onExpressionChange,
  analysis,
  x0,
  setX0,
  y0,
  setY0,
  onNavigateTab
}) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const dynamicGroupRef = useRef(null);

  const [showSliceY, setShowSliceY] = useState(true);
  const [showSliceX, setShowSliceX] = useState(true);
  const [showTangentPlane, setShowTangentPlane] = useState(true);
  const [activeCamPreset, setActiveCamPreset] = useState('isometric');
  const [copiedLatex, setCopiedLatex] = useState(false);

  const camSphericalRef = useRef({
    radius: 11.0,
    theta: Math.PI / 4,
    phi: Math.PI / 3.05,
    target: new THREE.Vector3(0, 0.2, 0)
  });

  const evalData = useMemo(() => {
    if (!analysis || !analysis.isValid) {
      return { z: 0, fx: 0, fy: 0, fxx: 0, fyy: 0, fxy: 0, fyx: 0 };
    }
    return analysis.evaluateAt(x0, y0);
  }, [analysis, x0, y0]);

  const syncCameraPosition = () => {
    const cam = cameraRef.current;
    if (!cam) return;
    const { radius, theta, phi, target } = camSphericalRef.current;
    const x = target.x + radius * Math.sin(phi) * Math.cos(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.sin(theta);
    cam.position.set(x, y, z);
    cam.lookAt(target);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 680;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 100);
    cameraRef.current = camera;
    syncCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight1 = new THREE.DirectionalLight(0x92f7c3, 0.85);
    dirLight1.position.set(8, 14, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe7c268, 0.45);
    dirLight2.position.set(-8, -6, -8);
    scene.add(dirLight2);

    // Spectral Obsidian Coordinate Grid & Axes
    const staticGroup = new THREE.Group();
    scene.add(staticGroup);

    const gridHelper = new THREE.GridHelper(6, 12, 0x23352f, 0x162722);
    staticGroup.add(gridHelper);

    const createAxisLine = (p1, p2, colorHex) => {
      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const mat = new THREE.LineBasicMaterial({ color: colorHex });
      return new THREE.Line(geom, mat);
    };
    // X-axis (#52b788 mint), Y-axis (#e7c268 gold), Z-axis (#6d857d sage)
    staticGroup.add(createAxisLine(new THREE.Vector3(-3.3, 0, 0), new THREE.Vector3(3.3, 0, 0), 0x52b788));
    staticGroup.add(createAxisLine(new THREE.Vector3(0, 0, 3.3), new THREE.Vector3(0, 0, -3.3), 0xe7c268));
    staticGroup.add(createAxisLine(new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0, 3.3, 0), 0x6d857d));

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    let isDragging = false;
    let isPanning = false;
    let prevX = 0;
    let prevY = 0;

    const domEl = renderer.domElement;

    const onPointerDown = (e) => {
      isDragging = true;
      isPanning = e.button === 2 || e.shiftKey;
      prevX = e.clientX;
      prevY = e.clientY;
      domEl.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      if (isPanning) {
        camSphericalRef.current.target.y += dy * 0.008;
      } else {
        camSphericalRef.current.theta += dx * 0.0075;
        camSphericalRef.current.phi = Math.max(
          0.12,
          Math.min(Math.PI - 0.12, camSphericalRef.current.phi - dy * 0.0075)
        );
      }
      syncCameraPosition();
    };

    const onPointerUp = (e) => {
      isDragging = false;
      try {
        domEl.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 1.08 : 0.92;
        camSphericalRef.current.radius = Math.max(4.5, Math.min(24, camSphericalRef.current.radius * factor));
        syncCameraPosition();
      }
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('contextmenu', (e) => e.preventDefault());

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: cw, height: ch } = entry.contentRect;
        if (cw > 0 && ch > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = cw / ch;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(cw, ch);
        }
      }
    });
    resizeObserver.observe(container);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  // Update 3D Surface & Slicing Geometry in Spectral Obsidian Palette (#52b788 Mint & #e7c268 Gold)
  useEffect(() => {
    const group = dynamicGroupRef.current;
    if (!group || !analysis || !analysis.isValid) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
      group.remove(child);
    }

    const segments = 56;
    const zValues = [];
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let j = 0; j <= segments; j++) {
      const my = -2.5 + (5 * j) / segments;
      for (let i = 0; i <= segments; i++) {
        const mx = -2.5 + (5 * i) / segments;
        const mz = analysis.evalSurface(mx, my);
        zValues.push(mz);
        if (mz < minZ) minZ = mz;
        if (mz > maxZ) maxZ = mz;
      }
    }

    const maxAbsZ = Math.max(Math.abs(minZ), Math.abs(maxZ), 1);
    const zScale = maxAbsZ > 3.0 ? 2.5 / maxAbsZ : 0.8;
    const toVec3 = (mx, my, mz) => new THREE.Vector3(mx, mz * zScale, -my);

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * (segments + 1) * 3);
    const colors = new Float32Array((segments + 1) * (segments + 1) * 3);
    const indices = [];

    // Spectral Obsidian color ramp: Deep Forest (#183a2c) -> Luminous Mint (#52b788) -> Warm Gold (#e7c268)
    const cLow = new THREE.Color(0x183a2c);
    const cMid = new THREE.Color(0x52b788);
    const cHigh = new THREE.Color(0xe7c268);
    const tmpColor = new THREE.Color();

    let ptr = 0;
    for (let j = 0; j <= segments; j++) {
      const my = -2.5 + (5 * j) / segments;
      for (let i = 0; i <= segments; i++) {
        const mx = -2.5 + (5 * i) / segments;
        const mz = zValues[j * (segments + 1) + i];
        const v = toVec3(mx, my, mz);

        positions[ptr * 3] = v.x;
        positions[ptr * 3 + 1] = v.y;
        positions[ptr * 3 + 2] = v.z;

        const t = maxZ > minZ ? (mz - minZ) / (maxZ - minZ) : 0.5;
        if (t < 0.55) {
          tmpColor.lerpColors(cLow, cMid, t / 0.55);
        } else {
          tmpColor.lerpColors(cMid, cHigh, (t - 0.55) / 0.45);
        }
        colors[ptr * 3] = tmpColor.r;
        colors[ptr * 3 + 1] = tmpColor.g;
        colors[ptr * 3 + 2] = tmpColor.b;
        ptr++;
      }
    }

    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i;
        const b = a + 1;
        const c = (j + 1) * (segments + 1) + i;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    group.add(
      new THREE.Mesh(
        geom,
        new THREE.MeshPhongMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.76,
          shininess: 45
        })
      )
    );

    group.add(
      new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({
          color: 0x52b788,
          wireframe: true,
          transparent: true,
          opacity: 0.18
        })
      )
    );

    const { z: z0, fx, fy } = evalData;
    const p0Vec = toVec3(x0, y0, z0);

    // Point P(x0, y0, z0)
    const ptSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x52b788 })
    );
    ptSphere.position.copy(p0Vec);
    group.add(ptSphere);

    const planeMinZ = Math.min(minZ, z0 - 1.4, -1) * zScale - 0.3;
    const planeMaxZ = Math.max(maxZ, z0 + 1.4, 1) * zScale + 0.3;
    const planeHeight = Math.max(2.2, planeMaxZ - planeMinZ);
    const planeCenterY = (planeMinZ + planeMaxZ) / 2;

    // X-Slice Plane (y = y0 held constant -> Mint #52b788)
    if (showSliceY) {
      const sliceYPlaneGeom = new THREE.PlaneGeometry(5, planeHeight);
      const sliceYPlane = new THREE.Mesh(
        sliceYPlaneGeom,
        new THREE.MeshBasicMaterial({
          color: 0x52b788,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.14,
          depthWrite: false
        })
      );
      sliceYPlane.position.set(0, planeCenterY, -y0);
      group.add(sliceYPlane);

      const borderY = new THREE.LineSegments(
        new THREE.EdgesGeometry(sliceYPlaneGeom),
        new THREE.LineBasicMaterial({ color: 0x52b788, transparent: true, opacity: 0.65 })
      );
      borderY.position.copy(sliceYPlane.position);
      group.add(borderY);

      const curvePtsX = [];
      for (let i = 0; i <= 75; i++) {
        const mx = -2.5 + (5 * i) / 75;
        curvePtsX.push(toVec3(mx, y0, analysis.evalSurface(mx, y0)));
      }
      group.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePtsX), 75, 0.04, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x74c69d })
        )
      );

      const dirX = new THREE.Vector3(1, fx * zScale, 0).normalize();
      group.add(new THREE.ArrowHelper(dirX, p0Vec, 1.45, 0x52b788, 0.26, 0.15));
    }

    // Y-Slice Plane (x = x0 held constant -> Gold #e7c268)
    if (showSliceX) {
      const sliceXPlaneGeom = new THREE.PlaneGeometry(5, planeHeight);
      sliceXPlaneGeom.rotateY(Math.PI / 2);
      const sliceXPlane = new THREE.Mesh(
        sliceXPlaneGeom,
        new THREE.MeshBasicMaterial({
          color: 0xe7c268,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.14,
          depthWrite: false
        })
      );
      sliceXPlane.position.set(x0, planeCenterY, 0);
      group.add(sliceXPlane);

      const borderX = new THREE.LineSegments(
        new THREE.EdgesGeometry(sliceXPlaneGeom),
        new THREE.LineBasicMaterial({ color: 0xe7c268, transparent: true, opacity: 0.65 })
      );
      borderX.position.copy(sliceXPlane.position);
      group.add(borderX);

      const curvePtsY = [];
      for (let j = 0; j <= 75; j++) {
        const my = -2.5 + (5 * j) / 75;
        curvePtsY.push(toVec3(x0, my, analysis.evalSurface(x0, my)));
      }
      group.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePtsY), 75, 0.04, 8, false),
          new THREE.MeshBasicMaterial({ color: 0xe7c268 })
        )
      );

      const dirY = new THREE.Vector3(0, fy * zScale, -1).normalize();
      group.add(new THREE.ArrowHelper(dirY, p0Vec, 1.45, 0xe7c268, 0.26, 0.15));
    }

    // Dynamic Tangent Plane & Gradient Vector at P(x0, y0, z0)
    if (showTangentPlane) {
      const patchRadius = 1.25;
      const tpSegments = 8;
      const tpGeom = new THREE.BufferGeometry();
      const tpPos = new Float32Array((tpSegments + 1) * (tpSegments + 1) * 3);
      const tpIdx = [];

      let idxPtr = 0;
      for (let j = 0; j <= tpSegments; j++) {
        const dy = -patchRadius + (2 * patchRadius * j) / tpSegments;
        for (let i = 0; i <= tpSegments; i++) {
          const dx = -patchRadius + (2 * patchRadius * i) / tpSegments;
          const v = toVec3(x0 + dx, y0 + dy, z0 + fx * dx + fy * dy);
          tpPos[idxPtr * 3] = v.x;
          tpPos[idxPtr * 3 + 1] = v.y;
          tpPos[idxPtr * 3 + 2] = v.z;
          idxPtr++;
        }
      }

      for (let j = 0; j < tpSegments; j++) {
        for (let i = 0; i < tpSegments; i++) {
          const a = j * (tpSegments + 1) + i;
          const b = a + 1;
          const c = (j + 1) * (tpSegments + 1) + i;
          const d = c + 1;
          tpIdx.push(a, c, b, b, c, d);
        }
      }

      tpGeom.setAttribute('position', new THREE.BufferAttribute(tpPos, 3));
      tpGeom.setIndex(tpIdx);
      tpGeom.computeVertexNormals();

      group.add(
        new THREE.Mesh(
          tpGeom,
          new THREE.MeshBasicMaterial({
            color: 0xe7c268,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
          })
        )
      );
      group.add(
        new THREE.Mesh(
          tpGeom,
          new THREE.MeshBasicMaterial({
            color: 0xffd566,
            wireframe: true,
            transparent: true,
            opacity: 0.45
          })
        )
      );

      // Steepest ascent vector ∇f projected onto tangent plane (#4ade80)
      const gradMagSq = fx * fx + fy * fy;
      if (gradMagSq > 1e-4) {
        const grad3D = new THREE.Vector3(fx, gradMagSq * zScale, -fy).normalize();
        group.add(new THREE.ArrowHelper(grad3D, p0Vec, 1.5, 0x4ade80, 0.28, 0.16));
      }
    }
  }, [analysis, evalData, x0, y0, showSliceY, showSliceX, showTangentPlane]);

  const snapCamera = (preset) => {
    setActiveCamPreset(preset);
    if (preset === 'isometric') {
      camSphericalRef.current.theta = Math.PI / 4;
      camSphericalRef.current.phi = Math.PI / 3.05;
      camSphericalRef.current.radius = 11.0;
    } else if (preset === 'top') {
      camSphericalRef.current.theta = Math.PI / 2;
      camSphericalRef.current.phi = 0.12;
      camSphericalRef.current.radius = 11.5;
    } else if (preset === 'sliceY') {
      camSphericalRef.current.theta = Math.PI / 2;
      camSphericalRef.current.phi = Math.PI / 2.1;
      camSphericalRef.current.radius = 10.2;
    } else if (preset === 'sliceX') {
      camSphericalRef.current.theta = 0;
      camSphericalRef.current.phi = Math.PI / 2.1;
      camSphericalRef.current.radius = 10.2;
    }
    syncCameraPosition();
  };

  const rotateCameraStep = (deltaTheta) => {
    camSphericalRef.current.theta += deltaTheta;
    syncCameraPosition();
  };

  const adjustZoom = (factor) => {
    camSphericalRef.current.radius = Math.max(4.5, Math.min(24, camSphericalRef.current.radius * factor));
    syncCameraPosition();
  };

  const copyLatexToClipboard = () => {
    if (!analysis.isValid) return;
    navigator.clipboard?.writeText(`f(x, y) = ${analysis.latex.f}`);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 1800);
  };

  const gradMag = Math.hypot(evalData.fx, evalData.fy);
  const ascentAngleDeg = (Math.atan2(evalData.fy, evalData.fx) * 180) / Math.PI;

  return (
    <div className="space-y-6">
      {/* SECTION 1: WORKSPACE HEADER & INTEGRATED TOOLBAR (from code.html) */}
      <section className="bg-[#111b18] border border-[#23352f] rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 text-xs font-label text-[#6d857d] mb-2">
          <span>Calculus III</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Multivariable Calculus</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-semibold">Partial Derivatives &amp; Tangent Planes</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl lg:text-3xl font-bold text-[#e2ece9] tracking-tight">
              Interactive Partial Differentiation &amp; Surface Analysis
            </h1>
            <p className="text-sm text-[#9cb3ab] mt-1.5 max-w-3xl leading-relaxed">
              Partial derivatives measure the rate of change of a multivariable function with respect to one variable while holding all other variables constant. Geometrically, they yield tangent slopes along perpendicular coordinate cross-sections, forming the local tangent plane.
            </p>
          </div>

          {/* Quick Controls Badge Cluster */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <span className="px-2.5 py-1 text-xs font-mono font-medium bg-[#15221f] rounded-lg border border-[#23352f] text-[#9cb3ab]">
              (x₀, y₀) = (<span className="font-bold text-primary">{x0.toFixed(2)}</span>,{' '}
              <span className="font-bold text-tertiary">{y0.toFixed(2)}</span>)
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-medium bg-[#15221f] rounded-lg border border-[#23352f] text-[#9cb3ab]">
              z₀ = <span className="font-bold text-tertiary">{evalData.z.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Integrated Quick Toolbar */}
        <div className="mt-5 pt-4 border-t border-[#23352f] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <label className="text-xs font-label font-bold text-[#6d857d] uppercase tracking-wider">
              Preset Surface:
            </label>
            <div className="relative">
              <select
                value={
                  SURFACE_PRESETS.find((p) => p.expr === expression.trim())?.expr || 'custom'
                }
                onChange={(e) => {
                  if (e.target.value !== 'custom') onExpressionChange(e.target.value);
                }}
                className="bg-[#15221f] text-xs font-label font-semibold text-[#e2ece9] pl-3 pr-8 py-1.5 rounded-lg border border-[#23352f] focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
              >
                {SURFACE_PRESETS.map((p) => (
                  <option key={p.id} value={p.expr}>
                    {p.name}: {p.label}
                  </option>
                ))}
                <option value="custom">Custom Expression...</option>
              </select>
              <span className="material-symbols-outlined text-sm text-[#6d857d] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Inline Custom Function Input */}
            <div className="relative flex items-center min-w-[210px] max-w-xs flex-1">
              <span className="absolute left-3 font-mono text-xs font-semibold text-primary">
                f(x,y) =
              </span>
              <input
                type="text"
                value={expression}
                onChange={(e) => onExpressionChange(e.target.value)}
                placeholder="x^3*y - 2*x*y^2 + sin(x)"
                className="w-full bg-[#15221f] border border-[#23352f] rounded-lg pl-16 pr-3 py-1.5 text-xs font-mono text-[#e2ece9] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Interactive Mode Pill Selector */}
            <div className="hidden sm:flex items-center bg-[#15221f] p-0.5 rounded-lg border border-[#23352f]">
              <button className="px-3 py-1 text-xs font-semibold rounded-md bg-[#1b2824] text-primary border border-primary/30">
                Explore 3D
              </button>
              <button
                onClick={() => onNavigateTab('moduleB')}
                className="px-3 py-1 text-xs font-medium text-[#9cb3ab] hover:text-[#e2ece9] transition-colors"
              >
                Step Solver
              </button>
              <button
                onClick={() => onNavigateTab('curl')}
                className="px-3 py-1 text-xs font-medium text-[#9cb3ab] hover:text-[#e2ece9] transition-colors"
              >
                Curl (∇×F)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setX0(1.2);
                setY0(0.8);
                snapCamera('isometric');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15221f] hover:bg-[#1b2824] text-xs font-medium text-[#e2ece9] border border-[#23352f] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#6d857d]">restart_alt</span>
              Reset Camera
            </button>
            <button
              onClick={copyLatexToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15221f] hover:bg-[#1b2824] text-xs font-medium text-[#e2ece9] border border-[#23352f] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#6d857d]">code</span>
              {copiedLatex ? 'Copied LaTeX!' : 'Export LaTeX'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: CORE INTERACTIVE MULTI-PANEL WORKSPACE (7 COLS + 5 COLS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT/CENTER: 3D SURFACE & TANGENT PLANE CANVAS (7 COLS) */}
        <div className="xl:col-span-7 flex flex-col bg-[#111b18] rounded-xl border border-[#23352f] overflow-hidden shadow-lg shadow-black/20">
          {/* Canvas Top Bar / HUD Controls */}
          <div className="px-4 py-3 bg-[#15221f] border-b border-[#23352f] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#52b788] animate-pulse" />
              <span className="text-xs font-label font-bold text-[#e2ece9]">
                3D Surface Canvas Simulator
              </span>
              <span className="text-[11px] text-[#6d857d] px-2 py-0.5 rounded bg-[#0d1513] border border-[#23352f] font-mono">
                Shader: Spectral Obsidian Dark
              </span>
            </div>

            {/* View Angle Shortcuts */}
            <div className="flex items-center gap-1">
              {[
                { id: 'isometric', label: 'Isometric' },
                { id: 'top', label: 'Top (Contour)' },
                { id: 'sliceY', label: 'X-Elev (∂f/∂x)' },
                { id: 'sliceX', label: 'Y-Elev (∂f/∂y)' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => snapCamera(btn.id)}
                  className={`px-2 py-1 text-[11px] rounded transition-all ${
                    activeCamPreset === btn.id
                      ? 'font-semibold bg-primary text-[#003823] shadow-[0_0_8px_rgba(82,183,136,0.3)]'
                      : 'text-[#9cb3ab] hover:bg-[#1b2824] hover:text-[#e2ece9]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main 3D WebGL Viewport */}
          <div className="relative w-full h-[440px] bg-gradient-to-b from-[#08100e] via-[#0d1714] to-[#0a1210] overflow-hidden select-none cursor-grab active:cursor-grabbing border-b border-[#23352f]">
            <div ref={mountRef} className="w-full h-full touch-none" />

            {/* Floating Overlay: Canvas Legend (Dark Obsidian Card from code.html) */}
            <div className="absolute top-3 left-3 bg-[#0d1513]/90 backdrop-blur-md border border-[#23352f] rounded-lg p-2.5 shadow-md text-xs space-y-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#52b788] rounded shadow-[0_0_6px_#52b788]" />
                <span className="text-[#e2ece9] font-medium">∂f/∂x (Along X-slice, Y constant)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#e7c268] rounded shadow-[0_0_6px_#e7c268]" />
                <span className="text-[#e2ece9] font-medium">∂f/∂y (Along Y-slice, X constant)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#4ade80] rounded shadow-[0_0_6px_#4ade80]" />
                <span className="text-[#e2ece9] font-medium">∇f = [∂f/∂x, ∂f/∂y]ᵀ (Steepest)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-2 bg-[#e7c268]/20 border border-[#e7c268] rounded" />
                <span className="text-[#e2ece9] font-medium">Local Tangent Plane at P</span>
              </div>
            </div>

            {/* Floating Compass / Quick View Widget */}
            <div className="absolute bottom-3 right-3 bg-[#0d1513]/85 backdrop-blur-md border border-[#23352f] rounded-lg p-1.5 flex items-center gap-1 shadow-md">
              <button
                onClick={() => rotateCameraStep(-0.25)}
                className="p-1 hover:bg-[#1b2824] rounded text-[#6d857d] hover:text-[#e2ece9] transition-colors"
                title="Rotate Left"
              >
                <span className="material-symbols-outlined text-base">rotate_left</span>
              </button>
              <button
                onClick={() => rotateCameraStep(0.25)}
                className="p-1 hover:bg-[#1b2824] rounded text-[#6d857d] hover:text-[#e2ece9] transition-colors"
                title="Rotate Right"
              >
                <span className="material-symbols-outlined text-base">rotate_right</span>
              </button>
              <button
                onClick={() => adjustZoom(0.86)}
                className="p-1 hover:bg-[#1b2824] rounded text-[#6d857d] hover:text-[#e2ece9] transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-base">zoom_in</span>
              </button>
              <button
                onClick={() => adjustZoom(1.16)}
                className="p-1 hover:bg-[#1b2824] rounded text-[#6d857d] hover:text-[#e2ece9] transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-base">zoom_out</span>
              </button>
            </div>
          </div>

          {/* On-Canvas Parametric Sliders & Slice Visibility HUD */}
          <div className="p-4 bg-[#111b18] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slider X0 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-semibold text-primary">Point x₀ Coordinate:</span>
                  <span className="font-mono text-[#e2ece9] font-bold">{x0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={x0}
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full obsidian-slider-mint h-1.5 bg-[#1b2824] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6d857d] font-mono">
                  <span>-2.5</span>
                  <span>0.0</span>
                  <span>+2.5</span>
                </div>
              </div>

              {/* Slider Y0 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-semibold text-tertiary">Point y₀ Coordinate:</span>
                  <span className="font-mono text-[#e2ece9] font-bold">{y0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={y0}
                  onChange={(e) => setY0(parseFloat(e.target.value))}
                  className="w-full obsidian-slider-gold h-1.5 bg-[#1b2824] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6d857d] font-mono">
                  <span>-2.5</span>
                  <span>0.0</span>
                  <span>+2.5</span>
                </div>
              </div>
            </div>

            {/* Slice & Vector Checkboxes */}
            <div className="flex flex-wrap items-center gap-5 pt-2.5 border-t border-[#23352f] text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#e2ece9]">
                <input
                  type="checkbox"
                  checked={showSliceY}
                  onChange={(e) => setShowSliceY(e.target.checked)}
                  className="rounded bg-[#15221f] text-primary focus:ring-primary border-[#23352f]"
                />
                <span>Show X-Slice Plane (y = {y0.toFixed(2)} constant)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#e2ece9]">
                <input
                  type="checkbox"
                  checked={showSliceX}
                  onChange={(e) => setShowSliceX(e.target.checked)}
                  className="rounded bg-[#15221f] text-tertiary focus:ring-tertiary border-[#23352f]"
                />
                <span>Show Y-Slice Plane (x = {x0.toFixed(2)} constant)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#e2ece9]">
                <input
                  type="checkbox"
                  checked={showTangentPlane}
                  onChange={(e) => setShowTangentPlane(e.target.checked)}
                  className="rounded bg-[#15221f] text-[#4ade80] focus:ring-[#4ade80] border-[#23352f]"
                />
                <span>Show Tangent Plane &amp; ∇f</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT: THE COMPUTATIONAL INSPECTOR & STEP-BY-STEP SOLVER (5 COLS from code.html) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Card 1: Active Formula & Mathematical Setup */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label font-bold text-[#6d857d] uppercase tracking-wider">
                Active Multivariable Function
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#182b24] text-secondary border border-primary/20">
                ℝ² → ℝ
              </span>
            </div>
            <div className="p-3.5 bg-[#15221f] rounded-lg border border-[#23352f] flex items-center justify-between gap-2 overflow-x-auto">
              <div className="font-mono text-base font-bold text-[#e2ece9]">
                <MathTex tex={`f(x, y) = ${analysis.isValid ? analysis.latex.f : '\\text{Invalid}'}`} />
              </div>
              <button
                onClick={copyLatexToClipboard}
                className="text-[#6d857d] hover:text-primary transition-colors shrink-0"
                title="Copy LaTeX"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
              </button>
            </div>
            <div className="text-xs text-[#9cb3ab] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">info</span>
              <span>
                Tangency Point: P(x₀ = {x0.toFixed(2)}, y₀ = {y0.toFixed(2)}) ⇒ z₀ = f({x0.toFixed(2)}, {y0.toFixed(2)}) ≈{' '}
                <strong className="text-[#e2ece9]">{evalData.z.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: First-Order Partial with respect to X */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_8px_#52b788]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-xs font-bold rounded">
                  Step 1
                </span>
                <h3 className="font-headline font-bold text-sm text-[#e2ece9]">
                  First-Order Partial: ∂f/∂x
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-primary">
                Slope = {evalData.fx >= 0 ? `+${evalData.fx.toFixed(2)}` : evalData.fx.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-[#15221f] rounded-lg border border-[#23352f] font-mono text-xs text-[#e2ece9] space-y-1.5 overflow-x-auto">
              <div className="text-[#9cb3ab] font-body">
                Treat variable <strong className="text-tertiary font-semibold">y as a constant</strong>. Differentiate with respect to x:
              </div>
              <div className="font-bold text-primary text-sm">
                <MathTex tex={`\\frac{\\partial f}{\\partial x} = ${analysis.isValid ? analysis.latex.fx : '0'}`} />
              </div>
            </div>
            <div className="bg-[#0e1715] p-2.5 rounded-lg text-xs space-y-1 text-[#9cb3ab] font-mono border border-[#1b2a26]">
              <div className="text-[11px] text-[#6d857d]">
                Evaluation at P({x0.toFixed(2)}, {y0.toFixed(2)}):
              </div>
              <div>
                fₓ({x0.toFixed(2)}, {y0.toFixed(2)}) ={' '}
                <span className="font-bold text-primary">{evalData.fx.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: First-Order Partial with respect to Y */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary shadow-[0_0_8px_#e7c268]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-tertiary/20 border border-tertiary/40 text-tertiary text-xs font-bold rounded">
                  Step 2
                </span>
                <h3 className="font-headline font-bold text-sm text-[#e2ece9]">
                  First-Order Partial: ∂f/∂y
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-tertiary">
                Slope = {evalData.fy >= 0 ? `+${evalData.fy.toFixed(2)}` : evalData.fy.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-[#15221f] rounded-lg border border-[#23352f] font-mono text-xs text-[#e2ece9] space-y-1.5 overflow-x-auto">
              <div className="text-[#9cb3ab] font-body">
                Treat variable <strong className="text-primary font-semibold">x as a constant</strong>. Differentiate with respect to y:
              </div>
              <div className="font-bold text-tertiary text-sm">
                <MathTex tex={`\\frac{\\partial f}{\\partial y} = ${analysis.isValid ? analysis.latex.fy : '0'}`} />
              </div>
            </div>
            <div className="bg-[#0e1715] p-2.5 rounded-lg text-xs space-y-1 text-[#9cb3ab] font-mono border border-[#1b2a26]">
              <div className="text-[11px] text-[#6d857d]">
                Evaluation at P({x0.toFixed(2)}, {y0.toFixed(2)}):
              </div>
              <div>
                fᵧ({x0.toFixed(2)}, {y0.toFixed(2)}) ={' '}
                <span className="font-bold text-tertiary">{evalData.fy.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Gradient Vector ∇f & Tangent Plane Equation */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-sm text-[#e2ece9] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4ade80] text-lg">north_east</span>
                Gradient Vector &amp; Tangent Plane
              </h3>
              <span className="text-[11px] font-mono text-[#6d857d]">
                ∇f({x0.toFixed(2)}, {y0.toFixed(2)})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#15221f] p-3 rounded-lg border border-[#23352f] space-y-1">
                <span className="text-[11px] font-bold text-[#6d857d]">GRADIENT VECTOR</span>
                <div className="font-mono text-xs text-[#e2ece9] font-semibold">
                  ∇f = [{evalData.fx.toFixed(2)}, {evalData.fy.toFixed(2)}]ᵀ
                </div>
                <div className="text-[10px] text-[#9cb3ab]">
                  ‖∇f‖ = <strong className="text-primary">{gradMag.toFixed(2)}</strong>
                </div>
              </div>

              <div className="bg-[#15221f] p-3 rounded-lg border border-[#23352f] space-y-1">
                <span className="text-[11px] font-bold text-[#6d857d]">MAX ASCENT ANGLE</span>
                <div className="font-mono text-xs text-[#e2ece9] font-semibold">
                  θ = atan2({evalData.fy.toFixed(1)}, {evalData.fx.toFixed(1)})
                </div>
                <div className="text-[10px] text-[#9cb3ab]">
                  Direction: <strong className="text-tertiary">{ascentAngleDeg.toFixed(1)}°</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#182b24]/60 border border-primary/25 rounded-lg text-xs font-mono space-y-1 overflow-x-auto">
              <div className="text-[11px] font-bold text-secondary">TANGENT PLANE EQUATION:</div>
              <div className="text-[#e2ece9]">z - z₀ = f_x(x - x₀) + f_y(y - y₀)</div>
              <div className="text-primary font-bold">
                z - ({evalData.z.toFixed(2)}) = {evalData.fx.toFixed(2)}(x - {x0.toFixed(2)}) + ({evalData.fy.toFixed(2)})(y - {y0.toFixed(2)})
              </div>
            </div>
          </div>

          {/* Card 5: Clairaut's Theorem & Mixed Partials */}
          <div className="bg-[#111b18] rounded-xl p-4 border border-[#23352f] shadow-lg shadow-black/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">sync_alt</span>
                <h4 className="font-headline font-semibold text-xs text-[#e2ece9]">
                  Clairaut&apos;s Theorem &amp; Mixed Partials
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary font-bold">
                f_xy = f_yx
              </span>
            </div>
            <div className="text-xs text-[#9cb3ab] font-mono p-2.5 bg-[#15221f] rounded-lg border border-[#23352f] space-y-1 overflow-x-auto">
              <div>
                ∂²f / (∂y∂x) ={' '}
                <span className="font-bold text-[#e2ece9]">
                  <MathTex tex={analysis.isValid ? analysis.latex.fxy : '0'} />
                </span>
              </div>
              <div>
                ∂²f / (∂x∂y) ={' '}
                <span className="font-bold text-[#e2ece9]">
                  <MathTex tex={analysis.isValid ? analysis.latex.fyx : '0'} />
                </span>
              </div>
              <div className="pt-1 text-[11px] text-[#6d857d] font-body">
                Both evaluate to <strong className="text-primary">{evalData.fxy.toFixed(3)}</strong> at P({x0.toFixed(2)}, {y0.toFixed(2)}).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: BOTTOM REAL-WORLD APPLICATIONS & DEEP DIVES GRID (from code.html) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-xl font-bold text-[#e2ece9] tracking-tight">
              Applied Multivariable Differentiation
            </h2>
            <p className="text-xs text-[#6d857d] mt-0.5">
              Explore how holding variables constant powers modern algorithms, physics, and vector calculus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card A: Machine Learning & Gradient Descent */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#182b24] border border-primary/30 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">smart_toy</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#15221f] text-[#6d857d] border border-[#23352f]">
                  Machine Learning
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#e2ece9]">
                  Backpropagation &amp; Loss Valley
                </h3>
                <p className="text-xs text-[#9cb3ab] mt-1 leading-relaxed">
                  Each parameter weight updates along its negative partial derivative of the loss surface <MathTex tex="\mathcal{L}(w_1, w_2)" />.
                </p>
              </div>
              <div className="p-2.5 bg-[#15221f] rounded-lg font-mono text-xs text-primary font-semibold border border-[#23352f]">
                w_new = w_old - η · (∂L / ∂w)
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#23352f] flex items-center justify-between text-xs">
              <span className="text-[#6d857d]">Module 04.2</span>
              <button
                onClick={() => onExpressionChange('x^2 + y^2')}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Load Loss Bowl
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>

          {/* Card B: Physics & Heat Equation */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 flex flex-col justify-between hover:border-tertiary/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-tertiary/15 border border-tertiary/30 text-tertiary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">thermostat</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#15221f] text-[#6d857d] border border-[#23352f]">
                  Thermodynamics
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#e2ece9]">
                  Fourier Heat Diffusion PDE
                </h3>
                <p className="text-xs text-[#9cb3ab] mt-1 leading-relaxed">
                  Thermal conduction equates <MathTex tex="\partial u/\partial t" /> to the spatial Laplacian <MathTex tex="\nabla^2 u = u_{xx} + u_{yy}" />.
                </p>
              </div>
              <div className="p-2.5 bg-[#15221f] rounded-lg font-mono text-xs text-tertiary font-semibold border border-[#23352f]">
                ∂u/∂t = α (∂²u/∂x² + ∂²u/∂y²)
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#23352f] flex items-center justify-between text-xs">
              <span className="text-[#6d857d]">Module 06.1</span>
              <button
                onClick={() => onExpressionChange('3 * exp(-(x^2 + y^2)/3)')}
                className="text-tertiary font-semibold hover:underline flex items-center gap-1"
              >
                Simulate Thermal Peak
                <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>

          {/* Card C: Fluid Vorticity & Curl Vector Field */}
          <div className="bg-[#111b18] rounded-xl p-5 border border-[#23352f] shadow-lg shadow-black/20 flex flex-col justify-between hover:border-secondary/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#182b24] border border-[#23352f] text-secondary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">cyclone</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#15221f] text-[#6d857d] border border-[#23352f]">
                  Vector Calculus
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#e2ece9]">
                  Vorticity &amp; Curl (∇ × F)
                </h3>
                <p className="text-xs text-[#9cb3ab] mt-1 leading-relaxed">
                  Cross-partial derivatives <MathTex tex="\partial Q/\partial x - \partial P/\partial y" /> quantify local rotation density in a fluid flow.
                </p>
              </div>
              <div className="p-2.5 bg-[#15221f] rounded-lg font-mono text-xs text-[#e2ece9] font-semibold border border-[#23352f]">
                curl F = ∇ × F = (∂R/∂y - ∂Q/∂z)î + ...
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-[#23352f] flex items-center justify-between text-xs">
              <span className="text-[#6d857d]">Module 08.3</span>
              <button
                onClick={() => onNavigateTab('curl')}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Open Curl Solver
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
