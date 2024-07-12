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
  useToast,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { useChatState } from "../Context/Chat";
import { useState } from "react";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";

const GroupChatModal = ({ children }) => {
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, chats, setChats } = useChatState();
  const toast = useToast();

  const searchHandler = async (search) => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
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

  const removeUser = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser));
  };

  const addUser = (user) => {
    if (selectedUsers.includes(user)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, user]);
  };

  const handleSubmit = async () => {
    if (!chatName || !selectedUsers) {
      toast({
        title: "Please fill all the feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      const { data } = await axios.post(
        `${BaseUrl}/api/v1/chat/create-grp`,
        {
          name: chatName,
          users: JSON.stringify(selectedUsers?.map((user) => user._id)),
        },
        config
      );

      setChats([data?.chat, ...chats]);
      onclose();

      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
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

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                type="text"
                placeholder="Chat Name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                mb={3}
              />
            </FormControl>
            <FormControl>
              <Input
                type="text"
                placeholder="Add Users eg: john doe"
                onChange={(e) => searchHandler(e.target.value)}
                mb={1}
              />
            </FormControl>
            <Box width="100%" display="flex" flexWrap="wrap">
              {selectedUsers?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => removeUser(user._id)}
                />
              ))}
            </Box>
            {loading ? (
              <Spinner />
            ) : (
              searchResult
                ?.slice(0, 4)
                ?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => addUser(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
