import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    ws.current = new WebSocket(
      "wss://live-merely-drum.ngrok-free.app/ws/chat/"
    );

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.formatted_response) {
        addMessage(message.formatted_response, "bot");
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to connect to the chatbot. Please try again later."
      );
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      // Attempt to reconnect after a delay
      setTimeout(connectWebSocket, 5000);
    };
  };

  const addMessage = (text: string, sender: "user" | "bot") => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now().toString(), text, sender },
    ]);
  };

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    addMessage(inputText, "user");

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: inputText }));
    } else {
      Alert.alert(
        "Connection Error",
        "Not connected to the server. Trying to reconnect..."
      );
      connectWebSocket();
    }

    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user"
            ? styles.userMessageText
            : styles.botMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatbot Assistant</Text>
        <View
          style={[
            styles.connectionStatus,
            isConnected ? styles.connected : styles.disconnected,
          ]}
        />
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Image style={{ height: 30, width: 30}}
                 source={require("../../../assets/icons/send.png")}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  connectionStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: "#4CAF50",
  },
  disconnected: {
    backgroundColor: "#F44336",
  },
  messageList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "white",
  },
  botMessageText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
