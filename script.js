
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
const glow = document.getElementById("glow");

let stars = [];
let width = 0;
let height = 0;
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  const count = Math.min(220, Math.floor(width * height / 5000));

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + .2,
    speed: Math.random() * .35 + .08,
    alpha: Math.random() * .7 + .2,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);

  stars.forEach(star => {
    star.y -= star.speed;

    if (star.y < 0) {
      star.y = height;
      star.x = Math.random() * width;
    }

    const twinkle = Math.sin(Date.now() * .001 + star.phase);
    const alpha = Math.max(.1, star.alpha + twinkle * .2);

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(205,195,255,${alpha})`;
    ctx.fill();
  });

  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", event => {
  mouseX = event.clientX;
  mouseY = event.clientY;

  glow.style.left = mouseX + "px";
  glow.style.top = mouseY + "px";
});

window.addEventListener("touchmove", event => {
  if (event.touches.length) {
    glow.style.left = event.touches[0].clientX + "px";
    glow.style.top = event.touches[0].clientY + "px";
  }
}, { passive: true });

resizeCanvas();
drawStars();

// Parallax effect
const planet = document.querySelector(".planet");
const planetSmall = document.querySelector(".planet-small");

window.addEventListener("mousemove", event => {
  const x = (event.clientX / window.innerWidth - .5);
  const y = (event.clientY / window.innerHeight - .5);

  if (planet) {
    planet.style.marginLeft = `${x * 18}px`;
    planet.style.marginTop = `${y * 18}px`;
  }

  if (planetSmall) {
    planetSmall.style.marginLeft = `${x * 30}px`;
    planetSmall.style.marginTop = `${y * 20}px`;
  }
});

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Load universe data
async function loadUniverse() {
  const grid = document.getElementById("universeGrid");

  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Failed to load");

    const worlds = await response.json();

    worlds.forEach((world, index) => {
      const card = document.createElement("article");
      card.className = "space-card reveal";
      card.style.setProperty("--orb", world.color);
      card.style.setProperty("--orb-glow", world.glow);

      card.innerHTML = `
        <span class="card-number">WORLD / 0${index + 1}</span>
        <div class="card-orb"></div>
        <h3>${world.name}</h3>
        <p>${world.description}</p>
      `;

      card.addEventListener("click", () => {
        openModal(world.name, world.detail);
      });

      grid.appendChild(card);
      observer.observe(card);
    });
  } catch (error) {
    grid.innerHTML = "<p>Universe data could not be loaded.</p>";
  }
}

loadUniverse();

// Modal
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

function openModal(title, text) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("modalOk").addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

// Launch button
document.getElementById("launchBtn").addEventListener("click", () => {
  openModal(
    "Signal activated.",
    "You are ready to explore. Keep your curiosity alive and never stop discovering."
  );
});
