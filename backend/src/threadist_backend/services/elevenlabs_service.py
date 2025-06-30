import os
import uuid
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from ..config import Config

class ElevenLabsService:
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.client = ElevenLabs(api_key=self.api_key)
        # Default voice ID for a good storytelling voice
        self.default_voice_id = "JBFqnCBsd6RMkjVDRZzb"  # This is a good storytelling voice
        
    async def text_to_speech_stream(self, text: str, voice_id: str = None) -> bytes:
        """
        Convert text to speech and return audio bytes for streaming
        """
        if not voice_id:
            voice_id = self.default_voice_id
            
        try:
            # Generate audio using the new client API with streaming
            response = self.client.text_to_speech.convert(
                voice_id=voice_id,
                output_format="mp3_22050_32",
                text=text,
                model_id="eleven_turbo_v2_5",  # use the turbo model for low latency
                voice_settings=VoiceSettings(
                    stability=0.0,
                    similarity_boost=1.0,
                    style=0.0,
                    use_speaker_boost=True,
                    speed=1.0,
                ),
            )
            
            # Convert response to bytes
            audio_bytes = b""
            for chunk in response:
                if chunk:
                    audio_bytes += chunk
            
            return audio_bytes
            
        except Exception as e:
            raise Exception(f"Error generating speech stream: {str(e)}")
    
    async def text_to_speech_file(self, text: str, voice_id: str = None) -> str:
        """
        Convert text to speech and save to file (for backward compatibility)
        """
        if not voice_id:
            voice_id = self.default_voice_id
            
        try:
            # Generate audio using the new client API
            response = self.client.text_to_speech.convert(
                voice_id=voice_id,
                output_format="mp3_22050_32",
                text=text,
                model_id="eleven_turbo_v2_5",  # use the turbo model for low latency
                voice_settings=VoiceSettings(
                    stability=0.0,
                    similarity_boost=1.0,
                    style=0.0,
                    use_speaker_boost=True,
                    speed=1.0,
                ),
            )

            # Generate a unique file name for the output MP3 file
            save_file_path = f"{uuid.uuid4()}.mp3"

            # Writing the audio to a file
            with open(save_file_path, "wb") as f:
                for chunk in response:
                    if chunk:
                        f.write(chunk)

            return save_file_path
            
        except Exception as e:
            raise Exception(f"Error generating speech: {str(e)}")
    
    async def get_available_voices(self):
        """
        Get list of available voices
        """
        try:
            voices = self.client.voices.get_all()
            return voices
        except Exception as e:
            raise Exception(f"Error getting voices: {str(e)}")
    
    def cleanup_temp_file(self, file_path: str):
        """
        Clean up temporary audio file
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error cleaning up temp file: {str(e)}") 