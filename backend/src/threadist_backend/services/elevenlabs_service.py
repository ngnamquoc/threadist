import os
import tempfile
import aiofiles
from elevenlabs import generate, save, set_api_key
from elevenlabs.api import History
from ..config import Config

class ElevenLabsService:
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        set_api_key(self.api_key)
        # Default voice ID for a good storytelling voice
        self.default_voice_id = "JBFqnCBsd6RMkjVDRZzb"  # This is a good storytelling voice
        
    async def text_to_speech(self, text: str, voice_id: str = None) -> str:
        """
        Convert text to speech and return the file path
        """
        if not voice_id:
            voice_id = self.default_voice_id
            
        try:
            # Generate audio
            audio = generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            temp_path = temp_file.name
            temp_file.close()
            
            # Save audio to file
            save(audio, temp_path)
            
            return temp_path
            
        except Exception as e:
            raise Exception(f"Error generating speech: {str(e)}")
    
    async def text_to_speech_stream(self, text: str, voice_id: str = None) -> bytes:
        """
        Convert text to speech and return audio bytes for streaming
        """
        if not voice_id:
            voice_id = self.default_voice_id
            
        try:
            # Generate audio
            audio = generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            
            # Convert to bytes
            audio_bytes = audio.read()
            
            return audio_bytes
            
        except Exception as e:
            raise Exception(f"Error generating speech stream: {str(e)}")
    
    async def get_available_voices(self):
        """
        Get list of available voices
        """
        try:
            from elevenlabs import voices
            available_voices = voices()
            return available_voices
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