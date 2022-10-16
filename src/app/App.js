import { useEffect, useReducer, useRef, useCallback } from "react";
import { createUseStyles } from "react-jss";
import Composer from "./Composer";
import sendPrompt from "./sendPrompt";
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
    fontSize: 18,
    marginBottom: 8,
  },
  labelFollowing: {
    marginTop: 12,
    marginLeft: 8,
    fontSize: 18,
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
    display: "flex",
    flexDirection: "column",
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
    width: "100%",
    paddingRight: 6,
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
  actor: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "inset 0 0 2px rgba(64,64,64,0.3)",
    borderRadius: 16,
    padding: 8,
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
        messages: [...state.messages, ...action.messages],
        waitingForReply: true,
      };
    case "receive_replies":
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        waitingForReply: false,
      };
    case "add_actors":
      const actors = { ...state.actors };
      for (const name of action.actors) {
        actors[name] = { stopAt: true };
      }
      return {
        ...state,
        actors,
      };
    case "set_actor_props":
      return {
        ...state,
        actors: {
          ...state.actors,
          [action.actor]: action.props,
        },
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
    hfToken: localStorage.getItem("hfToken") ?? "",
    actors: {},
    messages: [],
    waitingForReply: false,
  });
  const bottomRef = useRef(null);

  const addActors = useCallback(
    (messages) => {
      const actorsDuplicative = messages
        .map((m) => m.match(/^(.+):/))
        .filter((m) => m != null)
        .map((m) => m[1])
        .filter((m) => !Object.keys(state.actors).includes(m));
      const actors = new Set(actorsDuplicative);
      if (actors.size === 0) {
        return;
      }
      dispatch({ type: "add_actors", actors });
    },
    [state.actors]
  );

  useEffect(() => {
    localStorage.setItem("hfToken", state.hfToken);
  }, [state.hfToken]);

  useEffect(() => {
    if (!state.waitingForReply) {
      return;
    }
    sendPrompt({
      hfToken: state.hfToken,
      messages: state.messages,
    }).then((response) => {
      const allMessages = response
        // Remove repeated messages and phrases.
        .replace(/(.{2,}?)\1+/, "$1")
        .split("\n")
        .map((m) => m.trim())
        .filter((m) => m !== "");
      const stopActors = Object.entries(state.actors)
        .filter(([_, props]) => props.stopAt)
        .map(([name, _]) => name);
      const stopIndex = allMessages.findIndex(
        (m) => stopActors.findIndex((a) => m.startsWith(`${a}:`)) !== -1
      );

      const messages = allMessages.slice(
        0,
        stopIndex !== -1 ? stopIndex : allMessages.length
      );

      addActors(messages);
      dispatch({ type: "receive_replies", messages });
    });
  }, [
    addActors,
    state.actors,
    state.hfToken,
    state.messages,
    state.waitingForReply,
  ]);

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
              disabled={
                state.waitingForReply ||
                state.hfToken == null ||
                state.hfToken === ""
              }
              placeholder={
                state.hfToken == null || state.hfToken === ""
                  ? "You need to enter you Hugging Face Token first"
                  : state.waitingForReply
                  ? "Waiting for a reply..."
                  : state.messages.length === 0
                  ? "Set the scene"
                  : null
              }
              onSubmit={(text) => {
                const messages = text.split("\n");
                addActors(messages);
                dispatch({ type: "send_prompt", messages });
              }}
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.label}>Hugging Face Token</div>
          <Well>
            <input
              className={styles.oneLineUnput}
              type="text"
              value={state.hfToken}
              onChange={(e) =>
                dispatch({ type: "update_hf_token", token: e.target.value })
              }
            />
          </Well>
          <div className={styles.labelFollowing}>Actors</div>
          {Object.entries(state.actors).map(([name, props]) => (
            <div key={name} className={styles.actor}>
              <span>{name}</span>
              <span>
                Stop?:
                <input
                  type="checkbox"
                  checked={props.stopAt}
                  onChange={(e) => {
                    dispatch({
                      type: "set_actor_props",
                      actor: name,
                      props: { ...props, stopAt: e.target.checked },
                    });
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
