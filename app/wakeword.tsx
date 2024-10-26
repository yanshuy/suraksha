import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const Wakeword: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [keyword, setKeyword] = useState<string>('');
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const backgroundListeningRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (backgroundListeningRef.current) {
        clearInterval(backgroundListeningRef.current);
      }
    };
  }, []);

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant microphone permissions for continuous listening.');
      return false;
    }
    return true;
  };

  const startRecordingSample = async () => {
    try {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) return;

      console.log('Starting to record sample...');
      setIsRecordingSample(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecordingSample(false);
    }
  };

  const stopRecordingSample = async () => {
    try {
      setIsRecordingSample(false);
      setIsSaving(true);
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      console.log('Recording saved at', uri);

      if (uri) {
        await saveAudioToBackend(uri);
      }

      setRecording(null);
      Alert.alert('Sample Recorded', 'Your wake word sample has been saved successfully.');
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save the recording. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAudioToBackend = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'wakeword_sample.m4a',
      });
      formData.append('keyword', keyword);

      const response = await fetch('https://live-merely-drum.ngrok-free.app/save/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save audio on the server');
      }

      console.log('Audio saved successfully on the server');
    } catch (error) {
      console.error('Error saving audio to backend:', error);
      throw error;
    }
  };

  const startListeningForWakeWord = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    setIsListening(true);
    console.log("Listening for wake word...");

    // Simulating continuous listening and keyword detection
    backgroundListeningRef.current = setInterval(async () => {
      try {
        const response = await fetch('https://live-merely-drum.ngrok-free.app/verify/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keyword }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.detected) {
            sendSOSAlert();
          }
        }
      } catch (error) {
        console.error('Error verifying keyword:', error);
      }
    }, 5000); 
  };

  const stopListening = () => {
    setIsListening(false);
    if (backgroundListeningRef.current) {
      clearInterval(backgroundListeningRef.current);
    }
    console.log("Stopped listening.");
  };

  const sendSOSAlert = () => {
    Alert.alert("SOS Alert Sent!", "Wake word detected, sending SOS...");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Wakeword Setup</Text>
      
      <TextInput
        placeholder="Enter your distress keyword"
        value={keyword}
        onChangeText={setKeyword}
        style={styles.input}
        accessibilityLabel="Enter your distress keyword"
      />
      
      <TouchableOpacity
        style={[styles.button, isRecordingSample && styles.activeButton]}
        onPress={isRecordingSample ? stopRecordingSample : startRecordingSample}
        disabled={isSaving}
      >
        <Ionicons name={isRecordingSample ? "stop-circle" : "mic"} size={24} color="white" />
        <Text style={styles.buttonText}>
          {isRecordingSample ? 'Stop Recording' : 'Record Wakeword Sample'}
        </Text>
      </TouchableOpacity>

      {isSaving && <ActivityIndicator size="large" color="#0000ff" />}
      
      <TouchableOpacity
        style={[styles.button, isListening && styles.activeButton]}
        onPress={isListening ? stopListening : startListeningForWakeWord}
      >
        <Ionicons name={isListening ? "ear-off" : "ear"} size={24} color="white" />
        <Text style={styles.buttonText}>
          {isListening ? 'Stop Listening' : 'Start Listening for Wake Word'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.statusText}>
        {isListening ? 'Listening for wake word...' : 'Not listening'}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  activeButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Wakeword;