export const getSenderName = (loggedUser, users) => {
  return users && loggedUser?._id === users[0]?._id
    ? users[1]?.name
    : users[0]?.name;
};

export const getSender = (loggedUser, users) => {
  return users && loggedUser?._id === users[0]?._id ? users[1] : users[0];
};

export const isNotSameSender = (messages, m, i, loggedUser) => {
  return (
    i < messages.length - 1 &&
    m.sender._id !== messages[i + 1].sender._id &&
    m.sender._id !== loggedUser._id
  );
};

export const isLastMessage = (messages, m, i, loggedUser) => {
  return (
    i === messages.length - 1 && m.sender._id && m.sender._id !== loggedUser._id
  );
};

export const isSameSenderMargin = (messages, m, i, loggedUser) => {
  if (
    i < messages.length - 1 &&
    m.sender._id === messages[i + 1].sender._id &&
    m.sender._id !== loggedUser._id
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      m.sender._id !== messages[i + 1].sender._id &&
      m.sender._id !== loggedUser._id) ||
    (i === messages.length - 1 && m.sender._id !== loggedUser._id)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && m.sender._id === messages[i - 1].sender._id;
};
