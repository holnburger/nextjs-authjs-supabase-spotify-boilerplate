// components/spotify-player.tsx
"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  SimplifiedArtist,
  Track,
  Episode,
  PlaybackState,
} from "@spotify/web-api-ts-sdk";
import { useSpotifyStore } from "@/store/use-spotify-store";
import { PlayButton } from "@/components/play-button";
import { ProgressBar } from "@/components/progress-bar";
import { AuthUser } from "@/auth";

interface SpotifyPlayerProps {
  initialPlaybackState: PlaybackState | null;
  user: AuthUser;
}

function isTrack(item: Track | Episode): item is Track {
  return (item as Track).album !== undefined;
}

export function SpotifyPlayer({
  initialPlaybackState,
  user,
}: SpotifyPlayerProps) {
  const setCurrentTrack = useSpotifyStore((state) => state.setCurrentTrack);

  // Initialize store with current playback state
  useEffect(() => {
    if (initialPlaybackState) {
      setCurrentTrack(initialPlaybackState);
    }
  }, [initialPlaybackState, setCurrentTrack]);

  const currentTrack = useSpotifyStore((state) => state.currentTrack);

  if (!currentTrack?.item || !isTrack(currentTrack.item)) {
    return null;
  }

  return (
    <div className="mb-12 p-6 bg-zinc-800/50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
      <div className="flex items-center gap-4">
        <Image
          src={currentTrack.item.album.images[0].url}
          alt={currentTrack.item.album.name}
          width={96}
          height={96}
          className="rounded-md"
        />
        <div>
          <h3 className="text-xl font-semibold">{currentTrack.item.name}</h3>
          <p className="text-zinc-400">
            {currentTrack.item.artists
              .map((artist: SimplifiedArtist) => artist.name)
              .join(", ")}
          </p>
          <ProgressBar
            progressMs={currentTrack.progress_ms}
            durationMs={currentTrack.item.duration_ms}
            trackId={currentTrack.item.id}
            user={user}
          />
        </div>
        <PlayButton trackId={currentTrack.item.id} user={user} />
      </div>
    </div>
  );
}
