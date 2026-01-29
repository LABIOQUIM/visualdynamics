import classes from "./card.module.css";

import { Card } from "@mantine/core";

export default {
  Card: Card.extend({
    classNames: classes,
    defaultProps: {
      radius: "md",
      withBorder: true,
    },
  }),
};
