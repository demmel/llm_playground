import { createUseStyles } from "react-jss";
import Composer from "./Composer";
import sendSummarizationPrompt from "./sendSummarizationPrompt";
import Well from "./Well";
import ActorSettingsItem from "./ActorSettingsItem";

const useStyles = createUseStyles({
  root: {
    backgroundColor: "#121212",
    color: "#FFFFFF",
    width: "100%",
    height: "100vh",
    padding: 16,
    boxSizing: "border-box",
    display: "flex",
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
    flexGrow: 2,
    flexShrink: 0,
    marginRight: 8,
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 400,
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

export default function DesktopLayout({
  actors,
  addActors,
  dispatch,
  hfToken,
  prompt,
  scrollRef,
  waitingForReply,
}) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.mainContent}>
        <Composer
          ref={scrollRef}
          text={prompt}
          onChange={(e) => {
            const prompt = e.target.value;
            dispatch({
              type: "set_prompt",
              prompt,
            });
          }}
          disabled={waitingForReply || hfToken === ""}
          placeholder={
            hfToken === ""
              ? "You need to enter you Hugging Face Token first."
              : "Set the scene.  What's the setting?  Who's involed?  What are their motivations?"
          }
          onSubmit={(prompt) => {
            addActors(prompt);
            dispatch({ type: "send_prompt", prompt });
          }}
        />
      </div>
      <div className={styles.rightColumn}>
        <div>
          <div className={styles.label}>Actors</div>
          {Object.values(actors).map(({ name, color, stop }) => (
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
                hfToken,
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
              value={hfToken}
              onChange={(e) =>
                dispatch({ type: "update_hf_token", token: e.target.value })
              }
            />
          </Well>
        </div>
      </div>
    </div>
  );
}
