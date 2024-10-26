import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  ScrollView,
  Linking,
} from "react-native";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const RECORDING_DURATION = 30; // 30 seconds

const EMERGENCY_NUMBERS = [
  { name: "Police", number: "100" },
  { name: "Women Helpline", number: "1091" },
  { name: "Ambulance", number: "102" },
];

const SAFETY_TIPS = [
  "Stay aware of your surroundings",
  "Share your location with trusted contacts",
  "Learn basic self-defense techniques",
  "Trust your instincts",
  "Keep emergency numbers handy",
];

export default function SOSPage() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pingAnimation = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(pingAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pingAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [pingAnimation]);

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        "https://live-merely-drum.ngrok-free.app/sos/addlat/",
        {
          method: "POST",
          body: JSON.stringify({
            uri,
            latitude,
            longitude,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMDAxMjU1LCJpYXQiOjE3Mjk5MTQ4NTUsImp0aSI6IjNjYzI1NGY1M2Q1NzQ5NTQ4NzNhZjU5ZWM1YTVmNDNlIiwidXNlcl9pZCI6MX0.ohIS84_s_8DTM3s5eWH-36rW6ob6lhM4bIXHe6ytwz8",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send recording to backend");
      }

      console.log("Recording sent to backend successfully with location");
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

  const pingScale = pingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const pingOpacity = pingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  });

  const callEmergency = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.sosButtonContainer}>
        <Animated.View
          style={[
            styles.pingCircle,
            {
              transform: [{ scale: pingScale }],
              opacity: pingOpacity,
            },
          ]}
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
          <Text style={recording ? styles.stopText : styles.sosText}>
            {recording ? "Stop" : "SOS"}
          </Text>
        </TouchableOpacity>
        {recording && (
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Numbers</Text>
        {EMERGENCY_NUMBERS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.emergencyItem}
            onPress={() => callEmergency(item.number)}
          >
            <Text style={styles.emergencyName}>{item.name}</Text>
            <Text style={styles.emergencyNumber}>{item.number}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        {SAFETY_TIPS.map((tip, index) => (
          <Text key={index} style={styles.safetyTip}>
            • {tip}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5FCFF",
    paddingVertical: 20,
  },
  sosButtonContainer: {
    alignItems: "center",
    marginBottom: 30,
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
  pingCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 0, 0, 0.3)",
  },
  durationText: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  sosText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
  },
  stopText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  emergencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  emergencyName: {
    fontSize: 16,
    color: "#333",
  },
  emergencyNumber: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  safetyTip: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
});
