// locationService.ts
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface LocationMessage {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
}

interface LocationShareConfig {
  defaultMessage: string;
  expirationHours: number;
  updateIntervalMinutes: number;
}

export class LocationService {
  private static config: LocationShareConfig = {
    defaultMessage: "I'm sharing my location with you. Track me here:",
    expirationHours: 24,
    updateIntervalMinutes: 5,
  };

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to share your location."
        );
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        Alert.alert(
          "Background Permission",
          "Background location permission is needed for continuous tracking.",
          [
            { text: "Continue Anyway", onPress: () => true },
            { text: "Cancel", style: "cancel", onPress: () => false },
          ]
        );
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationMessage | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy ?? undefined,
        speed: location.coords.speed ?? undefined,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }

  static generateMapsUrl(location: LocationMessage): string {
    // Google Maps URL
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  static generateLiveTrackingUrl(
    location: LocationMessage,
    userId: string
  ): string {
    // Replace this with your actual tracking service URL
    return `https://yourapp.com/track/${userId}?lat=${location.latitude}&lng=${location.longitude}`;
  }

  static async shareLocation(
    contactName: string,
    phoneNumber: string,
    customMessage?: string
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      const location = await this.getCurrentLocation();
      if (!location) {
        Alert.alert("Error", "Unable to get current location");
        return false;
      }

      // Generate a unique tracking ID for this sharing session
      const trackingId = `track_${Date.now()}`;
      await this.saveTrackingSession(trackingId, location);

      // Generate tracking URL and maps URL
      const mapsUrl = this.generateMapsUrl(location);
      const trackingUrl = this.generateLiveTrackingUrl(location, trackingId);

      // Format the message
      const message = this.formatShareMessage(
        contactName,
        location,
        mapsUrl,
        trackingUrl,
        customMessage
      );

      // Share via WhatsApp
      return await this.shareViaWhatsApp(phoneNumber, message);
    } catch (error) {
      console.error("Error sharing location:", error);
      Alert.alert("Error", "Failed to share location");
      return false;
    }
  }

  private static formatShareMessage(
    contactName: string,
    location: LocationMessage,
    mapsUrl: string,
    trackingUrl: string,
    customMessage?: string
  ): string {
    const timestamp = new Date(location.timestamp).toLocaleTimeString();
    const defaultMsg = customMessage || this.config.defaultMessage;

    return (
      `Hi ${contactName}, ${defaultMsg}\n\n` +
      `📍 Current Location (as of ${timestamp}):\n${mapsUrl}\n\n` +
      `🔴 Live Tracking Link (valid for ${this.config.expirationHours} hours):\n` +
      `${trackingUrl}\n\n` +
      `Updates will be sent every ${this.config.updateIntervalMinutes} minutes.\n` +
      `Speed: ${
        location.speed ? `${Math.round(location.speed * 3.6)} km/h\n` : "N/A\n"
      }` +
      `Accuracy: ${
        location.accuracy ? `${Math.round(location.accuracy)} meters` : "N/A"
      }`
    );
  }

  private static async shareViaWhatsApp(
    phoneNumber: string,
    message: string
  ): Promise<boolean> {
    try {
      const formattedPhone = phoneNumber.replace(/\D/g, "");
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(
        message
      )}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (!canOpen) {
        Alert.alert("Error", "WhatsApp is not installed");
        return false;
      }

      await Linking.openURL(whatsappUrl);
      return true;
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      return false;
    }
  }

  private static async saveTrackingSession(
    trackingId: string,
    initialLocation: LocationMessage
  ): Promise<void> {
    try {
      const session = {
        id: trackingId,
        startTime: Date.now(),
        expiresAt: Date.now() + this.config.expirationHours * 60 * 60 * 1000,
        initialLocation,
        updates: [initialLocation],
      };

      await AsyncStorage.setItem(
        `tracking_${trackingId}`,
        JSON.stringify(session)
      );
    } catch (error) {
      console.error("Error saving tracking session:", error);
    }
  }
}

// Example usage in your FamilyMembersPage:
interface LocationSharingProps {
  customMessage?: string;
  onLocationShared?: (success: boolean) => void;
}

export function useLocationSharing({
  customMessage,
  onLocationShared,
}: LocationSharingProps = {}) {
  const handleShareLocation = async (member: FamilyMember) => {
    try {
      const success = await LocationService.shareLocation(
        member.name,
        member.phone,
        customMessage
      );

      if (onLocationShared) {
        onLocationShared(success);
      }
    } catch (error) {
      console.error("Error in location sharing:", error);
      Alert.alert("Error", "Failed to share location");
    }
  };

  return { handleShareLocation };
}
