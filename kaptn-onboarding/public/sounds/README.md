# Background Sound Files

This directory should contain the ambient sound effects for the KAPTN onboarding experience.

## Required Files

You need to add two audio files to this directory:

1. **ocean-waves.mp3** - Gentle ocean waves lapping against a harbor
2. **seagulls.mp3** - Seagull calls (occasional, not constant)

## Where to Get Sound Files

### Option 1: Free Sound Libraries (Recommended)

**Freesound.org** (requires free account):
- Ocean waves: Search for "ocean harbor waves gentle"
- Seagulls: Search for "seagull harbor calls"
- Make sure to filter by "Creative Commons 0" license for unrestricted use

**YouTube Audio Library** (no account needed):
- Go to YouTube Studio > Audio Library
- Search for "ocean" and "seagulls"
- Download as MP3

**Pixabay** (no account needed):
- https://pixabay.com/sound-effects/
- Search for "ocean waves" and "seagull"
- All sounds are free for commercial use

### Option 2: AI-Generated Sounds

Use AI sound generators like:
- **ElevenLabs Sound Effects** (https://elevenlabs.io/sound-effects)
- **Stable Audio** by Stability AI

Prompts:
- "Gentle ocean waves lapping against wooden dock in a quiet harbor, peaceful, ambient loop"
- "Seagull calls at a harbor, distant and occasional, maritime atmosphere"

### Option 3: Record Your Own

If you have access to:
- Ocean or harbor sounds (use your phone to record)
- Use free audio editors like Audacity to loop and edit

## Audio Specifications

For best results:
- **Format**: MP3 (or OGG for better compression)
- **Bitrate**: 128-192 kbps (balance between quality and file size)
- **Length**:
  - Ocean waves: 30-60 seconds (will loop seamlessly)
  - Seagulls: 20-40 seconds (will loop)
- **Volume**: Normalized to -3dB to prevent clipping

## Converting to MP3

If you have audio in other formats (WAV, M4A, etc.):

```bash
# Using ffmpeg (install with: brew install ffmpeg or apt-get install ffmpeg)
ffmpeg -i input.wav -b:a 192k ocean-waves.mp3
ffmpeg -i input.wav -b:a 192k seagulls.mp3
```

## Testing

Once you add the files:
1. Start the dev server: `pnpm run dev`
2. Open the app in your browser
3. You should see a sound toggle button in the bottom-right corner
4. Click anywhere on the page to activate audio (browser autoplay policy)

The audio will play continuously throughout the onboarding experience with adjustable volume via the toggle button.
