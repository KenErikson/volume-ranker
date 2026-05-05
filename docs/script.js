const TOTAL = 10;
const MAX_EVEN = 4;

const bigNumber = document.getElementById("bigNumber");
const remaining = document.getElementById("remaining");
const result = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");

const saneBtn = document.getElementById("saneBtn");
const nopeBtn = document.getElementById("nopeBtn");

const historyList = document.getElementById("historyList");

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
  const selected = new Set();
  let evenCount = 0;
  let endingWith5Count = 0;
  let endingWith0Count = 0;

  while (selected.size < TOTAL) {
    const n = Math.floor(Math.random() * 101);

    if (selected.has(n)) continue;

    // Constraint: max 4 evens
    if (n % 2 === 0 && evenCount >= MAX_EVEN) continue;

    // Constraint: max 1 ending with 5
    if (n % 10 === 5 && endingWith5Count >= 1) continue;

    // Constraint: max 1 ending with 0
    if (n % 10 === 0 && endingWith0Count >= 1) continue;

    // Accept number
    selected.add(n);
    if (n % 2 === 0) evenCount++;
    if (n % 10 === 5) endingWith5Count++;
    if (n % 10 === 0) endingWith0Count++;
  }

  return Array.from(selected);
}

function addHistoryItem(value, isCorrect) {
  const el = document.createElement("div");

  const isSane = solution.Sane.has(value);

  el.textContent = value;
  el.className = `history-item ${isSane ? "sane" : "nope"} ${isCorrect ? "correct" : "wrong"}`;

  historyList.appendChild(el);
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

  historyList.innerHTML = "";

  saneBtn.disabled = nopeBtn.disabled = false;
  restartBtn.hidden = true;
  result.textContent = "";

  updateUI();
}

saneBtn.onclick = () => answer("Sane");
nopeBtn.onclick = () => answer("Nope");
restartBtn.onclick = start;

start();
