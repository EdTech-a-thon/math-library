const $ = (selector) => document.querySelector(selector);

const exampleData = '4, 7, 8, 10, 12, 12, 15, 18, 21';
const summaryLabels = [
  ['Minimum', 'min'],
  ['First quartile', 'q1'],
  ['Median', 'median'],
  ['Third quartile', 'q3'],
  ['Maximum', 'max'],
];

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function median(values) {
  const middle = values.length / 2;
  return values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[Math.floor(middle)];
}

function calculateSummary(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const lowerHalf = sorted.slice(0, middle);
  const upperHalf = sorted.slice(sorted.length % 2 === 0 ? middle : middle + 1);

  return {
    sorted,
    min: sorted[0],
    q1: median(lowerHalf),
    median: median(sorted),
    q3: median(upperHalf),
    max: sorted[sorted.length - 1],
  };
}

function parseData(text) {
  const entries = text.trim().split(/[\s,]+/).filter(Boolean);
  if (!entries.length) return { error: 'Enter at least four numbers to make a box plot.' };

  const values = entries.map(Number);
  const invalidEntry = entries.find((entry, index) => !Number.isFinite(values[index]));
  if (invalidEntry) return { error: `“${invalidEntry}” is not a number. Please check your data.` };
  if (values.length < 4) return { error: 'Add at least four numbers so each half has a median.' };

  return { values };
}

function makeTicks(min, max) {
  const range = max - min;
  if (range === 0) return [min - 1, min, min + 1];

  const rawStep = range / 6;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normal = rawStep / magnitude;
  const step = (normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 5 ? 5 : 10) * magnitude;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];

  for (let tick = start; tick <= end + step / 1000; tick += step) ticks.push(Number(tick.toFixed(10)));
  return ticks;
}

function renderPlot(summary) {
  const svg = $('#box-plot');
  const ticks = makeTicks(summary.min, summary.max);
  const tickMin = ticks[0];
  const tickMax = ticks[ticks.length - 1];
  const left = 54;
  const right = 706;
  const axisY = 192;
  const boxTop = 80;
  const boxBottom = 150;
  const middleY = (boxTop + boxBottom) / 2;
  const x = (value) => left + ((value - tickMin) / (tickMax - tickMin)) * (right - left);
  const valueLabel = (label, value, className) => `<g class="plot-label ${className}"><text x="${x(value)}" y="44">${label}</text><text x="${x(value)}" y="63">${formatNumber(value)}</text></g>`;
  const tickMarkup = ticks.map((tick) => `<g class="tick"><line x1="${x(tick)}" y1="${axisY}" x2="${x(tick)}" y2="${axisY + 8}" /><text x="${x(tick)}" y="${axisY + 28}">${formatNumber(tick)}</text></g>`).join('');

  svg.innerHTML = `
    <title id="plot-title">Box plot for ${summary.sorted.length} values</title>
    <desc id="plot-description">Minimum ${formatNumber(summary.min)}, first quartile ${formatNumber(summary.q1)}, median ${formatNumber(summary.median)}, third quartile ${formatNumber(summary.q3)}, maximum ${formatNumber(summary.max)}.</desc>
    <line class="axis" x1="${left}" y1="${axisY}" x2="${right}" y2="${axisY}" />
    ${tickMarkup}
    <line class="whisker" x1="${x(summary.min)}" y1="${middleY}" x2="${x(summary.q1)}" y2="${middleY}" />
    <line class="whisker" x1="${x(summary.q3)}" y1="${middleY}" x2="${x(summary.max)}" y2="${middleY}" />
    <line class="cap" x1="${x(summary.min)}" y1="${boxTop + 14}" x2="${x(summary.min)}" y2="${boxBottom - 14}" />
    <line class="cap" x1="${x(summary.max)}" y1="${boxTop + 14}" x2="${x(summary.max)}" y2="${boxBottom - 14}" />
    <rect class="box" x="${x(summary.q1)}" y="${boxTop}" width="${Math.max(x(summary.q3) - x(summary.q1), 2)}" height="${boxBottom - boxTop}" />
    <line class="median-line" x1="${x(summary.median)}" y1="${boxTop}" x2="${x(summary.median)}" y2="${boxBottom}" />
    ${valueLabel('MIN', summary.min, 'label-min')}
    ${valueLabel('Q1', summary.q1, 'label-q1')}
    ${valueLabel('MEDIAN', summary.median, 'label-median')}
    ${valueLabel('Q3', summary.q3, 'label-q3')}
    ${valueLabel('MAX', summary.max, 'label-max')}
  `;
}

function renderResults(summary) {
  renderPlot(summary);
  $('#summary-grid').innerHTML = summaryLabels.map(([label, key]) => `
    <div><dt>${label}</dt><dd>${formatNumber(summary[key])}</dd></div>
  `).join('');
  $('#sorted-values').textContent = summary.sorted.map(formatNumber).join('  ·  ');
  $('#sorted-count').textContent = `${summary.sorted.length} values`;
  $('#plot-status').textContent = 'Your plot is ready';
  $('#empty-state').classList.add('hidden');
  $('#results').classList.remove('hidden');
}

function updateValueCount() {
  const entries = $('#data-input').value.trim().split(/[\s,]+/).filter(Boolean);
  $('#value-count').textContent = `${entries.length} value${entries.length === 1 ? '' : 's'}`;
}

function showError(message) {
  $('#error-message').textContent = message;
  $('#data-input').setAttribute('aria-invalid', 'true');
}

function clearError() {
  $('#error-message').textContent = '';
  $('#data-input').removeAttribute('aria-invalid');
}

$('#data-input').addEventListener('input', () => {
  updateValueCount();
  clearError();
});

$('#data-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const parsed = parseData($('#data-input').value);
  if (parsed.error) {
    showError(parsed.error);
    return;
  }

  clearError();
  renderResults(calculateSummary(parsed.values));
});

$('#example-button').addEventListener('click', () => {
  $('#data-input').value = exampleData;
  updateValueCount();
  clearError();
  $('#data-form').requestSubmit();
});

$('#clear-button').addEventListener('click', () => {
  $('#data-input').value = '';
  updateValueCount();
  clearError();
  $('#results').classList.add('hidden');
  $('#empty-state').classList.remove('hidden');
  $('#plot-status').textContent = 'Add data to begin';
  $('#data-input').focus();
});
