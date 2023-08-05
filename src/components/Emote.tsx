import { FC } from "react";
import styled from "styled-components";

interface EmoteProps {
  id: string;
}

const Emote: FC<EmoteProps> = ({ id }) => {
  return (
    <Container>
      <EmoteImage
        src={`https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/light/3.0`}
      />
    </Container>
  );
};

const Container = styled.div`
  display: inline-block;
  vertical-align: middle;

  user-select: none;
  pointer-events: none;
`;

export const EmoteImage = styled.img`
  width: 28px;
  height: 28px;
`;

export default Emote;
