import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import React, { useState } from "react";
import { useChatState } from "../Context/Chat";
import { useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import UserListItem from "./UserListItem";
import { Spinner, useToast } from "@chakra-ui/react";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";
import { getSenderName } from "../config/ChatLogics";

const Header = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState("");
  const [loadingChat, setLoadingChat] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    user,
    notification,
    setNotification,
    setSelectedChat,
    chats,
    setChats,
  } = useChatState();

  console.log(notification);

  const navigate = useNavigate();
  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BaseUrl}/api/v1/user?search=${search}`,
        config
      );

      setSearchResult(data?.users);
      setLoading(false);
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

  const accessChat = async (userId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      setLoadingChat(true);
      const { data } = await axios.post(
        `${BaseUrl}/api/v1/chat`,
        { userId },
        config
      );

      if (!chats?.find((c) => c._id === data?.chat?.id)) {
        setChats([data?.chat, ...chats]);
      }

      setSelectedChat(data?.chat);
      setLoadingChat(false);
      onClose();
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

  const logoutHandler = () => {
    localStorage.removeItem("chatApp-prac-user");
    navigate("/");
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="white"
        width="100%"
        padding="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Chat App
        </Text>
        <Box>
          <Menu>
            <MenuButton p={1} position="relative">
              <BellIcon fontSize="2xl" margin={1} />
              <Text position="absolute" top="-2px" right="0px">
                {notification?.length && notification.length}
              </Text>
            </MenuButton>
            <MenuList>
              {notification?.length ? (
                notification?.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif?.chatId);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif?.chatId?.isGroupChat
                      ? `New Message in ${notif?.chatId?.name}`
                      : `New Message from ${getSenderName(
                          user?.user,
                          notif?.chatId?.users
                        )}`}
                  </MenuItem>
                ))
              ) : (
                <Text pl="8px">No New Messages</Text>
              )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user?.user?.name}
                src={user?.user?.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user?.user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" alignItems="center" pb={2}>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search by name or email"
              />
              <Button marginLeft="8px" onClick={handleSearch}>
                Search
              </Button>
            </Box>
            {loading ? (
              <Spinner />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
