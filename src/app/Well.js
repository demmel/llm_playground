import * as React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    padding: 8,
    backgroundColor: "#080808",
    boxShadow: "inset 0 0 5px #191919",
    borderRadius: 16,
    width: ({ width = "auto" }) => width,
    height: ({ height = "auto" }) => height,
    boxSizing: "border-box",
  },
});

export default function Well({ children, ...props }) {
  const styles = useStyles(props);
  return <div className={styles.root}>{children}</div>;
}
