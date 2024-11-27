"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Device, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SpotifyVolumeProps {
  spotifyClient: SpotifyApi;
}

interface SpotifyDevice extends Device {
  supports_volume: boolean;
}

interface ActiveDevice {
  id: string;
  volume: number;
  supportsVolume: boolean;
  name: string;
}

export function SpotifyVolume({ spotifyClient }: SpotifyVolumeProps) {
  const [volume, setVolume] = useState(50);
  const [previousVolume, setPreviousVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [activeDevice, setActiveDevice] = useState<ActiveDevice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveDevice = async () => {
      try {
        const devices = await spotifyClient.player.getAvailableDevices();
        const active = devices.devices.find(
          (device) => device.is_active
        ) as SpotifyDevice;

        if (active?.id) {
          setActiveDevice({
            id: active.id,
            volume: active.volume_percent ?? 0,
            supportsVolume: active.supports_volume,
            name: active.name,
          });

          if (active.supports_volume) {
            setVolume(active.volume_percent ?? 0);
            setIsMuted((active.volume_percent ?? 0) === 0);
          }
        } else {
          setActiveDevice(null);
        }
      } catch (error) {
        console.error("Failed to fetch active device");
        toast.error("Failed to connect to device");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveDevice();
    const interval = setInterval(fetchActiveDevice, 5000);
    return () => clearInterval(interval);
  }, [spotifyClient]);

  const handleVolumeChange = async (newVolume: number[]) => {
    if (!activeDevice?.id || !activeDevice.supportsVolume) return;

    try {
      const volumeValue = newVolume[0];
      setPreviousVolume(volume);
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
    if (!activeDevice?.id || !activeDevice.supportsVolume) return;

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-2 w-[120px] rounded-full" />
      </div>
    );
  }

  if (!activeDevice) {
    return null;
  }

  if (!activeDevice.supportsVolume) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-not-allowed opacity-50"
          disabled
        >
          <VolumeX className="h-5 w-5" />
        </Button>
        <span className="text-xs">Volume control not available</span>
      </div>
    );
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
          isMuted && "cursor-not-allowed opacity-70"
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
