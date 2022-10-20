import { createUseStyles } from "react-jss";
import sendSummarizationPrompt from "./sendSummarizationPrompt";
import Well from "./Well";
import ActorSettingsItem from "./ActorSettingsItem";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
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

export default function Sidebar({ actors, dispatch, hfToken, prompt }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
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
              navigator.clipboard.writeText(response).then(() => {
                window.alert("Copied summary to clipboard.");
              });
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
  );
}
