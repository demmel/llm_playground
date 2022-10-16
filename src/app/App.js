import { useEffect, useReducer, useRef, useCallback } from "react";
import { createUseStyles } from "react-jss";
import appReducer from "./appReducer";
import Composer from "./Composer";
import sendPrompt from "./sendPrompt";
import Well from "./Well";
import Message from "./Message";
import ActorSettingsItem from "./ActorSettingsItem";
import nlp from "compromise";

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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  labelFollowing: {
    marginTop: 12,
    marginLeft: 8,
    fontSize: 24,
    fontWeight: "bold",
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
  actor: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "inset 0 0 2px rgba(64,64,64,0.3)",
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },
  composer: {
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
  },
});

export default function App() {
  const styles = useStyles();
  const [state, dispatch] = useReducer(appReducer, {
    hfToken: localStorage.getItem("hfToken") ?? "",
    actors: {},
    messages: [],
    waitingForReply: false,
  });
  const bottomRef = useRef(null);

  const getActorForMessage = useCallback((message) => {
    const normalized = nlp(message)
      .people()
      .normalize("heavy")
      .text()
      .replaceAll(/[.?!,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(" ")[0];
    const actor = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return actor;
  }, []);

  const addActors = useCallback(
    (messages) => {
      const actors = new Set(
        messages.map((m) => getActorForMessage(m)).filter((a) => a !== "")
      );

      for (const actor of Object.keys(state.actors)) {
        actors.delete(actor);
      }

      if (actors.size === 0) {
        return;
      }

      const actorColors = [
        "#1445a7",
        "#872323",
        "#135723",
        "#675708",
        "#451387",
        "#131367",
      ];

      let colorIndex = Object.keys(state.actors).length;
      const newActors = [...actors].reduce((newActors, name) => {
        newActors[name] = {
          name,
          stop:
            Object.keys(state.actors).length === 0 &&
            Object.keys(newActors).length === 0,
          color: actorColors[colorIndex++],
        };
        return newActors;
      }, {});

      dispatch({ type: "add_actors", actors: newActors });
    },
    [getActorForMessage, state.actors]
  );

  useEffect(() => {
    localStorage.setItem("hfToken", state.hfToken);
  }, [state.hfToken]);

  const unpackResponse = useCallback(
    (response, actors) => {
      let prev = response;
      let next = response;
      do {
        // Remove repeated messages and phrases.
        prev = next;
        next = prev.replaceAll(/([\s\S]{2,}?)\1+/g, "$1");
      } while (prev !== next);

      const allMessages = next
        .split("\n")
        .map((m) => m.trim())
        .filter((m) => m !== "");

      const stopActors = new Set(
        Object.entries(actors)
          .filter(([_, props]) => props.stop)
          .map(([name, _]) => name)
      );

      const stopIndex = allMessages.findIndex((m) =>
        stopActors.has(getActorForMessage(m))
      );

      const messages = allMessages.slice(
        0,
        stopIndex !== -1 ? stopIndex : allMessages.length
      );

      return messages;
    },
    [getActorForMessage]
  );

  useEffect(() => {
    if (!state.waitingForReply) {
      return;
    }
    sendPrompt({
      hfToken: state.hfToken,
      messages: state.messages,
    }).then((response) => {
      const messages = unpackResponse(response, state.actors);
      addActors(messages);
      dispatch({ type: "receive_replies", messages });
    });
    // dispatch({ type: "receive_replies", messages: ["Woe"] });
  }, [
    addActors,
    state.actors,
    state.hfToken,
    state.messages,
    state.waitingForReply,
    unpackResponse,
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
                <div>
                  {state.messages.map((message, i) => {
                    const actor = getActorForMessage(message);
                    const color = state.actors[actor]?.color ?? "#121212";
                    return (
                      <Message
                        key={i}
                        backgroundColor={color}
                        message={message}
                        onDelete={() => {
                          dispatch({ type: "delete_message", i });
                        }}
                      />
                    );
                  })}
                </div>
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
                const messages = text.split("\n").filter((m) => m !== "");
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
          {Object.values(state.actors).map(({ name, color, stop }) => (
            <ActorSettingsItem
              key={name}
              name={name}
              color={color}
              stop={stop}
              setStop={(stop) =>
                dispatch({
                  type: "set_actor_props",
                  actor: name,
                  props: { name, color, stop },
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
