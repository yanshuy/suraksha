"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  AccessibilityInfo,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { useLocationSharing } from "@/components/locationService";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function FamilyMembersPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [newMember, setNewMember] = useState<Omit<FamilyMember, "id">>({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const stored = await AsyncStorage.getItem("familyMembers");
      if (stored) {
        setFamilyMembers(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load family members:", error);
      Alert.alert("Error", "Failed to load family members");
    }
  };

  const saveFamilyMembers = async (updatedMembers: FamilyMember[]) => {
    try {
      await AsyncStorage.setItem(
        "familyMembers",
        JSON.stringify(updatedMembers)
      );
      setFamilyMembers(updatedMembers);
      return true;
    } catch (error) {
      console.error("Failed to save family members:", error);
      Alert.alert("Error", "Failed to save family members");
      return false;
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!newMember.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return false;
    }
    if (!validateEmail(newMember.email)) {
      Alert.alert("Error", "Please enter a valid email");
      return false;
    }
    if (!validatePhoneNumber(newMember.phone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;

    const member: FamilyMember = {
      id: Date.now().toString(),
      ...newMember,
    };

    const updated = [...familyMembers, member];
    await saveFamilyMembers(updated);
    setIsAddingMember(false);
    setNewMember({ name: "", email: "", phone: "" });
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !validateForm()) return;

    const updated = familyMembers.map((member) =>
      member.id === editingMember.id
        ? { ...editingMember, ...newMember }
        : member
    );

    await saveFamilyMembers(updated);
    setEditingMember(null);
    setNewMember({ name: "", email: "", phone: "" });
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
    });
  };

  const handleDeleteMember = (id: string) => {
    console.log("Delete initiated for member ID:", id);

    // Ensure we're working with the Platform-specific alert
    if (Platform.OS === "web") {
      // For web platform
      if (
        window.confirm("Are you sure you want to remove this family member?")
      ) {
        confirmDelete(id);
      }
    } else {
      // For native platforms
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to remove this family member?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("Delete cancelled"),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => confirmDelete(id),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const confirmDelete = async (id: string) => {
    console.log("Confirming delete for member ID:", id);
    try {
      const memberToDelete = familyMembers.find((member) => member.id === id);
      if (!memberToDelete) {
        console.error("Member not found:", id);
        return;
      }

      const updated = familyMembers.filter((member) => member.id !== id);
      const saveSuccess = await saveFamilyMembers(updated);

      if (saveSuccess) {
        console.log("Member deleted successfully:", memberToDelete.name);
        // Optional: Show success message
        Alert.alert("Success", "Family member removed successfully");
      }
    } catch (error) {
      console.error("Error during delete:", error);
      Alert.alert("Error", "Failed to delete family member");
    }
  };

  const { handleShareLocation } = useLocationSharing({
    customMessage:
      "I'm sharing my emergency location with you. Please track my location using the links below:",
    onLocationShared: (success) => {
      if (success) {
        Alert.alert("Success", "Location shared successfully");
      }
    },
  });

  const renderMember = ({ item }: { item: FamilyMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberDetail}>{item.email}</Text>
        <Text style={styles.memberDetail}>{item.phone}</Text>
      </View>
      <View style={styles.memberActions}>
        <View>
          <TouchableOpacity
            onPress={() => handleShareLocation(item)}
            style={[styles.actionButton, styles.locationButton]}
          >
            <FontAwesome name="location-arrow" size={20} color="#0074D9" />
            <Text style={styles.actionButtonText}>Share Location</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 5,
            alignSelf: "flex-end",
          }}
        >
          <TouchableOpacity
            onPress={() => handleEditMember(item)}
            style={styles.actionButton}
          >
            <FontAwesome
              name="edit"
              style={{ marginTop: 2 }}
              size={20}
              color="#2ECC40"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteMember(item.id)}
            style={styles.actionButton}
          >
            <FontAwesome name="trash" size={20} color="#FF4136" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        {!isAddingMember && !editingMember && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingMember(true)}
          >
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {(isAddingMember || editingMember) && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newMember.name}
            onChangeText={(text) => setNewMember({ ...newMember, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newMember.email}
            onChangeText={(text) => setNewMember({ ...newMember, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (with country code)"
            value={newMember.phone}
            onChangeText={(text) => setNewMember({ ...newMember, phone: text })}
            keyboardType="phone-pad"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setIsAddingMember(false);
                setEditingMember(null);
                setNewMember({ name: "", email: "", phone: "" });
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={editingMember ? handleUpdateMember : handleAddMember}
            >
              <Text style={styles.buttonText}>
                {editingMember ? "Update" : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={familyMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              No emergency contacts added yet
            </Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add someone
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#0074D9",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    marginTop: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 0.48,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2ECC40",
  },
  cancelButton: {
    backgroundColor: "#FF4136",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  list: {
    paddingBottom: 20,
  },
  memberCard: {
    marginTop: 4,
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  memberDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  memberActions: {
    flexDirection: "column",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 0,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4FF",
    padding: 8,
    borderRadius: 5,
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#0074D9",
  },
});
