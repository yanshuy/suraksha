import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

interface Recording {
  id: string;
  uri: string;
  date: string;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecordings = useCallback(async () => {
    try {
      const storedRecordings = await AsyncStorage.getItem("recordings");
      if (storedRecordings) {
        setRecordings(JSON.parse(storedRecordings));
      }
    } catch (error) {
      console.error("Failed to load recordings", error);
      Alert.alert("Error", "Failed to load recordings");
    }
  }, []);

  // Load recordings when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecordings();

      return () => {
        // Cleanup when screen loses focus
        if (sound) {
          sound.unloadAsync();
          setPlayingId(null);
        }
      };
    }, [loadRecordings, sound])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecordings();
    setRefreshing(false);
  }, [loadRecordings]);

  const playRecording = async (uri: string, id: string) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Set up audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(id);

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
      await sound.unloadAsync();
      setSound(null);
      setPlayingId(null);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      // If the recording is currently playing, stop it
      if (playingId === id) {
        await stopPlaying();
      }

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
      <View style={styles.recordingInfo}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.uriText}>
          {item.uri}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteRecording(item.id)}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="trash" size={24} color="#FF4136" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recordings</Text>
      {recordings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noRecordingsText}>No recordings found</Text>
          <Text style={styles.subText}>Pull down to refresh</Text>
        </View>
      ) : (
        <FlatList
          data={recordings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0074D9"]}
              tintColor="#0074D9"
            />
          }
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButton: {
    padding: 5,
  },
  recordingInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  uriText: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRecordingsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 8,
  },
  subText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
});
