import { createUseStyles } from "react-jss";
import sendSummarizationPrompt from "./sendSummarizationPrompt";
import ActorSettingsItem from "./ActorSettingsItem";
import TextInput from "./TextInput";
import Label from "./Label";
import Button from "./Button";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  },
});

export default function Sidebar({ actors, dispatch, hfToken, prompt }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div>
        <Label text="Actors" />
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
        <Label text={`Prompt Length: ${prompt.length}`} />
        <Button
          label="Copy Prompt"
          onClick={() => navigator.clipboard.writeText(prompt)}
        />
        <Button
          label="Summarize Conversation"
          onClick={() =>
            sendSummarizationPrompt({
              hfToken,
              prompt,
            })
              .then((response) => {
                navigator.clipboard.writeText(response).then(() => {
                  window.alert("Copied summary to clipboard.");
                });
              })
              .catch((e) => window.alert(e))
          }
        />
        <TextInput
          label="Hugging Face Token"
          value={hfToken}
          onChange={(e) =>
            dispatch({ type: "update_hf_token", token: e.target.value })
          }
        />
      </div>
    </div>
  );
}
