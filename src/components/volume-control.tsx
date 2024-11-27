"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpotifyVolumeProps {
  spotifyClient: SpotifyApi;
}

export function SpotifyVolume({ spotifyClient }: SpotifyVolumeProps) {
  const [volume, setVolume] = useState(50);
  const [previousVolume, setPreviousVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [activeDevice, setActiveDevice] = useState<{
    id: string;
    volume: number;
  } | null>(null);

  useEffect(() => {
    const fetchActiveDevice = async () => {
      try {
        const devices = await spotifyClient.player.getAvailableDevices();
        const active = devices.devices.find((device) => device.is_active);

        if (active?.id && active.volume_percent !== null) {
          setActiveDevice({ id: active.id, volume: active.volume_percent });
          setVolume(active.volume_percent);
          setIsMuted(active.volume_percent === 0);
        }
      } catch (error) {
        console.error("Failed to fetch active device");
      }
    };

    fetchActiveDevice();
    const interval = setInterval(fetchActiveDevice, 5000);
    return () => clearInterval(interval);
  }, [spotifyClient]);

  const handleVolumeChange = async (newVolume: number[]) => {
    if (!activeDevice?.id) return;

    try {
      const volumeValue = newVolume[0];
      setVolume(volumeValue);
      setIsMuted(volumeValue === 0);

      await spotifyClient.player.setPlaybackVolume(
        volumeValue,
        activeDevice.id
      );
    } catch (error) {
      toast.error("Failed to adjust volume");
      setVolume(previousVolume);
    }
  };

  const toggleMute = async () => {
    if (!activeDevice?.id) return;

    try {
      if (isMuted) {
        await spotifyClient.player.setPlaybackVolume(
          previousVolume,
          activeDevice.id
        );
        setVolume(previousVolume);
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        await spotifyClient.player.setPlaybackVolume(0, activeDevice.id);
        setVolume(0);
        setIsMuted(true);
      }
    } catch (error) {
      toast.error("Failed to toggle mute");
    }
  };

  if (!activeDevice) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggleMute}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>
      <Slider
        className={cn(
          "relative w-[120px]",
          volume === 0 && "cursor-not-allowed opacity-70"
        )}
        defaultValue={[volume]}
        value={[volume]}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
      />
    </div>
  );
}
