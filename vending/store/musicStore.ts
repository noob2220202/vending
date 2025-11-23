import { create } from 'zustand';

interface MusicStore {
  audioRef: HTMLAudioElement | null;
  isMuted: boolean;
  isInitialized: boolean;
  initAudio: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

let handleInteraction: (() => void) | null = null;

export const useMusicStore = create<MusicStore>((set, get) => ({
  audioRef: null,
  isMuted: false,
  isInitialized: false,

  initAudio: () => {
    const state = get();
    if (state.audioRef) return;

    const audio = new Audio('/music.mp3');
    audio.loop = true;
    audio.volume = 0.5;

    const playAudio = () => {
      const currentState = get();
      if (audio && !currentState.isInitialized) {
        audio.play()
          .then(() => {
            set({ isInitialized: true });
            if (handleInteraction) {
              document.removeEventListener('click', handleInteraction);
              document.removeEventListener('keydown', handleInteraction);
              document.removeEventListener('touchstart', handleInteraction);
              handleInteraction = null;
            }
          })
          .catch(console.error);
      }
    };

    handleInteraction = () => {
      playAudio();
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    set({ audioRef: audio });
  },

  toggleMute: () => {
    const state = get();
    if (!state.audioRef) {
      return;
    }
    const newMutedState = !state.isMuted;
    state.audioRef.muted = newMutedState;
    set({ isMuted: newMutedState });
  },

  setMuted: (muted: boolean) => {
    const state = get();
    if (state.audioRef) {
      state.audioRef.muted = muted;
      set({ isMuted: muted });
    }
  },
}));

