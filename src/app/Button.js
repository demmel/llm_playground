import { createUseStyles } from "react-jss";
import { isMobile } from "react-device-detect";

const BUTTON_TYPES = Object.freeze({
  normal: {
    colors: {
      background: "#4D4D4D",
      backgroundHover: "#606060",
      backgroundActive: "#303030",
      backgroundDisabled: "#808080",
      text: "#FFFFFF",
    },
  },
  primary: {
    colors: {
      background: "#4D804d",
      backgroundHover: "#608060",
      backgroundActive: "#306030",
      backgroundDisabled: "#808080",
      text: "#FFFFFF",
    },
  },
});

const useStyles = createUseStyles({
  root: {
    border: 0,
    height: isMobile ? 64 : 32,
    fontSize: isMobile ? 24 : 16,
    borderRadius: 12,
    backgroundColor: ({ type }) => BUTTON_TYPES[type].colors.background,
    color: ({ type }) => BUTTON_TYPES[type].colors.text,
    "&:hover": {
      backgroundColor: ({ type }) => BUTTON_TYPES[type].colors.backgroundHover,
    },
    "&:active": {
      backgroundColor: ({ type }) => BUTTON_TYPES[type].colors.backgroundActive,
    },
    "&:disabled": {
      backgroundColor: ({ type }) =>
        BUTTON_TYPES[type].colors.backgroundDisabled,
    },
  },
});

export default function Button({ type = "normal", label, onClick }) {
  const styles = useStyles({ type });
  return (
    <button className={styles.root} onClick={onClick}>
      {label}
    </button>
  );
}
