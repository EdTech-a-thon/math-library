const sets = [
  ['A','1×1, 2×1, 1×2, 3×1, 1×3, 4×1, 5×1, 1×6, 6×1, 1×7, 7×1, 1×8, 8×1, 1×9, 9×1'], ['B','2×2, 2×3, 3×2'], ['C','2×4, 4×2, 2×5, 5×2'], ['D','2×6, 6×2, 2×7, 7×2'], ['E','2×8, 8×2, 2×9, 9×2'], ['F','3×3, 3×4, 4×3'], ['G','3×5, 5×3, 3×9, 9×3'], ['H','3×6, 6×3, 4×9, 9×4'], ['I','3×7, 7×3, 5×9, 9×5'], ['J','3×8, 8×3, 6×9, 9×6'], ['K','0×1, 1×0, 0×2, 2×0, 0×5, 5×0, 0×6, 6×0, 0×7, 7×0, 0×8, 8×0'], ['L','7×9, 9×7'], ['M','4×4, 4×5, 5×4'], ['N','8×9, 9×8'], ['O','4×6, 6×4, 4×7, 7×4'], ['P','5×5, 4×8, 8×4'], ['Q','5×6, 6×5, 5×7, 7×5'], ['R','6×6, 5×8, 8×5'], ['S','6×7, 7×6'], ['T','7×7, 6×8, 8×6'], ['U','7×8, 8×7'], ['V','8×8, 9×9'], ['AA','10×1, 1×10, 10×10'], ['BB','10×2, 2×10, 10×5, 5×10'], ['CC','10×3, 3×10, 10×9, 9×10'], ['DD','10×4, 4×10, 10×6, 6×10'], ['EE','10×7, 7×10, 10×8, 8×10'], ['FF','10×11, 11×10, 10×12, 12×10'], ['GG','11×1, 1×11, 11×2, 2×11'], ['HH','11×3, 3×11, 11×5, 5×11'], ['II','11×11, 11×4, 4×11'], ['JJ','11×7, 7×11, 11×6, 6×11'], ['KK','11×8, 8×11, 11×9, 9×11'], ['LL','12×1, 1×12, 11×12, 12×11'], ['MM','12×12'], ['NN','12×5, 5×12, 9×12, 12×9'], ['OO','12×2, 2×12'], ['PP','12×6, 6×12, 12×8, 8×12'], ['QQ','12×4, 4×12, 12×3, 3×12'], ['RR','12×7, 7×12']
].map(([name, facts]) => ({ name, facts: facts.split(', ') }));

const $ = (selector) => document.querySelector(selector);
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const greetings = ['Let’s get those facts moving!', 'Your number brain is ready!', 'Time for a bright math boost!', 'Ready, steady, multiply!', 'Let’s launch a great practice round!'];
const praise = ['Correct!','Great job!','Nice thinking!','You got it!','Excellent work!'];
const endings = ['Nice work showing up and practicing!', 'That was focused work. Keep it up!', 'Your practice makes a difference!', 'You gave your brain a great workout!'];
const numberWords = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
let state = {};

const setSelect = $('#fact-set');
sets.forEach((set, index) => { const option = new Option(`Set ${set.name}`, index); setSelect.add(option); });
function updateSetDetail() { const set = sets[setSelect.value]; $('#set-detail').textContent = `${set.facts.length} new fact${set.facts.length === 1 ? '' : 's'} in this set`; }
setSelect.addEventListener('change', updateSetDetail); updateSetDetail();

function parseFact(fact) { return fact.split('×').map(Number); }
function factWords(fact) { const [a,b] = parseFact(fact); const answer = a * b; const written = answer <= 20 ? numberWords[answer] : String(answer); return `${numberWords[a][0].toUpperCase() + numberWords[a].slice(1)} times ${numberWords[b]} is ${written}.`; }
function buildRound(setIndex) {
  const current = sets[setIndex].facts.slice(0, 4);
  const review = sets.slice(0, setIndex).flatMap(set => set.facts);
  const repeatedNew = Array.from({length: 4}, () => current).flat();
  const neededReview = Math.max(0, 36 - repeatedNew.length);
  const reviewPool = review.length ? review : sets[0].facts.filter(fact => !current.includes(fact));
  const selectedReview = shuffle(reviewPool).slice(0, neededReview);
  while (selectedReview.length < neededReview) selectedReview.push(...shuffle(reviewPool));
  selectedReview.length = neededReview;
  return shuffle([...repeatedNew, ...selectedReview]);
}
function showScreen(id) { document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden')); $(id).classList.remove('hidden'); }
function showQuestion() {
  if (state.position >= state.round.length) return completeRound();
  const fact = state.round[state.position];
  $('#fact-display').textContent = fact.replace('×', ' × ');
  $('#question-count').textContent = `${state.position + 1} / ${state.round.length}`;
  $('#progress-fill').style.width = `${(state.position / state.round.length) * 100}%`;
  $('#answer-input').value = ''; $('#answer-input').focus();
}

$('#setup-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#student-name').value.trim(); if (!name) return;
  state = { name, setIndex: Number(setSelect.value), position: 0, round: buildRound(Number(setSelect.value)) };
  $('#student-label').textContent = `${greetings[Math.floor(Math.random() * greetings.length)]} Hi, ${name}!`;
  $('#feedback').textContent = 'Take your time. You can do this.'; $('#feedback').className = 'feedback neutral';
  showScreen('#practice-screen'); showQuestion();
});

$('#answer-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('#answer-input'); const response = input.value.trim().toLowerCase();
  if (response === 'done') return completeRound();
  if (!/^\d+$/.test(response)) { $('#feedback').textContent = 'Type a number, or type “done” to finish.'; $('#feedback').className = 'feedback incorrect'; return; }
  const fact = state.round[state.position]; const [a,b] = parseFact(fact);
  if (Number(response) === a * b) {
    $('#feedback').textContent = praise[Math.floor(Math.random() * praise.length)]; $('#feedback').className = 'feedback correct'; state.position += 1;
    setTimeout(showQuestion, 550);
  } else {
    $('#feedback').textContent = `${factWords(fact)} Say it to yourself three times, then try again.`; $('#feedback').className = 'feedback incorrect';
    state.position = Math.max(0, state.position - 3); setTimeout(showQuestion, 2300);
  }
});

$('#debug-button').addEventListener('click', () => { const set = sets[state.setIndex]; $('#debug-set').textContent = set.name; $('#debug-facts').innerHTML = set.facts.slice(0, 4).map(fact => `<li>${fact.replace('×', ' × ')}</li>`).join(''); $('#debug-dialog').showModal(); });
$('#close-debug').addEventListener('click', () => $('#debug-dialog').close());
function completeRound() {
  const id = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(100 + Math.random() * 900)}`;
  const questionCount = Math.min(state.position, state.round.length) || state.round.length;
  const summary = `Session ID: ${id}, Name: ${state.name}, Set: ${sets[state.setIndex].name}, Questions: ${questionCount}`;
  $('#complete-message').textContent = endings[Math.floor(Math.random() * endings.length)]; $('#session-summary').textContent = summary; $('#progress-fill').style.width = '100%'; showScreen('#complete-screen');
}
$('#copy-button').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#session-summary').textContent); $('#copy-button').textContent = 'Copied!'; setTimeout(() => $('#copy-button').textContent = 'Copy summary', 1500); } catch { $('#copy-button').textContent = 'Select and copy the line'; } });
$('#new-round-button').addEventListener('click', () => { $('#student-name').value = ''; showScreen('#welcome-screen'); $('#student-name').focus(); });
