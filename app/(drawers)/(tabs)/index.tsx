"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

const RECORDING_DURATION = 30; // 30 seconds

export default function SOSPage() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (recording) {
      interval = setInterval(() => {
        setDuration((prevDuration) => {
          if (prevDuration >= RECORDING_DURATION - 1) {
            stopRecording();
            return RECORDING_DURATION;
          }
          return prevDuration + 1;
        });
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (!permissionResponse.granted) {
        throw new Error("Permissions not granted");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync({
        isMeteringEnabled: true,
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}, // Add this line
      });

      setRecording(recording);
      console.log("Recording started");

      timerRef.current = setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION * 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const sendRecordingToBackend = async (fileUri: string) => {
    try {
      console.log("Preparing to send recording...");
      console.log("File URI:", fileUri);

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log("File info:", fileInfo);

      if (!fileInfo.exists) {
        throw new Error("Recording file does not exist");
      }

      // Read the file as base64
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create a Blob from the base64 data
      const byteCharacters = atob(base64Audio);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const audioBlob = new Blob(byteArrays, { type: "audio/m4a" });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.m4a");
      formData.append("latitude", "1");
      formData.append("longitude", "2");

      console.log("Sending request...");

      const response = await fetch(
        "https://live-merely-drum.ngrok-free.app/sos/add/",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMDAxMjU1LCJpYXQiOjE3Mjk5MTQ4NTUsImp0aSI6IjNjYzI1NGY1M2Q1NzQ5NTQ4NzNhZjU5ZWM1YTVmNDNlIiwidXNlcl9pZCI6MX0.ohIS84_s_8DTM3s5eWH-36rW6ob6lhM4bIXHe6ytwz8",
          },
          body: formData,
        }
      );

      const responseText = await response.text();
      console.log("Server response:", responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      console.log("Recording sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending recording:", error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log("No recording to stop");
      return;
    }

    try {
      console.log("Stopping recording..");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped at uri:", uri);
      setRecording(null);

      if (!uri) {
        throw new Error("No recording URI available");
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log("File info after recording:", fileInfo);

      if (!fileInfo.exists) {
        throw new Error("Recording file not found");
      }

      await sendRecordingToBackend(uri);
      Alert.alert("Success", "Recording saved and sent successfully");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
      Alert.alert("Error", "Failed to process recording. Please try again.");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.sosButton,
          recording && styles.recordingButton,
          recording ? { flexDirection: "column" } : { flexDirection: "row" },
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <FontAwesome
          name={recording ? "stop-circle" : "exclamation-triangle"}
          size={80}
          color="white"
        />
        <Text
          style={
            recording
              ? {
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "white",
                }
              : {
                  fontSize: 42,
                  fontWeight: "bold",
                  color: "white",
                }
          }
        >
          {recording ? "Stop" : "SOS"}
        </Text>
      </TouchableOpacity>
      {recording && (
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingButton: {
    backgroundColor: "#FF851B",
  },
  durationText: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
});
