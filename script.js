// ===== 要素取得 =====
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const jpElem = document.getElementById("jp");
const romaElem = document.getElementById("romaji");
const scoreElem = document.getElementById("score");
const timeElem = document.getElementById("time");
const finalScoreElem = document.getElementById("final-score");
const rankElem = document.getElementById("rank");

// ===== 単語 =====
const words = [
  { jp: "リンゴ", romaji: "ringo" },
  { jp: "ねこ", romaji: "neko" },
  { jp: "いぬ", romaji: "inu" },
  { jp: "みかん", romaji: "mikan" },
  { jp: "ぶどう", romaji: "budou" },
  { jp: "バナナ", romaji: "banana" },
  { jp: "ショコラ", romaji: "syokora" },
  { jp: "ラーメン", romaji: "ra-men" },
  { jp: "おすし", romaji: "osusi" }
];

// ===== 状態 =====
let currentWord = null;
let typedIndex = 0;
let score = 0;
let time = 30;
let timerId = null;

// ===== Audio =====
let audioCtx = null;

function playTypeSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.value = 600;

  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

function playClearSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

// ===== ゲーム開始 =====
startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);

function startGame() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  audioCtx.resume();

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  score = 0;
  time = 30;
  typedIndex = 0;
  scoreElem.textContent = score;
  timeElem.textContent = time;

  setNewWord();
  startTimer();
}

// ===== タイマー =====
function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    time--;
    timeElem.textContent = time;
    if (time <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timerId);
  currentWord = null;

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  finalScoreElem.textContent = score;
  resultScreen.classList.add("fade-in");

  let rank = "C";
  if (score >= 10) rank = "B";
  if (score >= 20) rank = "A";
  if (score >= 30) rank = "S";

  rankElem.textContent = "ランク: " + rank;
}

// ===== 単語 =====
function setNewWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  typedIndex = 0;
  jpElem.textContent = currentWord.jp;
  updateRomajiView();
}

function updateRomajiView() {
  const romaji = currentWord.romaji;
  const typed = romaji.slice(0, typedIndex);
  const rest = romaji.slice(typedIndex);

  romaElem.innerHTML =
    `<span class="typed">${typed}</span>` +
    `<span>${rest}</span>`;
}

// ===== キー入力 =====
document.addEventListener("keydown", (e) => {
  if (!currentWord) return;

  const key = e.key.toLowerCase();
  const romaji = currentWord.romaji;

  if (typedIndex >= romaji.length) return;

  if (key === romaji[typedIndex]) {
    typedIndex++;
    playTypeSound();
    updateRomajiView();

    if (typedIndex === romaji.length) {
      score++;
      scoreElem.textContent = score;

      scoreElem.classList.add("pop");
      setTimeout(() => scoreElem.classList.remove("pop"), 200);

      romaElem.classList.add("flash");
      setTimeout(() => romaElem.classList.remove("flash"), 300);

      playClearSound();
      setTimeout(setNewWord, 300);
    }
  }
});
