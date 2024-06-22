import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const loggedUserId = user.user.id;
  return (
    <ScrollableFeed>
      {messages &&
        messages.map((ele) => {
          return (
            <div key={ele.id} style={{ display: "flex" }}>
              {ele.userId !== loggedUserId && (
                <Tooltip
                  label={ele.user.userId}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt={"7px"}
                    mr={1}
                    size={"sm"}
                    cursor={"pointer"}
                    name={ele.user.userId}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: `${
                    ele.userId === loggedUserId ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  borderRadius: "10px",
                  padding: "3px 15px",
                  maxWidth: "75%",
                  marginLeft: `${ele.userId === loggedUserId ? "auto" : "0px"}`,
                  marginTop: "5px",
                }}
              >
                {ele.message}
              </span>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
