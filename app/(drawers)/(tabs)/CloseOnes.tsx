import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  TouchableOpacity,
} from "react-native";
import WebView from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";

// Types
interface Location {
  latitude: number;
  longitude: number;
}

interface Contact {
  name: string;
  phoneNumber: string;
  location: Location;
}

interface ContactCardProps {
  contact: Contact;
}

const generateMapHTML = (latitude: number, longitude: number, name: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        body { margin: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${latitude}, ${longitude}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([${latitude}, ${longitude}])
          .bindPopup("${name}")
          .addTo(map);
      </script>
    </body>
  </html>
`;

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const handleCallPress = () => {
    Linking.openURL(`tel:${contact.phoneNumber}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <View style={styles.rowContainer}>
          <MaterialIcons name="person" size={24} color="#0066cc" />
          <Text style={styles.name}>{contact.name}</Text>
        </View>

        <TouchableOpacity style={styles.rowContainer} onPress={handleCallPress}>
          <MaterialIcons name="phone" size={24} color="#0066cc" />
          <Text style={styles.phone}>{contact.phoneNumber}</Text>
        </TouchableOpacity>

        <View style={styles.rowContainer}>
          <MaterialIcons name="location-on" size={24} color="#0066cc" />
          <Text style={styles.location}>
            Lat: {contact.location.latitude.toFixed(4)},{"\n"}
            Long: {contact.location.longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{
            html: generateMapHTML(
              contact.location.latitude,
              contact.location.longitude,
              contact.name
            ),
          }}
          style={styles.map}
          scrollEnabled={false}
          bounces={false}
        />
      </View>
    </View>
  );
};


const CloseOne: React.FC = () => {
  const contacts: Contact[] = [
    {
      name: "Amit Verma",
      phoneNumber: "+91 9812345670",
      location: {
        latitude: 19.076,
        longitude: 72.8777,
      },
    },
    {
      name: "Priya Sharma",
      phoneNumber: "+91 9823456781",
      location: {
        latitude: 19.2183,
        longitude: 72.9781,
      },
    },
    {
      name: "Rahul Desai",
      phoneNumber: "+91 9834567892",
      location: {
        latitude: 19.1305,
        longitude: 72.8491,
      },
    },
    {
      name: "Sneha Patil",
      phoneNumber: "+91 9845678903",
      location: {
        latitude: 19.2094,
        longitude: 72.8645,
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Close Ones</Text>
      <View style={styles.cardsContainer}>
        {contacts.map((contact, index) => (
          <ContactCard key={index} contact={contact} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 16,
    color: "#333",
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    padding: 16,
    gap: 12,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  phone: {
    fontSize: 16,
    color: "#0066cc",
    textDecorationLine: "underline",
  },
  location: {
    fontSize: 16,
    color: "#666",
  },
  mapContainer: {
    height: 200,
    width: "100%",
  },
  map: {
    flex: 1,
  },
});

export default CloseOne;
