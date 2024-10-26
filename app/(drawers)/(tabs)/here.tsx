import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const data = [
  {
    id: 1,
    event_name: "Event One",
    city: "Mumbai",
    subcity: "Subcity One",
    description: "Description of Event One",
    longitude: 72.8777,
    latitude: 19.076,
  },
  {
    id: 2,
    event_name: "Event Two",
    city: "Mumbai",
    subcity: "Subcity Two",
    description: "Description of Event Two",
    longitude: 72.8353,
    latitude: 19.0894,
  },
  {
    id: 3,
    event_name: "Event Three",
    city: "Mumbai",
    subcity: "Subcity Three",
    description: "Description of Event Three",
    longitude: 72.8291,
    latitude: 19.1056,
  },
];

const Here = () => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    } else {
      setError('Location permission not granted');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const generateMapHTML = () => {
    const locations = JSON.stringify(data);
    const currentLat = currentLocation?.latitude || 19.076;
    const currentLng = currentLocation?.longitude || 72.8777;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
            crossorigin="" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
            crossorigin=""></script>
          <style>
            * { margin:0; padding:0; }
            html, body, #map { 
              width: 100%; 
              height: 100%; 
              background: #f8f9fa;
            }
            .leaflet-control-zoom {
              display: none;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const map = L.map('map', {
              zoomControl: false,
              attributionControl: false
            }).setView([${currentLat}, ${currentLng}], 12);
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              maxZoom: 19
            }).addTo(map);

            const locations = ${locations};
            
            if (locations && Array.isArray(locations)) {
              locations.forEach(location => {
                if (location && location.latitude && location.longitude) {
                  const circle = L.circle([location.latitude, location.longitude], {
                    radius: 2000,
                    color: 'transparent',
                    fillColor: 'red',
                    fillOpacity: 0.3
                  }).addTo(map);

                  circle.bindPopup(\`
                    <div style="padding: 10px; min-width: 150px;">
                      <h3 style="margin-bottom: 5px; color: #333;">\${location.event_name || 'Event'}</h3>
                      <p style="margin: 5px 0; color: #666;">Location: \${location.city || 'N/A'}</p>
                      <p style="margin: 5px 0; color: #666;">\${location.description || 'No description available'}</p>
                    </div>
                  \`);
                }
              });
            }
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ html: generateMapHTML() }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
          setError("Failed to load map");
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView HTTP error: ", nativeEvent);
          setError("Failed to load map resources");
        }}
        originWhitelist={["*"]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export default Here;
