import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

// Define the structure of an SOS activity
interface SOSActivity {
  id: string;
  date: string;
  location: string;
  report: string;
}

// Sample data (replace this with actual data from your backend)
const sampleSOSActivities: SOSActivity[] = [
  {
    id: "1",
    date: "26-10-2024 14:30",
    location: "Andheri, Mumbai",
    report:
      "User activated SOS at a busy intersection. No immediate danger detected, but user reported feeling uncomfortable due to persistent harassment from an unknown individual. Local authorities were notified and responded within 5 minutes. User confirmed safety after police arrival.",
  },
  {
    id: "2",
    date: "13-10-24 20:15",
    location: "Nahur",
    report:
      "SOS triggered in a poorly lit area of the park. User reported hearing suspicious noises and feeling threatened. Emergency contacts were immediately notified. Park security was alerted and reached the user within 3 minutes. No physical harm occurred, but user was escorted to a safe location.",
  },
  // Add more sample data as needed
];

const SOSActivityItem: React.FC<{ item: SOSActivity; onPress: () => void }> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity style={styles.activityItem} onPress={onPress}>
    <View style={styles.activityHeader}>
      <Text style={styles.dateText}>{item.date}</Text>
      <Ionicons
        name="chevron-forward"
        size={24}
        color="black"
        style={{ position: "absolute", right: -5, top: 10 }}
      />
    </View>
    <Text style={styles.locationText}>{item.location}</Text>
  </TouchableOpacity>
);

const SOSHistoryScreen: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<SOSActivity | null>(
    null
  );

  const handleActivityPress = (activity: SOSActivity) => {
    setSelectedActivity(activity);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>SOS History</Text>
      <FlatList
        data={sampleSOSActivities}
        renderItem={({ item }) => (
          <SOSActivityItem
            item={item}
            onPress={() => handleActivityPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedActivity !== null}
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>SOS Report</Text>
              <Text style={styles.modalDate}>{selectedActivity?.date}</Text>
              <Text style={styles.modalLocation}>
                {selectedActivity?.location}
              </Text>
              <Text style={styles.modalReport}>{selectedActivity?.report}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedActivity(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 16,
    color: "#333",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  activityItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  modalDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "blue",
    marginBottom: 8,
  },
  modalLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  modalReport: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.red.main,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SOSHistoryScreen;
