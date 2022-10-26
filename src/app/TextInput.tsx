import * as React from "react";
import { createUseStyles } from "react-jss";
import Well from "./Well";
import Label from "./Label";

const useStyles = createUseStyles({
  oneLineUnput: {
    fontSize: 16,
    backgroundColor: "#080808",
    color: "#FFFFFF",
    border: "none",
    outline: "none",
    width: "100%",
  },
});

type Props = {
  label?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function TextInput({ label, value, onChange }: Props) {
  const styles = useStyles();
  return (
    <div>
      {label && <Label text={label} />}
      <Well>
        <input
          className={styles.oneLineUnput}
          type="text"
          value={value}
          onChange={onChange}
        />
      </Well>
    </div>
  );
}
