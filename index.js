const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let currentOscillator = null;

function createTone(frequencies, durations) {
  // Arrête l'oscillateur précédent s'il existe
  if (currentOscillator) {
    currentOscillator.stop();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  let startTime = audioContext.currentTime;
  for (let i = 0; i < frequencies.length; i++) {
    const frequency = frequencies[i];
    const duration = durations[i] / 1000; // Convert milliseconds to seconds

    oscillator.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(1, startTime); // Start the tone
    startTime += duration;
    gainNode.gain.setValueAtTime(0, startTime); // Stop the tone
  }

  oscillator.start();
  oscillator.stop(startTime);

  // Enregistre l'oscillateur actuel pour pouvoir l'arrêter plus tard
  currentOscillator = oscillator;
}

function parseToneString(toneString) {
  const toneParts = toneString.split(',');
  const frequencies = [];
  const durations = [];

  toneParts.forEach(part => {
    const [tone, duration] = part.split('/');
    const frequency = tone.includes('+') ? tone.split('+').map(Number).reduce((a, b) => a + b) / 2 : Number(tone); // Average frequency for superimposed tones
    frequencies.push(frequency || 0); // 0 frequency for silence
    durations.push(Number(duration));
  });

  return { frequencies, durations };
}

function playTone(toneString) {
  const { frequencies, durations } = parseToneString(toneString);
  createTone(frequencies, durations);
}
