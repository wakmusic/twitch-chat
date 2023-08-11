import filter from "./assets/filter.json";
import { BadgeType, ChatType } from "./types";

export const IRC_REGEX = /^(@([^ ]*) )?(:([^ ]+) +)?([^ ]+)( *( .+))?/;

export const filterUser = (
  nickname: string,
  tagsObj: Record<string, string>
) => {
  const badges = tagsObj.badges;
  const special = ["broadcaster", "moderator", "vip", "verified"];

  if (badges) {
    for (const specialBadge of special) {
      return badges.includes(specialBadge);
    }
  }

  for (const filterObj of filter) {
    return nickname === filterObj.filters[0].value;
  }

  return false;
};

export const colors = [
  "#FF0000",
  "#0000FF",
  "#00FF00",
  "#B22222",
  "#FF7F50",
  "#9ACD32",
  "#FF4500",
  "#2E8B57",
  "#DAA520",
  "#D2691E",
  "#5F9EA0",
  "#1E90FF",
  "#FF69B4",
  "#8A2BE2",
  "#00FF7F",
];

export const parseMessage = (data: string): ChatType | null => {
  const parsed = IRC_REGEX.exec(data);
  if (!parsed) return null;

  const [, , tags, , user, command, , message] = parsed;

  if (!["PRIVMSG", "USERNOTICE"].includes(command)) return null;

  const tagsObj = tags.split(";").reduce((acc, tag) => {
    const [key, value] = tag.split("=");
    return { ...acc, [key]: value };
  }, {} as Record<string, string>);

  const id = user.split("!")[0];
  const nickname = tagsObj["display-name"];
  const [channel, content] = message.split(" :");
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
  let color = tagsObj.color;

  if (tagsObj.badges) {
    tagsObj.badges.split(",").forEach((badge) => {
      badges.push(badge);
    });
  }

  if (!color) {
    color = colors[parseInt(id, 36) % colors.length];
  }

  return {
    key: tagsObj.id,
    channel,
    id,
    nickname,
    content,
    emotes,
    color,
    badges,
    isNamed: filterUser(nickname, tagsObj),
  };
};

export const connectWebSocket = (
  channels: string[],
  delay: number,
  callback: (chat: ChatType) => void,
  reconnectCallback: (ws: WebSocket) => void
) => {
  const ws = new WebSocket("wss://irc-ws.chat.twitch.tv");

  ws.addEventListener("open", () => {
    console.log("Connected to Twitch");

    const randomNumber = Math.random() * 89999 + 10000;
    const randomId = `justinfan${randomNumber.toFixed(0)}`;

    console.log(`Using username ${randomId}`);

    ws.send("CAP REQ :twitch.tv/tags");
    ws.send("PASS SCHMOOPIIE");
    ws.send(`NICK ${randomId}`);
    ws.send(`USER ${randomId} 8 * :${randomId}`);

    console.log(`Joining channels ${channels.join(", ")}`);

    for (const channel of channels) {
      ws.send(`JOIN #${channel}`);
    }
  });

  ws.addEventListener("message", (e) => {
    const data: string[] = e.data.split("\r\n").filter((d: string) => d);

    for (const message of data) {
      const chat = parseMessage(message);

      if (!chat) {
        ws.send("PONG :tmi.twitch.tv");

        continue;
      }

      setTimeout(() => {
        callback(chat);
      }, delay);
    }
  });

  ws.addEventListener("close", () => {
    console.log("Disconnected from Twitch");

    ws.close();
    reconnectCallback(
      connectWebSocket(channels, delay, callback, reconnectCallback)
    );
  });

  return ws;
};

export const getBadges = (
  badgesData: BadgeType[],
  channel: string,
  badges: string[]
) => {
  const badgeImages: string[] = [];

  for (const badge of badges) {
    const [name, version] = badge.split("/");

    const hasChannelBadge = badgesData.some(
      (b) => b.set_id === channel + "-" + name
    );

    const badgeData = badgesData.find((b) =>
      hasChannelBadge ? b.set_id === channel + "-" + name : b.set_id === name
    );

    if (!badgeData) continue;

    const url = badgeData.versions.find(
      (versionData) => versionData.id === version
    )?.image_url_1x;

    if (!url) continue;

    badgeImages.push(url);
  }

  return badgeImages;
};
