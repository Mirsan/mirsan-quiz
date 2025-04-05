import buzzSound from '@/assets/sounds/buzz.mp3';
import badSound from '@/assets/sounds/bad.mp3';
import goodSound from '@/assets/sounds/good.mp3';
import introSound from '@/assets/sounds/intro.mp3';
import roundSound from '@/assets/sounds/round.mp3';
import pauseSound from '@/assets/sounds/win.mp3';
import outroSound from '@/assets/sounds/outro.mp3';
import clappingSound from '@/assets/sounds/clapping.mp3';

export function useAudioManager() {
  // Inicjalizacja obiektów Audio
  const audioFiles = {
    buzz: new Audio(buzzSound),
    bad: new Audio(badSound),
    good: new Audio(goodSound),
    intro: new Audio(introSound),
    round: new Audio(roundSound),
    pause: new Audio(pauseSound),
    outro: new Audio(outroSound),
    clapping: new Audio(clappingSound)
  };

  // Ustawienie głośności dla wszystkich dźwięków
  Object.values(audioFiles).forEach(audio => {
    audio.volume = 0.7;
  });

  // Funkcja do odtwarzania dźwięku
  const play = (soundName) => {
    if (!audioFiles[soundName]) {
      console.error(`Dźwięk "${soundName}" nie istnieje`);
      return;
    }

    // Zatrzymaj dźwięk jeśli jest już odtwarzany
    audioFiles[soundName].pause();
    audioFiles[soundName].currentTime = 0;
    
    // Odtwórz dźwięk
    audioFiles[soundName].play().catch(error => {
      console.error(`Błąd odtwarzania dźwięku "${soundName}":`, error);
    });
  };

  // Funkcja do zatrzymania wszystkich dźwięków
  const stopAll = () => {
    Object.values(audioFiles).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  // Funkcja do ustawienia głośności dla wszystkich dźwięków
  const setVolume = (volume) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    Object.values(audioFiles).forEach(audio => {
      audio.volume = normalizedVolume;
    });
  };

  return {
    play,
    stopAll,
    setVolume,
    // Funkcje pomocnicze dla konkretnych dźwięków
    playBuzz: () => play('buzz'),
    playBad: () => play('bad'),
    playGood: () => play('good'),
    playIntro: () => play('intro'),
    playRound: () => play('round'),
    playPause: () => play('pause'),
    playOutro: () => play('outro'),
    playClapping: () => play('clapping')
  };
} 