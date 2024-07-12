import React, { useState } from "react";
import { Box, Container } from "@chakra-ui/react";
import { useChatState } from "../Context/Chat";
import Header from "../components/Header";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);

  const { user } = useChatState();

  return (
    <Box width="100%">
      {user && <Header />}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        height="91.5vh"
        padding="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
