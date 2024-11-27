// components/spotify-container.tsx
import { getSpotifyClient } from "@/utils/spotify";
import { SpotifyPlayer } from "./spotify-player";
import { AuthUser } from "@/auth";
import { PlaybackState } from "@spotify/web-api-ts-sdk";

interface SpotifyContainerProps {
  currentlyPlaying: PlaybackState | null; // Changed from currentPlaybackState
  user: AuthUser;
}

export default async function SpotifyContainer({
  currentlyPlaying,
  user,
}: SpotifyContainerProps) {
  if (!currentlyPlaying) {
    const spotify = getSpotifyClient(user);
    const recentlyPlayed = await spotify.player.getRecentlyPlayedTracks(1);

    if (recentlyPlayed.items.length > 0) {
      const lastPlayedState: PlaybackState = {
        device: {
          id: recentlyPlayed.items[0].context?.uri || "",
          is_active: false,
          volume_percent: 100,
          name: "Last Device",
          type: "Computer",
          is_private_session: false,
          is_restricted: false,
        },
        repeat_state: "off",
        shuffle_state: false,
        context: recentlyPlayed.items[0].context,
        timestamp: recentlyPlayed.items[0].played_at
          ? new Date(recentlyPlayed.items[0].played_at).getTime()
          : Date.now(),
        progress_ms: 0,
        is_playing: false,
        item: recentlyPlayed.items[0].track,
        currently_playing_type: "track",
        actions: {
          interrupting_playback: false,
          pausing: false,
          resuming: false,
          seeking: false,
          skipping_next: false,
          skipping_prev: false,
          toggling_repeat_context: false,
          toggling_shuffle: false,
          toggling_repeat_track: false,
          transferring_playback: false,
        },
      };
      return (
        <SpotifyPlayer initialPlaybackState={lastPlayedState} user={user} />
      );
    }
  }

  return <SpotifyPlayer initialPlaybackState={currentlyPlaying} user={user} />;
}
