import { useEffect, useReducer, useRef, useCallback } from "react";
import { createUseStyles } from "react-jss";
import appReducer from "./appReducer";
import Composer from "./Composer";
import sendChatPrompt from "./sendChatPrompt";
import sendSummarizationPrompt from "./sendSummarizationPrompt";
import Well from "./Well";
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
    justifyContent: "space-between",
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
  button: {
    border: 0,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#4D4D4D",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#606060",
    },
    "&:active": {
      backgroundColor: "#303030",
    },
  },
});

function getActorsForPrompt(prompt) {
  return nlp(prompt)
    .people()
    .normalize("heavy")
    .text()
    .replaceAll(/[.?!,/#!$%^&*;:{}=\-_`~()"']/g, "")
    .split(" ")
    .filter((a) => a !== "")
    .map((a) => a.charAt(0).toUpperCase() + a.slice(1));
}

function unpackResponse(response, actors) {
  let prev = response;
  let next = response;
  do {
    // Remove repeated messages and phrases.
    prev = next;
    next = prev.replaceAll(/([\s\S]{2,}?)\1+/g, "$1");
  } while (prev !== next);

  // const stopActors = new Set(
  //   Object.entries(actors)
  //     .filter(([_, props]) => props.stop)
  //     .map(([name, _]) => name)
  // );

  return response;
}

export default function App() {
  const styles = useStyles();
  const [state, dispatch] = useReducer(appReducer, {
    hfToken: localStorage.getItem("hfToken") ?? "",
    actors: {},
    prompt: "",
    waitingForReply: false,
    scrollToBottom: false,
  });
  const bottomRef = useRef(null);

  const addActors = useCallback(
    (prompt) => {
      const actors = new Set(getActorsForPrompt(prompt));

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
    [state.actors]
  );

  useEffect(() => {
    localStorage.setItem("hfToken", state.hfToken);
  }, [state.hfToken]);

  useEffect(() => {
    if (!state.waitingForReply) {
      return;
    }
    sendChatPrompt({
      hfToken: state.hfToken,
      prompt: state.prompt,
    }).then((response) => {
      const addendum = unpackResponse(response, state.actors);
      addActors(addendum);
      dispatch({ type: "receive_replies", prompt: state.prompt + addendum });
    });
  }, [
    addActors,
    state.actors,
    state.hfToken,
    state.prompt,
    state.waitingForReply,
  ]);

  useEffect(() => {
    if (!state.scrollToBottom) {
      return;
    }
    dispatch({ type: "finish_scroll" });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.scrollToBottom]);

  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        <div className={styles.mainContent}>
          <Composer
            text={state.prompt}
            onChange={(e) => {
              const prompt = e.target.value;
              dispatch({
                type: "set_prompt",
                prompt,
              });
            }}
            disabled={state.waitingForReply || state.hfToken === ""}
            placeholder={
              state.hfToken === ""
                ? "You need to enter you Hugging Face Token first."
                : "Set the scene.  What's the setting?  Who's involed?  What are their motivations?"
            }
            onSubmit={(prompt) => {
              console.log(prompt);
              addActors(prompt);
              dispatch({ type: "send_prompt", prompt });
            }}
          />
        </div>
        <div className={styles.rightColumn}>
          <div>
            <div className={styles.label}>Actors</div>
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
          <div>
            <div className={styles.label}>Prompt Length: {prompt.length}</div>
            <button
              className={styles.button}
              onClick={() => navigator.clipboard.writeText(prompt)}
            >
              Copy Prompt
            </button>
            <button
              className={styles.button}
              onClick={() =>
                sendSummarizationPrompt({
                  hfToken: state.hfToken,
                  prompt,
                }).then((response) => {
                  navigator.clipboard.writeText(response);
                  window.alert("Copied summary to clipboard.");
                })
              }
            >
              Summarize Conversation
            </button>
            <div className={styles.labelFollowing}>Hugging Face Token</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
