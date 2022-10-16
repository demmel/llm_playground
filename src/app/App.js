import { useEffect, useReducer, useRef } from "react";
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
    outline: "none",
    width: "100%",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  rightColumn: {
    flexBasis: 400,
    flexGrow: 0,
    flexShrink: 0,
    borderLeft: "soild 1px #FFFFFF",
  },
  chatArea: {
    flexGrow: 1,
    flexShrink: 1,
    width: "100%",
    marginBottom: 12,
    overflow: "hidden",
  },
  chatAreaScroll: {
    overflowY: "scroll",
    height: "100%",
  },
  message: {
    whiteSpace: "pre-wrap",
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    "&:last-child": {
      marginBottom: 0,
    },
  },
  composer: {
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
  },
});

function reducer(state, action) {
  switch (action.type) {
    case "update_hf_token":
      return {
        ...state,
        hfToken: action.token,
      };
    case "send_prompt":
      return {
        ...state,
        messages: [...state.messages, action.text],
        waitingForReply: true,
      };
    case "receive_reply":
      return {
        ...state,
        messages: [...state.messages, action.text],
        waitingForReply: false,
      };
    default:
      throw new Error(
        `Action Type: ${action.type} does not have a handler defined`
      );
  }
}

export default function App() {
  const styles = useStyles();
  const [state, dispatch] = useReducer(reducer, {
    token: null,
    messages: [],
    waitingForReply: false,
  });
  const bottomRef = useRef(null);
  useEffect(() => {
    if (!state.waitingForReply) {
      return;
    }

    console.log(JSON.stringify(state.messages.join("\n") + "\n"));

    dispatch({ type: "receive_reply", text: "Wow!" });
  }, [state.messages, state.waitingForReply]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);
  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <div className={styles.mainContent}>
          <div className={styles.chatArea}>
            <Well height="100%">
              <div className={styles.chatAreaScroll}>
                {state.messages.map((message, i) => (
                  <div key={i} className={styles.message}>
                    {message}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </Well>
          </div>
          <div className={styles.composer}>
            <Composer
              onSubmit={(text) => dispatch({ type: "send_prompt", text })}
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.label}>Hugging Face Token</div>
          <Well>
            <input
              className={styles.oneLineUnput}
              type="text"
              value={state.token}
              onChange={(token) => dispatch({ type: "update_hf_token", token })}
            />
          </Well>
        </div>
      </div>
    </div>
  );
}
