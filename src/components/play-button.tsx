"use client";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSpotifyClient } from "@/utils/spotify";
import { AuthUser } from "@/auth";
import { useSpotifyStore } from "@/store/use-spotify-store";
import { PlaybackState } from "@spotify/web-api-ts-sdk";

interface PlayButtonProps {
  trackId: string;
  user: AuthUser;
}

export function PlayButton({ trackId, user }: PlayButtonProps) {
  const spotify = getSpotifyClient(user);
  const {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    activeTrackId,
    setIsPlaying,
  } = useSpotifyStore();

  const isThisTrackPlaying = isPlaying && activeTrackId === trackId;

  const handlePlaybackError = (error: Error) => {
    let errorMessage = "Playback failed";
    if (error.message.includes("NO_ACTIVE_DEVICE")) {
      errorMessage =
        "No active Spotify device found. Please open Spotify on a device.";
    } else if (error.message.includes("PREMIUM_REQUIRED")) {
      errorMessage = "Premium required for playback control";
    } else if (error.message.includes("INVALID_AUTHENTICATION")) {
      errorMessage = "Session expired. Please sign in again.";
    }
    toast.error("Playback Error", {
      description: errorMessage,
    });
  };

  const getActiveDevice = async (): Promise<string> => {
    const devices = await spotify.player.getAvailableDevices();
    const activeDevice = devices.devices.find((device) => device.is_active);
    if (activeDevice?.id) return activeDevice.id;
    if (devices.devices[0]?.id) return devices.devices[0].id;
    throw new Error("NO_ACTIVE_DEVICE");
  };

  const updatePlaybackState = async () => {
    try {
      const currentPlayback = await spotify.player.getCurrentlyPlayingTrack();
      if (currentPlayback) {
        setCurrentTrack(currentPlayback);
        setIsPlaying(currentPlayback.is_playing);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error updating playback state:", error);
    }
  };

  const handlePlay = async () => {
    try {
      const deviceId = await getActiveDevice();
      if (activeTrackId === trackId && !isPlaying) {
        // Resume current track
        setIsPlaying(true);
        await spotify.player.startResumePlayback(deviceId);
      } else {
        // Play new track
        setCurrentTrack({
          is_playing: true,
          progress_ms: 0,
          item: { id: trackId, duration_ms: 0 },
        } as PlaybackState);
        setIsPlaying(true);
        await spotify.player.startResumePlayback(deviceId, undefined, [
          `spotify:track:${trackId}`,
        ]);
      }
      await updatePlaybackState();
    } catch (error) {
      handlePlaybackError(error as Error);
    }
  };

  const handlePause = async () => {
    try {
      const deviceId = await getActiveDevice();
      setIsPlaying(false);
      await spotify.player.pausePlayback(deviceId);
      await updatePlaybackState();
    } catch (error) {
      handlePlaybackError(error as Error);
    }
  };

  useEffect(() => {
    const syncInterval = setInterval(() => {
      updatePlaybackState();
    }, 5000);
    return () => clearInterval(syncInterval);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isThisTrackPlaying ? handlePause : handlePlay}
      title={isThisTrackPlaying ? "Pause" : "Play"}
    >
      {isThisTrackPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}
