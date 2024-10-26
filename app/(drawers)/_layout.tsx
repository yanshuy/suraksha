import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { Text, View } from "@/components/Themed";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 16,
                  }}
                >
                  <Image
                    style={{ height: 35, width: 35, marginRight: 16 }}
                    source={require("../../assets/icons/logo.png")}
                  />
                  <Text style={{ fontSize: 22, fontWeight: "600" }}>
                    सुरक्षा
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("login" as never)}
                >
                  <Text style={styles.buttonText}>Login</Text>
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
            drawerLabel: 'Profile',
            drawerIcon: () => <Feather name="user" size={24} color="black" />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#e04759",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
