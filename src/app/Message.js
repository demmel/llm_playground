import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  message: {
    whiteSpace: "pre-wrap",
    backgroundColor: ({ backgroundColor }) => backgroundColor,
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    "&:last-child": {
      marginBottom: 0,
    },
  },
});

export default function Message({ backgroundColor, message }) {
  const styles = useStyles({
    backgroundColor,
  });
  return <div className={styles.message}>{message}</div>;
}
