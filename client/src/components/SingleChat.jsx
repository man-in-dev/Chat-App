import React, { useEffect, useState } from "react";
import { useChatState } from "../Context/Chat";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { getSender, getSenderName } from "../config/ChatLogics";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import { BaseUrl } from "../config/BaseUrl";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

let socket, selectedChatCompare;
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    useChatState();
  const toast = useToast();

  const fetchMessage = async () => {
    if (!selectedChat) return;

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${BaseUrl}/api/v1/message/${selectedChat._id}`,
        config
      );

      setMessages(data?.msg);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error?.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      try {
        setLoading(true);

        setNewMessage("");
        const { data } = await axios.post(
          `${BaseUrl}/api/v1/message`,
          { content: newMessage, chatId: selectedChat._id },
          config
        );

        setMessages([...messages, data?.msg]);
        setLoading(false);

        socket.emit("new Message", data?.msg);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error?.response?.data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    socket = io(BaseUrl, { transports: ["websocket"] });
    socket.emit("setup", user?.user?._id);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessage();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message Received", (receivedMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== receivedMessage.chatId._id
      ) {
        if (!notification.includes(receivedMessage)) {
          setNotification([receivedMessage, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, receivedMessage]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTimeTyping = new Date().getTime();
    let timeLength = 3000;

    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTimeTyping;

      if (timeDiff >= timeLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timeLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              icon={<ArrowLeftIcon />}
              display={{ base: "flex", md: "none" }}
              onClick={() => setSelectedChat()}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSenderName(user?.user, selectedChat?.users)}
                <ProfileModal
                  user={getSender(user?.user, selectedChat?.users)}
                />
              </>
            ) : (
              <>
                {selectedChat?.name.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            padding={3}
            bg="#E8E8E8"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <Box>
                <ScrollableChat messages={messages} />
              </Box>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping && (
                // <Lottie
                //   options={defaultOptions}
                //   width={70}
                //   style={{ marginBottom: 15, marginLeft: 0 }}
                // />
                <>Typing...</>
              )}
              <Input
                type="text"
                placeholder="Enter message"
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
