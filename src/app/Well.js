import * as React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: 8,
    backgroundColor: ({ backgroundColor = "#080808" }) => backgroundColor,
    boxShadow: "inset 0 0 2px #191919",
    borderRadius: 16,
    boxSizing: "border-box",
  },
});

export default function Well({ children, ...props }) {
  const styles = useStyles(props);
  return <div className={styles.root}>{children}</div>;
}
