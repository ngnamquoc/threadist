# Streaming Audio Guide

This guide explains how to use the new streaming audio functionality in Threadist.

## Overview

The Threadist backend now supports streaming audio responses directly from ElevenLabs, eliminating the need to save audio files to disk. This provides:

- **Faster response times**: No file I/O operations
- **Lower latency**: Direct streaming from TTS service
- **Better resource management**: No temporary files to clean up
- **Improved user experience**: Audio starts playing immediately

## Backend Changes

### New Streaming Endpoint

**POST** `/api/tts/stream`

This endpoint streams audio directly from text without saving files.

**Request Body:**
```json
{
  "text": "Your story text here",
  "voice_id": "optional_voice_id",
  "model_id": "eleven_turbo_v2_5",
  "output_format": "mp3_22050_32"
}
```

**Response:**
- **Content-Type**: `audio/mpeg`
- **Body**: Raw audio data as MP3 bytes
- **Headers**: 
  - `Content-Disposition: attachment; filename=audio.mp3`
  - `Content-Length: <audio_size>`

### Updated ElevenLabs Service

The `ElevenLabsService` class has been updated to use the new ElevenLabs client API:

- `text_to_speech_stream()`: Returns audio bytes for streaming
- `text_to_speech_file()`: Saves to file (for backward compatibility)
- Updated voice settings for better storytelling quality

### Backward Compatibility

The original `/api/tts/generate` endpoint still works for file-based audio generation, ensuring existing code continues to function.

## Frontend Changes

### New API Method

```typescript
// Stream audio directly
const audioDataUrl = await apiService.streamAudio(text, voiceId);
```

### Updated Audio Service

```typescript
// Load audio from stream
await audioService.loadAudioStream(text, voiceId, story);
```

### Usage Example

```typescript
import { audioService } from '../services/audioService';

// Load and play audio from stream
const success = await audioService.loadAudioStream(
  "Once upon a time, there was a magical story...",
  "JBFqnCBsd6RMkjVDRZzb" // Optional voice ID
);

if (success) {
  await audioService.play();
}
```

## Testing

### Backend Testing

Run the test script to verify streaming functionality:

```bash
cd backend
python test_api.py
```

This will test both the file-based and streaming endpoints.

### Manual Testing

1. **Start the backend server:**
   ```bash
   cd backend
   python run.py
   ```

2. **Test streaming endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/tts/stream \
     -H "Content-Type: application/json" \
     -d '{"text": "This is a test story for streaming audio."}' \
     --output test_audio.mp3
   ```

3. **Verify the audio file was created and contains valid MP3 data**

## Configuration

### Environment Variables

Ensure your `.env` file contains:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Voice Settings

The default voice settings are optimized for storytelling:

- **Stability**: 0.0 (more expressive)
- **Similarity Boost**: 1.0 (maintains voice consistency)
- **Style**: 0.0 (neutral style)
- **Speaker Boost**: true (enhanced clarity)
- **Speed**: 1.0 (normal speed)

## Performance Considerations

### Latency Optimization

- Uses `eleven_turbo_v2_5` model for faster generation
- Streams audio in chunks for immediate playback
- No file system operations during generation

### Memory Usage

- Audio is streamed directly without buffering entire file
- Data URLs are created for React Native consumption
- Automatic memory management by React Native runtime

### Error Handling

- Graceful fallback to file-based generation if streaming fails
- Proper error messages for debugging
- Timeout handling for long text inputs

## Migration Guide

### From File-Based to Streaming

1. **Replace API calls:**
   ```typescript
   // Old way
   const audioResponse = await apiService.generateAudio(text);
   const audioUrl = apiService.getAudioUrl(audioResponse.audio_url);
   
   // New way
   const audioDataUrl = await apiService.streamAudio(text);
   // audioDataUrl is already a valid URI for React Native
   ```

2. **Update audio loading:**
   ```typescript
   // Old way
   await audioService.loadAudio(text, story);
   
   // New way
   await audioService.loadAudioStream(text, voiceId, story);
   ```

3. **No cleanup needed:**
   ```typescript
   // Data URLs are automatically managed by React Native
   // No manual cleanup required
   ```

## Troubleshooting

### Common Issues

1. **Audio not playing:**
   - Check ElevenLabs API key validity
   - Verify network connectivity
   - Ensure text length is under 5000 characters

2. **Streaming errors:**
   - Check backend logs for detailed error messages
   - Verify ElevenLabs service status
   - Ensure proper CORS configuration

3. **Memory leaks:**
   - Data URLs are automatically managed by React Native
   - Unload audio properly before loading new content
   - No manual cleanup of URLs required

### Debug Mode

Enable debug logging in the backend:

```bash
DEBUG=True python run.py
```

This will provide detailed information about streaming operations.

## Future Enhancements

- **Real-time streaming**: Stream audio as it's generated
- **Voice selection UI**: Allow users to choose different voices
- **Audio caching**: Cache frequently requested audio
- **Quality settings**: Allow users to adjust audio quality vs. speed 