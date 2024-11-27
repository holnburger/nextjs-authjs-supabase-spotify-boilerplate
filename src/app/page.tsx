import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSpotifyClient } from "@/utils/spotify";
import { SpotifyPlayer } from "@/components/spotify-player";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const spotify = getSpotifyClient(session.user);

  const [currentlyPlaying, profile] = await Promise.all([
    spotify.player.getCurrentlyPlayingTrack().catch(() => null),
    spotify.currentUser.profile().catch(() => null),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        {profile && (
          <div className="mb-12 flex items-center gap-6">
            {profile.images?.[0]?.url && (
              <Image
                src={profile.images[0].url}
                alt={profile.display_name}
                width={128}
                height={128}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {profile.display_name}
              </h1>
              <p className="text-zinc-400">
                {profile.followers.total} followers • {profile.country}
              </p>
            </div>
          </div>
        )}

        {/* Player Section */}
        <SpotifyPlayer
          initialPlaybackState={currentlyPlaying}
          user={session.user}
        />

        {/* Debug Section */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-zinc-800/30 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Debug Info</h2>
            <pre className="overflow-auto text-sm">
              <code>{JSON.stringify({ session }, null, 2)}</code>
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
