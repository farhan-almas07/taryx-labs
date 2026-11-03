// 3D intro: galaxy of particles → forms the name → bursts into a living sphere behind the photo.
// Uses Three.js (WebGL). If anything fails, the site simply shows without the intro.
const done = () => { if (window.__introDone) return; window.__introDone = true; window.dispatchEvent(new Event("intro:done")); };
const reduce = false; // animations always on

async function start() {
  const canvas = document.querySelector(".hero-3d");
  if (!canvas || reduce) return done();
  let THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js");
  } catch {
    return done();
  }

  const mobile = innerWidth < 900;
  const COUNT = mobile ? 7000 : 16000;
  const WORD = "TARYX";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch {
    return done();
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const group = new THREE.Group();
  scene.add(group);

  // visible size of the z=0 plane
  const view = () => {
    const h = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    return { w: h * camera.aspect, h };
  };

  // ---------- Shapes ----------
  const galaxy = new Float32Array(COUNT * 3);
  const sphere = new Float32Array(COUNT * 3);
  const text = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT);
  const ring = new Float32Array(COUNT);
  const SPH = Math.floor(COUNT * 0.68); // the rest form an orbiting ring

  for (let i = 0; i < COUNT; i++) {
    rand[i] = Math.random();
    // spiral galaxy with 3 arms
    const arm = i % 3, r = Math.pow(Math.random(), 0.7) * 6 + 0.2;
    const a = (arm / 3) * Math.PI * 2 + r * 0.9 + (Math.random() - 0.5) * 0.6;
    galaxy[i * 3] = Math.cos(a) * r + (Math.random() - 0.5) * 0.4;
    galaxy[i * 3 + 1] = (Math.random() - 0.5) * 0.5 * (1.4 - r / 6);
    galaxy[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * 0.4;
    if (i < SPH) {
      // fibonacci sphere shell (+ a few inner particles for depth)
      const k = i + 0.5, phi = Math.acos(1 - (2 * k) / SPH), th = Math.PI * (1 + Math.sqrt(5)) * k;
      const rad = Math.random() < 0.88 ? 1 : 0.55 + Math.random() * 0.4;
      sphere[i * 3] = Math.cos(th) * Math.sin(phi) * rad;
      sphere[i * 3 + 1] = Math.sin(th) * Math.sin(phi) * rad;
      sphere[i * 3 + 2] = Math.cos(phi) * rad;
    } else {
      // Saturn-style ring: denser near the inner edge, with a thin gap
      ring[i] = 1;
      let rr = 1.45 + Math.pow(Math.random(), 1.6) * 0.75;
      if (rr > 1.78 && rr < 1.84) rr += 0.08;
      const ra = Math.random() * Math.PI * 2;
      sphere[i * 3] = Math.cos(ra) * rr;
      sphere[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      sphere[i * 3 + 2] = Math.sin(ra) * rr;
    }
  }

  // sample the word from a 2D canvas
  function buildText() {
    const c = document.createElement("canvas"), W = 1200, H = 300;
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.font = `700 ${mobile ? 240 : 260}px "Clash Display", "Satoshi", Arial, sans-serif`;
    g.letterSpacing = "8px";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(WORD, W / 2, H / 2 + 10);
    const px = g.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
    const v = view(), scale = (Math.min(v.w * 0.86, 11) / W);
    for (let i = 0; i < COUNT; i++) {
      const j = (Math.floor(Math.random() * (pts.length / 2))) * 2;
      text[i * 3] = (pts[j] - W / 2) * scale + (Math.random() - 0.5) * 0.02;
      text[i * 3 + 1] = -(pts[j + 1] - H / 2) * scale + (Math.random() - 0.5) * 0.02;
      text[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(galaxy, 3));
  geo.setAttribute("aGalaxy", new THREE.BufferAttribute(galaxy, 3));
  geo.setAttribute("aText", new THREE.BufferAttribute(text, 3));
  geo.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
  geo.setAttribute("aRing", new THREE.BufferAttribute(ring, 1));

  const uniforms = {
    uT1: { value: 0 }, uT2: { value: 0 }, uTime: { value: 0 }, uIn: { value: 0 },
    uAlpha: { value: 1 }, uPixel: { value: renderer.getPixelRatio() },
    uSize: { value: mobile ? 44 : 40 }, uRadius: { value: 2.6 }, uCenter: { value: new THREE.Vector3() },
    uMouse: { value: new THREE.Vector2(9, 9) }, uRot: { value: new THREE.Vector3() }, uCalm: { value: 1 }, uFocus: { value: new THREE.Vector3() },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aGalaxy; attribute vec3 aText; attribute vec3 aSphere; attribute float aRand; attribute float aRing;
      uniform float uT1, uT2, uTime, uIn, uSize, uPixel, uRadius; uniform vec3 uCenter; uniform vec2 uMouse; uniform vec3 uRot; uniform vec3 uFocus;
      varying float vRand; varying float vGlow;
      mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
      void main() {
        vRand = aRand;
        // galaxy spins (faster near the centre) and tilts towards the camera
        vec3 g = aGalaxy;
        g.xz *= rot(uTime * (0.35 + 0.6 / (length(g.xz) + 0.6)));
        g.yz *= rot(0.62);
        g *= mix(0.2, 1.0, uIn);
        g += uFocus;
        // the name shimmers slightly
        vec3 t = aText + uFocus + vec3(0.0, sin(uTime * 3.0 + aText.x * 2.0) * 0.03, 0.0);
        // living sphere: breathing waves across the surface
        vec3 sp = aSphere;
        if (aRing > 0.5) {
          sp.xz *= rot(uTime * (0.32 / length(aSphere.xz)));   // inner ring orbits faster
          sp.yz *= rot(0.38);
          sp.xy *= rot(-0.32);
        } else {
          sp.xz *= rot(uRot.z);
        }
        sp.xz *= rot(uRot.x);   // follow the mouse
        sp.yz *= rot(uRot.y);
        float wave = (sin(uTime * 1.6 + aSphere.y * 4.0 + aRand * 6.28) * 0.06 + sin(uTime * 0.9 + aSphere.x * 3.0) * 0.05) * (1.0 - aRing);
        vec3 s = sp * uRadius * (1.0 + wave) + uCenter;
        vec3 p = mix(g, t, uT1);
        p = mix(p, s, uT2);
        // explosion between the word and the sphere
        float burst = sin(uT2 * 3.14159);
        p += normalize(p - uCenter * uT2 + vec3(aRand - 0.5, 0.3, 0.2)) * burst * (1.5 + aRand * 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // mouse glow
        vec4 clip = projectionMatrix * mv;
        vec2 ndc = clip.xy / clip.w;
        vGlow = smoothstep(0.35, 0.0, distance(ndc, uMouse)) * uT2;
        gl_Position = clip;
        gl_PointSize = uSize * uPixel * (0.35 + aRand * 0.9) * (1.0 + vGlow * 1.5) / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha, uIn, uCalm; varying float vRand; varying float vGlow;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        vec3 gold = vec3(0.886, 0.741, 0.482), blue = vec3(0.56, 0.66, 1.0), white = vec3(1.0, 0.97, 0.92);
        vec3 col = mix(gold, blue, smoothstep(0.55, 0.95, vRand));
        col = mix(col, white, vGlow * 0.7 + step(0.985, vRand) * 0.6);
        gl_FragColor = vec4(col * 1.15, a * (0.8 + vGlow * 0.2) * uAlpha * uIn * uCalm);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  group.add(points);

  // ---------- Layout ----------
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const v = view(), hr = canvas.getBoundingClientRect();
    // centre of the part of the hero you can actually see
    const top = Math.max(0, hr.top), bottom = Math.min(innerHeight, hr.bottom);
    const visMid = (top + bottom) / 2, visH = ((bottom - top) / h) * v.h;
    const fy = -((visMid - hr.top) / h - 0.5) * v.h;
    uniforms.uFocus.value.set(0, fy, 0);
    // the sphere + ring sit centred behind the headline
    uniforms.uCenter.value.set(0, fy + visH * 0.02, -1.5);
    uniforms.uRadius.value = Math.min(v.w * 0.205, visH * 0.27);
  }
  layout();
  // wait (max 1.2s) for the brand font so the particles form the real letters
  try { await Promise.race([document.fonts.load('700 120px "Clash Display"'), new Promise((r) => setTimeout(r, 1200))]); } catch {}
  buildText();
  geo.attributes.aText.needsUpdate = true;
  addEventListener("resize", layout);

  // ---------- Interaction ----------
  const target = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    target.x = e.clientX / innerWidth - 0.5;
    target.y = e.clientY / innerHeight - 0.5;
    const r = canvas.getBoundingClientRect();
    uniforms.uMouse.value.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  }, { passive: true });

  // ---------- Timeline ----------
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const T = { in: [0, 0.9], form: [0.9, 2.3], burst: [3.2, 4.6], reveal: 3.4 };
  // #still (used for screenshots) jumps straight to the final scene
  let clock = location.hash === "#still" ? T.burst[1] : 0, speed = 1, last = performance.now(), revealed = false, visible = true;
  const skip = () => { speed = 4; };
  addEventListener("pointerdown", skip, { once: true });
  addEventListener("keydown", skip, { once: true });
  addEventListener("wheel", skip, { once: true, passive: true });

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt * speed;
    uniforms.uTime.value += dt;
    const k = (a, b) => ease((clock - a) / (b - a));
    uniforms.uIn.value = k(...T.in);
    uniforms.uT1.value = k(...T.form);
    uniforms.uT2.value = k(...T.burst);
    uniforms.uCalm.value = 1 - 0.3 * uniforms.uT2.value;
    if (!revealed && clock >= T.reveal) { revealed = true; layout(); done(); }

    // camera drift + mouse parallax
    const rotU = uniforms.uRot.value;
    rotU.x += (target.x * 0.9 - rotU.x) * 0.05;   // follow the mouse
    rotU.y += (target.y * 0.6 - rotU.y) * 0.05;
    rotU.z += dt * 0.18;                         // slow spin
    camera.position.z = 10 + (1 - uniforms.uT1.value) * 2 - Math.sin(uniforms.uT2.value * Math.PI) * 1.2;

    // fade while scrolling away
    const bottom = canvas.getBoundingClientRect().bottom;
    uniforms.uAlpha.value = Math.min(1, Math.max(0, bottom / (innerHeight * 0.8)));
    if (visible && uniforms.uAlpha.value > 0) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

start().catch(done);
