import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [showCnf, setShowCnf] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [isPrime, setIsPrime] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const getDeviceId = async () => {
      const fp = await FingerprintJS.load();

      const result = await fp.get();

      const visitorId = result.visitorId;
      setDeviceId(visitorId);
    };

    getDeviceId();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    if (!phone || !userId || !password || !confirmpassword) {
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

    if (password !== confirmpassword) {
      toast({
        title: "Please check the password",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const head = {
        headers: {
          "Content-type": "application/json",
        },
      };
      // comm-u-cate.onrender.com
      const { data } = await axios.post(
        `http://localhost:4444/api/auth/register`,
        { name, userId, deviceId, phone, password, isPrime },
        // { userId, deviceId, name, phone, password, availCoins, isPrime }
        head
      );
      console.log(data);

      if (data) {
        toast({
          title: "Registration Successful",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
      return;
    } catch (error) {
      console.log(error);
      toast({
        title: "Error Occured",
        description: error.response.data.message,
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
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          max={35}
          onChange={(e) => {
            // const text = e.target.value;
            // if (text.length <= 35) {
            //   setName(text);
            // }
            setName(e.target.value);
          }}
          maxLength={35}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>User ID</FormLabel>
        <Input
          type="text"
          placeholder="Choose User ID"
          onChange={(e) => {
            setUserId(e.target.value);
          }}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Mobile Number</FormLabel>
        <Input
          type="number"
          p={1.5}
          minLength={10}
          placeholder="Your Mobile Number"
          onChange={(e) => {
            let number = e.target.value;
            if (number.length >= 10) {
              setPhone(number);
            }
          }}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Choose a password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            minLength={4}
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
      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={showCnf ? "text" : "password"}
            placeholder="Confirm your password"
            onChange={(e) => {
              setConfirmpassword(e.target.value);
            }}
            minLength={4}
          />
          <InputRightElement width={"4rem"}>
            <Button
              size="sm"
              h="1.7rem"
              onClick={() => {
                setShowCnf(!showCnf);
              }}
            >
              {showCnf ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl>
        <Checkbox
          isChecked={isPrime}
          style={{ marginTop: "10px" }}
          onChange={(e) => {
            setIsPrime(e.target.checked);
          }}
        >
          Is Prime
        </Checkbox>
      </FormControl>
      <Button
        colorScheme="blue"
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={handleSubmit}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
