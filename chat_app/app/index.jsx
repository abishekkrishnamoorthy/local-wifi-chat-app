import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { io } from 'socket.io-client';

export default function App() {
  const router = useRouter();
  const [serverRunning, setServerRunning] = useState(false);
  const [serverIP] = useState("192.168.148.205"); 
  const [chatDisabled, setChatDisabled] = useState(true);
  const [socket, setSocket] = useState(null);

  
  const startServer = () => {
    console.log("Server Started at:", serverIP);
    setServerRunning(true);

    
    const newSocket = io(`http://${serverIP}:8080`);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server!");
      setChatDisabled(false); 
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server!");
      setChatDisabled(true); // Disable chat 
    });

    setSocket(newSocket);
  };

  
  const stopServer = () => {
    if (socket) {
      socket.disconnect();
      console.log("Server Stopped!");
      setServerRunning(false);
      setChatDisabled(true); 
      setSocket(null);
    }
  };


  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        console.log("Socket Disconnected");
      }
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Public Local Chat App</Text>
      {!serverRunning ? (
        <Button title="Start Server" onPress={startServer} />
      ) : (
        <>
          <Text style={styles.runningText}>Server Running on {serverIP}</Text>
          <Button title="Stop Server" onPress={stopServer} color="red" />
        </>
      )}

      <Button
        title="Go to Chat"
        onPress={() => router.push('/chat')}
        disabled={chatDisabled}
        color={chatDisabled ? "gray" : "blue"}
      />
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  title: { color: 'white', fontSize: 24, marginBottom: 20 },
  runningText: { color: 'lightgreen', fontSize: 16, marginTop: 10 },
});
