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
 { jp: "ねこ", romaji: "neko" },
 { jp: "いぬ", romaji: "inu" },
 { jp: "りんご", romaji: "ringo" },
 { jp: "みかん", romaji: "mikan" },
 { jp: "ぶどう", romaji: "budou" }
];

// ===== 状態 =====
let currentWord = null;
let typedIndex = 0;
let score = 0;
let time = 30;
let timerId = null;
let audioCtx = null;

// ========================
// 🔊 サウンド関係
// ========================

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  audioCtx.resume();
}

function playSound(freq1, freq2, duration = 0.1) {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq1, now);
  if (freq2) {
    osc.frequency.linearRampToValueAtTime(freq2, now + duration);
  }

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

// 正解ポップ音
function playCorrect() {
  playSound(600, 900, 0.08);
}

// ミス音
function playMiss() {
  playSound(200, 100, 0.15);
}

// クリア音（キラッ）
function playClear() {
  playSound(800, 1200, 0.2);
}

// ========================
// 🎮 ゲーム開始
// ========================

startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);

function startGame() {

  initAudio();

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

// ========================
// ⏳ タイマー
// ========================

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

  finalScoreElem.textContent = score;

  let rank = "C";
  if (score >= 5) rank = "B";
  if (score >= 10) rank = "A";
  if (score >= 15) rank = "S";

  rankElem.textContent = "ランク: " + rank;
}

// ========================
// 📝 単語処理
// ========================

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

// ========================
// ⌨️ キー入力
// ========================

document.addEventListener("keydown", (e) => {

  if (!currentWord) return;

  const key = e.key.toLowerCase();
  const romaji = currentWord.romaji;

  if (typedIndex >= romaji.length) return;

  if (key === romaji[typedIndex]) {

    typedIndex++;
    playCorrect();
    updateRomajiView();

    if (typedIndex === romaji.length) {

      // ✨ クリア演出
      romaElem.classList.add("flash");
      playClear();

      score++;
      scoreElem.textContent = score;

      setTimeout(() => {
        romaElem.classList.remove("flash");
        setNewWord();
      }, 200);
    }

  } else {

    // ❌ ミス演出
    romaElem.classList.add("miss");
    playMiss();

    setTimeout(() => {
      romaElem.classList.remove("miss");
    }, 150);
  }
});
