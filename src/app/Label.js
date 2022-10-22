import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  label: {
    marginLeft: 8,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default function Label({ text }) {
  const styles = useStyles();
  return <div className={styles.label}>{text}</div>;
}
