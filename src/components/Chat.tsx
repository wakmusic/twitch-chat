import { FC } from "react";
import styled from "styled-components";
import { ChatType } from "../types";
import Content from "./Content";

interface ChatProps {
  chat: ChatType;
}

const Chat: FC<ChatProps> = ({ chat }) => {
  return (
    <ChatBox>
      <InnerContainer>
        {chat.badgeImages?.map((url, idx) => (
          <Badge key={idx} src={url} />
        ))}
        <Nickname color={chat.color}>{chat.nickname} </Nickname>
        <Id color={chat.color}>({chat.id})</Id>:{" "}
        <Content content={chat.content} emotes={chat.emotes} />
      </InnerContainer>
    </ChatBox>
  );
};

const ChatBox = styled.div`
  color: white;
  font-size: 14px;
  line-height: 16px;

  margin-bottom: 10px;
`;

const InnerContainer = styled.div`
  display: inline-block;
`;

const Badge = styled.img`
  margin-right: 3px;

  display: inline-block;
  vertical-align: sub;
`;

const Nickname = styled.span<{ color: string }>`
  color: ${(props) => props.color};
`;

const Id = styled.span<{ color: string }>`
  color: ${(props) => props.color};
  opacity: 0.6;
`;

export default Chat;
