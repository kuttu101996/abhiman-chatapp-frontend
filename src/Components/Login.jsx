// rafce
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { setUser } = ChatState();

  const handleSubmit = async () => {
    setLoading(true);
    if (!userId || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const d2p = {
        userId,
        password,
      };
      await fetch(
        `https://abhiman-chatapp-backend.onrender.com/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(d2p),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "User not found") {
            toast({
              title: "No User found with this UserID",
              status: "warning",
              duration: 3000,
              isClosable: true,
              position: "top-left",
            });
            toast({
              title: "Try registering yourself with this UserID",
              status: "info",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
          }
          if (data.message === "Success") {
            toast({
              title: "Login Successful",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data));
            setTimeout(() => {
              navigate("/chat");
            }, 1500);
          }
        })
        .catch((err) => {
          console.log(err.message);
          toast({
            title: "Error Occured",
            description: err.message,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom",
          });
        });
      return;
    } catch (error) {
      console.log(error.message);
      toast({
        title: "Error Occured",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl isRequired>
        <FormLabel>User ID</FormLabel>
        <Input
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
          }}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <InputRightElement width="4rem">
            <Button
              size="sm"
              h="1.7rem"
              onClick={() => {
                setShow(!show);
              }}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
