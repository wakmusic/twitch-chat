import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Chat from "./components/Chat";
import { BadgeType, ChatType } from "./types";
import { parseMessage } from "./utils";

const App: FC = () => {
  const ws = useRef<WebSocket | null>(null);
  const [topChats, setTopChats] = useState<ChatType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [badges, setBadges] = useState<BadgeType[]>([]);

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const channel = params.get("channel") || "woowakgood";

    (async () => {
      const globalRes = await fetch("https://api.wakscord.xyz/badges/global");
      const badges: BadgeType[] = (await globalRes.json()).data;

      const channelRes = await fetch(
        "https://api.wakscord.xyz/badges/" + channel
      );

      const data: {
        data: BadgeType[];
      } = await channelRes.json();

      data.data.forEach((badge) => {
        const index = badges.findIndex((b) => b.set_id === badge.set_id);

        if (index === -1) {
          badges.push(badge);
        } else {
          badges[index] = badge;
        }

        badges.push(badge);
      });

      setBadges(badges);
    })();
  }, []);

  useEffect(() => {
    if (ws.current) return;

    const params = new URLSearchParams(location.search);
    const channel = params.get("channel") || "woowakgood";
    const delay = Number(params.get("delay") || "0") * 1000;

    ws.current = new WebSocket("wss://irc-ws.chat.twitch.tv");
    ws.current.addEventListener("open", () => {
      console.log("Connected to Twitch");
      ws.current!.send("CAP REQ :twitch.tv/tags");
      ws.current!.send("PASS SCHMOOPIIE");
      ws.current!.send("NICK justinfan42601");
      ws.current!.send("USER justinfan42601 8 * :justinfan42601");
      ws.current!.send("JOIN #" + channel);
    });

    ws.current.addEventListener("message", (e) => {
      const chat = parseMessage(e.data);

      if (!chat) return;

      setTimeout(() => {
        setChats((prev) => [...prev, chat].slice(-100));

        if (chat.isNamed) {
          setTopChats((prev) => [...prev, chat].slice(-50));
        }
      }, delay);
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
        {topChats.map((chat, index) => (
          <Chat key={index} chat={chat} badges={badges} />
        ))}
      </ChatContainer>

      <ChatContainer style={{ height: "83vh" }} ref={bottomRef}>
        {chats.map((chat, index) => (
          <Chat key={index} chat={chat} badges={badges} />
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
