import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native"

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          height: 70, // Adjust the height here
          paddingBottom: 10, // Optional: Adjust padding for better alignment
          paddingTop: 10,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Alert",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="alert-octagon"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          headerShown: false,
          title: "ChatBot",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="record-circle"
              size={26}
              color={color}
            />
          ),
        }}
      />
             <Tabs.Screen
        name="here"
        options={{
          headerShown: false,
          title: "I'm Here",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="google-maps"
              size={29}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="CloseOnes"
        options={{
          headerShown: false,
          title: "Track",
          tabBarIcon: ({focused, color }) => (
            <Image
            style={{ height: 35, width: 35, resizeMode: 'contain', tintColor: focused ? 'black' : '#777' }}
            source={require("../../../assets/icons/trackicon.png")}
          />
          ),
        }}
      />
      <Tabs.Screen
        name="myfamily"
        options={{
          headerShown: false,
          title: "Contacts",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="groups" size={36} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
