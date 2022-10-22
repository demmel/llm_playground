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

export default function TextInput({ label, value, onChange }) {
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
