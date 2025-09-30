// Q-Learning Agent with localStorage support
class QLearning {
  constructor(lr = 0.1, gamma = 0.9, epsilon = 0.1) {
    this.q = new Map();
    this.lr = lr;
    this.gamma = gamma;
    this.epsilon = epsilon;
    this.difficulty = 'intermediate';
  }

  getQ(state) {
    if (!this.q.has(state)) this.q.set(state, Array(9).fill(0));
    return this.q.get(state);
  }

  getAction(state, available) {
    // Difficulty-based behavior
    if (this.difficulty === 'beginner') {
      // 70% random moves for beginner
      if (Math.random() < 0.7) {
        return available[~~(Math.random() * available.length)];
      }
    } else if (this.difficulty === 'expert') {
      // Use minimax for perfect play
      return this.getMinimaxAction(state, available);
    }

    // Intermediate: epsilon-greedy
    if (Math.random() < this.epsilon) {
      return available[~~(Math.random() * available.length)];
    }
    const q = this.getQ(state);
    return available.reduce((best, a) => q[a] > q[best] ? a : best, available[0]);
  }

  getMinimaxAction(state, available) {
    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const move of available) {
      const newState = state.substring(0, move) + 'O' + state.substring(move + 1);
      const score = this.minimax(newState, 0, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  minimax(state, depth, isMaximizing) {
    const winner = this.checkWinnerStatic(state);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    const available = [...state].map((c, i) => c === '-' ? i : null).filter(x => x !== null);
    
    if (isMaximizing) {
      let best = -Infinity;
      for (const move of available) {
        const newState = state.substring(0, move) + 'O' + state.substring(move + 1);
        best = Math.max(best, this.minimax(newState, depth + 1, false));
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of available) {
        const newState = state.substring(0, move) + 'X' + state.substring(move + 1);
        best = Math.min(best, this.minimax(newState, depth + 1, true));
      }
      return best;
    }
  }

  checkWinnerStatic(state) {
    const patterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const p of patterns) {
      if (state[p[0]] !== '-' && state[p[0]] === state[p[1]] && state[p[1]] === state[p[2]]) {
        return state[p[0]];
      }
    }
    return state.includes('-') ? null : 'draw';
  }

  update(s, a, r, s2, available2) {
    const q = this.getQ(s);
    const maxQ2 = available2.length ? Math.max(...available2.map(a => this.getQ(s2)[a])) : 0;
    q[a] += this.lr * (r + this.gamma * maxQ2 - q[a]);
  }

  decay() {
    this.epsilon = Math.max(0.01, this.epsilon * 0.995);
  }

  reset() {
    this.q.clear();
    this.epsilon = 0.1;
  }

  // localStorage methods
  save() {
    const data = {
      q: Array.from(this.q.entries()),
      lr: this.lr,
      gamma: this.gamma,
      epsilon: this.epsilon,
      difficulty: this.difficulty
    };
    localStorage.setItem('tictactoe_ai', JSON.stringify(data));
  }

  load() {
    const saved = localStorage.getItem('tictactoe_ai');
    if (!saved) return false;
    
    try {
      const data = JSON.parse(saved);
      this.q = new Map(data.q);
      this.lr = data.lr;
      this.gamma = data.gamma;
      this.epsilon = data.epsilon;
      this.difficulty = data.difficulty || 'intermediate';
      return true;
    } catch (e) {
      console.error('Failed to load AI state:', e);
      return false;
    }
  }

  clearStorage() {
    localStorage.removeItem('tictactoe_ai');
  }
}

// Tic-Tac-Toe Game with difficulty levels and persistence
class TicTacToe {
  constructor() {
    this.board = '---------';
    this.ai = new QLearning();
    this.stats = { played: 0, aiWins: 0, playerWins: 0, draws: 0 };
    this.training = false;
    this.gameOver = false;

    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = 133.33;

    this.canvas.onclick = e => this.handleClick(e);
    this.initControls();
    this.loadState();
    this.draw();
  }

  initControls() {
    ['learningRate', 'discountFactor', 'explorationRate'].forEach(id => {
      const el = document.getElementById(id);
      el.oninput = e => {
        const val = parseFloat(e.target.value);
        document.getElementById(id + 'Value').textContent = val.toFixed(2);
        if (id === 'learningRate') this.ai.lr = val;
        if (id === 'discountFactor') this.ai.gamma = val;
        if (id === 'explorationRate') this.ai.epsilon = val;
        this.saveState();
      };
    });
  }

  setDifficulty(level) {
    this.ai.difficulty = level;
    
    // Update button styles
    ['beginner', 'intermediate', 'expert'].forEach(diff => {
      const btn = document.getElementById(`diff${diff.charAt(0).toUpperCase() + diff.slice(1)}`);
      if (diff === level) {
        btn.className = 'py-2 px-4 rounded-lg font-semibold text-sm transition-all bg-purple-600 text-white border-2 border-purple-600';
      } else {
        btn.className = 'py-2 px-4 rounded-lg font-semibold text-sm transition-all bg-white text-gray-700 hover:bg-gray-100';
      }
    });

    // Adjust AI parameters based on difficulty
    if (level === 'beginner') {
      this.setStatus('🌱 Beginner mode: AI makes more mistakes');
    } else if (level === 'intermediate') {
      this.setStatus('🎯 Medium mode: Balanced AI using Q-learning');
    } else {
      this.setStatus('🔥 Expert mode: Perfect AI using minimax algorithm');
    }

    this.saveState();
  }

  draw() {
    const { ctx, canvas, cellSize } = this;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 4;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    for (let i = 0; i < 9; i++) {
      const symbol = this.board[i];
      if (symbol === '-') continue;
      
      const x = (i % 3) * cellSize + cellSize / 2;
      const y = ~~(i / 3) * cellSize + cellSize / 2;
      
      ctx.strokeStyle = symbol === 'X' ? '#ef4444' : '#10b981';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';

      if (symbol === 'X') {
        const s = cellSize * 0.3;
        ctx.beginPath();
        ctx.moveTo(x - s, y - s);
        ctx.lineTo(x + s, y + s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + s, y - s);
        ctx.lineTo(x - s, y + s);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, cellSize * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const winner = this.checkWinner();
    if (winner?.line) this.drawWinLine(winner.line);
  }

  drawWinLine(line) {
    const [a, , c] = line;
    const startX = (a % 3) * this.cellSize + this.cellSize / 2;
    const startY = ~~(a / 3) * this.cellSize + this.cellSize / 2;
    const endX = (c % 3) * this.cellSize + this.cellSize / 2;
    const endY = ~~(c / 3) * this.cellSize + this.cellSize / 2;

    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  handleClick(e) {
    if (this.gameOver || this.training) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const col = ~~((e.clientX - rect.left) / this.cellSize);
    const row = ~~((e.clientY - rect.top) / this.cellSize);
    const idx = row * 3 + col;

    if (this.board[idx] === '-') {
      this.move(idx, 'X');
      if (!this.gameOver) setTimeout(() => this.aiMove(), 300);
    }
  }

  move(idx, player) {
    if (this.board[idx] !== '-' || this.gameOver) return false;
    this.board = this.board.substring(0, idx) + player + this.board.substring(idx + 1);
    this.draw();
    this.checkGameOver();
    return true;
  }

  aiMove() {
    if (this.gameOver) return;
    
    const state = this.board;
    const available = this.getAvailable();
    const action = this.ai.getAction(state, available);
    
    this.move(action, 'O');
    
    const winner = this.checkWinner();
    const reward = winner?.winner === 'O' ? 1 : winner?.winner === 'X' ? -1 : 0;
    this.ai.update(state, action, reward, this.board, this.getAvailable());
  }

  getAvailable() {
    return [...this.board].map((c, i) => c === '-' ? i : null).filter(x => x !== null);
  }

  checkWinner() {
    const patterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const p of patterns) {
      if (this.board[p[0]] !== '-' && 
          this.board[p[0]] === this.board[p[1]] && 
          this.board[p[1]] === this.board[p[2]]) {
        return { winner: this.board[p[0]], line: p };
      }
    }
    return this.board.includes('-') ? null : { winner: 'draw', line: null };
  }

  checkGameOver() {
    const result = this.checkWinner();
    if (!result) return;

    this.gameOver = true;
    this.stats.played++;

    if (result.winner === 'X') {
      this.stats.playerWins++;
      if (!this.training) this.setStatus('🎉 You win!');
    } else if (result.winner === 'O') {
      this.stats.aiWins++;
      if (!this.training) this.setStatus('🤖 AI wins!');
    } else {
      this.stats.draws++;
      if (!this.training) this.setStatus('🤝 Draw!');
    }

    if (!this.training) {
      this.updateStats();
      this.saveState();
    }
  }

  setStatus(msg) {
    document.getElementById('gameStatus').textContent = msg;
  }

  updateStats() {
    document.getElementById('gamesPlayed').textContent = this.stats.played;
    document.getElementById('aiWins').textContent = this.stats.aiWins;
    document.getElementById('playerWins').textContent = this.stats.playerWins;
    document.getElementById('draws').textContent = this.stats.draws;
    document.getElementById('statesLearned').textContent = this.ai.q.size;
    
    const winRate = this.stats.played ? (this.stats.aiWins / this.stats.played * 100).toFixed(1) : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
  }

  reset() {
    this.board = '---------';
    this.gameOver = false;
    this.draw();
    this.setStatus('Your turn! (X)');
  }

  resetAI() {
    if (confirm('Reset AI memory? All progress will be lost.')) {
      this.ai.reset();
      this.ai.clearStorage();
      this.stats = { played: 0, aiWins: 0, playerWins: 0, draws: 0 };
      this.updateStats();
      this.reset();
      this.setStatus('AI memory reset!');
      localStorage.removeItem('tictactoe_stats');
    }
  }

  async startTraining() {
    this.training = true;
    document.getElementById('trainingIndicator').classList.remove('hidden');
    
    const originalEpsilon = this.ai.epsilon;
    this.ai.epsilon = 0.3;

    for (let i = 0; i < 1000; i++) {
      await this.trainGame();
      this.ai.decay();
      if (i % 50 === 0) {
        document.getElementById('trainingProgress').textContent = `${i + 1}/1000`;
        await new Promise(r => setTimeout(r, 0));
      }
    }

    this.ai.epsilon = originalEpsilon;
    this.training = false;
    document.getElementById('trainingIndicator').classList.add('hidden');
    this.updateStats();
    this.reset();
    this.setStatus('Training complete!');
    this.saveState();
  }

  async trainGame() {
    this.board = '---------';
    this.gameOver = false;
    const moves = [];

    while (!this.gameOver && moves.length < 9) {
      const state = this.board;
      const available = this.getAvailable();
      const action = this.ai.getAction(state, available);
      const player = moves.length % 2 === 0 ? 'X' : 'O';
      
      moves.push({ state, action, player });
      this.move(action, player);
    }

    const winner = this.checkWinner();
    moves.forEach(m => {
      const reward = winner?.winner === m.player ? 1 : winner?.winner && winner.winner !== m.player ? -1 : 0;
      this.ai.update(m.state, m.action, reward, this.board, []);
    });
  }

  // Save state to localStorage
  saveState() {
    this.ai.save();
    localStorage.setItem('tictactoe_stats', JSON.stringify(this.stats));
  }

  // Load state from localStorage
  loadState() {
    const loaded = this.ai.load();
    if (loaded) {
      const savedStats = localStorage.getItem('tictactoe_stats');
      if (savedStats) {
        this.stats = JSON.parse(savedStats);
      }
      this.updateStats();
      this.setDifficulty(this.ai.difficulty);
      
      // Update sliders
      document.getElementById('learningRate').value = this.ai.lr;
      document.getElementById('learningRateValue').textContent = this.ai.lr.toFixed(2);
      document.getElementById('discountFactor').value = this.ai.gamma;
      document.getElementById('discountFactorValue').textContent = this.ai.gamma.toFixed(2);
      document.getElementById('explorationRate').value = this.ai.epsilon;
      document.getElementById('explorationRateValue').textContent = this.ai.epsilon.toFixed(2);
      
      console.log('✓ Loaded AI state from localStorage');
    }
  }
}

// Initialize game
let game;
window.addEventListener('DOMContentLoaded', () => {
  game = new TicTacToe();
});