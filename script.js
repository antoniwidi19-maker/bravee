
import * as THREE from "three";

// ==========================================
// NEBULA — INTERACTIVE DIGITAL UNIVERSE
// ==========================================

// ---------- DOM ----------
const planetStage = document.getElementById("planet3d");
const starCanvas = document.getElementById("starfield");
const starCtx = starCanvas.getContext("2d");
const ambientGlow = document.getElementById("ambientGlow");

let scene, camera, renderer;
let planet, clouds, atmosphere;
let dragging = false;
let lastPointer = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let pointerMoved = false;

const clock = new THREE.Clock();

// ---------- PLANET PALETTE ----------
const palettes = {
  violet: {
    base: "#3a1d78",
    light: "#a98aff",
    dark: "#100820",
    land: "#8a68db"
  },
  blue: {
    base: "#12518d",
    light: "#7be1ff",
    dark: "#071a35",
    land: "#429ad7"
  },
  amber: {
    base: "#7a4128",
    light: "#ffd1a0",
    dark: "#24120c",
    land: "#c98a58"
  },
  rose: {
    base: "#672b73",
    light: "#ffb5ff",
    dark: "#210c2b",
    land: "#c35bc4"
  },
  red: {
    base: "#7e282b",
    light: "#ffac83",
    dark: "#260b11",
    land: "#c15a4e"
  },
  emerald: {
    base: "#15574a",
    light: "#91ffe2",
    dark: "#071e1a",
    land: "#45b997"
  }
};

// ---------- PROCEDURAL TEXTURE ----------
function createPlanetTexture(palette, seed = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  const p = palettes[palette] || palettes.violet;

  // Base
  const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
  gradient.addColorStop(0, p.dark);
  gradient.addColorStop(.5, p.base);
  gradient.addColorStop(1, p.dark);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 512);

  // Seeded random
  let seedValue = seed * 999 + 7;

  function random() {
    seedValue = (seedValue * 16807) % 2147483647;
    return (seedValue - 1) / 2147483646;
  }

  // Surface patches
  for (let i = 0; i < 1500; i++) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const radius = random() * 45 + 4;

    ctx.beginPath();
    ctx.ellipse(
      x, y,
      radius * (random() * 2 + .4),
      radius * .4,
      random() * Math.PI,
      0, Math.PI * 2
    );

    ctx.fillStyle = random() > .5
      ? `${p.land}${random() > .5 ? "55" : "33"}`
      : `${p.light}${random() > .5 ? "22" : "11"}`;

    ctx.fill();
  }

  // Bands
  for (let i = 0; i < 55; i++) {
    const y = random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      250, y + random() * 60 - 30,
      700, y + random() * 60 - 30,
      1024, y + random() * 20 - 10
    );
    ctx.strokeStyle = `${p.light}${i % 2 ? "22" : "11"}`;
    ctx.lineWidth = random() * 8 + 1;
    ctx.stroke();
  }

  // Small texture grains
  for (let i = 0; i < 22000; i++) {
    ctx.fillStyle = random() > .5
      ? "rgba(255,255,255,.035)"
      : "rgba(0,0,0,.05)";
    ctx.fillRect(random() * 1024, random() * 512, 1.3, 1.3);
  }

  return new THREE.CanvasTexture(canvas);
}

// ---------- CLOUD TEXTURE ----------
function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = Math.random() * 30 + 5;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(255,255,255,${Math.random() * .12})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// ---------- INIT 3D ----------
function initPlanet() {
  if (!planetStage) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    38,
    planetStage.clientWidth / planetStage.clientHeight,
    .1,
    100
  );
  camera.position.z = 4.2;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(planetStage.clientWidth, planetStage.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  planetStage.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0x605080, 1.2);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);
  mainLight.position.set(-3, 2, 4);
  scene.add(mainLight);

  const rimLight = new THREE.PointLight(0x9160ff, 12, 12);
  rimLight.position.set(2, -2, -3);
  scene.add(rimLight);

  // Planet
  const geometry = new THREE.SphereGeometry(1, 96, 96);
  const texture = createPlanetTexture("violet", 1);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: .88,
    metalness: .03
  });

  planet = new THREE.Mesh(geometry, material);
  planet.rotation.z = -.25;
  scene.add(planet);

  // Clouds
  const cloudGeometry = new THREE.SphereGeometry(1.012, 96, 96);
  const cloudTexture = createCloudTexture();

  const cloudMaterial = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: .23,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  planet.add(clouds);

  // Atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(1.13, 64, 64);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x8051e8,
    transparent: true,
    opacity: .075,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  // Hide loading text
  const loading = planetStage.querySelector(".planet-loading");
  if (loading) loading.remove();

  // Drag rotation
  planetStage.addEventListener("pointerdown", onPointerDown);
  planetStage.addEventListener("pointermove", onPointerMove);
  planetStage.addEventListener("pointerup", onPointerUp);
  planetStage.addEventListener("pointercancel", onPointerUp);
  planetStage.addEventListener("lostpointercapture", onPointerUp);

  animatePlanet();
}

function onPointerDown(event) {
  dragging = true;
  pointerMoved = false;

  lastPointer.x = event.clientX;
  lastPointer.y = event.clientY;

  velocity.x = 0;
  velocity.y = 0;

  planetStage.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!dragging || !planet) return;

  const dx = event.clientX - lastPointer.x;
  const dy = event.clientY - lastPointer.y;

  if (Math.abs(dx) + Math.abs(dy) > 2) {
    pointerMoved = true;
  }

  planet.rotation.y += dx * .008;
  planet.rotation.x += dy * .008;

  planet.rotation.x = Math.max(-1.3, Math.min(1.3, planet.rotation.x));

  velocity.x = dx * .0015;
  velocity.y = dy * .0015;

  lastPointer.x = event.clientX;
  lastPointer.y = event.clientY;
}

function onPointerUp() {
  dragging = false;
}

function animatePlanet() {
  requestAnimationFrame(animatePlanet);

  const delta = Math.min(clock.getDelta(), .04);

  if (planet && !dragging) {
    planet.rotation.y += .12 * delta + velocity.x;
    planet.rotation.x += velocity.y;

    velocity.x *= .95;
    velocity.y *= .95;
  }

  if (clouds) {
    clouds.rotation.y += .0004;
    clouds.rotation.x += .0001;
  }

  if (atmosphere && planet) {
    atmosphere.rotation.copy(planet.rotation);
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ---------- RESIZE ----------
function resizePlanet() {
  if (!renderer || !camera || !planetStage) return;

  const width = planetStage.clientWidth;
  const height = planetStage.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", resizePlanet);

// ---------- STARS ----------
let stars = [];
let starWidth = 0;
let starHeight = 0;

function resizeStarfield() {
  starWidth = starCanvas.width = window.innerWidth;
  starHeight = starCanvas.height = window.innerHeight;

  const count = Math.min(200, Math.floor(starWidth * starHeight / 5500));

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * starWidth,
    y: Math.random() * starHeight,
    size: Math.random() * 1.3 + .2,
    speed: Math.random() * .3 + .05,
    alpha: Math.random() * .6 + .2,
    phase: Math.random() * 10
  }));
}

function drawStarfield() {
  starCtx.clearRect(0, 0, starWidth, starHeight);

  stars.forEach(star => {
    star.y -= star.speed;

    if (star.y < -2) {
      star.y = starHeight + 2;
      star.x = Math.random() * starWidth;
    }

    const twinkle = Math.sin(performance.now() * .001 + star.phase);

    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(210,205,255,${Math.max(.08, star.alpha + twinkle * .2)})`;
    starCtx.fill();
  });

  requestAnimationFrame(drawStarfield);
}

resizeStarfield();
drawStarfield();

// ---------- GLOW FOLLOW ----------
window.addEventListener("mousemove", event => {
  if (!ambientGlow) return;
  ambientGlow.style.left = event.clientX + "px";
  ambientGlow.style.top = event.clientY + "px";
});

window.addEventListener("touchmove", event => {
  const touch = event.touches[0];
  if (!touch || !ambientGlow) return;

  ambientGlow.style.left = touch.clientX + "px";
  ambientGlow.style.top = touch.clientY + "px";
}, { passive: true });

// ---------- SCROLL REVEAL ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// ---------- LOAD PLANETS ----------
async function loadPlanets() {
  const grid = document.getElementById("planetGrid");

  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("Planet data unavailable");

    const worlds = await response.json();

    worlds.forEach((world, index) => {
      const card = document.createElement("article");
      card.className = "planet-card reveal";

      card.style.setProperty("--card-planet", world.cardGradient);
      card.style.setProperty("--card-glow", world.glow);

      card.innerHTML = `
        <span class="planet-card-number">WORLD / ${String(index + 1).padStart(2, "0")}</span>
        <div class="planet-card-sphere"></div>
        <h3>${world.name}</h3>
        <p>${world.description}</p>
        <span class="card-discover">DISCOVER WORLD ↗</span>
      `;

      card.addEventListener("click", () => showPlanet(world, index));
      grid.appendChild(card);
      revealObserver.observe(card);
    });

  } catch (error) {
    console.error(error);
    grid.innerHTML = "<p>Planet data could not be loaded. Please refresh.</p>";
  }
}

// ---------- PLANET MODAL ----------
const modal = document.getElementById("planetModal");

function showPlanet(world, index) {
  modal.style.setProperty("--modal-planet", world.cardGradient);
  modal.style.setProperty("--modal-glow", world.glow);

  document.getElementById("modalNumber").textContent =
    `WORLD / ${String(index + 1).padStart(2, "0")}`;

  document.getElementById("modalTitle").textContent = world.name;
  document.getElementById("modalDescription").textContent = world.detail;
  document.getElementById("modalClass").textContent = world.class;
  document.getElementById("modalElement").textContent = world.element;

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalDone").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

// ---------- LAUNCH BUTTON ----------
document.getElementById("launchButton").addEventListener("click", () => {
  showPlanet({
    name: "Your Journey Begins",
    detail:
      "The universe is full of unanswered questions. Your journey begins with curiosity, imagination, and the courage to discover something new. Explore beyond what you know.",
    class: "Explorer",
    element: "Curiosity",
    cardGradient: "radial-gradient(circle at 30% 25%, #d6c7ff, #8757e8 40%, #26134c 75%)",
    glow: "rgba(134,83,255,.35)"
  }, 0);
});

// ---------- PORTAL INTERACTION ----------
const portal = document.getElementById("portalVisual");

portal.addEventListener("pointermove", event => {
  const rect = portal.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;

  portal.style.transform = `rotateX(${y * -12}deg) rotateY(${x * 12}deg)`;
});

portal.addEventListener("pointerleave", () => {
  portal.style.transform = "";
});

// ---------- INITIALIZE ----------
initPlanet();
loadPlanets();
