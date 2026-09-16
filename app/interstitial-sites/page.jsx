"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";

// ------------------------------------------------------------ structures ---
// Cubic cells centered on the origin, spanning [-a/2, a/2].
// HCP uses the conventional hexagonal prism: vertices at radius a, height c.

const A = 2;
const C = A * Math.sqrt(8 / 3);
const H = A / 2;

const key3 = (p) => p.map((x) => Math.round(x * 1e4)).join(",");

function cubeCorners() {
  const out = [];
  for (const x of [-H, H]) for (const y of [-H, H]) for (const z of [-H, H]) out.push([x, y, z]);
  return out;
}
const faceCenters = () => [[H, 0, 0], [-H, 0, 0], [0, H, 0], [0, -H, 0], [0, 0, H], [0, 0, -H]];
function edgeCenters() {
  const out = [];
  for (let ax = 0; ax < 3; ax++)
    for (const u of [-H, H]) for (const v of [-H, H]) {
      const p = [0, 0, 0];
      p[(ax + 1) % 3] = u;
      p[(ax + 2) % 3] = v;
      out.push(p);
    }
  return out;
}

function buildFCC() {
  return {
    id: "fcc", name: "FCC", cell: "cube", R: (A * Math.SQRT2) / 4,
    lattice: [[A, 0, 0], [0, A, 0], [0, 0, A]],
    atoms: [
      ...cubeCorners().map((p) => ({ p, share: 1 / 8, label: "corner" })),
      ...faceCenters().map((p) => ({ p, share: 1 / 2, label: "face" })),
    ],
    oct: [{ p: [0, 0, 0], share: 1 }, ...edgeCenters().map((p) => ({ p, share: 1 / 4 }))],
    tet: cubeCorners().map((p) => ({ p: p.map((x) => x / 2), share: 1 })),
    ratios: { oct: 0.414, tet: 0.225 }, coordination: 12, packing: 0.74,
  };
}

function buildBCC() {
  const tet = [];
  for (let ax = 0; ax < 3; ax++)
    for (const s of [-H, H])
      for (const o of [-A / 4, A / 4]) {
        const p1 = [0, 0, 0], p2 = [0, 0, 0];
        p1[ax] = s; p1[(ax + 1) % 3] = o;
        p2[ax] = s; p2[(ax + 2) % 3] = o;
        tet.push({ p: p1, share: 1 / 2 }, { p: p2, share: 1 / 2 });
      }
  return {
    id: "bcc", name: "BCC", cell: "cube", R: (A * Math.sqrt(3)) / 4,
    lattice: [[A, 0, 0], [0, A, 0], [0, 0, A]],
    atoms: [
      ...cubeCorners().map((p) => ({ p, share: 1 / 8, label: "corner" })),
      { p: [0, 0, 0], share: 1, label: "body centre" },
    ],
    oct: [...faceCenters().map((p) => ({ p, share: 1 / 2 })), ...edgeCenters().map((p) => ({ p, share: 1 / 4 }))],
    tet,
    ratios: { oct: 0.155, tet: 0.291 }, coordination: 8, packing: 0.68,
  };
}

function buildHCP() {
  const hz = C / 2, rIn = A / Math.sqrt(3);
  const ring = (rad, angles, z) =>
    angles.map((d) => {
      const t = (d * Math.PI) / 180;
      return [rad * Math.cos(t), rad * Math.sin(t), z].map((x) => +x.toFixed(6));
    });
  const hex = [0, 60, 120, 180, 240, 300];
  const bA = [30, 150, 270], cA = [90, 210, 330];

  const tet = [];
  for (const z of [C * 0.375, -C * 0.375]) ring(rIn, bA, z).forEach((p) => tet.push({ p, share: 1 }));
  for (const z of [C / 8, -C / 8]) {
    ring(A, hex, z).forEach((p) => tet.push({ p, share: 1 / 3 }));
    tet.push({ p: [0, 0, z], share: 1 });
  }

  return {
    id: "hcp", name: "HCP", cell: "hex", R: A / 2, a: A, c: C,
    lattice: [[A, 0, 0], [A / 2, (A * Math.sqrt(3)) / 2, 0], [0, 0, C]],
    cellT: [[1.5 * A, (Math.sqrt(3) / 2) * A, 0], [0, Math.sqrt(3) * A, 0], [0, 0, C]],
    atoms: [
      ...ring(A, hex, hz).map((p) => ({ p, share: 1 / 6, label: "prism corner" })),
      ...ring(A, hex, -hz).map((p) => ({ p, share: 1 / 6, label: "prism corner" })),
      { p: [0, 0, hz], share: 1 / 2, label: "basal face" },
      { p: [0, 0, -hz], share: 1 / 2, label: "basal face" },
      ...ring(rIn, bA, 0).map((p) => ({ p, share: 1, label: "midplane" })),
    ],
    oct: [
      ...ring(rIn, cA, C / 4).map((p) => ({ p, share: 1 })),
      ...ring(rIn, cA, -C / 4).map((p) => ({ p, share: 1 })),
    ],
    tet,
    ratios: { oct: 0.414, tet: 0.225 }, coordination: 12, packing: 0.74,
  };
}

const STRUCTURES = { fcc: buildFCC(), bcc: buildBCC(), hcp: buildHCP() };
// cubic cells tile on their own lattice vectors; hcp needs the hexagon tiling
Object.values(STRUCTURES).forEach((s) => { s.cellT = s.cellT || s.lattice; });

// ---------------------------------------------------- neighbours + hulls ---

function neighbourPool(S) {
  const seen = new Set(), out = [];
  const [t1, t2, t3] = S.lattice;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++)
        S.atoms.forEach((a) => {
          const p = [
            a.p[0] + i * t1[0] + j * t2[0] + k * t3[0],
            a.p[1] + i * t1[1] + j * t2[1] + k * t3[1],
            a.p[2] + i * t1[2] + j * t2[2] + k * t3[2],
          ];
          const kk = key3(p);
          if (seen.has(kk)) return;
          seen.add(kk);
          out.push(p);
        });
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function nearest(pool, p, k) {
  return pool
    .map((q) => ({ q, d: dot(sub(q, p), sub(q, p)) }))
    .sort((u, v) => u.d - v.d)
    .slice(0, k)
    .map((u) => u.q);
}

// Brute-force hull for <= 8 points: every outward-facing triple is a face.
function hullFaces(P) {
  const n = P.length, faces = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const nrm = cross(sub(P[j], P[i]), sub(P[k], P[i]));
        const len = Math.hypot(nrm[0], nrm[1], nrm[2]);
        if (len < 1e-9) continue;
        const u = nrm.map((x) => x / len);
        let pos = 0, neg = 0;
        for (let m = 0; m < n; m++) {
          if (m === i || m === j || m === k) continue;
          const d = dot(u, sub(P[m], P[i]));
          if (d > 1e-6) pos++; else if (d < -1e-6) neg++;
        }
        if (pos && neg) continue;
        faces.push(pos > 0 ? [i, k, j] : [i, j, k]);
      }
  return faces;
}

function cageMeshes(verts, color, planes) {
  const faces = hullFaces(verts);
  const tri = [];
  faces.forEach(([i, j, k]) => tri.push(...verts[i], ...verts[j], ...verts[k]));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(tri, 3));
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(
    g,
    new THREE.MeshPhongMaterial({
      color, transparent: true, opacity: 0.16, side: THREE.DoubleSide,
      depthWrite: false, clippingPlanes: planes,
    })
  );
  const seen = new Set(), ep = [];
  faces.forEach((f) => {
    for (let e = 0; e < 3; e++) {
      const a = f[e], b = f[(e + 1) % 3];
      const kk = Math.min(a, b) + "-" + Math.max(a, b);
      if (seen.has(kk)) continue;
      seen.add(kk);
      ep.push(...verts[a], ...verts[b]);
    }
  });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3));
  const lines = new THREE.LineSegments(
    lg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75, clippingPlanes: planes })
  );
  return [mesh, lines];
}

// ---------------------------------------------------------------- tables ---

function tally(list) {
  const g = new Map();
  list.forEach((s) => {
    const k = (s.label || "site") + "|" + s.share;
    const e = g.get(k) || { label: s.label || "site", share: s.share, n: 0 };
    e.n += 1;
    g.set(k, e);
  });
  return [...g.values()];
}
const frac = (x) =>
  ({ 1: "1", 0.5: "1/2", 0.25: "1/4", 0.125: "1/8" }[x] ||
    (Math.abs(x - 1 / 6) < 1e-9 ? "1/6" : Math.abs(x - 1 / 3) < 1e-9 ? "1/3" : x.toFixed(2)));

const COL_ATOM = 0x93a7c4, COL_MARK = 0xffb347, COL_OCT = 0x35c4f0, COL_TET = 0xf7568f;

// ------------------------------------------------------------------ view ---

export default function InterstitialSites() {
  const mountRef = useRef(null);
  const api = useRef(null);

  const [sid, setSid] = useState("fcc");
  const [sites, setSites] = useState("oct");
  const [cage, setCage] = useState(false);
  const [ghosts, setGhosts] = useState(false);
  const [ghostOp, setGhostOp] = useState(0.13);
  const [scale, setScale] = useState(0.55);
  const [clipCell, setClipCell] = useState(true);
  const [cutAxis, setCutAxis] = useState(2);
  const [cutPos, setCutPos] = useState(1);
  const [counted, setCounted] = useState({});
  const [status, setStatus] = useState("");

  const S = STRUCTURES[sid];
  const atomTotal = S.atoms.reduce((s, x) => s + x.share, 0);
  const octTotal = S.oct.reduce((s, x) => s + x.share, 0);
  const tetTotal = S.tet.reduce((s, x) => s + x.share, 0);
  const rows = useMemo(() => tally(S.atoms), [sid]);
  const userSum = Object.values(counted).reduce((s, x) => s + x, 0);
  const nCounted = Object.keys(counted).length;

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch (e) { setStatus("WebGL unavailable: " + e.message); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080c14, 1);
    renderer.localClippingEnabled = true;
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "grab",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0x5a6678, 1.0));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.85); d1.position.set(4, 6, 5);
    const d2 = new THREE.DirectionalLight(0x88aaff, 0.35); d2.position.set(-5, -3, -4);
    scene.add(d1, d2);

    const root = new THREE.Group();
    scene.add(root);

    const cellPlanes = Array.from({ length: 8 }, () => new THREE.Plane(new THREE.Vector3(1, 0, 0), 1e3));
    const slicePlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e3);
    const allPlanes = [...cellPlanes, slicePlane];

    // cap machinery: unit disc in XY, reused meshes, materials cached per (colour, excluded plane)
    const capGeo = new THREE.CircleGeometry(1, 48);
    const capGroup = new THREE.Group();
    root.add(capGroup);
    const capPool = [];
    const capMats = new Map();
    const capMat = (color, skip) => {
      const k = color + ":" + skip;
      if (!capMats.has(k)) {
        capMats.set(k, new THREE.MeshPhongMaterial({
          color, shininess: 10, side: THREE.DoubleSide,
          clippingPlanes: allPlanes.filter((_, i) => i !== skip),
        }));
      }
      return capMats.get(k);
    };

    let theta = 0.75, phi = 1.05, radius = 7.5;
    const place = () => {
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
    };
    place();

    const dom = renderer.domElement;
    let dragging = false, px = 0, py = 0, moved = 0;
    const down = (e) => { dragging = true; moved = 0; px = e.clientX; py = e.clientY; dom.setPointerCapture(e.pointerId); dom.style.cursor = "grabbing"; };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      moved += Math.abs(dx) + Math.abs(dy);
      theta -= dx * 0.006;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - dy * 0.006));
      px = e.clientX; py = e.clientY;
      place();
    };
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const up = (e) => {
      dragging = false; dom.style.cursor = "grab";
      try { dom.releasePointerCapture(e.pointerId); } catch (_) {}
      if (moved > 6 || !api.current) return;
      const r = dom.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(api.current.atomMeshes, false);
      if (!hits.length) return;
      const m = hits[0].object;
      setCounted((c) => {
        const next = { ...c };
        if (next[m.userData.key] !== undefined) delete next[m.userData.key];
        else next[m.userData.key] = m.userData.share;
        return next;
      });
    };
    const wheel = (e) => { e.preventDefault(); radius = Math.max(3.2, Math.min(18, radius * (1 + e.deltaY * 0.0012))); place(); };
    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", up);
    dom.addEventListener("wheel", wheel, { passive: false });

    const resize = () => {
      const cw = mount.clientWidth || 640, ch = mount.clientHeight || 440;
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf, dead = false;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (dead) return;
      try { renderer.render(scene, camera); }
      catch (err) { dead = true; setStatus("Render failed: " + err.message); }
    };
    loop();

    api.current = {
      scene, root, cellPlanes, slicePlane, allPlanes,
      capGeo, capGroup, capPool, capMat, atomMeshes: [], groups: {},
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointercancel", up);
      dom.removeEventListener("wheel", wheel);
      renderer.dispose();
      if (dom.parentNode === mount) mount.removeChild(dom);
    };
  }, []);

  // ---- rebuild on structure change
  useEffect(() => {
    const ctx = api.current;
    if (!ctx) return;
    setCounted({});

    ctx.root.children
      .filter((c) => c !== ctx.capGroup)
      .forEach((c) => {
        ctx.root.remove(c);
        c.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      });
    ctx.atomMeshes = [];

    const P = ctx.allPlanes;
    const linePts = [];

    if (S.cell === "cube") {
      const c = cubeCorners();
      [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]]
        .forEach(([i, j]) => linePts.push(...c[i], ...c[j]));
      [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach((n, i) =>
        ctx.cellPlanes[i].set(new THREE.Vector3(...n).negate(), H)
      );
      ctx.cellPlanes[6].set(new THREE.Vector3(1, 0, 0), 1e3);
      ctx.cellPlanes[7].set(new THREE.Vector3(1, 0, 0), 1e3);
    } else {
      const hz = S.c / 2;
      const vtx = [0, 60, 120, 180, 240, 300].map((d) => {
        const t = (d * Math.PI) / 180;
        return [S.a * Math.cos(t), S.a * Math.sin(t)];
      });
      for (let i = 0; i < 6; i++) {
        const j = (i + 1) % 6;
        linePts.push(vtx[i][0], vtx[i][1], hz, vtx[j][0], vtx[j][1], hz);
        linePts.push(vtx[i][0], vtx[i][1], -hz, vtx[j][0], vtx[j][1], -hz);
        linePts.push(vtx[i][0], vtx[i][1], -hz, vtx[i][0], vtx[i][1], hz);
      }
      const apo = (S.a * Math.sqrt(3)) / 2;
      [30, 90, 150, 210, 270, 330].forEach((d, i) => {
        const t = (d * Math.PI) / 180;
        ctx.cellPlanes[i].set(new THREE.Vector3(-Math.cos(t), -Math.sin(t), 0), apo);
      });
      ctx.cellPlanes[6].set(new THREE.Vector3(0, 0, -1), hz);
      ctx.cellPlanes[7].set(new THREE.Vector3(0, 0, 1), hz);
    }
    ctx.cellPlanes.forEach((p) => { p.__keep = p.constant; });

    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.Float32BufferAttribute(linePts, 3));
    ctx.frame = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x7d8ca3 }));
    ctx.root.add(ctx.frame);

    const sphere = new THREE.SphereGeometry(1, 32, 24);
    S.atoms.forEach((atom, i) => {
      const m = new THREE.Mesh(
        sphere,
        new THREE.MeshPhongMaterial({ color: COL_ATOM, shininess: 35, clippingPlanes: P })
      );
      m.position.set(...atom.p);
      m.userData = { key: S.id + ":" + i, share: atom.share, label: atom.label, capColor: COL_ATOM };
      ctx.root.add(m);
      ctx.atomMeshes.push(m);
    });

    // ---- adjacent cells: faint atoms + faint frames, so the central cell reads as the subject
    const [g1, g2, g3] = S.cellT;
    const ghostPts = [], ghostPos = [];
    const seenG = new Set();
    // the central cell's own sites get a ghost too: that is what completes each
    // clipped atom back into a whole sphere around the solid in-cell wedge
    S.atoms.forEach((a) => {
      const kk = key3(a.p);
      if (seenG.has(kk)) return;
      seenG.add(kk);
      ghostPos.push(a.p.slice());
    });
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++)
        for (let k = -1; k <= 1; k++) {
          if (!i && !j && !k) continue;
          const t = [
            i * g1[0] + j * g2[0] + k * g3[0],
            i * g1[1] + j * g2[1] + k * g3[1],
            i * g1[2] + j * g2[2] + k * g3[2],
          ];
          for (let q = 0; q < linePts.length; q += 3)
            ghostPts.push(linePts[q] + t[0], linePts[q + 1] + t[1], linePts[q + 2] + t[2]);
          S.atoms.forEach((a) => {
            const q = [a.p[0] + t[0], a.p[1] + t[1], a.p[2] + t[2]];
            const kk = key3(q);
            if (seenG.has(kk)) return;
            seenG.add(kk);
            ghostPos.push(q);
          });
        }

    const gfg = new THREE.BufferGeometry();
    gfg.setAttribute("position", new THREE.Float32BufferAttribute(ghostPts, 3));
    const ghostFrame = new THREE.LineSegments(
      gfg, new THREE.LineBasicMaterial({ color: 0x5c6d88, transparent: true, opacity: 0.3 })
    );
    ctx.root.add(ghostFrame);

    const ghostMesh = new THREE.InstancedMesh(
      sphere,
      new THREE.MeshPhongMaterial({
        color: COL_ATOM, transparent: true, opacity: 0.13, depthWrite: false,
        clippingPlanes: [ctx.slicePlane],
      }),
      Math.max(ghostPos.length, 1)
    );
    ghostMesh.frustumCulled = false;
    ctx.root.add(ghostMesh);
    ctx.ghost = { mesh: ghostMesh, frame: ghostFrame, pos: ghostPos };

    const pool = neighbourPool(S);
    const mkSites = (list, color, ratio) => {
      const g = new THREE.Group();
      list.forEach((s) => {
        const m = new THREE.Mesh(
          sphere,
          new THREE.MeshPhongMaterial({
            color, emissive: color, emissiveIntensity: 0.25, shininess: 60, clippingPlanes: P,
          })
        );
        m.position.set(...s.p);
        m.userData = { ratio, capColor: color };
        g.add(m);
      });
      ctx.root.add(g);
      return g;
    };
    const mkCages = (list, color, n) => {
      const g = new THREE.Group();
      list.forEach((s) => cageMeshes(nearest(pool, s.p, n), color, P).forEach((o) => g.add(o)));
      g.visible = false;
      ctx.root.add(g);
      return g;
    };

    ctx.groups.oct = mkSites(S.oct, COL_OCT, S.ratios.oct);
    ctx.groups.tet = mkSites(S.tet, COL_TET, S.ratios.tet);
    ctx.groups.octCage = mkCages(S.oct, COL_OCT, 6);
    ctx.groups.tetCage = mkCages(S.tet, COL_TET, 4);
  }, [sid]);

  // ---- per-control updates, including cut caps
  useEffect(() => {
    const ctx = api.current;
    if (!ctx) return;
    const rAtom = S.R * scale;

    ctx.atomMeshes.forEach((m) => {
      m.scale.setScalar(rAtom);
      const on = counted[m.userData.key] !== undefined;
      m.material.color.setHex(on ? COL_MARK : COL_ATOM);
      m.material.emissive.setHex(on ? 0x3a2500 : 0x000000);
      m.userData.capColor = on ? COL_MARK : COL_ATOM;
      m.userData.radius = rAtom;
    });
    [
      ["oct", sites === "oct"], ["tet", sites === "tet"],
      ["octCage", sites === "oct" && cage], ["tetCage", sites === "tet" && cage],
    ].forEach(([k, vis]) => {
      const g = ctx.groups[k];
      if (!g) return;
      g.visible = vis;
      if (k === "oct" || k === "tet")
        g.children.forEach((m) => {
          m.scale.setScalar(rAtom * m.userData.ratio);
          m.userData.radius = rAtom * m.userData.ratio;
        });
    });

    ctx.cellPlanes.forEach((p) => { p.constant = clipCell ? p.__keep ?? 1e3 : 1e3; });

    if (ctx.ghost) {
      const { mesh, frame, pos } = ctx.ghost;
      mesh.visible = ghosts && pos.length > 0;
      frame.visible = ghosts;
      mesh.material.opacity = ghostOp;
      frame.material.opacity = Math.min(1, ghostOp * 2.4);
      if (mesh.visible) {
        const mtx = new THREE.Matrix4();
        pos.forEach((q, i) => {
          mtx.makeScale(rAtom * 0.997, rAtom * 0.997, rAtom * 0.997);
          mtx.setPosition(q[0], q[1], q[2]);
          mesh.setMatrixAt(i, mtx);
        });
        mesh.count = pos.length;
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
    if (ctx.frame) ctx.frame.material.color.setHex(ghosts ? 0xe8eef8 : 0x7d8ca3);

    const half = S.cell === "cube" ? H : cutAxis === 2 ? S.c / 2 : S.a;
    const n = [0, 0, 0];
    n[cutAxis] = -1;
    ctx.slicePlane.normal.set(...n);
    ctx.slicePlane.constant = cutPos >= 0.999 ? 1e3 : -half + cutPos * 2 * half;

    // ---- caps: a sphere cut by plane (n, c) exposes a disc of radius sqrt(r^2 - d^2)
    const spheres = [...ctx.atomMeshes];
    if (sites === "oct") spheres.push(...ctx.groups.oct.children);
    if (sites === "tet") spheres.push(...ctx.groups.tet.children);

    let used = 0;
    const zAxis = new THREE.Vector3(0, 0, 1);
    const tmp = new THREE.Vector3();
    spheres.forEach((m) => {
      const r = m.userData.radius;
      ctx.allPlanes.forEach((pl, idx) => {
        if (Math.abs(pl.constant) > 900) return;
        const d = pl.normal.dot(m.position) + pl.constant;
        if (d >= r || d <= -r) return;
        const cap = ctx.capPool[used] || (ctx.capPool[used] = (() => {
          const c = new THREE.Mesh(ctx.capGeo, ctx.capMat(COL_ATOM, 0));
          ctx.capGroup.add(c);
          return c;
        })());
        used++;
        cap.visible = true;
        cap.material = ctx.capMat(m.userData.capColor, idx);
        tmp.copy(pl.normal).multiplyScalar(d);
        cap.position.copy(m.position).sub(tmp);
        cap.quaternion.setFromUnitVectors(zAxis, pl.normal);
        cap.scale.setScalar(Math.sqrt(r * r - d * d));
      });
    });
    for (let i = used; i < ctx.capPool.length; i++) ctx.capPool[i].visible = false;
  }, [sid, scale, sites, cage, ghosts, ghostOp, clipCell, cutAxis, cutPos, counted]);

  const btn = (a) =>
    "flex-1 py-1 text-xs rounded-sm border " +
    (a ? "border-sky-400 bg-sky-900 text-sky-100" : "border-slate-700 text-slate-400 hover:border-slate-500");

  return (
    <div className="w-full flex flex-col bg-slate-950 text-slate-200 font-sans" style={{ height: "100%", minHeight: 660 }}>
      <div className="flex items-baseline justify-between px-4 py-2 border-b border-slate-800">
        <h1 className="text-sm font-medium text-slate-100">Interstitial sites &middot; {S.name}</h1>
        <span className="text-xs text-slate-500">drag orbit &middot; scroll zoom &middot; click an atom to count it</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div ref={mountRef} className="flex-1 relative" style={{ minHeight: 380 }}>
          {status && <div className="absolute inset-0 flex items-center justify-center text-xs text-rose-300 p-6 text-center">{status}</div>}
        </div>

        <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 space-y-4 overflow-y-auto">
          <div className="flex gap-1">
            {["fcc", "bcc", "hcp"].map((k) => (
              <button key={k} onClick={() => setSid(k)} className={btn(sid === k)}>{STRUCTURES[k].name}</button>
            ))}
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={clipCell} onChange={(e) => setClipCell(e.target.checked)} className="accent-sky-400" />
              Clip atoms to the cell
            </label>
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-slate-400">Radius</span>
              <input type="range" min="0.15" max="1" step="0.01" value={scale} onChange={(e) => setScale(+e.target.value)} className="flex-1 accent-slate-300" />
              <span className="w-10 text-right tabular-nums text-slate-300">{scale.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-slate-400">Cut</span>
              <div className="flex gap-1 flex-1">
                {["x", "y", "z"].map((ax, i) => (
                  <button key={ax} onClick={() => setCutAxis(i)} className={btn(cutAxis === i)}>{ax}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-slate-400">Depth</span>
              <input type="range" min="0" max="1" step="0.005" value={cutPos} onChange={(e) => setCutPos(+e.target.value)} className="flex-1 accent-amber-400" />
              <span className="w-10 text-right tabular-nums text-slate-300">{cutPos.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex gap-1">
              {[["none", "No sites"], ["oct", "Octahedral"], ["tet", "Tetrahedral"]].map(([k, l]) => (
                <button key={k} onClick={() => setSites(k)} className={btn(sites === k)}>{l}</button>
              ))}
            </div>
            {sites !== "none" && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: sites === "oct" ? "#35c4f0" : "#f7568f" }} />
                <span className="flex-1 text-slate-400 tabular-nums">
                  {sites === "oct" ? octTotal : tetTotal} per cell &middot; r/R {sites === "oct" ? S.ratios.oct : S.ratios.tet}
                </span>
                <label className="flex items-center gap-1.5 text-slate-300">
                  <input type="checkbox" checked={cage} onChange={(e) => setCage(e.target.checked)} className="accent-sky-400" />
                  cage
                </label>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <label className="flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={ghosts} onChange={(e) => setGhosts(e.target.checked)} className="accent-slate-300" />
              Adjacent cells
            </label>
            {ghosts && (
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-slate-400">Opacity</span>
                <input type="range" min="0.04" max="0.4" step="0.01" value={ghostOp}
                  onChange={(e) => setGhostOp(+e.target.value)} className="flex-1 accent-slate-400" />
                <span className="w-10 text-right tabular-nums text-slate-300">{ghostOp.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="rounded-sm border border-slate-800">
            <table className="w-full text-xs">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label + r.share} className="border-b border-slate-800">
                    <td className="px-2 py-1 text-slate-400">{r.label}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-slate-300">{r.n} &times; {frac(r.share)}</td>
                    <td className="px-2 py-1 text-right tabular-nums text-slate-200 w-12">{(r.n * r.share).toFixed(2).replace(/\.00$/, "")}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-2 py-1 text-slate-300">atoms / cell</td>
                  <td />
                  <td className="px-2 py-1 text-right tabular-nums text-amber-300 font-medium">{atomTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-sm border border-slate-800 bg-slate-900 px-3 py-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Your tally</span>
              <button onClick={() => setCounted({})} className="text-slate-500 hover:text-slate-300">reset</button>
            </div>
            <div className="mt-1 tabular-nums">
              <span className="text-lg font-medium text-amber-300">{(+userSum.toFixed(3)).toString()}</span>
              <span className="text-slate-500"> / {atomTotal} from {nCounted} atom{nCounted === 1 ? "" : "s"}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            CN {S.coordination} &middot; APF {S.packing}. Cages show the host atoms coordinating each
            site &mdash; turn the radius down to see them. BCC octahedra are visibly squashed; the
            0.155 ratio is the short axis, which is why carbon in ferrite strains the lattice so hard.
          </div>
        </div>
      </div>
    </div>
  );
}
