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
    } catch (error) {
      Alert.alert("Error", "Failed to save family members");
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

  const handleDeleteMember = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this family member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = familyMembers.filter((member) => member.id !== id);
            await saveFamilyMembers(updated);
          },
        },
      ]
    );
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
    <View
      style={styles.memberCard}
      accessible={true}
      accessibilityLabel={`Family member card for ${item.name}`}
      accessibilityHint="Double tap to expand options"
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Family Member</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.contactInfo}>
          <View
            style={styles.infoRow}
            accessible={true}
            accessibilityLabel={`Email: ${item.email}`}
          >
            <FontAwesome name="envelope" size={16} color="#666" />
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
          <View
            style={styles.infoRow}
            accessible={true}
            accessibilityLabel={`Phone: ${item.phone}`}
          >
            <FontAwesome name="phone" size={16} color="#666" />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.locationButton]}
            onPress={() => handleShareLocation(item)}
            accessible={true}
            accessibilityLabel={`Share location with ${item.name}`}
            accessibilityHint="Shares your current location via WhatsApp"
          >
            <FontAwesome name="location-arrow" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Share Location</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.iconButton, styles.editButton]}
              onPress={() => handleEditMember(item)}
              accessible={true}
              accessibilityLabel={`Edit ${item.name}'s information`}
            >
              <FontAwesome name="edit" size={20} color="#2ECC40" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, styles.deleteButton]}
              onPress={() => handleDeleteMember(item.id)}
              accessible={true}
              accessibilityLabel={`Delete ${item.name} from family members`}
            >
              <FontAwesome name="trash" size={20} color="#FF4136" />
            </TouchableOpacity>
          </View>
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
            accessible={true}
            accessibilityLabel="Add new family member"
          >
            <FontAwesome name="plus" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={familyMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No emergency contacts added yet</Text>
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#0074D9",
    padding: 12,
    borderRadius: 25,
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  memberCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0074D9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  badge: {
    backgroundColor: "#E8F4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#0074D9",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 15,
  },
  contactInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
  },
  actionButtons: {
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: "#0074D9",
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#E8F8E8",
  },
  deleteButton: {
    backgroundColor: "#FFE8E8",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
});
