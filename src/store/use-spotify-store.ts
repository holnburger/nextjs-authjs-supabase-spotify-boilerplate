// store/use-spotify-store.ts
import { create } from "zustand";
import type { PlaybackState } from "@spotify/web-api-ts-sdk";

interface SpotifyState {
  currentTrack: PlaybackState | null;
  isPlaying: boolean;
  progressMs: number;
  activeTrackId: string | null;
  setCurrentTrack: (track: PlaybackState | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setProgressMs: (progress: number) => void;
  updateProgress: () => void;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  progressMs: 0,
  activeTrackId: null,
  setCurrentTrack: (track) =>
    set({
      currentTrack: track,
      isPlaying: track?.is_playing ?? false,
      progressMs: track?.progress_ms ?? 0,
      activeTrackId: track?.item?.id ?? null,
    }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgressMs: (progressMs) => set({ progressMs }),
  updateProgress: () =>
    set((state) => ({
      progressMs: state.isPlaying
        ? Math.min(
            state.progressMs + 100,
            state.currentTrack?.item?.duration_ms ?? 0
          )
        : state.progressMs,
    })),
}));
