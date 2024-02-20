const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let currentOscillators = [];
let loopTimeout = null;

const INDICATIONS = 'https://raw.githubusercontent.com/asterisk/asterisk/master/configs/samples/indications.conf.sample';

function createTone(frequencies, durations, loop = false) {
  stopTone();

  let startTime = audioContext.currentTime;
  let totalDuration = 0;

  frequencies.forEach((freqArray, index) => {
    const duration = durations[index] / 1000;
    totalDuration += duration;

    freqArray.forEach(frequency => {
      if (frequency > 0) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(1, startTime);
        gainNode.gain.setValueAtTime(0, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        currentOscillators.push(oscillator);
      }
    });

    startTime += duration;
  });

  if (loop) {
    loopTimeout = setTimeout(() => {
      createTone(frequencies, durations, true);
    }, totalDuration * 1000);
  }
}

function parseToneString(toneString) {
  const toneParts = toneString.split(',');
  const frequencies = [];
  const durations = [];

  toneParts.forEach(part => {
    const [tone, duration] = part.split('/');
    const freqArray = tone.split('+').map(Number);
    frequencies.push(freqArray);
    durations.push(Number(duration));
  });

  return { frequencies, durations };
}

function playTone(toneString) {
  const { frequencies, durations } = parseToneString(toneString);
  createTone(frequencies, durations, true);
}

function stopTone() {
  currentOscillators.forEach(oscillator => oscillator.stop());
  currentOscillators = [];

  if (loopTimeout) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }
}

async function fetchCountryData() {
  try {
    const response = await fetch(INDICATIONS);
    const data = await response.text();
    const lines = data.split('\n');
    let countryOptions = '';
    let currentCountry = '';
    let ringValue = '';

    lines.forEach(line => {
      if (line.startsWith('description')) {
        currentCountry = line.split('=')[1].trim();
      } else if (line.startsWith('ring =') && currentCountry) {
        ringValue = line.split('=')[1].trim().replace(/\*/g, '+');
        countryOptions += `<option value="${ringValue}">${currentCountry}</option>`;
        currentCountry = '';
        ringValue = '';
      }
    });

    document.getElementById('countrySelect').innerHTML = countryOptions;
  } catch (error) {
    console.error('Error fetching country data:', error);
  }
}

function playSelectedTone() {
    const selectedTone = document.getElementById('countrySelect').value;
    playTone(selectedTone);
}

fetchCountryData();
