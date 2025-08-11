const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const gameDiv = document.getElementById("game");
const p1HealthLabel = document.getElementById("p1-health");
const p2HealthLabel = document.getElementById("p2-health");

const GRAVITY = 0.6;
const FRICTION = 0.8;

class Fighter {
  constructor(x, controls) {
    this.x = x;
    this.y = canvas.height - 100;
    this.vx = 0;
    this.vy = 0;
    this.width = 60;
    this.height = 100;
    this.color = "#fff";
    this.health = 100;
    this.strength = Math.floor(Math.random() * 15) + 5;
    this.speed = Math.floor(Math.random() * 5) + 3;
    this.controls = controls;
    this.image = new Image();
    this.ready = false;
  }

  async loadRandomAvatar() {
    const randomId = Math.floor(Math.random() * 826) + 1;
    const res = await fetch(`https://rickandmortyapi.com/api/character/${randomId}`);
    const data = await res.json();
    this.image.src = data.image;
    this.image.onload = () => (this.ready = true);
  }

  update() {
    this.vx *= FRICTION;
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.vy = 0;
    }
  }

  draw() {
    ctx.save();
    if (this.ready) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }
}

let player1, player2;
let keys = {};

function initGame() {
  player1 = new Fighter(100, { left: "a", right: "d", jump: "w", punch: "f" });
  player2 = new Fighter(600, { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp", punch: "l" });
  player1.loadRandomAvatar();
  player2.loadRandomAvatar();
}

window.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function handleControls() {
  if (keys[player1.controls.left]) player1.vx = -player1.speed;
  if (keys[player1.controls.right]) player1.vx = player1.speed;
  if (keys[player1.controls.jump] && player1.y >= canvas.height - player1.height)
    player1.vy = -12;

  if (keys[player2.controls.left]) player2.vx = -player2.speed;
  if (keys[player2.controls.right]) player2.vx = player2.speed;
  if (keys[player2.controls.jump] && player2.y >= canvas.height - player2.height)
    player2.vy = -12;

  if (keys[player1.controls.punch]) punch(player1, player2);
  if (keys[player2.controls.punch]) punch(player2, player1);
}

function punch(attacker, defender) {
  if (
    attacker.x < defender.x + defender.width &&
    attacker.x + attacker.width > defender.x &&
    attacker.y < defender.y + defender.height &&
    attacker.y + attacker.height > defender.y
  ) {
    defender.health -= attacker.strength;
    updateHealthUI();
  }
}

function updateHealthUI() {
  p1HealthLabel.textContent = `P1 Health: ${player1.health}`;
  p2HealthLabel.textContent = `P2 Health: ${player2.health}`;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  handleControls();
  player1.update();
  player2.update();
  player1.draw();
  player2.draw();
  requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameDiv.classList.remove("hidden");
  initGame();
  updateHealthUI();
  gameLoop();
});
