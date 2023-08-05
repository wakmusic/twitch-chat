import { FC } from "react";
import styled from "styled-components";
import { BadgeType, ChatType } from "../types";
import Content from "./Content";

interface ChatProps {
  chat: ChatType;
  badges: BadgeType[];
}

const Chat: FC<ChatProps> = ({ chat, badges }) => {
  return (
    <ChatBox>
      {chat.badges.map((badge) => {
        const [name, version] = badge.split("/");
        const badgeData = badges.find((badge) => badge.set_id === name);

        if (!badgeData) return null;

        const url = badgeData.versions.find(
          (versionData) => versionData.id === version
        )?.image_url_1x;

        return <Badge key={badge} src={url} alt={name} />;
      })}
      <Nickname color={chat.color}>{chat.nickname} </Nickname>
      <Id color={chat.color}>({chat.id})</Id>:{" "}
      <Content content={chat.content} emotes={chat.emotes} />
    </ChatBox>
  );
};

const ChatBox = styled.div`
  min-height: 30px;

  color: white;
  font-size: 14px;
  line-height: 16px;
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
