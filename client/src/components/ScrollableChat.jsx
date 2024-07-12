import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isNotSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { useChatState } from "../Context/Chat";

const ScrollableChat = ({ messages }) => {
  const {
    user: { user },
  } = useChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages?.map((m, i) => (
          <Box key={m._id} display="flex">
            {(isNotSameSender(messages, m, i, user) ||
              isLastMessage(messages, m, i, user)) && (
              <Tooltip
                label={m?.sender?.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  src={m?.sender?.pic}
                  name={m?.sender?.name}
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m?.sender?._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(messages, m, i, user),
                marginTop: isSameUser(messages, m, i) ? "5px" : "10px",
              }}
            >
              {m.content}
            </span>
          </Box>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
