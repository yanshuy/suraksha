import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import * as Audio from 'expo-av'; // Make sure to install expo-av
import { Alert } from 'react-native';

const Wakeword = () => {
  const [keyword, setKeyword] = useState('');
  const [recording, setRecording] = useState<null | Audio.Recording>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (granted) {
        const { recording } = await Audio.Recording.createAsync({
          // Recording settings (modify if needed)
          android: {
            extension: '.mp3',
            outputFormat: Audio.RecordingOptionsAndroid.OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RecordingOptionsAndroid.AUDIO_ENCODER_AAC,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RecordingOptionsIOS.IOS_AUDIO_RECORDING_FORMAT_M4A,
          },
        });
        setRecording(recording);
        setIsRecording(true);
      } else {
        Alert.alert('Permission not granted for audio recording');
      }
    } catch (error) {
      console.error('Error starting recording', error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); // Use the URI to save or upload the recording
      Alert.alert('Recording stopped', `Audio saved at: ${uri}`);
      // You can save the keyword and audio URI to your database here
    }
  };

  const handleSubmit = () => {
    if (keyword) {
      // Logic to save the keyword and the audio URI
      Alert.alert('Keyword Saved', `Your distress keyword "${keyword}" has been saved.`);
      // Optionally navigate back to the profile page
    } else {
      Alert.alert('Input Error', 'Please enter a keyword.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Set Your Distress Keyword</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your keyword"
        value={keyword}
        onChangeText={setKeyword}
      />
      
      {/* Recording Button */}
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        color="#FF6347" // Customize button color
      />
      
      {/* Submit Button */}
      <Button
        title="Submit"
        onPress={handleSubmit}
        color="#FF6347" // Customize button color
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default Wakeword;
