document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const homeScreen = document.getElementById("home-screen");
  const gameScreen = document.getElementById("game-screen");
  const countdownScreen = document.getElementById("countdown-screen");
  const resultScreen = document.getElementById("result-screen");

  const singlePlayerBtn = document.getElementById("single-player-btn");
  const multiPlayerBtn = document.getElementById("multi-player-btn");
  const playerSelect = document.getElementById("player-select");
  const playerXBtn = document.getElementById("player-x");
  const playerOBtn = document.getElementById("player-o");
  const startBtn = document.getElementById("start-btn");
  const backBtn = document.getElementById("back-btn");
  const homeBtn = document.getElementById("home-btn");
  const shareBtn = document.getElementById("share-btn");
  const screenshotBtn = document.getElementById("screenshot-btn");

  const board = document.getElementById("board");
  const cells = document.querySelectorAll(".cell");
  const status = document.getElementById("status");
  const gameSubtitle = document.getElementById("game-subtitle");
  const countdownElement = document.getElementById("countdown");

  const winnerText = document.getElementById("winner-text");
  const drawText = document.getElementById("draw-text");
  const playerXScore = document.getElementById("player-x-score");
  const playerOScore = document.getElementById("player-o-score");
  const stars = document.querySelectorAll(".star");

  const shapesContainer = document.getElementById("shapes-container");

  // Game variables
  let currentPlayer = "X";
  let gameActive = true;
  let gameState = ["", "", "", "", "", "", "", "", ""];
  let humanPlayer = "X";
  let isSinglePlayer = true;
  let scores = { X: 0, O: 0 };
  let currentRating = 0;

  // Create floating shapes
  function createShapes() {
    const shapes = ["circle", "triangle", "square"];
    const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d"];

    for (let i = 0; i < 15; i++) {
      const shape = document.createElement("div");
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.random() * 50 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];

      shape.classList.add("shape", shapeType);
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      shape.style.left = `${Math.random() * 100}vw`;
      shape.style.bottom = `-${size}px`;
      shape.style.animationDuration = `${Math.random() * 10 + 10}s`;
      shape.style.animationDelay = `${Math.random() * 5}s`;

      if (shapeType === "circle") {
        shape.style.background = `radial-gradient(circle, ${color}, transparent)`;
      } else if (shapeType === "triangle") {
        shape.style.borderBottom = `50px solid ${color}`;
      } else {
        shape.style.backgroundColor = color;
      }

      shapesContainer.appendChild(shape);
    }
  }

  // Winning conditions
  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // Switch screens
  function showScreen(screen) {
    homeScreen.style.display = "none";
    gameScreen.style.display = "none";
    countdownScreen.style.display = "none";
    resultScreen.style.display = "none";

    switch (screen) {
      case "home":
        homeScreen.style.display = "flex";
        break;
      case "game":
        gameScreen.style.display = "flex";
        break;
      case "countdown":
        countdownScreen.style.display = "flex";
        break;
      case "result":
        resultScreen.style.display = "flex";
        break;
    }
  }

  // Start game with countdown
  function startGameWithCountdown() {
    showScreen("countdown");
    let count = 3;
    countdownElement.textContent = count;

    const countdownInterval = setInterval(() => {
      count--;
      countdownElement.textContent = count;

      if (count <= 0) {
        clearInterval(countdownInterval);
        startGame();
      }
    }, 1000);
  }

  // Start game
  function startGame() {
    showScreen("game");
    resetGame();
  }

  // Handle cell click
  function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

    // If cell already filled or game not active, ignore
    if (gameState[clickedCellIndex] !== "" || !gameActive) return;

    // In single player mode, only allow human player to click
    if (isSinglePlayer && currentPlayer !== humanPlayer) return;

    // Proceed with game
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    // AI move if game is still active and it's single player mode
    if (gameActive && isSinglePlayer && currentPlayer !== humanPlayer) {
      setTimeout(makeAIMove, 800);
    }
  }

  // Enhanced AI move
  function makeAIMove() {
    if (!gameActive || !isSinglePlayer || currentPlayer === humanPlayer) return;

    // Check for winning move
    let move = findWinningMove(currentPlayer);
    if (move !== -1) {
      makeMove(move);
      return;
    }

    // Check if opponent can win next move and block them
    move = findWinningMove(humanPlayer);
    if (move !== -1) {
      makeMove(move);
      return;
    }

    // Take center if available
    if (gameState[4] === "") {
      makeMove(4);
      return;
    }

    // Take a corner if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((index) => gameState[index] === "");
    if (availableCorners.length > 0) {
      const randomCorner =
        availableCorners[Math.floor(Math.random() * availableCorners.length)];
      makeMove(randomCorner);
      return;
    }

    // Take any available edge
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter((index) => gameState[index] === "");
    if (availableEdges.length > 0) {
      const randomEdge =
        availableEdges[Math.floor(Math.random() * availableEdges.length)];
      makeMove(randomEdge);
      return;
    }
  }

  // Helper function to find a winning move for a player
  function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      const values = [gameState[a], gameState[b], gameState[c]];

      // Count how many spots are taken by the player and how many are empty
      const playerCount = values.filter((val) => val === player).length;
      const emptyCount = values.filter((val) => val === "").length;

      if (playerCount === 2 && emptyCount === 1) {
        // This is a winning move - return the empty spot
        if (gameState[a] === "") return a;
        if (gameState[b] === "") return b;
        if (gameState[c] === "") return c;
      }
    }
    return -1; // No winning move found
  }

  // Helper function to make a move
  function makeMove(index) {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    handleCellPlayed(cell, index);
    handleResultValidation();
  }

  // Handle cell played
  function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    clickedCell.textContent = currentPlayer;

    // Add animation
    clickedCell.style.transform = "scale(0)";
    setTimeout(() => {
      clickedCell.style.transform = "scale(1)";
    }, 100);
  }

  // Validate result
  function handleResultValidation() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];

      if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "")
        continue;

      if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
        roundWon = true;
        break;
      }
    }

    if (roundWon) {
      if (status) status.textContent = `Player ${currentPlayer} wins!`;
      if (gameSubtitle)
        gameSubtitle.textContent = `Player ${currentPlayer} wins!`;
      gameActive = false;

      // Update scores
      scores[currentPlayer]++;
      showResultScreen(currentPlayer);
      return;
    }

    // Check for draw
    if (!gameState.includes("")) {
      if (status) status.textContent = "Game ended in a draw!";
      if (gameSubtitle) gameSubtitle.textContent = "Game ended in a draw!";
      gameActive = false;
      showResultScreen(null);
      return;
    }

    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (status) status.textContent = `Player ${currentPlayer}'s turn`;
    if (gameSubtitle)
      gameSubtitle.textContent = `Player ${currentPlayer}'s turn`;
  }

  // Reset game
  function resetGame() {
    currentPlayer = "X";
    gameActive = true;
    gameState = ["", "", "", "", "", "", "", "", ""];

    if (isSinglePlayer) {
      if (status)
        status.textContent =
          humanPlayer === "X" ? "Your turn! Place your X" : "AI is thinking...";
      if (gameSubtitle)
        gameSubtitle.textContent =
          humanPlayer === "X" ? "Your turn! Place your X" : "AI is thinking...";

      // If human is O, AI makes first move
      if (humanPlayer === "O") {
        setTimeout(makeAIMove, 800);
      }
    } else {
      if (status) status.textContent = "Player X's turn";
      if (gameSubtitle) gameSubtitle.textContent = "Player X's turn";
    }

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("x", "o");
      cell.style.transform = "";
    });
  }

  // Show result screen
  function showResultScreen(winner) {
    // Update scores
    if (playerXScore) playerXScore.textContent = scores.X;
    if (playerOScore) playerOScore.textContent = scores.O;

    if (winner) {
      if (winnerText) {
        winnerText.textContent = `Player ${winner} Wins!`;
        winnerText.style.display = "block";
      }
      if (drawText) drawText.style.display = "none";
    } else {
      if (winnerText) winnerText.style.display = "none";
      if (drawText) drawText.style.display = "block";
    }

    // Reset rating
    currentRating = 0;
    stars.forEach((star) => {
      star.classList.remove("active");
    });

    showScreen("result");
    createConfetti();
  }

  // Create confetti effect
  function createConfetti() {
    const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#ffffff"];
    const container = document.querySelector(".result-content");

    if (!container) return;

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 100}%`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;

      container.appendChild(confetti);

      // Animate
      setTimeout(() => {
        confetti.style.opacity = "1";
        confetti.style.transform = `translate(${Math.random() * 200 - 100}px, ${
          Math.random() * 200 + 100
        }px) rotate(${Math.random() * 360}deg)`;
        confetti.style.transition = `all ${Math.random() * 2 + 1}s ease-out`;

        // Remove after animation
        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }, 0);
    }
  }

  // Change player
  function changePlayer(player) {
    humanPlayer = player;
    if (playerXBtn) playerXBtn.classList.toggle("active", player === "X");
    if (playerOBtn) playerOBtn.classList.toggle("active", player === "O");
  }

  // Change game mode
  function changeGameMode(mode) {
    isSinglePlayer = mode === "single";
    if (singlePlayerBtn)
      singlePlayerBtn.classList.toggle("active", isSinglePlayer);
    if (multiPlayerBtn)
      multiPlayerBtn.classList.toggle("active", !isSinglePlayer);

    // Show player selection only in single player mode
    if (playerSelect)
      playerSelect.style.display = isSinglePlayer ? "flex" : "none";
  }

  // Set rating
  function setRating(rating) {
    currentRating = rating;
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
  }

  // Share game
  function shareGame() {
    if (navigator.share) {
      navigator
        .share({
          title: "Super Tic Tac Toe",
          text: `I just played Super Tic Tac Toe! Current score: X - ${scores.X}, O - ${scores.O}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.log("Error sharing:", err);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  }

  // Copy to clipboard
  function copyToClipboard() {
    const text = `I just played Super Tic Tac Toe! Current score: X - ${scores.X}, O - ${scores.O}\nPlay it here: ${window.location.href}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Game results copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  }

  // Take screenshot
  function takeScreenshot() {
    alert(
      "Screenshot functionality would be implemented here. In a real app, you would use a library like html2canvas to capture the game board."
    );
  }

  // Event listeners
  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  if (startBtn) startBtn.addEventListener("click", startGameWithCountdown);
  if (backBtn) backBtn.addEventListener("click", () => showScreen("home"));
  if (homeBtn)
    homeBtn.addEventListener("click", () => {
      showScreen("home");
      scores = { X: 0, O: 0 }; // Reset scores when going home
    });
  if (shareBtn) shareBtn.addEventListener("click", shareGame);
  if (screenshotBtn) screenshotBtn.addEventListener("click", takeScreenshot);

  if (playerXBtn) playerXBtn.addEventListener("click", () => changePlayer("X"));
  if (playerOBtn) playerOBtn.addEventListener("click", () => changePlayer("O"));

  if (singlePlayerBtn)
    singlePlayerBtn.addEventListener("click", () => changeGameMode("single"));
  if (multiPlayerBtn)
    multiPlayerBtn.addEventListener("click", () => changeGameMode("multi"));

  stars.forEach((star) => {
    star.addEventListener("click", (e) => {
      const rating = parseInt(e.target.getAttribute("data-rating"));
      setRating(rating);
    });
  });

  // Initialize
  createShapes();
  showScreen("home");
});
