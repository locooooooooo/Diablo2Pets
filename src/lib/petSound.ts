export type PetSoundKind = 'unlock' | 'rare' | 'mastery';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const Context =
    window.AudioContext ||
    // @ts-expect-error webkit prefix fallback
    window.webkitAudioContext;

  if (!Context) {
    return null;
  }

  if (!audioContext) {
    audioContext = new Context();
  }

  return audioContext;
}

function scheduleTone(
  context: AudioContext,
  startAt: number,
  frequency: number,
  duration: number,
  volume: number
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

export function playPetChime(kind: PetSoundKind) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  if (context.state === 'suspended') {
    void context.resume();
  }

  const startAt = context.currentTime + 0.02;

  const pattern =
    kind === 'mastery'
      ? [
          [523.25, 0.18, 0.03],
          [659.25, 0.22, 0.038],
          [880, 0.34, 0.045]
        ]
      : kind === 'rare'
        ? [
            [392, 0.16, 0.024],
            [587.33, 0.22, 0.032],
            [783.99, 0.3, 0.04]
          ]
        : [
            [523.25, 0.16, 0.02],
            [659.25, 0.24, 0.028]
          ];

  pattern.forEach(([frequency, offset, volume]) => {
    scheduleTone(context, startAt + offset, frequency, 0.22, volume);
  });
}
