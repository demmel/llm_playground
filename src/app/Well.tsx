import * as React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles<string, { backgroundColor?: string }>({
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

type Props = {
  children: React.ReactNode;
  backgroundColor?: string;
};

export default function Well({ children, ...props }: Props) {
  const styles = useStyles(props);
  return <div className={styles.root}>{children}</div>;
}
