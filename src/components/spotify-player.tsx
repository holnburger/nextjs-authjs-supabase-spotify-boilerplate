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
import { DevicePicker } from "@/components/device-picker";
import { SpotifyVolume } from "@/components/volume-control";
import { getSpotifyClient } from "@/utils/spotify";

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
  const currentTrack = useSpotifyStore((state) => state.currentTrack);
  const spotifyClient = getSpotifyClient(user);

  useEffect(() => {
    if (initialPlaybackState) {
      setCurrentTrack(initialPlaybackState);
    }
  }, [initialPlaybackState, setCurrentTrack]);

  if (!currentTrack?.item || !isTrack(currentTrack.item)) {
    return null;
  }

  return (
    <div className="p-4 relative">
      <div className="mx-auto max-w-7xl flex flex-col">
        <div className="flex flex-col items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full flex-1">
            <Image
              src={currentTrack.item.album.images[0].url}
              alt={currentTrack.item.album.name}
              width={128}
              height={128}
              className="shadow-lg"
            />
            <div className="min-w-0 flex-1 relative">
              <h2 className="font-semibold text-sm text-foreground truncate">
                {currentTrack.item.name}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {currentTrack.item.artists
                  .map((artist: SimplifiedArtist) => artist.name)
                  .join(", ")}
              </p>
              <div className="w-full">
                <ProgressBar
                  progressMs={currentTrack.progress_ms}
                  durationMs={currentTrack.item.duration_ms}
                  trackId={currentTrack.item.id}
                  user={user}
                />
              </div>
            </div>
            <div className="flex items-center">
              <PlayButton trackId={currentTrack.item.id} user={user} />
              <DevicePicker spotifyClient={spotifyClient} />
            </div>
          </div>
          <div className="flex items-center justify-end w-full">
            <SpotifyVolume spotifyClient={spotifyClient} />
          </div>
        </div>
      </div>
    </div>
  );
}
