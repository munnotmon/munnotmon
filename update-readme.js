import fetch from "node-fetch";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function fetchCurrentlyPlaying(accessToken) {
  const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 200) {
    const data = await response.json();
    if (data.item) {
      const song = data.item.name;
      const artist = data.item.artists.map(artist => artist.name).join(", ");
      return `🎵 Sedang mendengarkan **${song}** oleh **${artist}**`;
    }
  }
  return "🎵 Tidak ada lagu yang sedang diputar.";
}

async function updateReadme() {
  const accessToken = await getAccessToken();
  const nowPlaying = await fetchCurrentlyPlaying(accessToken);
  const readmeContent = `# Spotify Now Playing\n\n${nowPlaying}\n\n_(Diperbarui secara otomatis)_`;

  fs.writeFileSync("README.md", readmeContent);
}

updateReadme();
