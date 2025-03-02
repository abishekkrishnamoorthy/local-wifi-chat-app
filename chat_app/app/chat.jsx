import React, { useState, useEffect, useRef } from "react";
import { View, Text , TextInput, Button, ScrollView, StyleSheet} from "react-native";
import { io } from "socket.io-client";
const SERVER_IP = "192.168.148.205";
const url = `http://${SERVER_IP}:8080`;

export default function Chat() {
  const [messages, setMessages] = useState([]); 
  const [text, setText] = useState(""); 
  const [socket, setSocket] = useState(null); 
  const [socketId, setSocketId] = useState(""); 
  const scrollViewRef = useRef(); 

  useEffect(() => {
    
    const newSocket = io(url);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server!");
      setSocketId(newSocket.id);
    })

    
    newSocket.on("history", (history) => {
      setMessages(history);
    })

    
    newSocket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom();
    })

    setSocket(newSocket);

    
    return () => {
      newSocket.disconnect();
      console.log("Disconnected from WebSocket");
    };
  }, []);

  
  const scrollToBottom = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = () => {
    if (!text.trim() || !socket) return;
    const msgData = { text, sender: "Me", socketId, timestamp: new Date().toISOString() };
    socket.emit("message", msgData);
    setText(""); 
    scrollToBottom();
  };

  return (
    <View style={styles.container}>
    <ScrollView ref={scrollViewRef} style={styles.textArea}>
      {messages.map((msg, index) => (
        msg.message?.text ? ( 
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.socketId === socketId ? styles.myMessage : styles.otherMessage
            ]}
          >
            <Text style={styles.messageText}>{msg.message.text}</Text>
          </View>
        ) : null
      ))}
    </ScrollView>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor="gray"
        value={text}
        onChangeText={setText}
      />
      <Button title="Send" onPress={sendMessage} color="blue" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "black",
  },
  textArea: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: "70%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "blue",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "gray",
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#222",
    color: "white",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
