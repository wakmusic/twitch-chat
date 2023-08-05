import { FC, Fragment, ReactElement, useMemo } from "react";
import styled from "styled-components";
import Emote from "./Emote";

interface ContentProps {
  content: string;
  emotes: {
    [key: string]: string;
  };
}

const Content: FC<ContentProps> = ({ content, emotes }) => {
  const render: Array<ReactElement> = useMemo(() => {
    const render: Array<ReactElement> = [];

    let index = 0;
    let words = "";

    content.split(" ").forEach((word) => {
      const start = index;
      const end = index + word.length - 1;
      const idx = `${start}-${end}`;

      index += word.length + 1;

      if (emotes[idx]) {
        if (words) {
          render.push(<TextFragment>{words}</TextFragment>);

          words = "";
        }

        render.push(<Emote id={emotes[idx]} key={idx} />);
        render.push(<TextFragment> </TextFragment>);
      } else {
        words += `${word} `;
      }
    });

    if (words) {
      render.push(<TextFragment>{words}</TextFragment>);
    }

    return render;
  }, [content, emotes]);

  return (
    <Container>
      {render.map((element, index) => {
        return <Fragment key={index}>{element}</Fragment>;
      })}
    </Container>
  );
};

const Container = styled.div`
  display: inline;
  vertical-align: baseline;

  font-weight: 300;
  line-height: 1.3;
`;

const TextFragment = styled.span`
  vertical-align: middle;

  word-wrap: break-word;
`;

export default Content;
