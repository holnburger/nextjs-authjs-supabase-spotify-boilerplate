import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { AuthUser } from "@/auth";

export function getSpotifyClient(user: AuthUser) {
  return SpotifyApi.withAccessToken(user.token_type, {
    access_token: user.access_token,
    expires_in: Number.MAX_SAFE_INTEGER, // Effectively disable SDK refresh
    refresh_token: user.refresh_token,
    token_type: user.token_type,
  });
}
