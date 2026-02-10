const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, duration, type = "sine", volume = 0.1) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}


// ===== 要素取得 =====
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");

const jpElem = document.getElementById("jp");
const romaElem = document.getElementById("romaji");
const scoreElem = document.getElementById("score");
const timeElem = document.getElementById("time");

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

// ===== スタート =====
startBtn.addEventListener("click", startGame);

function startGame() {
  audioCtx.resume();
  // 画面切り替え
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  // 初期化
  score = 0;
  time = 30;
  scoreElem.textContent = score;
  timeElem.textContent = time;

  setNewWord();
  startTimer();
}

// ===== タイマー =====
function startTimer() {
  timerId = setInterval(() => {
    time--;
    timeElem.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

const resultScreen = document.getElementById("result-screen");
const finalScoreElem = document.getElementById("final-score");
const rankElem = document.getElementById("rank");

function endGame() {
  clearInterval(timerId);
  currentWord = null;

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  finalScoreElem.textContent = score;

  // ランク判定
  let rank = "C";
  if (score >= 10) rank = "B";
  if (score >= 20) rank = "A";
  if (score >= 30) rank = "S";

  rankElem.textContent = "ランク: " + rank;
}


// ===== 新しい単語 =====
function setNewWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  typedIndex = 0;

  jpElem.textContent = currentWord.jp;
  updateRomajiView();
}

// ===== 表示更新 =====
function updateRomajiView() {
  const romaji = currentWord.romaji;
  const typed = romaji.slice(0, typedIndex);
  const rest = romaji.slice(typedIndex);

  romaElem.innerHTML =
    `<span class="typed">${typed}</span>` +
    `<span class="rest">${rest}</span>`;
}

// ===== ミス演出 =====
function showRomaMiss() {
  romaElem.classList.remove("roma-miss");
  void romaElem.offsetWidth;
  romaElem.classList.add("roma-miss");

  setTimeout(() => {
    romaElem.classList.remove("roma-miss");
  }, 150);
}

// ===== キー入力 =====
document.addEventListener("keydown", (e) => {
  if (!currentWord) return;

  const key = e.key.toLowerCase();
  const romaji = currentWord.romaji;

  if (typedIndex >= romaji.length) return;

  if (key === romaji[typedIndex]) {
   playSound(600, 0.05, "square", 0.05);
    typedIndex++;
    updateRomajiView();

    if (typedIndex === romaji.length) {
      playSound(800, 0.1, "triangle", 0.1);
      setTimeout(() => {
      playSound(1000, 0.1, "triangle", 0.1);
      } ,100);
      score++;
      scoreElem.textContent = score;
      setTimeout(setNewWord, 200);
    }
  } else {
  playSound(200, 0.15, "sawtooth", 0.07);
    showRomaMiss();
  }
});
