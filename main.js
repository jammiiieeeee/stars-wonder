import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const FINE_COUNT = 48000;
const COARSE_COUNT = 22000;

boot();

function boot() {
  const field = document.getElementById("field");
  const canvas = document.getElementById("scene");
  const focusInput = document.getElementById("focus");
  const trackingInput = document.getElementById("tracking");
  const releaseButton = document.getElementById("release");
  const releaseLabel = releaseButton.querySelector(".release-label");
  const releaseState = releaseButton.querySelector(".release-state");
  const focusOutput = document.querySelector('[data-value="focus"]');
  const trackingOutput = document.querySelector('[data-value="tracking"]');
  const particlesOutput = document.querySelector('[data-readout="particles"]');
  const approachOutput = document.querySelector('[data-readout="approach"]');

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const compact = window.matchMedia("(max-width: 56rem)").matches;
  const starCount = coarse || compact ? COARSE_COUNT : FINE_COUNT;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (error) {
    field.classList.add("field-failed");
    const message = document.createElement("p");
    message.className = "field-error";
    message.textContent = "This field needs WebGL, which this browser did not give us.";
    field.append(message);
    return;
  }

  renderer.setClearColor(0x050507, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
  camera.position.set(0, 0.28, 4.6);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.4, 0.84);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  scene.add(createBackdrop());

  const sky = new THREE.Group();
  const skyTexture = makeStarTexture();
  sky.add(createSky(1500, 14, 30, 0.105, 0.85, skyTexture));
  sky.add(createSky(520, 7, 13, 0.055, 0.55, skyTexture));
  sky.add(createSky(24, 10, 26, 0.24, 0.75, skyTexture));
  scene.add(sky);

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: reduced ? 0 : 1 },
    uFocus: { value: 0.35 + (Number(focusInput.value) / 100) * 0.65 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uPointerStrength: { value: 0 },
    uTwinkle: { value: reduced ? 0.35 : 1 },
    uPulse: { value: 1 },
    uPointScale: { value: 1 },
  };

  const glowTexture = makeGlowTexture();
  const bodyTexture = makeBodyTexture();
  const bodyGlow = makeHalo(bodyTexture, 0xffe3c6, 2.02, 0.72);
  const haloWide = makeHalo(glowTexture, 0xff8f45, 4.2, 0.06);
  const star = createStar(starCount, uniforms);
  const starGroup = new THREE.Group();
  starGroup.rotation.set(0.11, 0, 0.17);
  starGroup.add(haloWide, bodyGlow, star.points);
  scene.add(starGroup);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.65;
  controls.minDistance = 2.4;
  controls.maxDistance = 7;
  controls.autoRotateSpeed = 0.28;
  controls.autoRotate = false;

  const baseDistance = camera.position.length();
  const pointer = uniforms.uPointer.value;
  let pointerTarget = 0;
  let interacting = false;
  let idle = 10;
  let morph = reduced ? 0 : 1;
  let morphTarget = 0;
  let scattered = false;
  let drift = 0;
  let lastApproach = "";
  let lastFrame = performance.now();
  let time = 0;
  let pulse = 1;

  function applyFocus() {
    const value = Number(focusInput.value);
    const f = value / 100;
    uniforms.uFocus.value = f;
    bloom.strength = 0.12 + f * 0.44;
    focusOutput.textContent = String(Math.round(value));
    focusInput.setAttribute("aria-valuetext", `${Math.round(value)} percent`);
    focusInput.style.setProperty("--fill", `${value}%`);
  }

  function applyTracking() {
    const value = Number(trackingInput.value);
    drift = (value / 100) * 3;
    trackingOutput.textContent = `${drift.toFixed(3)}°/s`;
    trackingInput.setAttribute(
      "aria-valuetext",
      `${drift.toFixed(3)} degrees per second`,
    );
    trackingInput.style.setProperty("--fill", `${value}%`);
  }

  function setScattered(next) {
    scattered = next;
    morphTarget = next ? 1 : 0;
    releaseButton.setAttribute("aria-pressed", String(next));
    releaseLabel.textContent = next ? "Recollect" : "Release";
    releaseState.textContent = next ? "dispersed" : "assembled";
    idle = 0;
  }

  releaseButton.addEventListener("click", () => setScattered(!scattered));

  focusInput.addEventListener("input", applyFocus);
  trackingInput.addEventListener("input", applyTracking);

  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
    if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
    event.preventDefault();
    setScattered(!scattered);
  });

  field.addEventListener("pointerdown", () => {
    interacting = true;
    idle = 0;
    field.classList.add("is-grabbing");
  });

  window.addEventListener("pointerup", () => {
    if (!interacting) return;
    interacting = false;
    idle = 0;
    field.classList.remove("is-grabbing");
  });

  field.addEventListener("wheel", () => {
    idle = 0;
  }, { passive: true });

  field.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || coarse) return;
    const rect = field.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointerTarget = 1;
  });

  field.addEventListener("pointerleave", () => {
    pointerTarget = 0;
  });

  const spherical = new THREE.Spherical();
  field.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    spherical.setFromVector3(camera.position);
    if (event.key === "ArrowLeft") spherical.theta += 0.1;
    if (event.key === "ArrowRight") spherical.theta -= 0.1;
    if (event.key === "ArrowUp") spherical.phi = Math.max(0.3, spherical.phi - 0.08);
    if (event.key === "ArrowDown") spherical.phi = Math.min(Math.PI - 0.3, spherical.phi + 0.08);
    if (event.key === "+" || event.key === "=") {
      spherical.radius = Math.max(controls.minDistance, spherical.radius * 0.92);
    }
    if (event.key === "-" || event.key === "_") {
      spherical.radius = Math.min(controls.maxDistance, spherical.radius * 1.08);
    }
    camera.position.setFromSpherical(spherical);
    camera.lookAt(controls.target);
    controls.update();
    idle = 0;
  });

  particlesOutput.textContent = new Intl.NumberFormat("en-US").format(starCount);

  function resize() {
    const width = field.clientWidth;
    if (!width) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const renderSize = Math.round(Math.min(1400, Math.max(640, width * ratio)));
    renderer.setPixelRatio(1);
    renderer.setSize(renderSize, renderSize, false);
    composer.setPixelRatio(1);
    composer.setSize(renderSize, renderSize);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    uniforms.uPointScale.value = renderSize / 630;
  }

  new ResizeObserver(resize).observe(field);
  resize();
  applyFocus();
  applyTracking();

  let started = false;

  function frame(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    time += dt;

    const speed = morphTarget > morph ? 4.2 : 2.7;
    morph += (morphTarget - morph) * (1 - Math.exp(-dt * speed));
    if (Math.abs(morphTarget - morph) < 0.0008) morph = morphTarget;

    uniforms.uMorph.value = morph;
    uniforms.uTime.value = time;
    uniforms.uPointerStrength.value +=
      (pointerTarget - uniforms.uPointerStrength.value) * Math.min(1, dt * 7);

    star.points.rotation.y += THREE.MathUtils.degToRad(drift) * dt;
    sky.rotation.y += dt * 0.0022;

    const assembled = 1 - Math.min(1, morph * 1.25);
    pulse = reduced ? 1 : 1 + Math.sin(time * 0.85) * 0.045;
    uniforms.uPulse.value = pulse;
    bodyGlow.material.opacity = (0.12 + (Number(focusInput.value) / 100) * 0.3) * assembled * pulse;
    haloWide.material.opacity = (0.01 + (Number(focusInput.value) / 100) * 0.025) * assembled;

    idle += interacting ? 0 : dt;
    controls.autoRotate = !reduced && !interacting && idle > 5;
    controls.update(dt);

    const approach = `${(camera.position.length() / baseDistance).toFixed(2)}×`;
    if (approach !== lastApproach) {
      approachOutput.textContent = approach;
      lastApproach = approach;
    }

    composer.render();

    if (!started) {
      started = true;
      document.documentElement.classList.add("is-ready");
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function createBackdrop() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uWarm: { value: new THREE.Vector3(0.013, 0.0055, 0.0021) },
        uCool: { value: new THREE.Vector3(0.0014, 0.0018, 0.0034) },
        uDir: { value: new THREE.Vector3(0.35, 0.14, 1).normalize() },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uWarm;
        uniform vec3 uCool;
        uniform vec3 uDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float key = pow(max(dot(d, uDir), 0.0), 7.0);
          float band = pow(1.0 - abs(d.y), 10.0);
          float counter = pow(max(dot(d, normalize(vec3(-0.7, 0.2, -0.65))), 0.0), 9.0);
          vec3 color = uCool + uWarm * key + uWarm * band * 0.3 + uWarm * counter * 0.22;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    }),
  );
}

function createSky(count, minRadius, maxRadius, size, opacity, texture) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  const cool = new THREE.Color(0xcdd8ea);
  const warm = new THREE.Color(0xffdcc0);
  const white = new THREE.Color(0xffffff);

  for (let i = 0; i < count; i += 1) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const radial = Math.sqrt(1 - u * u);
    const radius = minRadius + Math.pow(Math.random(), 0.7) * (maxRadius - minRadius);
    positions[i * 3] = Math.cos(phi) * radial * radius;
    positions[i * 3 + 1] = u * radius;
    positions[i * 3 + 2] = Math.sin(phi) * radial * radius;

    const pick = Math.random();
    color.copy(pick < 0.06 ? white : pick < 0.3 ? warm : cool);
    color.multiplyScalar(0.45 + Math.random() * 0.55);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createStar(count, uniforms) {
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const delays = new Float32Array(count);

  const core = new THREE.Color(0xfff4de);
  const gold = new THREE.Color(0xffdfb2);
  const amber = new THREE.Color(0xffbb7a);
  const spark = new THREE.Color(0xfffaf0);
  const color = new THREE.Color();

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const jitter = 0.018;

    let nx = Math.cos(theta) * ring + (Math.random() - 0.5) * jitter;
    let ny = y + (Math.random() - 0.5) * jitter;
    let nz = Math.sin(theta) * ring + (Math.random() - 0.5) * jitter;
    const length = Math.hypot(nx, ny, nz) || 1;
    nx /= length;
    ny /= length;
    nz /= length;

    const roll = Math.random();
    const surface = roll > 0.18;
    const corona = roll < 0.03;
    let radius;
    if (surface) radius = 0.965 + Math.pow(Math.random(), 3) * 0.03;
    else if (corona) radius = 1 + Math.pow(Math.random(), 2) * 0.06;
    else radius = Math.pow(Math.random(), 0.45) * 0.94;

    const n1 = noise3(nx * 2.1 + 4.7, ny * 2.1 + 1.3, nz * 2.1 + 8.2) * 2 - 1;
    const n2 = noise3(nx * 5.4 + 1.1, ny * 5.4 + 9.4, nz * 5.4 + 2.6) * 2 - 1;
    const turbulence = surface ? 0.5 : corona ? 0.3 : 0.3;
    radius *= 1 + (n1 * 0.035 + n2 * 0.012) * turbulence;

    const px = nx * radius;
    const py = ny * radius;
    const pz = nz * radius;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;

    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const radial = Math.sqrt(1 - u * u);
    const far = 0.7 + Math.pow(Math.random(), 2) * 1.6;
    scatter[i * 3] = Math.cos(phi) * radial * far;
    scatter[i * 3 + 1] = u * far;
    scatter[i * 3 + 2] = Math.sin(phi) * radial * far;

    color.copy(core).lerp(gold, Math.pow(Math.min(1, radius), 0.8));
    if (surface) color.lerp(amber, 0.22 + Math.max(0, n1) * 0.4);
    if (Math.random() < 0.045) color.copy(spark);

    let intensity;
    if (surface) intensity = (1.0 + Math.random() * 0.45) * (0.7 + n1 * 0.45) * (0.86 + n2 * 0.18);
    else if (corona) intensity = 0.12 + Math.random() * 0.12;
    else intensity = (0.55 + Math.random() * 0.4) * (0.85 + n1 * 0.2);

    colors[i * 3] = color.r * intensity;
    colors[i * 3 + 1] = color.g * intensity;
    colors[i * 3 + 2] = color.b * intensity;

    if (surface) {
      sizes[i] = 0.35 + Math.pow(Math.random(), 3.2) * 1.7;
      if (n1 < -0.22 && Math.random() < 0.45) sizes[i] *= 0.22;
      else if (n1 > 0.42) sizes[i] *= 1.8;
      if (Math.random() < 0.004) sizes[i] += 1.6;
    } else if (corona) {
      sizes[i] = 1 + Math.random() * 1.8;
    } else {
      sizes[i] = 0.3 + Math.pow(Math.random(), 2) * 1.3;
    }

    phases[i] = Math.random();

    const longitude = (Math.atan2(pz, px) + Math.PI) / (Math.PI * 2);
    delays[i] = Math.min(1, longitude * 0.72 + Math.min(1, radius) * 0.28);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uMorph;
      uniform float uPointScale;
      uniform float uFocus;
      uniform float uPointerStrength;
      uniform float uTwinkle;
      uniform float uPulse;
      uniform vec2 uPointer;

      attribute vec3 aScatter;
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aDelay;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float start = aDelay * 0.34;
        float m = smoothstep(start, start + 0.62, uMorph);

        vec3 p = mix(position, aScatter, m);
        vec3 normal = normalize(position + vec3(0.0001));
        p += normal * sin(uTime * 0.8 + aPhase * 6.2831853) * 0.0075;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        vec2 ndc = gl_Position.xy / max(gl_Position.w, 0.0001);
        float near = uPointerStrength * smoothstep(0.3, 0.0, distance(ndc, uPointer));

        float twinkle = 0.8 + 0.2 * uTwinkle * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 26.0);
        float depth = smoothstep(-0.1, 0.9, mv.z);
        float body = mix(1.0, 0.6, depth);
        vec3 viewNormal = normalize(normalMatrix * normal);
        float rim = 1.0 - abs(dot(viewNormal, normalize(-mv.xyz)));
        float rimLight = 1.0 + pow(rim, 3.0) * 0.15;
        float focus = 0.2 + uFocus * 0.8;
        float size = aSize * (9.0 / max(-mv.z, 0.4)) * (1.0 + near * 0.7 + m * 0.2) * (1.45 - focus * 0.45);
        gl_PointSize = size * uPointScale;

        vColor = aColor * (twinkle + near * 0.75) * (0.55 + focus * 0.5) * body * rimLight * uPulse;
        vAlpha = (0.55 + 0.45 * twinkle) * (1.0 - m * 0.35) * (0.3 + focus * 0.58);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float a = 1.0 - d;
        a = a * a * (0.6 + 0.4 * a);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 2;

  return { points };
}

function makeStarTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.92)");
  gradient.addColorStop(0.24, "rgba(255,242,220,0.5)");
  gradient.addColorStop(0.55, "rgba(255,204,156,0.14)");
  gradient.addColorStop(1, "rgba(255,196,140,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeBodyTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,250,242,0.98)");
  gradient.addColorStop(0.3, "rgba(255,232,198,0.74)");
  gradient.addColorStop(0.58, "rgba(255,206,156,0.34)");
  gradient.addColorStop(0.82, "rgba(255,172,110,0.1)");
  gradient.addColorStop(0.94, "rgba(255,150,90,0.03)");
  gradient.addColorStop(1, "rgba(255,140,80,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeHalo(texture, color, scale, opacity) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  sprite.scale.setScalar(scale);
  sprite.renderOrder = 0;
  return sprite;
}

function hash(x, y, z) {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function noise3(x, y, z) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const w = fz * fz * (3 - 2 * fz);

  const n000 = hash(ix, iy, iz);
  const n100 = hash(ix + 1, iy, iz);
  const n010 = hash(ix, iy + 1, iz);
  const n110 = hash(ix + 1, iy + 1, iz);
  const n001 = hash(ix, iy, iz + 1);
  const n101 = hash(ix + 1, iy, iz + 1);
  const n011 = hash(ix, iy + 1, iz + 1);
  const n111 = hash(ix + 1, iy + 1, iz + 1);

  const a = n000 + (n100 - n000) * u;
  const b = n010 + (n110 - n010) * u;
  const c = n001 + (n101 - n001) * u;
  const d = n011 + (n111 - n011) * u;
  const e = a + (b - a) * v;
  const f = c + (d - c) * v;
  return e + (f - e) * w;
}
