const NUMBERS_PER_RUN = 20;

const numbersDiv = document.getElementById("numbers");
const tiers = document.querySelectorAll(".tier");
const resultDiv = document.getElementById("result");
const scoreBtn = document.getElementById("scoreBtn");
const resetBtn = document.getElementById("resetBtn");

let dragged = null;
let currentNumbers = [];

// Drag logic
function makeDraggable(el) {
  el.draggable = true;
  el.addEventListener("dragstart", () => {
    dragged = el;
  });
}

tiers.forEach(tier => {
  tier.addEventListener("dragover", e => e.preventDefault());
  tier.addEventListener("drop", () => {
    if (dragged) tier.appendChild(dragged);
  });
});

// Random subset generation
function pickRandomNumbers(count) {
  const all = Array.from({ length: 101 }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count).sort((a, b) => a - b);
}

// Setup new run
function setupNewRun() {
  numbersDiv.innerHTML = "";
  tiers.forEach(t =>
    t.querySelectorAll(".number").forEach(n => n.remove())
  );
  resultDiv.textContent = "";

  currentNumbers = pickRandomNumbers(NUMBERS_PER_RUN);
  currentNumbers.forEach(n => {
    const el = document.createElement("div");
    el.className = "number";
    el.textContent = n;
    makeDraggable(el);
    numbersDiv.appendChild(el);
  });
}

// Scoring
scoreBtn.onclick = async () => {
  const solution = await fetch("volume-tiers.json").then(r => r.json());

  let placed = 0;
  let correct = 0;

  tiers.forEach(tier => {
    const tierName = tier.dataset.tier;
    const correctSet = new Set(solution.tiers[tierName]);

    tier.querySelectorAll(".number").forEach(num => {
      placed++;
      const value = Number(num.textContent);
      if (correctSet.has(value)) {
        correct++;
        num.style.background = "#c8f7c5";
      } else {
        num.style.background = "#f7c5c5";
      }
    });
  });

  if (placed !== currentNumbers.length) {
    resultDiv.textContent = "Place all numbers before scoring.";
    return;
  }

  const percent = Math.round((correct / placed) * 100);
  resultDiv.textContent = `Score: ${correct}/${placed} (${percent}%)`;
};

resetBtn.onclick = setupNewRun;

// Initial load
setupNewRun();
