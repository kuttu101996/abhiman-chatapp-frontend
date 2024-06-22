import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/spinner";
import React, { useEffect, useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../chatCompo/ChatLoading";
import UserListItem from "../userAvatar/UserListItem";

const SideComing = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { fetchChat, setFetchChat } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user"));
  const [invitedTokens, setInvitedTokens] = useState([]);

  useEffect(() => {
    const getUserData = async () => {
      const config = {
        headers: {
          Authorization: `bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `https://abhiman-chatapp-backend.onrender.com/api/user/profile/${user.user.id}`,
        config
      );
      setInvitedTokens(data.data.invites);
    };
    getUserData();
  }, [fetchChat, setFetchChat]);

  const logoutHandler = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Write something to search",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `https://abhiman-chatapp-backend.onrender.com/api/user/search-user?search=${search}`,
        config
      );
      setLoading(false);
      setSearchResult(data.users);
    } catch (error) {
      console.log(error);
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

  const handleJoinRoom = async (roomId, joinRoomToken) => {
    if (!roomId || !joinRoomToken) return;
    try {
      const config = {
        headers: {
          Authorization: `bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `https://abhiman-chatapp-backend.onrender.com/api/chat/joinroom`,
        { roomId, joinRoomToken },
        config
      );
      if (data.message === "Success") {
        toast({
          title: data.additionalMessage,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        setInvitedTokens(
          invitedTokens.filter((notification) => notification.roomId !== roomId)
        );
        setFetchChat((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: error.response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"#38B2AC"}
        color={"white"}
        w={"100%"}
        p={"5px 10px 5px 10px"}
      >
        <Tooltip label="Search User for Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" _hover={{ bg: "#38A5AC" }} onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text
              display={{ base: "none", md: "flex" }}
              color={"white"}
              px="10px"
            >
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Chat Application
        </Text>
        <div>
          <Menu>
            <MenuButton paddingRight={"10px"}>
              {invitedTokens.length > 0 && (
                <h5
                  style={{
                    position: "sticky",
                    fontSize: "11px",
                    width: "50%",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    marginBottom: -12,
                    marginTop: "-5px",
                    marginLeft: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {invitedTokens.length}
                </h5>
              )}
              {/*
               */}
              <BellIcon fontSize={"2xl"} m={1} marginBottom={0} marginTop={0} />
            </MenuButton>
            <MenuList p={2}>
              {!invitedTokens.length && "No new Messages"}
              {invitedTokens.map((ele) => {
                return (
                  <MenuItem
                    key={ele.id}
                    p={1}
                    mb={invitedTokens.length > 1 ? 1 : 0}
                    _hover={{ backgroundColor: "#E8E8E8" }}
                    onClick={() => {
                      handleJoinRoom(ele.roomId, ele.token);
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        color: "black",
                      }}
                    >
                      <span>Room Joining Invitation</span>

                      <div>
                        From User{" "}
                        <span style={{ color: "blueviolet" }}>
                          {ele.creatorId ? ele.creatorId : ""}
                        </span>{" "}
                        Room name{" "}
                        <span style={{ color: "blueviolet" }}>
                          {ele.roomId}
                        </span>
                      </div>
                    </div>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              marginTop={"3px"}
              padding={2}
              as={Button}
              rightIcon={<ChevronDownIcon />}
            >
              {user.name || user.user.name}
            </MenuButton>
            <MenuList color={"grey"}>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"5px"}>Search User</DrawerHeader>
          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                placeholder="Search by Name or Email"
                mr={2}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              <>
                {searchResult.map((item) => {
                  return <UserListItem key={item.id} user={item} />;
                })}
              </>
            )}
            {loadingChat && <Spinner display={"flex"} ml={"auto"} />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideComing;
