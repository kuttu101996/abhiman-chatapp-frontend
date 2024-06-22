import React, { useState, useEffect } from "react";
import "../style.css";
import { ChatState } from "../../context/ChatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "lottie-react";
import typingAnni from "../../animation/typing.json";

const ENDPOINT = "https://abhiman-chatapp-backend.onrender.com";
var socket;

const SingleChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const { selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const user = JSON.parse(localStorage.getItem("user"));
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user.user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));
  }, [user.userExist]);

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stopTyping", selectedChat.id);
      try {
        let messageDetails = {
          roomId: selectedChat.id,
          userId: user.user.id,
          message: newMessage,
        };
        socket.emit("newMessage", messageDetails);
        setMessages([...messages, messageDetails]);
        setNewMessage("");
      } catch (error) {
        toast({
          title: "Error Occured!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:4444/api/message/room/${selectedChat.id}`,
        config
      );
      setMessages(data.data);
      setLoading(false);
      socket.emit("joinChat", selectedChat.id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        status: "error",
        description: "Failed to load chats",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    if (selectedChat) {
      setNotification(
        notification.filter((ele) => {
          return ele.chat.id !== selectedChat.id;
        })
      );
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on("messageRcv", (newMessageRcv) => {
      setMessages([...messages, newMessageRcv]);
    });
  }, []);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat.id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stopTyping", selectedChat.id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={{ base: "space-between" }}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
          </Box>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf={"center"}
                margin={"auto"}
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <div style={{ width: "8%" }}>
                  <Lottie
                    width={"70px"}
                    style={{ marginBottom: 10, marginLeft: 0 }}
                    animationData={typingAnni}
                    loop={true}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant={"filled"}
                bg={"whiteAlpha.900"}
                placeholder="Write your message here"
                onChange={typingHandler}
                value={newMessage}
                _hover={{ bg: "#E0E0E0" }}
                color={"rgb(80, 80, 80)"}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          height={"100%"}
          w={"100%"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text fontSize={"4xl"}>Select an user to start conversation</Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
