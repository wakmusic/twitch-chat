import { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import filter from "./assets/filter.json";
import Chat from "./components/Chat";
import { BadgeType, ChatType } from "./types";

const IRC_REGEX = /^(@([^ ]*) )?(:([^ ]+) +)?([^ ]+)( *( .+))?/;

const filterUser = (nickname: string, tagsObj: Record<string, string>) => {
  const badges = tagsObj.badges;
  const special = ["broadcaster", "moderator", "vip", "verified"];

  if (badges) {
    for (const specialBadge of special) {
      if (badges.includes(specialBadge)) {
        console.log("special", specialBadge);
        return true;
      }
    }
  }

  for (const filterObj of filter) {
    const value = filterObj.filters[0].value;

    if (nickname === value) {
      console.log("filter", value);
      return true;
    }
  }

  return true;
};

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
    const delay = Number(params.get("delay") || "5") * 1000;

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
      const parsed = IRC_REGEX.exec(e.data);
      if (!parsed) return;

      const [, , tags, , user, , , message] = parsed;

      const tagsObj = tags.split(";").reduce((acc, tag) => {
        const [key, value] = tag.split("=");
        return { ...acc, [key]: value };
      }, {} as Record<string, string>);

      const id = user.split("!")[0];
      const nickname = tagsObj["display-name"];
      const content = message.split(":")[1];
      const emotes = tagsObj.emotes
        ? tagsObj.emotes.split("/").reduce((acc, emote) => {
            const [id, indexes] = emote.split(":");

            indexes.split(",").forEach((index) => {
              acc[index] = id;
            });

            return acc;
          }, {} as Record<string, string>)
        : {};

      const badges: string[] = [];

      if (tagsObj.badges) {
        tagsObj.badges.split(",").forEach((badge) => {
          badges.push(badge);
        });
      }

      setTimeout(() => {
        setChats((prev) =>
          [
            ...prev,
            {
              id,
              nickname,
              content,
              emotes,
              color: tagsObj.color,
              badges,
            },
          ].slice(-100)
        );

        if (filterUser(nickname, tagsObj)) {
          setTopChats((prev) =>
            [
              ...prev,
              {
                id,
                nickname,
                content,
                emotes,
                color: tagsObj.color,
                badges,
              },
            ].slice(-50)
          );
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
