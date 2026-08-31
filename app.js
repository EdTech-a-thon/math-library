const $ = (selector) => document.querySelector(selector);

const chapterDetails = [
  ['The Torn Catalogue', 'STANDARD → VERTEX', '▤', 'The catalogue mends itself, its ink flowing back into a single unbroken line.', 'Restore its missing line.', 'A page lists a quadratic in standard form, but its vertex-form entry has faded away. Complete the catalogue to return it to its shelf.', 'The repaired page names the next chamber: the Astronomer’s Stack. A book of constellations shivers on a distant shelf.', 'Approach the Star Book'],
  ['The Star Book', 'VERTEX → STANDARD', '✧', 'A constellation book opens by itself. Its gold stars join into a clean parabola.', 'Wake the sleeping constellations.', 'The star book only understands standard form. Translate its inscription so its constellations can return to their places.', 'The stars illuminate a collapsed ink-and-gold archway. Its stones rearrange themselves into a factored clue.', 'Cross to the Archway'],
  ['The Ink Archway', 'FACTORED → STANDARD', '⌒', 'Dark ink becomes gold-veined stone. The archway now stands tall enough to pass beneath.', 'Rebuild the fallen arch.', 'Each stone bears one factor. Multiply the factors correctly and the archway will remember its original shape.', 'Beyond the arch, a stone librarian tilts its head. Its name has been carved as a hidden factored form.', 'Meet the Stone Librarian'],
  ['The Stone Librarian', 'STANDARD → FACTORED', '♙', 'The stone librarian wakes, raising one hand toward a spiral stair.', 'Speak the statue’s true name.', 'The statue responds only to roots. Factor the inscription to discover the two values hidden in its stone base.', 'The librarian speaks one word: “Vertex.” A spiral stair turns toward the observatory, where an astrolabe is waiting.', 'Climb to the Observatory'],
  ['The Brass Astrolabe', 'KEY FEATURES', '◉', 'The astrolabe turns. Its rings lock onto the parabola’s highest point.', 'Align the observatory instrument.', 'No graph remains, but the astrolabe can still find a parabola’s turning point. Identify the vertex and axis of symmetry from the equation.', 'The astrolabe projects two roots and a doorway of light. The final missing page lies within the Living Index.', 'Enter the Living Index'],
  ['The Living Index', 'KEY FEATURES', '✦', 'The living index shines with a final line of gold ink. The exit arch stirs beyond it.', 'Write the final record.', 'The Library needs every landmark of this parabola before it can open the exit: the roots, the y-intercept, and the vertex. No graph will be drawn for you.', '', ''],
];

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function signed(value) {
  return value < 0 ? ` - ${Math.abs(value)}` : ` + ${value}`;
}

function factor(root) {
  const sign = root < 0 ? '+' : '-';
  return `(x ${sign} ${Math.abs(root)})`;
}

function vertexEquation(h, k, html = true) {
  const sign = h < 0 ? '+' : '-';
  const squared = html ? '<sup>2</sup>' : '^2';
  return `y = (x ${sign} ${Math.abs(h)})${squared}${signed(k)}`;
}

function standardEquation(b, c, html = true) {
  const squared = html ? '<sup>2</sup>' : '^2';
  return `y = x${squared}${b ? `${signed(b)}x` : ''}${c ? signed(c) : ''}`;
}

function plainEquation(equation) {
  return equation.replace(/ /g, '').replace(/<sup>2<\/sup>/g, '^2');
}

function randomVertex() {
  return { h: pick([-4, -3, -2, -1, 1, 2, 3, 4]), k: pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]) };
}

function randomRoots(sameParity = false) {
  const values = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  const first = pick(values);
  const options = values.filter((value) => value !== first && (!sameParity || Math.abs(value % 2) === Math.abs(first % 2)));
  return [first, pick(options)].sort((a, b) => a - b);
}

function chapter(index, question) {
  const [name, badge, artifact, scene, title, story, reveal, next] = chapterDetails[index];
  return { name, badge, artifact, scene, title, story, reveal, next, ...question };
}

function createChallenges() {
  const firstVertex = randomVertex();
  const firstB = -2 * firstVertex.h;
  const firstC = firstVertex.h ** 2 + firstVertex.k;
  const secondVertex = randomVertex();
  const [thirdRootA, thirdRootB] = randomRoots();
  const [fourthRootA, fourthRootB] = randomRoots();
  const astrolabeVertex = randomVertex();
  const [finalRootA, finalRootB] = randomRoots(true);
  const finalB = -(finalRootA + finalRootB);
  const finalC = finalRootA * finalRootB;
  const finalH = (finalRootA + finalRootB) / 2;
  const finalK = -(((finalRootA - finalRootB) / 2) ** 2);
  const correctFactors = `y = ${factor(fourthRootA)}${factor(fourthRootB)}`;
  const distractors = [];

  while (distractors.length < 3) {
    const [rootA, rootB] = randomRoots();
    const equation = `y = ${factor(rootA)}${factor(rootB)}`;
    if (equation !== correctFactors && !distractors.includes(equation) && -(rootA + rootB) !== -(fourthRootA + fourthRootB)) distractors.push(equation);
  }

  const choices = [correctFactors, ...distractors].sort(() => Math.random() - .5);

  return [
    chapter(0, { type: 'input', prompt: `Convert <strong>${standardEquation(firstB, firstC)}</strong> to vertex form.`, label: 'Vertex form', placeholder: 'Example: y = (x - 2)^2 + 3', answer: [plainEquation(vertexEquation(firstVertex.h, firstVertex.k, false)).replace('y=', ''), plainEquation(vertexEquation(firstVertex.h, firstVertex.k, false))], hint: `Half of the x coefficient is ${-firstVertex.h}. Square that value, then complete the square.` }),
    chapter(1, { type: 'input', prompt: `Convert <strong>${vertexEquation(secondVertex.h, secondVertex.k)}</strong> to standard form.`, label: 'Standard form', placeholder: 'Example: y = x^2 + 2x - 1', answer: [plainEquation(standardEquation(-2 * secondVertex.h, secondVertex.h ** 2 + secondVertex.k, false)).replace('y=', ''), plainEquation(standardEquation(-2 * secondVertex.h, secondVertex.h ** 2 + secondVertex.k, false))], hint: 'Expand the squared bracket first, then combine the constant terms.' }),
    chapter(2, { type: 'input', prompt: `Convert <strong>y = ${factor(thirdRootA)}${factor(thirdRootB)}</strong> to standard form.`, label: 'Standard form', placeholder: 'Example: y = x^2 + 3x - 10', answer: [plainEquation(standardEquation(-(thirdRootA + thirdRootB), thirdRootA * thirdRootB, false)).replace('y=', ''), plainEquation(standardEquation(-(thirdRootA + thirdRootB), thirdRootA * thirdRootB, false))], hint: 'Use FOIL: multiply every term in the first bracket by every term in the second.' }),
    chapter(3, { type: 'choice', prompt: `Which factored form is equivalent to <strong>${standardEquation(-(fourthRootA + fourthRootB), fourthRootA * fourthRootB)}</strong>?`, choices, correct: choices.indexOf(correctFactors), hint: `Find two integers with a product of ${fourthRootA * fourthRootB} and a sum of ${fourthRootA + fourthRootB}.` }),
    chapter(4, { type: 'features', prompt: `For <strong>${vertexEquation(astrolabeVertex.h, astrolabeVertex.k)}</strong>, identify the key features.`, fields: [{ label: 'Vertex', placeholder: 'Example: (-2, 5)', answer: [`(${astrolabeVertex.h},${astrolabeVertex.k})`, `${astrolabeVertex.h},${astrolabeVertex.k}`] }, { label: 'Axis of symmetry', placeholder: 'Example: x = -2', answer: [`x=${astrolabeVertex.h}`, String(astrolabeVertex.h)] }], hint: 'Vertex form y = (x - h)² + k has vertex (h, k). Watch the sign inside the parentheses.' }),
    chapter(5, { type: 'finalFeatures', prompt: `For <strong>${standardEquation(finalB, finalC)}</strong>, identify all key features.`, fields: [{ label: 'x-intercepts', placeholder: 'Example: (1, 0), (3, 0)', answer: [`(${finalRootA},0),(${finalRootB},0)`, `(${finalRootB},0),(${finalRootA},0)`, `${finalRootA},${finalRootB}`] }, { label: 'y-intercept', placeholder: 'Example: (0, 3)', answer: [`(0,${finalC})`, String(finalC)] }, { label: 'Vertex', placeholder: 'Example: (2, -1)', answer: [`(${finalH},${finalK})`, `${finalH},${finalK}`] }], hint: 'Factor to find the x-intercepts. For the y-intercept, set x = 0. The vertex lies midway between the roots.' }),
  ];
}

let challenges = createChallenges();

let current = 0;
let attempts = 0;

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, '').replace(/[{}]/g, '').replace(/−/g, '-').replace(/\*+/g, '');
}

function renderChallenge() {
  const challenge = challenges[current];
  attempts = 0;
  $('#room-label').textContent = `CHAPTER ${['I', 'II', 'III', 'IV', 'V', 'VI'][current]} OF VI`;
  $('#challenge-kicker').textContent = challenge.name.toUpperCase();
  $('#challenge-title').textContent = challenge.title;
  $('#form-badge').textContent = challenge.badge;
  $('#story-text').textContent = challenge.story;
  $('#scene-artifact').textContent = challenge.artifact;
  $('#scene-caption').textContent = current === 0 ? 'A damaged catalogue waits beneath a pool of moonlight.' : challenge.scene;
  $('#feedback').textContent = '';
  $('#hint-box').classList.add('hidden');
  $('#hint-button').disabled = true;
  $('#hint-box p').textContent = challenge.hint;
  $('#check-button').disabled = false;
  $('#reveal-card').classList.add('hidden');
  $('#question-area').innerHTML = makeQuestion(challenge);
  document.querySelectorAll('.artifact').forEach((artifact, index) => artifact.classList.toggle('active', index === current));
}

function makeQuestion(challenge) {
  if (challenge.type === 'choice') {
    return `<p class="math-prompt">${challenge.prompt}</p><fieldset class="choice-list"><legend>Choose one answer</legend>${challenge.choices.map((choice, index) => `<label class="choice"><input type="radio" name="answer" value="${index}" /><span>${choice}</span></label>`).join('')}</fieldset>`;
  }
  if (challenge.fields) {
    return `<p class="math-prompt">${challenge.prompt}</p><div class="feature-fields">${challenge.fields.map((field, index) => `<label>${field.label}<input data-field="${index}" type="text" autocomplete="off" spellcheck="false" placeholder="${field.placeholder}" /></label>`).join('')}</div>`;
  }
  return `<p class="math-prompt">${challenge.prompt}</p><label class="answer-label">${challenge.label}<input id="answer-input" type="text" autocomplete="off" spellcheck="false" placeholder="${challenge.placeholder}" /></label>`;
}

function isCorrect(challenge) {
  if (challenge.type === 'choice') return Number(document.querySelector('input[name="answer"]:checked')?.value) === challenge.correct;
  if (challenge.fields) return challenge.fields.every((field, index) => field.answer.includes(normalize(document.querySelector(`[data-field="${index}"]`).value)));
  return challenge.answer.includes(normalize($('#answer-input').value));
}

function checkAnswer() {
  const challenge = challenges[current];
  if (isCorrect(challenge)) {
    $('#feedback').textContent = 'Correct. The library responds to your restoration.';
    $('#feedback').className = 'feedback correct';
    $('#check-button').disabled = true;
    document.querySelectorAll('#question-area input').forEach((input) => input.disabled = true);
    setTimeout(showReveal, 350);
    return;
  }
  attempts += 1;
  $('#feedback').textContent = attempts === 1 ? 'That is not quite the lost entry. Check each step and try again.' : 'Still not the right restoration. The Archivist can now offer a hint.';
  $('#feedback').className = 'feedback incorrect';
  if (attempts >= 2) $('#hint-button').disabled = false;
}

function showReveal() {
  const challenge = challenges[current];
  if (current === challenges.length - 1) {
    showComplete();
    return;
  }
  $('#reveal-title').textContent = `${challenge.name} restored.`;
  $('#reveal-text').textContent = challenge.reveal;
  $('#next-button').textContent = `${challenge.next} →`;
  $('#reveal-card').classList.remove('hidden');
  $('#reveal-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showComplete() {
  $('#game-screen').classList.add('hidden');
  $('#complete-screen').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#start-button').addEventListener('click', () => {
  challenges = createChallenges();
  $('#welcome-screen').classList.add('hidden');
  $('#game-screen').classList.remove('hidden');
  renderChallenge();
});

$('#check-button').addEventListener('click', checkAnswer);
$('#hint-button').addEventListener('click', () => $('#hint-box').classList.remove('hidden'));
$('#next-button').addEventListener('click', () => { current += 1; renderChallenge(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
$('#restart-button').addEventListener('click', () => { current = 0; $('#complete-screen').classList.add('hidden'); $('#welcome-screen').classList.remove('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
