import * as React from "react";
import { useCallback } from "react";
import { createUseStyles } from "react-jss";
import Well from "./Well";

const DISABLED_COLOR = "#333333";

const useStyles = createUseStyles({
  input: {
    alignSelf: "center",
    width: "100%",
    flexGrow: 1,
    backgroundColor: "#080808",
    color: "#FFFFFF",
    border: "none",
    fontSize: 24,
    lineHeight: 1,
    outline: "none",
    resize: "none",
    "&:disabled": {
      backgroundColor: DISABLED_COLOR,
    },
  },
});

type Props = {
  text: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  disabled: boolean;
  onSubmit: (_: string) => void;
};

export default React.forwardRef<HTMLTextAreaElement, Props>(function Composer(
  { text, onChange, placeholder, disabled, onSubmit }: Props,
  ref
) {
  const styles = useStyles();

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> =
    useCallback(
      function (event) {
        if (event.key === "Enter" && event.getModifierState("Shift")) {
          event.preventDefault();
          onSubmit(text);
        }
      },
      [onSubmit, text]
    );

  return (
    <Well backgroundColor={disabled ? DISABLED_COLOR : undefined}>
      <textarea
        ref={ref}
        autoFocus={true}
        className={styles.input}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
      />
    </Well>
  );
});
