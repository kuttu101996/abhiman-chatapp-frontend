import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "../miscellaneous/GroupChatModal";

const MyChats = () => {
  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    fetchChat,
    setFetchChat,
  } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const config = {
        headers: {
          Authorization: `bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        "https://abhiman-chatapp-backend.onrender.com/api/chat/joined-rooms",
        config
      );
      setChats(data.data.joinedRooms);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchChat, setFetchChat]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir={"column"}
      alignItems={"center"}
      p={3}
      bg={"white"}
      w={{ base: "100%", md: "31%" }}
      borderRadius={"lg"}
      borderWidth={"1px"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        display={"flex"}
        w={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
        color={"grey"}
      >
        My Chats
        <GroupChatModal>
          <Button
            color={"grey"}
            display={"flex"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            Create Room
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display={"flex"}
        flexDir={"column"}
        p={3}
        w={"100%"}
        h={"100%"}
        borderRadius={"lg"}
        overflowY={"hidden"}
        bg={"#F8F8F8"}
      >
        {chats.length > 0 ? (
          <Stack overflowY={"scroll"}>
            {chats?.map((chat) => {
              return (
                <Box
                  display={"flex"}
                  onClick={() => setSelectedChat(chat.room)}
                  cursor={"pointer"}
                  px={3}
                  py={2}
                  borderRadius={"lg"}
                  bg={selectedChat === chat.room ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat.room ? "white" : "black"}
                  key={chat.room.id}
                >
                  <div>
                    <Text>{chat.room.roomId}</Text>
                  </div>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
