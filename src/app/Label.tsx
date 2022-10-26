import * as React from "react";

import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  label: {
    marginLeft: 8,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

type Props = {
  text: string;
};

export default function Label({ text }: Props) {
  const styles = useStyles();
  return <div className={styles.label}>{text}</div>;
}
