import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  actor: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: ({ color }) => color,
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },
});

export default function ActorSettingsItem({ name, color, stop, setStop }) {
  const styles = useStyles({ color });
  return (
    <div key={name} className={styles.actor}>
      <span>{name}</span>
      <span>
        Stop?:
        <input
          type="checkbox"
          checked={stop}
          onChange={(e) => {
            setStop(e.target.checked);
          }}
        />
      </span>
    </div>
  );
}
