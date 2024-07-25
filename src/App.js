import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Heading,
  List,
  ListItem,
  Text,
  Container,
} from "@chakra-ui/react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTasks();
    setupWebSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "https://todoappbackend-production-5840.up.railway.app/fetchAllTasks"
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const addTask = async () => {
    if (title) {
      try {
        await axios.post(
          "https://todoappbackend-production-5840.up.railway.app/add",
          { title }
        );
        fetchTasks(); // Refresh tasks
        setTitle(""); // Clear input
      } catch (error) {
        console.error("Error adding task", error);
      }
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(
      "wss://todoappbackend-production-5840.up.railway.app"
    );

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const newTask = JSON.parse(event.data);
      setMessage(`New task added: ${newTask.title}`);
      fetchTasks(); // Refresh tasks
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  return (
    <Container maxW="md" marginTop="10%" centerContent>
      <Box
        w={{ base: "100%", md: "50%", lg: "30%" }} // Adjust width based on screen size
        p={4}
        boxShadow="md"
        borderRadius="md"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        mt={8}
      >
        <Heading mb={4} marginLeft="10px">
          Note App
        </Heading>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task"
          mb={4}
          ml="10px"
        />
        <Button colorScheme="blue" onClick={addTask} ml="20px">
          Add Task
        </Button>
        <Box mt={4} maxH="200px" overflowY="auto">
          <List>
            {tasks.map((task, index) => (
              <ListItem key={index} borderBottom="1px solid #eee" p={2}>
                {task.title}
              </ListItem>
            ))}
          </List>
        </Box>
        <Text mt={4}>Showing notes out of {tasks.length}</Text>
        {message && <Text mt={4}>Message from MQTT: {message}</Text>}
      </Box>
    </Container>
  );
}

export default App;
