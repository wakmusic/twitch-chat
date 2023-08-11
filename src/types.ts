export interface ChatType {
  key: string;
  channel: string;

  id: string;
  nickname: string;
  content: string;
  emotes: {
    [key: string]: string;
  };
  color: string;
  badges: string[];

  isNamed: boolean;

  badgeImages?: string[];
}

export type BadgeType = {
  set_id: string;
  versions: {
    id: string;
    image_url_1x: string;
  }[];
};
