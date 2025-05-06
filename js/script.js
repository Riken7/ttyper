const overlay = document.getElementById('overlay');
const typeInput = document.getElementById('typeInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const modeOptions = document.querySelectorAll('.mode-option');

// Arrays of sample texts
const simpleSentences = [
  "The sun rises slowly over the calm valley. Birds sing as the day begins.",
  "A small cat runs through the green field. It chases a butterfly with joy.",
  "The river flows gently under the old bridge. Fish swim in the clear water.",
  "A bright star shines in the dark night sky. The moon glows softly nearby."
];

const famousQuotes = [
  "To be or not to be, that is the question. William Shakespeare wrote this famous line.",
  "The only way to do great work is to love what you do. Steve Jobs inspired many.",
  "In the middle of difficulty lies opportunity. Albert Einstein said this wisely.",
  "Life is what happens when you're busy making other plans. John Lennon spoke truly."
];

const technicalTerms = [
  "The algorithm optimizes the database query. It reduces latency significantly.",
  "A recursive function calls itself with smaller inputs. Stack overflow must be avoided.",
  "The API endpoint returns JSON data. Authentication requires a secure token.",
  "Machine learning models need large datasets. Overfitting can degrade performance."
];

// Combine all arrays for random selection
const allSampleTexts = [...simpleSentences, ...famousQuotes, ...technicalTerms];

let sampleText = ''; // Will be set in initialize
let startTime, timerInterval, isTyping = false;
let timerDuration = 60; // Default duration in seconds

function getRandomText() {
  return allSampleTexts[Math.floor(Math.random() * allSampleTexts.length)];
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function generateTestText() {
  const averageWPM = 80;
  const expectedWords = averageWPM * (timerDuration / 60) * 1.5;
  let currentWords = 0;
  let textSegments = [];
  const minSegments = 3;

  while (currentWords < expectedWords || textSegments.length < minSegments) {
    const newText = getRandomText();
    textSegments.push(newText);
    currentWords += countWords(newText);
  }

  return textSegments.join(' | ');
}

function initialize() {
  sampleText = generateTestText();
  overlay.innerHTML = sampleText
    .split('')
    .map((char, index) => {
      const isSeparator = char === '|' && index > 0 && index < sampleText.length - 1;
      return `<span class="${isSeparator ? 'separator' : ''}">${char}</span>`;
    })
    .join('');
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
  const inputText = typeInput.value;
  const caretPosition = typeInput.selectionStart;

  // Create a temporary div to measure the height of the text up to the caret
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.whiteSpace = 'pre-wrap';
  tempDiv.style.wordWrap = 'break-word';
  tempDiv.style.width = typeInput.clientWidth + 'px';
  tempDiv.style.padding = '15px';
  tempDiv.style.fontFamily = getComputedStyle(typeInput).fontFamily;
  tempDiv.style.fontSize = getComputedStyle(typeInput).fontSize;
  tempDiv.style.lineHeight = getComputedStyle(typeInput).lineHeight;
  tempDiv.style.letterSpacing = getComputedStyle(typeInput).letterSpacing;
  tempDiv.style.wordSpacing = getComputedStyle(typeInput).wordSpacing;
  tempDiv.textContent = inputText.substring(0, caretPosition);
  document.body.appendChild(tempDiv);

  const caretHeight = tempDiv.scrollHeight;
  document.body.removeChild(tempDiv);

  // Calculate the scroll position to center the caret
  const containerHeight = typeInput.clientHeight;
  const scrollPosition = caretHeight - containerHeight / 2;

  // Apply the scroll position
  typeInput.scrollTop = Math.max(0, scrollPosition);
  overlay.scrollTop = typeInput.scrollTop;
}

typeInput.addEventListener('input', () => {
  if (!isTyping) startTimer();
  const input = typeInput.value;
  const spans = overlay.children;

  // Update highlighting and current position
  for (let i = 0; i < sampleText.length; i++) {
    const isSeparator = sampleText[i] === '|' && i > 0 && i < sampleText.length - 1;
    let className = isSeparator ? 'separator' : '';
    if (i < input.length) {
      className += input[i] === sampleText[i] ? ' correct' : ' incorrect';
    }
    if (i === input.length) {
      className += ' current'; // Highlight the current typing position
    }
    spans[i].className = className.trim();
  }

  updateStats(input, sampleText);
  syncScroll();
});

typeInput.addEventListener('scroll', syncScroll);

modeOptions.forEach(option => {
  option.addEventListener('click', () => {
    if (option.dataset.mode === 'arrows') {
      sampleText = generateTestText();
      initialize();
      return;
    }
    timerDuration = parseInt(option.dataset.mode);
    modeOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    initialize();
  });
});

resetButton.addEventListener('click', initialize);

initialize();
