import filter from "./assets/filter.json";
import { ChatType } from "./types";

export const IRC_REGEX = /^(@([^ ]*) )?(:([^ ]+) +)?([^ ]+)( *( .+))?/;

export const filterUser = (
  nickname: string,
  tagsObj: Record<string, string>
) => {
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
    id,
    nickname,
    content,
    emotes,
    color,
    badges,
    isNamed: filterUser(nickname, tagsObj),
  };
};
