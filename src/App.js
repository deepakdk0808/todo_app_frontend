import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Input,
  Heading,
  List,
  ListItem,
  Text,
  Container,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import "./App.css"; // Import the CSS file

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    fetchTasks();
    setupWebSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:12676/fetchAllTasks");
      setTasks(response.data.tasks);
      setSource(response.data.source);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const addTask = async () => {
    if (title) {
      try {
        await axios.post("http://localhost:12676/add", { title });
        fetchTasks();
        setTitle("");
      } catch (error) {
        console.error("Error adding task", error);
      }
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket("ws://localhost:12676");

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const newTask = JSON.parse(event.data);
      setMessage(`New task added: ${newTask.title}`);
      fetchTasks();
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  return (
    <Container maxW="md" marginTop="5%" centerContent>
      <Box
        w={{ base: "100%", md: "50%", lg: "30%" }}
        p={4}
        boxShadow="lg"
        borderRadius="md"
        bg="lightyellow"
        border="1px solid"
        borderColor="gray.300"
      >
        <Heading mb={4} textAlign="center" mt={0}>
          Note App
        </Heading>
        <Flex mb={4} align="center">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task"
            flex="1"
            mr={2}
          />
          <IconButton
            icon={<AddIcon />}
            bg="green"
            onClick={addTask}
            aria-label="Add Task"
          />
        </Flex>
        <Box className="task-list" mt={4} maxH="200px" overflowY="auto">
          <List spacing={3}>
            {tasks.map((task, index) => (
              <ListItem
                key={index}
                boxShadow="sm"
                p={2}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {task.title}
              </ListItem>
            ))}
          </List>
          
        </Box>
        <Text mt={2}>Showing notes from {source}</Text>
        <Text mt={2}>Total notes: {tasks.length}</Text>
        {message && <Text mt={2}>Message from MQTT: {message}</Text>}
      </Box>
    </Container>
  );
}

export default App;
