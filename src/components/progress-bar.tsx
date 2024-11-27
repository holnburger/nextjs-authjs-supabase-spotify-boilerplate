// components/progress-bar.tsx
"use client";

import { useEffect } from "react";
import { getSpotifyClient } from "@/utils/spotify";
import { AuthUser } from "@/auth";
import { useSpotifyStore } from "@/store/use-spotify-store";

interface ProgressBarProps {
  progressMs: number;
  durationMs: number;
  trackId: string;
  user: AuthUser;
}

export function ProgressBar({
  progressMs: initialProgressMs,
  durationMs,
  trackId,
  user,
}: ProgressBarProps) {
  const spotify = getSpotifyClient(user);
  const { progressMs, isPlaying, setCurrentTrack, updateProgress } =
    useSpotifyStore();

  // Initialize progress
  useEffect(() => {
    useSpotifyStore.getState().setProgressMs(initialProgressMs);
  }, [initialProgressMs]);

  // Handle progress updates
  useEffect(() => {
    let progressTimer: NodeJS.Timeout | null = null;
    let syncTimer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      // Update progress every 100ms
      progressTimer = setInterval(() => {
        updateProgress();
      }, 100);

      // Sync with Spotify every 15 seconds
      syncTimer = setInterval(async () => {
        try {
          const currentTrack = await spotify.player.getCurrentlyPlayingTrack();
          if (currentTrack?.item?.id === trackId) {
            setCurrentTrack(currentTrack);
          }
        } catch (error) {
          console.warn("Sync skipped");
        }
      }, 15000);
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
      if (syncTimer) clearInterval(syncTimer);
    };
  }, [isPlaying, trackId, spotify, setCurrentTrack, updateProgress]);

  const progressPercentage = Math.min((progressMs / durationMs) * 100, 100);

  return (
    <div className="mt-2 h-1 bg-zinc-700 rounded-full w-64">
      <div
        className="h-1 bg-green-500 rounded-full transition-all duration-100 ease-linear"
        style={{
          width: `${progressPercentage}%`,
        }}
      />
    </div>
  );
}
