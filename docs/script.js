const TOTAL = 10;
const MAX_EVEN = 4;

const bigNumber = document.getElementById("bigNumber");
const remaining = document.getElementById("remaining");
const result = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");

const saneBtn = document.getElementById("saneBtn");
const nopeBtn = document.getElementById("nopeBtn");

const correctList = document.getElementById("correctList");
const wrongList = document.getElementById("wrongList");

let numbers = [];
let index = 0;
let correct = 0;
let solution = null;

/* ---------- helpers ---------- */

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function generateNumbers() {
  const evens = [];
  const odds = [];

  for (let i = 0; i <= 100; i++) {
    (i % 2 === 0 ? evens : odds).push(i);
  }

  shuffle(evens);
  shuffle(odds);

  const selected = [
    ...evens.slice(0, MAX_EVEN),
    ...odds.slice(0, TOTAL - MAX_EVEN),
  ];

  shuffle(selected);
  return selected;
}

function addHistoryItem(value, isCorrect) {
  const el = document.createElement("div");
  el.textContent = value;

  const isSane = solution.Sane.has(value);
  el.className = `history-item ${isSane ? "sane" : "nope"}`;

  (isCorrect ? correctList : wrongList).appendChild(el);
}

function blink(isCorrect) {
  bigNumber.classList.remove("correct-blink", "wrong-blink");
  void bigNumber.offsetWidth; // reset animation
  bigNumber.classList.add(isCorrect ? "correct-blink" : "wrong-blink");
}

/* ---------- quiz logic ---------- */

function updateUI() {
  if (index >= numbers.length) {
    bigNumber.textContent = "✓";
    remaining.textContent = "";
    result.textContent = `Score: ${correct} / ${TOTAL} (${Math.round(
      (correct / TOTAL) * 100
    )}%)`;
    saneBtn.disabled = nopeBtn.disabled = true;
    restartBtn.hidden = false;
    return;
  }

  bigNumber.textContent = numbers[index];

  // Exclude current number from remaining display
  remaining.textContent =
    `Remaining: ${numbers.slice(index + 1).join(", ")}`;
}

function answer(choice) {
  if (index >= numbers.length) return;

  const value = numbers[index];
  const isCorrect = solution[choice].has(value);

  blink(isCorrect);
  addHistoryItem(value, isCorrect);
  if (isCorrect) correct++;

  index++;
  updateUI();
}

/* ---------- keyboard input ---------- */

document.addEventListener("keydown", e => {
  if (saneBtn.disabled) return;

  if (e.key === "ArrowLeft") {
    answer("Sane");
  } else if (e.key === "ArrowRight") {
    answer("Nope");
  }
});

/* ---------- init ---------- */

async function start() {
  solution = await fetch("volume-tiers.json")
    .then(r => r.json())
    .then(data => ({
      Sane: new Set(data.tiers.Sane),
      Nope: new Set(data.tiers.Nope),
    }));

  numbers = generateNumbers();
  index = 0;
  correct = 0;

  correctList.innerHTML = "";
  wrongList.innerHTML = "";

  saneBtn.disabled = nopeBtn.disabled = false;
  restartBtn.hidden = true;
  result.textContent = "";

  updateUI();
}

saneBtn.onclick = () => answer("Sane");
nopeBtn.onclick = () => answer("Nope");
restartBtn.onclick = start;

start();
