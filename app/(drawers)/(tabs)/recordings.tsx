import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

interface Recording {
  id: string;
  uri: string;
  date: string;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const storedRecordings = await AsyncStorage.getItem("recordings");
      if (storedRecordings) {
        setRecordings(JSON.parse(storedRecordings));
      }
    } catch (error) {
      console.error("Failed to load recordings", error);
      Alert.alert("Error", "Failed to load recordings");
    }
  };

  const playRecording = async (uri: string, id: string) => {
    try {
      if (playingId === id) {
        setPlayingId(null);
        return;
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      setPlayingId(id);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error("Failed to play recording", error);
      Alert.alert("Error", "Failed to play recording");
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      const updatedRecordings = recordings.filter(
        (recording) => recording.id !== id
      );
      await AsyncStorage.setItem(
        "recordings",
        JSON.stringify(updatedRecordings)
      );
      setRecordings(updatedRecordings);
      Alert.alert("Success", "Recording deleted successfully");
    } catch (error) {
      console.error("Failed to delete recording", error);
      Alert.alert("Error", "Failed to delete recording");
    }
  };

  const renderItem = ({ item }: { item: Recording }) => (
    <View style={styles.recordingItem}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => playRecording(item.uri, item.id)}
      >
        <Ionicons
          name={playingId === item.id ? "pause" : "play"}
          size={24}
          color="#007AFF"
        />
      </TouchableOpacity>
      <View style={styles.recordingInfo}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteRecording(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recordings</Text>
      {recordings.length === 0 ? (
        <Text style={styles.noRecordingsText}>No recordings found</Text>
      ) : (
        <FlatList
          data={recordings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1C1C1E",
  },
  listContainer: {
    paddingBottom: 16,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recordingInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: "#3A3A3C",
    fontWeight: "500",
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  noRecordingsText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 24,
  },
});
