# 🎮 Adaptive Tic-Tac-Toe AI with Reinforcement Learning

This project is a web-based Tic-Tac-Toe game featuring an AI opponent that learns and improves its strategy through Q-learning, a foundational reinforcement learning algorithm.  
The entire application is built with vanilla JavaScript, HTML, and Tailwind CSS.

---

## ➡️ [View Live Demo Here](https://mayur9210.github.io/tic-tac-toe-ai/)

---

## ✨ Features

- **Reinforcement Learning Core**  
  The AI uses a Q-table to learn the value of each move in every possible board state.

- **Adaptive Difficulty Levels**
  - 🌱 **Beginner:** The AI makes random moves 70% of the time, perfect for new players.
  - 🎯 **Intermediate:** The AI uses its learned Q-learning strategy, providing a challenging opponent.
  - 🔥 **Expert:** The AI switches to a perfect-play Minimax algorithm, making it unbeatable.

- **Interactive Training**  
  A "Train AI" button allows the AI to play 1,000 games against itself in seconds, rapidly improving its strategy.

- **Real-time Parameter Tuning**  
  Interactively adjust key reinforcement learning hyperparameters (Learning Rate, Discount Factor, Exploration Rate) and see their immediate effect on the AI's behavior.

- **State Persistence**  
  The AI's learned knowledge (its Q-table) and game statistics are automatically saved to your browser's localStorage, so it remembers its training across sessions.

- **Live Statistics**  
  A dynamic dashboard tracks games played, wins, losses, draws, and the total number of board states the AI has learned.

- **Zero Dependencies**  
  Built with pure vanilla JavaScript, HTML, and Tailwind CSS for a lightweight and fast experience.

---

## 🤖 How It Works

The intelligence of the game is powered by two classic AI techniques: **Q-learning** and **Minimax**.

### Q-Learning (Intermediate Difficulty)

Q-learning is a model-free reinforcement learning algorithm that learns a policy, telling an agent what action to take under what circumstances.

- **State (s):** A string representing the 9 cells of the board (e.g., `"XO-X-----"`).
- **Action (a):** Placing a piece in an empty cell (an index from 0-8).
- **Reward (r):** Feedback given to the AI after a game ends.
  - `+1` for a win
  - `-1` for a loss
  - `0` for a draw

- **Q-Table:**  
  A simple lookup table (implemented as a JavaScript Map) that stores the "quality" or expected future reward for taking any action `a` in a given state `s`.

- **Update Rule:**  
  After each move, the AI updates its Q-table using the Bellman equation, which refines its estimate based on the reward it received and the maximum potential reward from the next state.

- **Exploration vs. Exploitation:**  
  The AI uses an epsilon-greedy strategy to balance trying new moves (exploration) with using moves it knows are good (exploitation).

### Minimax Algorithm (Expert Difficulty)

For the expert level, the AI switches to the Minimax algorithm. This is a recursive, deterministic algorithm that explores the entire game tree from the current state to find the optimal move. It assumes both players play perfectly.

---

## 🚀 Getting Started

You can run this project locally with no special tools required—just a modern web browser.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mayur9210/tic-tac-toe-ai.git
   ```

2. **Navigate to the directory:**
   ```bash
   cd tic-tac-toe-ai
   ```

3. **Open the HTML file:**  
   Simply open the `index.html` file in your favorite web browser (like Chrome, Firefox, or Edge).

That's it! The game is now running locally on your machine.

---

## 🛠️ Technologies Used

- **HTML5:** Structure and layout of the application.
- **Tailwind CSS:** Modern, responsive styling directly in the markup.
- **JavaScript (ES6+):** All game logic, AI implementation, and interactivity.
- **HTML5 Canvas:** Rendering the game board and pieces.

---

## 📁 File Structure

The project is intentionally simple and contained in two main files:

```
tic-tac-toe-ai/
├── 📄 index.html      # The main HTML file containing the UI structure.
└── 📜 game.js         # All JavaScript logic for the game, AI, and controls.
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/mayur9210/tic-tac-toe-ai/issues).

---
