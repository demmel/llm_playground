import * as React from "react";
import { useCallback, useState } from "react";
import { createUseStyles } from "react-jss";
import { Action } from "./appReducer";
import Button from "./Button";
import Composer from "./Composer";
import { Config } from "./hfApi";
import Sidebar from "./Sidebar";

const useStyles = createUseStyles<string, { showSettings: boolean }>({
  root: {
    backgroundColor: "#121212",
    color: "#FFFFFF",
    width: "100%",
    minHeight: "100vh",
    padding: 16,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  composer: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  spacing: {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
  },
  settings: {
    marginTop: 16,
    display: ({ showSettings }) => (showSettings ? "block" : "none"),
  },
});

type Props = {
  stopSequences: ReadonlyArray<string>;
  hfConfig: Config;
  dispatch: React.Dispatch<Action>;
  hfToken: string;
  prompt: string;
  scrollRef: React.RefObject<HTMLTextAreaElement>;
  waitingForReply: boolean;
};

export default function MobileLayout({
  stopSequences,
  hfConfig,
  dispatch,
  hfToken,
  prompt,
  scrollRef,
  waitingForReply,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const styles = useStyles({ showSettings });

  const sendPrompt = useCallback(() => {
    dispatch({ type: "send_prompt", prompt });
  }, [dispatch, prompt]);

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
      <div className={styles.spacing}>
        <Button
          type="primary"
          disabled={sendDisabled}
          onClick={sendPrompt}
          label="Generate"
        />
      </div>
      <div className={styles.spacing}>
        <Button
          onClick={() => setShowSettings(!showSettings)}
          label="Settings"
        />
      </div>
      <div className={styles.settings}>
        <Sidebar
          stopSequences={stopSequences}
          hfConfig={hfConfig}
          dispatch={dispatch}
          hfToken={hfToken}
          prompt={prompt}
        />
      </div>
    </div>
  );
}
