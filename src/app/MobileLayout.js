import { useCallback, useState } from "react";
import { createUseStyles } from "react-jss";
import Composer from "./Composer";
import Sidebar from "./Sidebar";

const useStyles = createUseStyles({
  root: {
    backgroundColor: "#121212",
    color: "#FFFFFF",
    width: "100%",
    height: "100vh",
    padding: 16,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  composer: {
    height: "100%",
  },
  button: {
    border: 0,
    height: 64,
    fontSize: 24,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: "#4D4D4D",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#606060",
    },
    "&:active": {
      backgroundColor: "#303030",
    },
    "&:disabled": {
      backgroundColor: "#808080",
    },
  },
  submitButton: {
    border: 0,
    height: 64,
    fontSize: 24,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: "#4D804d",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#608060",
    },
    "&:active": {
      backgroundColor: "#306030",
    },
    "&:disabled": {
      backgroundColor: "#808080",
    },
  },
  settings: {
    marginTop: 16,
    display: ({ showSettings }) => (showSettings ? "block" : "none"),
  },
});

export default function MobileLayout({
  actors,
  addActors,
  dispatch,
  hfToken,
  prompt,
  scrollRef,
  waitingForReply,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const styles = useStyles({ showSettings });

  const sendPrompt = useCallback(() => {
    addActors(prompt);
    dispatch({ type: "send_prompt", prompt });
  }, [addActors, dispatch, prompt]);

  const sendDisabled = waitingForReply || hfToken === "";

  return (
    <div className={styles.root}>
      <div className={styles.composer}>
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
          disabled={sendDisabled}
          placeholder={
            hfToken === ""
              ? "You need to enter you Hugging Face Token first."
              : "Set the scene.  What's the setting?  Who's involed?  What are their motivations?"
          }
          onSubmit={sendPrompt}
        />
      </div>
      <button
        className={styles.submitButton}
        disabled={sendDisabled}
        onClick={sendPrompt}
      >
        Generate
      </button>
      <button
        className={styles.button}
        onClick={() => setShowSettings(!showSettings)}
      >
        Settings
      </button>
      <div className={styles.settings}>
        <Sidebar actors={actors} dispatch={dispatch} hfToken={hfToken} />
      </div>
    </div>
  );
}
