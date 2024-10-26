// Wakeword.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import { Audio } from 'expo-av';

const Wakeword = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [keyword, setKeyword] = useState<string>('');
  const [detectedKeyword, setDetectedKeyword] = useState<string>('');

  // Function to request microphone permission
  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant microphone permissions for continuous listening.');
      return false;
    }
    return true;
  };

  // Function to start recording a sample
  const startRecordingSample = async () => {
    try {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) return;

      console.log('Starting to record sample...');

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RecordingOptionsAndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.RecordingOptionsAndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.caf',
          audioQuality: Audio.RecordingOptionsIOSAudioQuality.High,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const newRecording = await Audio.Recording.createAsync(recordingOptions);
      setRecording(newRecording.recording);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Function to stop recording and save the sample
  const stopRecordingSample = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      console.log('Recording saved at', uri);
      // Use the URI to save or process the recording for model training
      setRecording(null);
      Alert.alert('Sample Recorded', `Your sample has been saved at: ${uri}`);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  // Function to start listening for the wake word
  const startListeningForWakeWord = async () => {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    setIsListening(true);
    console.log("Listening for wake word...");

    // Placeholder for actual keyword detection logic
    // For demonstration, we simulate wake word detection with a timeout
    setTimeout(() => {
      if (keyword.toLowerCase() === detectedKeyword.toLowerCase()) {
        sendSOSAlert();
      }
    }, 10000); // Simulate detection after 10 seconds
  };

  // Function to stop listening
  const stopListening = () => {
    setIsListening(false);
    console.log("Stopped listening.");
  };

  // Function to trigger SOS alert
  const sendSOSAlert = () => {
    if (isListening) {
      Alert.alert("SOS Alert Sent!", "Wake word detected, sending SOS...");
      // Additional SOS logic (e.g., API call, notification)
    }
  };

  // Effect to start listening for the wake word when the component mounts
  useEffect(() => {
    startListeningForWakeWord();

    return () => {
      stopListening();
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Wakeword Detection</Text>
      
      {/* Input field for the distress keyword */}
      <TextInput
        placeholder="Type your distress keyword"
        value={keyword}
        onChangeText={setKeyword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      {/* Button to record a sample */}
      <Button
        title={recording ? 'Stop Recording Sample' : 'Record Wakeword Sample'}
        onPress={recording ? stopRecordingSample : startRecordingSample}
      />
      
      {/* Toggle listening for wake word */}
      <Button
        title={isListening ? 'Stop Listening' : 'Start Listening for Wake Word'}
        onPress={isListening ? stopListening : startListeningForWakeWord}
      />

      <Text>{isListening ? 'Listening for wake word...' : 'Not listening'}</Text>
    </View>
  );
};

export default Wakeword;
