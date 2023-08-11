import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Chat from "./components/Chat";
import { BadgeType, ChatType } from "./types";
import { connectWebSocket, getBadges } from "./utils";

const App: FC = () => {
  const [topChats, setTopChats] = useState<ChatType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);

  const ws = useRef<WebSocket | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const badges = useRef<BadgeType[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const channelsParam = params.getAll("channel");
    const channels =
      channelsParam.length === 0 ? ["woowakgood"] : channelsParam;

    (async () => {
      const globalRes = await fetch("https://api.wakscord.xyz/badges/global");
      const badges_: BadgeType[] = (await globalRes.json()).data;

      for (const channel of channels) {
        const channelRes = await fetch(
          "https://api.wakscord.xyz/badges/" + channel
        );

        const data: {
          data: BadgeType[];
        } = await channelRes.json();

        data.data.forEach((badge) => {
          badge.set_id = `${channel}-${badge.set_id}`;
          badges_.push(badge);
        });
      }

      badges.current = badges_;
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const delay = Number(params.get("delay") || "0") * 1000;
    const channelsParam = params.getAll("channel");
    const channels =
      channelsParam.length === 0 ? ["woowakgood"] : channelsParam;

    if (ws.current) return;

    const addChat = (chat: ChatType) => {
      if (chat.badges.length !== 0) {
        const channel = chat.channel.split("#")[1];

        chat.badgeImages = getBadges(badges.current, channel, chat.badges);
      }

      setChats((prev) => [...prev, chat].slice(-100));

      if (chat.isNamed) {
        setTopChats((prev) => [...prev, chat].slice(-50));
      }
    };

    ws.current = connectWebSocket(channels, delay, addChat, (newWebSocket) => {
      ws.current = newWebSocket;
    });
  }, []);

  useEffect(() => {
    if (!topRef.current) return;

    topRef.current.scrollTop = topRef.current.scrollHeight;
  }, [topChats]);

  useEffect(() => {
    if (!bottomRef.current) return;

    bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
  }, [chats]);

  return (
    <Container>
      <ChatContainer
        style={{
          height: "17vh",
          borderBottom: "3px solid #26262b",
          paddingBottom: "4px",
        }}
        ref={topRef}
      >
        {topChats.map((chat) => (
          <Chat key={chat.key} chat={chat} />
        ))}
      </ChatContainer>

      <ChatContainer style={{ height: "83vh" }} ref={bottomRef}>
        {chats.map((chat) => (
          <Chat key={chat.key} chat={chat} />
        ))}
      </ChatContainer>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: #26262b;
`;

const ChatContainer = styled.div`
  background: #18181b;

  overflow: hidden;

  padding: 10px;
  box-sizing: border-box;
`;

export default App;
