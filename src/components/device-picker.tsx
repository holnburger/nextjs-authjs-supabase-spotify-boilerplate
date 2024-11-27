"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Computer, Smartphone, Speaker, Tv } from "lucide-react";
import { Device, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { toast } from "sonner";

interface DevicePickerProps {
  spotifyClient: SpotifyApi;
}

export function DevicePicker({ spotifyClient }: DevicePickerProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await spotifyClient.player.getAvailableDevices();
        setDevices(response.devices);

        const activeDevice = response.devices.find(
          (device) => device.is_active
        );
        if (activeDevice?.id) {
          setCurrentDeviceId(activeDevice.id);
        } else if (response.devices.length > 0 && response.devices[0].id) {
          setCurrentDeviceId(response.devices[0].id);
        }
      } catch (error) {
        toast.error("Failed to load available devices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, [spotifyClient]);

  const handleDeviceSelect = async (deviceId: string) => {
    try {
      await spotifyClient.player.transferPlayback([deviceId]);
      setCurrentDeviceId(deviceId);
      const selectedDevice = devices.find((device) => device.id === deviceId);
      toast.success(
        `Playback transferred to ${selectedDevice?.name || "selected device"}`
      );
    } catch (error) {
      toast.error("Failed to transfer playback");
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "computer":
        return <Computer className="h-4 w-4" />;
      case "smartphone":
        return <Smartphone className="h-4 w-4" />;
      case "speaker":
        return <Speaker className="h-4 w-4" />;
      case "tv":
        return <Tv className="h-4 w-4" />;
      default:
        return <Speaker className="h-4 w-4" />;
    }
  };

  const activeDevice = devices.find((device) => device.id === currentDeviceId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="">
        {/* {getDeviceIcon(activeDevice?.type || "speaker")} */}
        <Speaker className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        {devices.length > 0 ? (
          devices.map((device) => (
            <DropdownMenuItem
              key={device.id}
              onClick={() => device.id && handleDeviceSelect(device.id)}
              className={`flex items-center space-x-2 py-2 px-3
                ${device.is_active ? "bg-secondary" : "hover:bg-primary"}`}
            >
              <span
                className={
                  device.is_active ? "text-foreground" : "text-muted-foreground"
                }
              >
                {getDeviceIcon(device.type)}
              </span>
              <div className="flex flex-col">
                <span
                  className={`font-medium ${
                    device.is_active
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {device.name}
                </span>
                {device.is_active && (
                  <span className="text-xs text-emerald-400">
                    Currently playing
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="py-3 px-2 text-center text-sm text-muted-foreground">
            No available devices
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
