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
    scene.background = new THREE.Color(0x09090b);

    const camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 100);
    cameraRef.current = camera;
    syncCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight1 = new THREE.DirectionalLight(0xd4d4d8, 0.75);
    dirLight1.position.set(8, 14, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x71717a, 0.4);
    dirLight2.position.set(-8, -6, -8);
    scene.add(dirLight2);

    // Architectural Ground Grid & Structural Coordinate Axes
    const staticGroup = new THREE.Group();
    scene.add(staticGroup);

    const gridHelper = new THREE.GridHelper(6, 12, 0x3f3f46, 0x1f1f23);
    staticGroup.add(gridHelper);

    const createAxisLine = (p1, p2, colorHex) => {
      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const mat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 1.5 });
      return new THREE.Line(geom, mat);
    };

    // X-axis (Cyan #38bdf8), Y-axis (Amber #f59e0b), Z-axis (Zinc #71717a)
    staticGroup.add(createAxisLine(new THREE.Vector3(-3.3, 0, 0), new THREE.Vector3(3.3, 0, 0), 0x38bdf8));
    staticGroup.add(createAxisLine(new THREE.Vector3(0, 0, 3.3), new THREE.Vector3(0, 0, -3.3), 0xf59e0b));
    staticGroup.add(createAxisLine(new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0, 3.3, 0), 0x71717a));

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

  // Update 3D Surface & Slicing Geometry (Swiss Technical Palette)
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

    // Technical elevation color ramp: Deep Charcoal -> Slate Blue -> Cool Silver
    const cLow = new THREE.Color(0x1e293b);
    const cMid = new THREE.Color(0x2563eb);
    const cHigh = new THREE.Color(0x94a3b8);
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
        if (t < 0.5) {
          tmpColor.lerpColors(cLow, cMid, t / 0.5);
        } else {
          tmpColor.lerpColors(cMid, cHigh, (t - 0.5) / 0.5);
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
          opacity: 0.8,
          shininess: 30
        })
      )
    );

    // Architectural Wireframe Overlay
    group.add(
      new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.15
        })
      )
    );

    const { z: z0, fx, fy } = evalData;
    const p0Vec = toVec3(x0, y0, z0);

    // Point P0(x0, y0, z0) Marker
    const ptSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf4f4f5 })
    );
    ptSphere.position.copy(p0Vec);
    group.add(ptSphere);

    const planeMinZ = Math.min(minZ, z0 - 1.4, -1) * zScale - 0.3;
    const planeMaxZ = Math.max(maxZ, z0 + 1.4, 1) * zScale + 0.3;
    const planeHeight = Math.max(2.2, planeMaxZ - planeMinZ);
    const planeCenterY = (planeMinZ + planeMaxZ) / 2;

    // X-Slice Plane (y = y0 held constant -> Cyan #38bdf8)
    if (showSliceY) {
      const sliceYPlaneGeom = new THREE.PlaneGeometry(5, planeHeight);
      const sliceYPlane = new THREE.Mesh(
        sliceYPlaneGeom,
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.12,
          depthWrite: false
        })
      );
      sliceYPlane.position.set(0, planeCenterY, -y0);
      group.add(sliceYPlane);

      const borderY = new THREE.LineSegments(
        new THREE.EdgesGeometry(sliceYPlaneGeom),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
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
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePtsX), 75, 0.035, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        )
      );

      const dirX = new THREE.Vector3(1, fx * zScale, 0).normalize();
      group.add(new THREE.ArrowHelper(dirX, p0Vec, 1.4, 0x38bdf8, 0.24, 0.12));
    }

    // Y-Slice Plane (x = x0 held constant -> Amber #f59e0b)
    if (showSliceX) {
      const sliceXPlaneGeom = new THREE.PlaneGeometry(5, planeHeight);
      sliceXPlaneGeom.rotateY(Math.PI / 2);
      const sliceXPlane = new THREE.Mesh(
        sliceXPlaneGeom,
        new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.12,
          depthWrite: false
        })
      );
      sliceXPlane.position.set(x0, planeCenterY, 0);
      group.add(sliceXPlane);

      const borderX = new THREE.LineSegments(
        new THREE.EdgesGeometry(sliceXPlaneGeom),
        new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7 })
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
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePtsY), 75, 0.035, 8, false),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        )
      );

      const dirY = new THREE.Vector3(0, fy * zScale, -1).normalize();
      group.add(new THREE.ArrowHelper(dirY, p0Vec, 1.4, 0xf59e0b, 0.24, 0.12));
    }

    // Dynamic Tangent Plane at P(x0, y0, z0)
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
            color: 0x71717a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
          })
        )
      );
      group.add(
        new THREE.Mesh(
          tpGeom,
          new THREE.MeshBasicMaterial({
            color: 0xa1a1aa,
            wireframe: true,
            transparent: true,
            opacity: 0.6
          })
        )
      );

      // Normal Vector n = ⟨fx, fy, -1⟩
      const normVec = new THREE.Vector3(fx, -1 * zScale, -fy).normalize();
      group.add(new THREE.ArrowHelper(normVec, p0Vec, 1.2, 0xd4d4d8, 0.2, 0.1));
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

  const copyLatexToClipboard = () => {
    if (!analysis.isValid) return;
    navigator.clipboard?.writeText(`f(x, y) = ${analysis.latex.f}`);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 1800);
  };

  // Second derivative test discriminant: D = f_xx * f_yy - (f_xy)^2
  const D = evalData.fxx * evalData.fyy - Math.pow(evalData.fxy, 2);
  let extremumClassification = 'INCONCLUSIVE';
  if (Math.abs(evalData.fx) < 0.05 && Math.abs(evalData.fy) < 0.05) {
    if (D > 0) {
      extremumClassification = evalData.fxx > 0 ? 'LOCAL MINIMUM' : 'LOCAL MAXIMUM';
    } else if (D < 0) {
      extremumClassification = 'SADDLE POINT';
    }
  } else {
    extremumClassification = 'REGULAR POINT (∇f ≠ 0)';
  }

  return (
    <div className="space-y-4">
      {/* ================= COMPACT ARCHITECTURAL WORKBENCH HEADER ================= */}
      <section className="border border-border bg-surface p-3.5 sm:p-4 rounded-md shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
              MODULE 01 // 3D SLICING &amp; TANGENT LINEARIZATION
            </div>
            <h1 className="font-serif text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
              Orthogonal Slicing Planes &amp; Partial Derivative Slopes
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="bg-surface-sunken border border-border px-2.5 py-1 rounded">
              <span className="text-zinc-500 mr-1.5">P₀:</span>
              <span className="text-sky-400 font-bold">{x0.toFixed(2)}</span>
              <span className="text-zinc-600 mx-1">,</span>
              <span className="text-amber-400 font-bold">{y0.toFixed(2)}</span>
              <span className="text-zinc-600 mx-1">,</span>
              <span className="text-zinc-200">{evalData.z.toFixed(2)}</span>
            </div>
            <button
              onClick={copyLatexToClipboard}
              className="px-2.5 py-1 bg-surface-raised hover:bg-zinc-800 border border-border text-zinc-300 rounded transition-colors"
            >
              {copiedLatex ? 'COPIED' : 'TEX'}
            </button>
          </div>
        </div>

        {/* Function Input & Preset Bar */}
        <div className="pt-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 shrink-0">
              PRESET:
            </span>
            <select
              value={
                SURFACE_PRESETS.find((p) => p.expr === expression.trim())?.expr || 'custom'
              }
              onChange={(e) => {
                if (e.target.value !== 'custom') onExpressionChange(e.target.value);
              }}
              className="w-full bg-surface-sunken border border-border rounded px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {SURFACE_PRESETS.map((p) => (
                <option key={p.id} value={p.expr}>
                  {p.name}
                </option>
              ))}
              <option value="custom">Custom Equation...</option>
            </select>
          </div>

          <div className="lg:col-span-8 flex items-center gap-2">
            <span className="font-mono text-xs text-brand-text shrink-0">z = f(x, y) =</span>
            <input
              type="text"
              value={expression}
              onChange={(e) => onExpressionChange(e.target.value)}
              placeholder="x^3*y - 2*x*y^2 + sin(x)"
              className="w-full bg-surface-sunken border border-border rounded px-3 py-1 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
      </section>

      {/* ================= MAIN DUAL-PANE WORKSPACE ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: 3D VIEWPORT & PARAMETRIC CONTROLS (7 COLS) */}
        <div className="xl:col-span-7 border border-border bg-surface rounded-md shadow-xs overflow-hidden flex flex-col">
          {/* Viewport Segmented Camera Controls */}
          <div className="px-3.5 py-2 border-b border-border bg-surface-sunken flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              VIEWPORT CAMERA PROJECTION
            </span>
            <div className="inline-flex p-0.5 bg-surface border border-border rounded">
              {[
                { id: 'isometric', label: 'ISOMETRIC' },
                { id: 'top', label: 'TOP (XY)' },
                { id: 'sliceY', label: 'X-ELEV' },
                { id: 'sliceX', label: 'Y-ELEV' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => snapCamera(btn.id)}
                  className={`px-2.5 py-0.5 text-[10px] font-mono transition-colors rounded-sm ${
                    activeCamPreset === btn.id
                      ? 'bg-brand text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* WebGL Canvas Viewport */}
          <div className="relative w-full h-[410px] bg-canvas border-b border-border select-none">
            <div ref={mountRef} className="w-full h-full touch-none" />

            {/* Architectural HUD Overlay */}
            <div className="absolute top-2.5 left-2.5 bg-surface/90 border border-border rounded p-2 text-[10px] font-mono space-y-1 select-none pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-1 bg-sky-400 rounded-xs" />
                <span className="text-zinc-300">PLANE y = y₀ // Tₓ = ⟨1, 0, fₓ⟩</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-1 bg-amber-400 rounded-xs" />
                <span className="text-zinc-300">PLANE x = x₀ // Tᵧ = ⟨0, 1, fᵧ⟩</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-1 bg-zinc-400 rounded-xs" />
                <span className="text-zinc-300">TANGENT PLANE // n = ⟨fₓ, fᵧ, -1⟩</span>
              </div>
            </div>
          </div>

          {/* Precision Sliders & Layer Toggles */}
          <div className="p-3.5 bg-surface space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* X0 Slider */}
              <div className="bg-surface-sunken border border-border p-2.5 rounded">
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-sky-400 font-semibold">X₀ POSITION</span>
                  <span className="text-zinc-100 font-bold">{x0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={x0}
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full slider-x"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-1">
                  <span>-2.50</span>
                  <span>0.00</span>
                  <span>+2.50</span>
                </div>
              </div>

              {/* Y0 Slider */}
              <div className="bg-surface-sunken border border-border p-2.5 rounded">
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-amber-400 font-semibold">Y₀ POSITION</span>
                  <span className="text-zinc-100 font-bold">{y0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.05"
                  value={y0}
                  onChange={(e) => setY0(parseFloat(e.target.value))}
                  className="w-full slider-y"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-1">
                  <span>-2.50</span>
                  <span>0.00</span>
                  <span>+2.50</span>
                </div>
              </div>
            </div>

            {/* Segmented Slicing Toggle Buttons */}
            <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setShowSliceY(!showSliceY)}
                className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-2 ${
                  showSliceY
                    ? 'bg-sky-950/40 border-sky-900/60 text-sky-300'
                    : 'bg-surface-sunken border-border text-zinc-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showSliceY ? 'bg-sky-400' : 'bg-zinc-600'}`} />
                <span>PLANE y = y₀ (X-SLICE)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSliceX(!showSliceX)}
                className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-2 ${
                  showSliceX
                    ? 'bg-amber-950/40 border-amber-900/60 text-amber-300'
                    : 'bg-surface-sunken border-border text-zinc-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showSliceX ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                <span>PLANE x = x₀ (Y-SLICE)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTangentPlane(!showTangentPlane)}
                className={`px-3 py-1.5 rounded border transition-colors flex items-center gap-2 ${
                  showTangentPlane
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                    : 'bg-surface-sunken border-border text-zinc-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showTangentPlane ? 'bg-zinc-200' : 'bg-zinc-600'}`} />
                <span>TANGENT PLANE</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-DENSITY DATA INSPECTOR TABLE (5 COLS) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Table 1: First-Order Derivatives & Tangent Vectors */}
          <div className="border border-border bg-surface rounded-md shadow-xs overflow-hidden">
            <div className="px-3.5 py-2 border-b border-border bg-surface-sunken flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                FIRST-ORDER PARTIAL DERIVATIVES
              </span>
              <span className="text-[10px] font-mono text-zinc-400">TABLE 01</span>
            </div>

            <div className="divide-y divide-border text-xs font-mono">
              {/* Row: ∂f/∂x */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-950/50 border border-sky-900/60 text-sky-400 font-bold text-[10px]">
                      ∂f/∂x
                    </span>
                    <span className="text-zinc-200 font-semibold">Slope along X-Axis</span>
                  </div>
                  <span className="text-sky-400 font-bold text-sm">
                    {evalData.fx >= 0 ? `+${evalData.fx.toFixed(3)}` : evalData.fx.toFixed(3)}
                  </span>
                </div>
                <div className="bg-surface-sunken border border-border-subtle p-2 rounded text-zinc-300">
                  <MathTex tex={`\\frac{\\partial f}{\\partial x} = ${analysis.isValid ? analysis.latex.fx : '0'}`} />
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Tangent Vector Tₓ:</span>
                  <span className="text-zinc-200">⟨1.00, 0.00, {evalData.fx.toFixed(2)}⟩</span>
                </div>
              </div>

              {/* Row: ∂f/∂y */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/50 border border-amber-900/60 text-amber-400 font-bold text-[10px]">
                      ∂f/∂y
                    </span>
                    <span className="text-zinc-200 font-semibold">Slope along Y-Axis</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">
                    {evalData.fy >= 0 ? `+${evalData.fy.toFixed(3)}` : evalData.fy.toFixed(3)}
                  </span>
                </div>
                <div className="bg-surface-sunken border border-border-subtle p-2 rounded text-zinc-300">
                  <MathTex tex={`\\frac{\\partial f}{\\partial y} = ${analysis.isValid ? analysis.latex.fy : '0'}`} />
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Tangent Vector Tᵧ:</span>
                  <span className="text-zinc-200">⟨0.00, 1.00, {evalData.fy.toFixed(2)}⟩</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table 2: Linear Tangent Plane Equation */}
          <div className="border border-border bg-surface rounded-md shadow-xs p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span>LINEAR TANGENT PLANE EQUATION</span>
              <span>DEGREE 1</span>
            </div>
            <div className="bg-surface-sunken border border-border-subtle p-2.5 rounded text-xs text-zinc-200 font-mono">
              <MathTex
                tex={`z - ${evalData.z.toFixed(2)} = (${evalData.fx.toFixed(2)})(x - ${x0.toFixed(2)}) + (${evalData.fy.toFixed(2)})(y - ${y0.toFixed(2)})`}
                block
              />
            </div>
            <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-border-subtle">
              <span>Normal Vector n:</span>
              <span className="text-zinc-200">
                ⟨{evalData.fx.toFixed(2)}, {evalData.fy.toFixed(2)}, -1.00⟩
              </span>
            </div>
          </div>

          {/* Table 3: Second-Order Curvatures & Hessian Test */}
          <div className="border border-border bg-surface rounded-md shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span>HESSIAN CURVATURE MATRIX</span>
              <span>2ND DERIVATIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                <span className="text-zinc-500 block text-[10px]">f_xx (X-CONCAVITY)</span>
                <span className="text-zinc-100 font-bold">{evalData.fxx.toFixed(3)}</span>
              </div>
              <div className="bg-surface-sunken border border-border-subtle p-2 rounded">
                <span className="text-zinc-500 block text-[10px]">f_yy (Y-CONCAVITY)</span>
                <span className="text-zinc-100 font-bold">{evalData.fyy.toFixed(3)}</span>
              </div>
              <div className="bg-surface-sunken border border-border-subtle p-2 rounded col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px]">MIXED PARTIALS (CLAIRAUT)</span>
                  <span className="text-zinc-100 font-bold">f_xy = f_yx = {evalData.fxy.toFixed(3)}</span>
                </div>
                <span className="text-[10px] text-emerald-400 border border-emerald-900/50 bg-emerald-950/30 px-1.5 py-0.5 rounded">
                  SYMMETRIC
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">DISCRIMINANT D = f_xx·f_yy - (f_xy)²:</span>
              <span className="text-zinc-200 font-bold">{D.toFixed(3)}</span>
            </div>

            <div className="text-[10px] font-mono text-zinc-400 bg-surface-sunken border border-border-subtle p-2 rounded flex items-center justify-between">
              <span>POINT CLASSIFICATION:</span>
              <span className="text-brand-text font-bold">{extremumClassification}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
