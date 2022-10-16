import { useReducer } from "react";
import { createUseStyles } from "react-jss";
import Composer from "./Composer";
import Well from "./Well";

const useStyles = createUseStyles({
  root: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    width: "100%",
    height: "100vh",
    padding: 16,
    boxSizing: "border-box",
  },
  columns: {
    display: "flex",
    backgroundColor: "#121212",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 16,
    boxSizing: "border-box",
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  oneLineUnput: {
    fontSize: 16,
    backgroundColor: "#080808",
    color: "#FFFFFF",
    border: "none",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 16,
  },
  rightColumn: {
    flexGrow: 0,
    flexShrink: 0,
    borderLeft: "soild 1px #FFFFFF",
  },
  chatArea: {
    flexGrow: 1,
    flexShrink: 1,
    width: "100%",
    marginBottom: 16,
  },
  composer: {
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
  },
});

function reducer(state, action) {
  return state;
}

export default function App() {
  const styles = useStyles();
  const [state, dispatch] = useReducer(reducer, {});
  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <div className={styles.mainContent}>
          <div className={styles.chatArea}>
            <Well height="100%" />
          </div>
          <div className={styles.composer}>
            <Composer />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.label}>Hugging Face Token</div>
          <Well>
            <input className={styles.oneLineUnput} type="text" />
          </Well>
        </div>
      </div>
    </div>
  );
}
