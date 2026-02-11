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
  { jp: "お寿司", romaji: "osusi" }
];

// ===== 状態 =====
let currentWord = null;
let typedIndex = 0;
let score = 0;
let time = 30;
let timerId = null;

// ===== Audio =====
let audioCtx = null;

// 通常入力音
function playPopSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(700, now);
  osc.frequency.linearRampToValueAtTime(900, now + 0.08);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

// ミス音
function playMissSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.linearRampToValueAtTime(150, now + 0.1);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

// クリア音（3音上昇）
function playClearSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const notes = [600, 900, 1400];

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + i * 0.1);

    gain.gain.setValueAtTime(0.25, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.2);
  });
}

// ===== スタート =====
startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);

function startGame() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  audioCtx.resume();

  resultScreen.classList.remove("fade-in");

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

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerId);
  currentWord = null;

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  resultScreen.classList.add("fade-in");

  finalScoreElem.textContent = score;

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
    `<span class="rest">${rest}</span>`;
}

// ===== キー入力 =====
document.addEventListener("keydown", (e) => {
  if (!currentWord) return;

  const key = e.key.toLowerCase();
  const romaji = currentWord.romaji;

  if (typedIndex >= romaji.length) return;

  if (key === romaji[typedIndex]) {
    typedIndex++;
    playPopSound();
    updateRomajiView();

    if (typedIndex === romaji.length) {
      score++;
      scoreElem.textContent = score;

      // スコア跳ね
      scoreElem.classList.add("pop");
      setTimeout(() => {
        scoreElem.classList.remove("pop");
      }, 200);

      // クリア音
      playClearSound();

      // 文字フラッシュ
      romaElem.classList.add("flash");
      setTimeout(() => {
        romaElem.classList.remove("flash");
      }, 300);

      setTimeout(setNewWord, 200);
    }
  } else {
    playMissSound();
  }
});
