import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const navigation = useNavigation();

  //   useEffect(() => {
  //     checkLoginStatus();
  //   }, []);

  //   const checkLoginStatus = async () => {
  //     try {
  //       const token = await SecureStore.getItemAsync("userToken");
  //       if (token) {
  //         await validateToken(token);
  //       }
  //     } catch (error) {
  //       console.error("Error checking login status:", error);
  //     }
  //   };

  //   const validateToken = async (token: string) => {
  //     try {
  //       const response = await fetch(
  //         "https://live-merely-drum.ngrok-free.app/api/validate-token/",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (response.ok) {
  //         const userData = await response.json();
  //         setUser(userData);
  //         navigation.navigate("(tabs)" as never);
  //       } else {
  //         await SecureStore.deleteItemAsync("userToken");
  //       }
  //     } catch (error) {
  //       console.error("Error validating token:", error);
  //     }
  //   };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(
        "https://live-merely-drum.ngrok-free.app/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        const { access, refresh, user } = await response.json();
        await SecureStore.setItemAsync("userToken", access);
        await SecureStore.setItemAsync("refreshToken", refresh);
        setUser(user);
        navigation.navigate("(tabs)" as never);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setUser(null);
    navigation.navigate("login" as never);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
