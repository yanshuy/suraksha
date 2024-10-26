"use client";

import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECORDING_DURATION = 30; // 30 seconds

export default function SOSPage() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const navigation = useNavigation();
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
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);

      // Set timer to auto-stop after 30 seconds
      timerRef.current = setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION * 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        await saveRecording(uri);
        await sendRecordingToBackend(uri);
        Alert.alert("Success", "Recording saved and sent successfully");
      }

      // Clear the auto-stop timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const saveRecording = async (uri: string) => {
    try {
      const recordings = await AsyncStorage.getItem("recordings");
      const currentRecordings = recordings ? JSON.parse(recordings) : [];
      const newRecording = {
        id: Date.now().toString(),
        uri: uri,
        date: new Date().toISOString().split("T")[0],
      };
      const updatedRecordings = [...currentRecordings, newRecording];
      await AsyncStorage.setItem(
        "recordings",
        JSON.stringify(updatedRecordings)
      );
    } catch (error) {
      console.error("Failed to save recording", error);
      Alert.alert("Error", "Failed to save recording");
    }
  };

  const sendRecordingToBackend = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);
      formData.append("latitude", lat?.toString() || "");
      formData.append("longitude", long?.toString() || "");

      const response = await fetch(
        "https://live-merely-drum.ngrok-free.app/sos/add/",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMDAxMjU1LCJpYXQiOjE3Mjk5MTQ4NTUsImp0aSI6IjNjYzI1NGY1M2Q1NzQ5NTQ4NzNhZjU5ZWM1YTVmNDNlIiwidXNlcl9pZCI6MX0.ohIS84_s_8DTM3s5eWH-36rW6ob6lhM4bIXHe6ytwz8",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send recording to backend");
      }

      console.log("Recording sent to backend successfully");
    } catch (error) {
      console.error("Failed to send recording to backend", error);
      Alert.alert("Error", "Failed to send recording to backend");
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
      <Button
        title="login"
        onPress={() => navigation.navigate("login" as never)}
      />
      <TouchableOpacity
        style={[
          styles.sosButton,
          recording && styles.recordingButton,
          recording ? { flexDirection: "column" } : { flexDirection: "row" },
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <FontAwesome
          name={recording ? "stop-circle" : ""}
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
  recordingsButton: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#0074D9",
    borderRadius: 5,
  },
  recordingsButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
