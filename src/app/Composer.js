import * as React from "react";
import { useCallback } from "react";
import { createUseStyles } from "react-jss";
import Well from "./Well";

const DISABLED_COLOR = "#333333";

const useStyles = createUseStyles({
  input: {
    alignSelf: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#080808",
    color: "#FFFFFF",
    border: "none",
    fontSize: 16,
    lineHeight: 1,
    outline: "none",
    resize: "none",
    "&:disabled": {
      backgroundColor: DISABLED_COLOR,
    },
  },
});

export default function Composer({
  text,
  onChange,
  placeholder,
  disabled,
  onSubmit,
}) {
  const styles = useStyles();

  const onKeyDown = useCallback(
    function (event) {
      if (event.key === "Enter" && event.getModifierState("Shift")) {
        event.preventDefault();
        onSubmit(text);
      }
    },
    [onSubmit, text]
  );

  return (
    <Well height="100%" backgroundColor={disabled ? DISABLED_COLOR : undefined}>
      <textarea
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
}
