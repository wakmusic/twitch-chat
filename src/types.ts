export interface ChatType {
  id: string;
  nickname: string;
  content: string;
  emotes: {
    [key: string]: string;
  };
  color: string;
  badges: string[];

  isNamed: boolean;
}

export type BadgeType = {
  set_id: string;
  versions: {
    id: string;
    image_url_1x: string;
  }[];
};
