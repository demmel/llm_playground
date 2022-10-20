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
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 2,
    flexShrink: 0,
    marginRight: 8,
  },
  rightColumn: {
    width: 400,
    flexGrow: 0,
    flexShrink: 0,
    borderLeft: "soild 1px #FFFFFF",
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
        <Sidebar actors={actors} dispatch={dispatch} hfToken={hfToken} />
      </div>
    </div>
  );
}
