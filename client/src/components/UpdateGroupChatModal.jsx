import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  Input,
  Box,
  Spinner,
  useToast,
} from "@chakra-ui/react";

import { ViewIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import { useChatState } from "../Context/Chat";
import { useEffect, useState } from "react";
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
  const [chatName, setChatName] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = useChatState();
  const toast = useToast();

  const removeUser = async (delUser) => {
    if (
      user?.user._id !== selectedChat?.groupAdmin._id &&
      user?.user._id !== delUser._id
    ) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${BaseUrl}/api/v1/chat/remove-grp`,
        { userId: delUser._id, chatId: selectedChat._id },
        config
      );

      delUser._id === user?.user?._id
        ? setSelectedChat()
        : setSelectedChat(data?.chat);

      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setChatName("");
  };

  const addUser = async (addUser) => {
    if (user?.user?._id !== selectedChat?.groupAdmin?._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      return;
    }

    if (selectedChat?.users?.find((user) => user?._id === addUser?._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${BaseUrl}/api/v1/chat/add-grp`,
        { userId: addUser._id, chatId: selectedChat._id },
        config
      );
      setSelectedChat(data?.chat);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setChatName("");
  };

  const searchHandler = async (search) => {
    if (!search) {
      toast({
        title: "Please Enter chat Name",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });

      return;
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
      console.log(error);
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

  const renameHandler = async () => {
    if (!chatName) {
      toast({
        title: "Please Enter Chat Name",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });

      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${BaseUrl}/api/v1/chat/rename-grp`,
        { name: chatName, chatId: selectedChat._id },
        config
      );

      setSelectedChat(data?.chat);
      setFetchAgain(!fetchAgain);
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
      setLoading(false);
    }
    setChatName("");
  };

  return (
    <>
      <IconButton icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box width="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat?.users?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => removeUser(user)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                type="text"
                placeholder="Chat Name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                mb={3}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                onClick={renameHandler}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                type="text"
                placeholder="Add User to group"
                onChange={(e) => searchHandler(e.target.value)}
              />
            </FormControl>
            {!loading ? (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => addUser(user)}
                />
              ))
            ) : (
              <Spinner size="lg" />
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => removeUser(user?.user)}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
