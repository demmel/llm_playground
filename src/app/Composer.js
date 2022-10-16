import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import Well from "./Well";

const TEXT_AREA_LINE_HEIGHT = 16;

const useStyles = createUseStyles({
  input: {
    width: "100%",
    backgroundColor: "#080808",
    color: "#FFFFFF",
    border: "none",
    fontSize: 16,
    lineHeight: 1,
    outline: "none",
    resize: "none",
  },
});

export default function Composer({ onSubmit }) {
  const styles = useStyles();
  const ref = useRef(null);
  const [rows, setRows] = useState(1);
  const [text, setText] = useState("");

  const clearComposer = useCallback(
    function () {
      setRows(1);
      setText("");
    },
    [setRows, setText]
  );

  const onChange = useCallback(
    function (event) {
      const newRows = ~~(
        event.currentTarget.scrollHeight / TEXT_AREA_LINE_HEIGHT
      );
      if (newRows !== rows) {
        setRows(newRows);
      }

      const input = event.currentTarget.value;
      setText(input);
    },
    [rows]
  );

  const onSubmitWrapper = useCallback(
    function (e) {
      e.preventDefault();

      if (text === "") {
        return;
      }

      onSubmit(text);
      clearComposer();
    },
    [clearComposer, onSubmit, text]
  );

  const onKeyDown = useCallback(
    function (event) {
      if (event.key === "Enter" && !event.getModifierState("Shift")) {
        event.preventDefault();
        onSubmitWrapper(event);
      }
    },
    [onSubmitWrapper]
  );

  return (
    <Well>
      <textarea
        ref={ref}
        rows={rows}
        autoFocus={true}
        className={styles.input}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </Well>
  );
}
