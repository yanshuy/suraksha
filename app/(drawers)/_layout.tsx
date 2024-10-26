import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Text, View } from "@/components/Themed";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Layout() {
  const navigation = useNavigation();

  return (
    <GestureHandlerRootView>
      <Drawer
        screenOptions={{
          drawerStyle: {
            paddingVertical: 10,
          },
          drawerLabelStyle: {
            paddingHorizontal: 20,
            marginLeft: -35,
          },
        }}
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
                marginBottom: 15,
                borderBottomColor: "#f2f2f2",
                borderBottomWidth: 2,
              }}
            >
              <Image
                style={{ height: 35, width: 35, marginRight: 16 }}
                source={require("../../assets/icons/logo.png")}
              />
              <Text style={{ fontSize: 22, fontWeight: "600" }}>सुरक्षा</Text>
            </View>

            <DrawerItemList {...props} />
          </DrawerContentScrollView>
        )}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Home",
            drawerIcon: () => <Feather name="home" size={24} color="black" />,
            headerTitle: () => (
              <View style={styles.container}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Raksha</Text>
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate("login" as never)}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
            ),
            headerStyle: {
              height: 110,
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                <Image
                  style={{ width: 30, height: 30, marginLeft: 16 }}
                  source={require("../../assets/icons/menuicon.png")}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Drawer.Screen
          name="index"
          options={{
            title: "",
            drawerLabel: "Profile",
            drawerIcon: () => <Feather name="user" size={24} color="black" />,
          }}
        />
        <Drawer.Screen
        name="recordings"
        options={{
          title: "",
          drawerLabel: "Recordings",
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="record-circle"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          title: "",
          drawerLabel: "History",
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" size={28} color={color} />
          ),
        }}
      />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
  },
  loginButton: {
    backgroundColor: "black",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
