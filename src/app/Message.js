import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    justifyContent: "space-between",
    whiteSpace: "pre-wrap",
    backgroundColor: ({ backgroundColor }) => backgroundColor,
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  deleteButton: {
    border: 0,
    marginLeft: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    "&:active": {
      backgroundColor: "rgba(0,0,0,0.7)",
    },
  },
});

export default function Message({ backgroundColor, message, onDelete }) {
  const styles = useStyles({
    backgroundColor,
  });
  return (
    <div className={styles.root}>
      {message}
      <button className={styles.deleteButton} onClick={onDelete}>
        X
      </button>
    </div>
  );
}
