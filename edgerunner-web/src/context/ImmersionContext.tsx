import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { SOUND_STORAGE_KEY, soundEngine } from '../utils/sound';

export type VisualMode = 'immersive' | 'simplified';

interface ImmersionContextValue {
  visualMode: VisualMode;
  soundEnabled: boolean;
  reducedMotion: boolean;
  toggleVisualMode: () => void;
  toggleSound: () => void;
  toggleReducedMotion: () => void;
}

const VISUAL_MODE_KEY = 'afterhours_visual_mode';
const REDUCED_MOTION_KEY = 'afterhours_reduced_motion';

const ImmersionContext = createContext<ImmersionContextValue | undefined>(undefined);

export function ImmersionProvider({ children }: { children: ReactNode }) {
  const [visualMode, setVisualMode] = useState<VisualMode>(() => {
    const saved = localStorage.getItem(VISUAL_MODE_KEY);
    return saved === 'simplified' ? 'simplified' : 'immersive';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem(REDUCED_MOTION_KEY);
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Sincroniza classes no <html> para estilização condicional de alta performance
  useEffect(() => {
    const root = document.documentElement;
    if (visualMode === 'simplified') {
      root.classList.add('mode-simplified');
    } else {
      root.classList.remove('mode-simplified');
    }
    localStorage.setItem(VISUAL_MODE_KEY, visualMode);
  }, [visualMode]);

  useEffect(() => {
    localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem(REDUCED_MOTION_KEY, String(reducedMotion));
  }, [reducedMotion]);

  // Escuta alterações na preferência do sistema operacional (RF-120)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleVisualMode = () => {
    setVisualMode((prev) => {
      const next = prev === 'immersive' ? 'simplified' : 'immersive';
      soundEngine.playClick();
      return next;
    });
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      if (next) soundEngine.playClick();
      return next;
    });
  };

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => {
      const next = !prev;
      soundEngine.playClick();
      return next;
    });
  };

  return (
    <ImmersionContext.Provider
      value={{
        visualMode,
        soundEnabled,
        reducedMotion,
        toggleVisualMode,
        toggleSound,
        toggleReducedMotion,
      }}
    >
      {children}
    </ImmersionContext.Provider>
  );
}

export function useImmersion(): ImmersionContextValue {
  const ctx = useContext(ImmersionContext);
  if (!ctx) {
    throw new Error('useImmersion deve ser utilizado dentro de um ImmersionProvider');
  }
  return ctx;
}
