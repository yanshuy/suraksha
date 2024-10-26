// src/screens/KeywordDetectionService.ts
import Voice from '@react-native-voice/voice';

class KeywordDetectionService {
  keyword: string;
  onKeywordDetected: () => void;

  constructor(keyword: string, onKeywordDetected: () => void) {
    this.keyword = keyword;
    this.onKeywordDetected = onKeywordDetected;

    // Set up voice event listeners
    Voice.onSpeechResults = this.handleSpeechResults;
  }

  startListening = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice detection', error);
    }
  };

  stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice detection', error);
    }
  };

  private handleSpeechResults = (event: any) => {
    const spokenText = event.value[0];
    if (spokenText.toLowerCase().includes(this.keyword.toLowerCase())) {
      this.onKeywordDetected();
      this.stopListening();
    }
  };
}

export default KeywordDetectionService;
