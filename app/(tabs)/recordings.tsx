"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

interface Recording {
  id: string;
  uri: string;
  date: string;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
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
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingId(id);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error("Failed to play recording", error);
      Alert.alert("Error", "Failed to play recording");
    }
  };

  const stopPlaying = async () => {
    if (sound) {
      await sound.stopAsync();
      setPlayingId(null);
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
        onPress={() =>
          playingId === item.id
            ? stopPlaying()
            : playRecording(item.uri, item.id)
        }
      >
        <FontAwesome
          name={playingId === item.id ? "stop-circle" : "play-circle"}
          size={24}
          color="#0074D9"
        />
      </TouchableOpacity>
      <View>
        <Text>{item.date}</Text>
        <Text numberOfLines={1} ellipsizeMode="middle">
          {item.uri}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteRecording(item.id)}>
        <FontAwesome name="trash" size={24} color="#FF4136" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recordings</Text>
      {recordings.length === 0 ? (
        <Text>No recordings found</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
  },
});
