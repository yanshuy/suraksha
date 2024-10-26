import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

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
        name="recordings"
        options={{
          headerShown: false,
          title: "Recordings",
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
        name="history"
        options={{
          headerShown: false,
          title: "History",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" size={28} color={color} />
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
