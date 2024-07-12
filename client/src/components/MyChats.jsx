import { Box, Button, Spinner, Stack, useToast, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import GroupChatModal from "./GroupChatModal";
import { AddIcon } from "@chakra-ui/icons";
import { useChatState } from "../Context/Chat";
import { getSenderName } from "../config/ChatLogics";
import { BaseUrl } from "../config/BaseUrl";
import axios from "axios";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useChatState();
  const toast = useToast();

  const fetchChats = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      const { data } = await axios.get(`${BaseUrl}/api/v1/chat`, config);

      setChats(data?.chats);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error?.response?.data?.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("chatApp-prac-user")));

    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      padding={3}
      backgroundColor="white"
      width={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        padding={3}
        backgroundColor="#F8F8F8"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="auto">
            {chats?.map((chat) => (
              <Box
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
              >
                <Text width="max-content">
                  {chat.isGroupChat
                    ? chat.name
                    : getSenderName(loggedUser?.user, chat?.users)}
                </Text>
                <Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat.latestMessage.sender.name}: </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <Spinner />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
