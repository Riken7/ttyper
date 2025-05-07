const overlay = document.getElementById('overlay');
const typeInput = document.getElementById('typeInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const modeOptions = document.querySelectorAll('.mode-option');

const sampleTexts = [
  "The sun rises slowly over the calm valley. Birds sing as the day begins.",
  "A small cat runs through the green field. It chases a butterfly with joy.",
  "The river flows gently under the old bridge. Fish swim in the clear water.",
  "A bright star shines in the dark night sky. The moon glows softly nearby.",
  "To be or not to be, that is the question. William Shakespeare wrote this famous line.",
  "The only way to do great work is to love what you do. Steve Jobs inspired many.",
  "In the middle of difficulty lies opportunity. Albert Einstein said this wisely.",
  "Life is what happens when you're busy making other plans. John Lennon spoke truly.",
  "The algorithm optimizes the database query. It reduces latency significantly.",
  "A recursive function calls itself with smaller inputs. Stack overflow must be avoided.",
  "The API endpoint returns JSON data. Authentication requires a secure token.",
  "Machine learning models need large datasets. Overfitting can degrade performance."
];

let sampleText = '';
let startTime, timerInterval, isTyping = false;
let timerDuration = 60;

function getRandomText() {
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function generateTestText() {
  return [getRandomText(), getRandomText(), getRandomText(), getRandomText()].join(' ');
}

function initialize() {
  sampleText = generateTestText();
  overlay.innerHTML = sampleText.split('').map(char => `<span>${char}</span>`).join('');
  typeInput.value = '';
  typeInput.disabled = false;
  timerDisplay.textContent = `${timerDuration} s`;
  wpmDisplay.textContent = 'WPM: 0';
  accuracyDisplay.textContent = 'Accuracy: 100%';
  isTyping = false;
  clearInterval(timerInterval);
  typeInput.focus();
  syncScroll();
}

function startTimer() {
  if (!isTyping) {
    isTyping = true;
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
  }
}

function updateTimer() {
  const elapsed = Math.floor((new Date() - startTime) / 1000);
  const timeLeft = timerDuration - elapsed;
  timerDisplay.textContent = `${timeLeft} s`;
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    typeInput.disabled = true;
    isTyping = false;
  }
}

function updateStats(input, text) {
  const words = input.trim().split(/\s+/).filter(word => word.length > 0).length;
  const elapsed = (new Date() - startTime) / 60000;
  const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
  wpmDisplay.textContent = `WPM: ${wpm}`;

  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === text[i]) correct++;
  }
  const accuracy = input.length > 0 ? Math.round((correct / input.length) * 100) : 100;
  accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
}

function syncScroll() {
  const spans = overlay.children;
  let currentSpan = null;
  for (let i = 0; i < spans.length; i++) {
    if (spans[i].classList.contains('current')) {
      currentSpan = spans[i];
      break;
    }
  }
  if (currentSpan) {
    const spanTop = currentSpan.offsetTop;
    const containerHeight = overlay.clientHeight;
    overlay.scrollTop = Math.max(0, spanTop - containerHeight / 2);
    typeInput.scrollTop = overlay.scrollTop;
  }
}

typeInput.addEventListener('input', () => {
  if (!isTyping) startTimer();
  const input = typeInput.value;
  const spans = overlay.children;

  for (let i = 0; i < sampleText.length; i++) {
    let className = i < input.length ? (input[i] === sampleText[i] ? 'correct' : 'incorrect') : '';
    if (i === input.length) className = 'current';
    spans[i].className = className;
  }

  updateStats(input, sampleText);
  syncScroll();
});

typeInput.addEventListener('scroll', syncScroll);

modeOptions.forEach(option => {
  option.addEventListener('click', () => {
    timerDuration = parseInt(option.dataset.timer);
    modeOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    initialize();
  });
});

resetButton.addEventListener('click', initialize);

initialize();
