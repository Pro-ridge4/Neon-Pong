const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// Resize canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const paddleWidth = 18,
  paddleHeight = 120,
  paddleSpeed = 8,
  ballRadius = 12,
  initialBallSpeed = 8,
  maxBallSpeed = 40,
  netWidth = 5,
  netColor = "WHITE";

let aiLevel = 0.1; // default (Medium)
let gameRunning = false;

// Draw rectangle
function drawRect(x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

// Draw net
function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    drawRect(canvas.width / 2 - netWidth / 2, i, netWidth, 10, netColor);
  }
}

// Draw text
function drawText(text, x, y, color, fontSize = 60, fontWeight = "bold", font = "Courier New") {
  context.fillStyle = color;
  context.font = `${fontWeight} ${fontSize}px ${font}`;
  context.textAlign = "center";
  context.fillText(text, x, y);
}

// Create paddle
function createPaddle(x, y, width, height, color) {
  return { x, y, width, height, color, score: 0 };
}

// Create ball
function createBall(x, y, radius, velocityX, velocityY, color) {
  return { x, y, radius, velocityX, velocityY, color, speed: initialBallSpeed };
}

let user = createPaddle(0, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, "WHITE");
let com = createPaddle(canvas.width - paddleWidth, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, "WHITE");
let ball = createBall(canvas.width / 2, canvas.height / 2, ballRadius, initialBallSpeed, initialBallSpeed, "WHITE");

// Collision detection
function collision(b, p) {
  return b.x + b.radius > p.x && b.x - b.radius < p.x + p.width && b.y + b.radius > p.y && b.y - b.radius < p.y + p.height;
}

// Reset ball
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
  ball.velocityX = -ball.velocityX;
  ball.speed = initialBallSpeed;
}

// Update logic
function update() {
  if (!gameRunning) return;

  if (ball.x - ball.radius < 0) {
    com.score++;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    resetBall();
  }

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // AI movement
  com.y += (ball.y - (com.y + com.height / 2)) * aiLevel;

  // Wall collision
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.velocityY = -ball.velocityY;
  }

  // Paddle collision
  let player = ball.x + ball.radius < canvas.width / 2 ? user : com;
  if (collision(ball, player)) {
    const collidePoint = ball.y - (player.y + player.height / 2);
    const collisionAngle = (Math.PI / 4) * (collidePoint / (player.height / 2));
    const direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(collisionAngle);
    ball.velocityY = ball.speed * Math.sin(collisionAngle);

    ball.speed += 0.5;
    if (ball.speed > maxBallSpeed) ball.speed = maxBallSpeed;
  }
}

// Render graphics
function render() {
  drawRect(0, 0, canvas.width, canvas.height, "black");

  // background gradient effect
  let gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#141E30");
  gradient.addColorStop(1, "#243B55");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawNet();

  // scores
  drawText(user.score, canvas.width / 4, canvas.height / 5, "WHITE", 100);
  drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5, "WHITE", 100);

  // paddles
  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(com.x, com.y, com.width, com.height, com.color);

  // ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "W") user.y -= paddleSpeed;
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") user.y += paddleSpeed;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  user.y = e.clientY - rect.top - user.height / 2;
});

// Start screen logic
const startScreen = document.getElementById("start-screen");
const buttons = document.querySelectorAll("#start-screen button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const difficulty = btn.getAttribute("data-difficulty");
    if (difficulty === "easy") aiLevel = 0.05;
    if (difficulty === "medium") aiLevel = 0.1;
    if (difficulty === "hard") aiLevel = 0.2;

    startScreen.style.display = "none";
    canvas.style.display = "block";
    gameRunning = true;
    requestAnimationFrame(gameLoop);
  });
});

// Resize listener
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  resetBall();
});
