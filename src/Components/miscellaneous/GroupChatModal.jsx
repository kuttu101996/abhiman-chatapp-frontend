import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import UserListItem from "../userAvatar/UserListItem";
import UserBadgeItem from "../userAvatar/UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomName, setRoomName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { setFetchChat } = ChatState();

  const handleCreateRoom = async () => {
    const token = JSON.parse(localStorage.getItem("user")).token;
    setLoading(true);
    try {
      if (!roomName) {
        toast({
          title: "Please give a name to this room",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        return;
      }
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `bearer ${token}`,
        },
      };
      const { data } = await axios.post(
        `http://localhost:4444/api/chat/create-chatroom`,
        { roomId: roomName },
        config
      );
      if (data.message === "Success") {
        toast({
          title: "New Room Created",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        setFetchChat((prev) => !prev);
      }
      if (data.message === "RoomID exists") {
        toast({
          title: "Room exist",
          description:
            "Room name exist, try another name or invite user to this room",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    const token = JSON.parse(localStorage.getItem("user")).token;

    if (!roomName) {
      toast({
        title: "Please select a room name",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
      return;
    }
    if (!selectedUsers.length) {
      toast({
        title: "Select user to send invites",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }

    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `bearer ${token}`,
      },
    };

    try {
      let count = 0;
      let result = selectedUsers.map(async (user) => {
        const { data } = await axios.post(
          `http://localhost:4444/api/chat/invite`,
          { roomId: roomName, invitedUserId: user.userId },
          config
        );

        if (data.message === "Success") {
          count++;
          toast({
            title: "Invitation sending successful",
            description: `${user.userId} gets an invitation`,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        } else {
          toast({
            title: data.message,
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      });
      Promise.all(result).then(() =>
        count === selectedUsers.length ? onClose() : ""
      );
      setLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
      onClose();
    }
  };

  const handleSearch = async (query) => {
    const token = JSON.parse(localStorage.getItem("user")).token;
    // setSearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:4444/api/user/search-user?search=${query}`,
        config
      );
      setLoading(false);
      setSearchResult(data.users);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to search the user",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleGroup = (user) => {
    if (selectedUsers.includes(user)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (selectedUsers.length === 5) {
      toast({
        title: "Room limit reached",
        description: "Maximum limit reached, can't add more than 5 user.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, user]);
  };

  const handleDelete = (user) => {
    setSelectedUsers(selectedUsers.filter((ele) => ele.id !== user.id));
  };

  // const handleSubmit = async () => {
  //   if (!groupChatName || !selectedUsers) {
  //     toast({
  //       title: "Please fill all feilds",
  //       status: "warning",
  //       duration: 4000,
  //       isClosable: true,
  //       position: "top",
  //     });
  //   }
  //   try {
  //     const config = {
  //       headers: {
  //         Authorization: `bearer ${user.token}`,
  //       },
  //     };

  //     const { data } = await axios.post(
  //       `https://communi-cate.onrender.com/api/chat/group`,
  //       {
  //         name: groupChatName,
  //         users: JSON.stringify(selectedUsers.map((ele) => ele._id)),
  //         chatPic: imageLink,
  //       },
  //       config
  //     );
  //     setChats([data, ...chats]);
  //     onClose();
  //     toast({
  //       title: "New Group Created",
  //       status: "success",
  //       duration: 4000,
  //       isClosable: true,
  //       position: "top",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Unable to create the group",
  //       description: error.response.data,
  //       status: "error",
  //       duration: 4000,
  //       isClosable: true,
  //       position: "top",
  //     });
  //   }
  // };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display={"flex"}
            justifyContent={"center"}
            fontSize={"35px"}
          >
            Create New Room
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <FormControl>
              <FormLabel>Room Name</FormLabel>
              <Input
                placeholder="Room ID"
                mb={3}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users eg: Guest, John"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box display={"flex"} w={"100%"} flexWrap={"wrap"}>
              {selectedUsers.map((ele) => {
                return (
                  <UserBadgeItem
                    key={ele.id}
                    user={ele}
                    handleFunction={() => handleDelete(ele)}
                  />
                );
              })}
            </Box>
            {loading ? (
              <Spinner />
            ) : (
              searchResult?.slice(0, 4).map((ele) => {
                return (
                  <UserListItem
                    key={ele.id}
                    user={ele}
                    handleFunction={() => handleGroup(ele)}
                  />
                );
              })
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCreateRoom}>
              Create Room
            </Button>
            <Button
              colorScheme="blue"
              style={{ marginLeft: "6px" }}
              onClick={handleInviteUser}
            >
              Invite Users
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
