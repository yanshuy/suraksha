import React from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Link, Tabs } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 5;

function TabBarIcon({
  name,
  color,
  size,
  isMaterialIcons = false,
}: {
  name: string;
  color: string;
  size: number;
  isMaterialIcons?: boolean;
}) {
  const IconComponent = isMaterialIcons
    ? MaterialIcons
    : MaterialCommunityIcons;
  return <IconComponent name={name as any} size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tabColor = Colors[colorScheme ?? "light"].tint;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(0)).current;

  const animateSlider = (index: number) => {
    Animated.spring(translateX, {
      toValue: index * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    animateSlider(activeIndex);
  }, [activeIndex]);

  const tabScreens = [
    { name: "index", title: "Alert", icon: "alert-octagon" },
    { name: "recordings", title: "Recordings", icon: "record-circle" },
    { name: "here", title: "I'm Here", icon: "google-maps" },
    { name: "phone", title: "History", icon: "history" },
    {
      name: "myfamily",
      title: "Contacts",
      icon: "groups",
      isMaterialIcons: true,
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: tabColor,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
      }}
      tabBar={(props) => (
        <View style={styles.customTabBar}>
          <Animated.View
            style={[
              styles.slider,
              {
                transform: [{ translateX }],
                backgroundColor: tabColor,
              },
            ]}
          />
          {props.state.routes.map((route, index) => {
            const { options } = props.descriptors[route.key];
            const isFocused = props.state.index === index;

            const onPress = () => {
              const event = props.navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                props.navigation.navigate(route.name);
              }

              setActiveIndex(index);
            };

            const screen = tabScreens.find(
              (screen) => screen.name === route.name
            );

            return (
              <Link key={route.key} href={route.name as any} asChild>
                <View
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onMagicTap={onPress}
                  style={styles.tabItem}
                >
                  <TabBarIcon
                    name={screen?.icon || ""}
                    color={
                      isFocused
                        ? tabColor
                        : Colors[colorScheme ?? "light"].tabIconDefault
                    }
                    size={24}
                    isMaterialIcons={screen?.isMaterialIcons}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isFocused
                          ? tabColor
                          : Colors[colorScheme ?? "light"].tabIconDefault,
                      },
                    ]}
                  >
                    {screen?.title}
                  </Text>
                </View>
              </Link>
            );
          })}
        </View>
      )}
    >
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name as any}
          options={{
            headerShown: false,
            title: screen.title,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    height: 60,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  slider: {
    position: "absolute",
    top: 0,
    height: 3,
    width: TAB_WIDTH,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
  },
  tabBar: {
    display: "none",
  },
});
