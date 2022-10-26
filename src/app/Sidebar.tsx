import type { Config, Task, Parameters } from "./hfApi";
import type { Action } from "./appReducer";

import * as React from "react";
import { createUseStyles } from "react-jss";
import TextInput from "./TextInput";
import Label from "./Label";
import Button from "./Button";
import { CONFIGS } from "./hfApi";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { useCallback } from "react";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  },
  paramSelector: {
    marginTop: 8,
    marginLeft: 8,
  },
  paramHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paramInput: {
    width: "15%",
  },
  paramSlider: {
    width: "100%",
  },
  spacing: {
    marginTop: 12,
  },
});

type Props = {
  dispatch: React.Dispatch<Action>;
  hfToken: string;
  hfConfig: Config;
  prompt: string;
  stopSequences: ReadonlyArray<string>;
};

export default function Sidebar({
  dispatch,
  hfToken,
  hfConfig,
  prompt,
  stopSequences,
}: Props) {
  const styles = useStyles();
  const config = hfConfig.configs[hfConfig.task];
  const config_def = CONFIGS[hfConfig.task];

  const setParamValue = useCallback(
    (name: keyof Parameters<Task>, rawValue: string) => {
      const value = (function () {
        switch (config_def.parameters[name].type) {
          case "int":
            return Number.parseInt(rawValue);
          case "float":
            return Number.parseFloat(rawValue);
          default:
            throw new Error(
              `${config_def.parameters[name].type} is not implementfor setParamValue`
            );
        }
      })();

      dispatch({ type: "set_param", name, value });
    },
    [config_def.parameters, dispatch]
  );

  return (
    <div className={styles.root}>
      <div>
        <Label text="Task" />
        <Dropdown
          options={Object.keys(CONFIGS)}
          onChange={(task) =>
            dispatch({
              type: "set_task",
              task: task.value as Task,
            })
          }
          value={hfConfig.task}
          placeholder="Select a task"
        />
        {Object.entries(config_def.parameters).map(
          ([param_name, param_def]) => (
            <div className={styles.paramSelector} key={param_name}>
              <div className={styles.paramHeader}>
                {param_name}
                <div className={styles.paramInput}>
                  <TextInput
                    value={String(
                      config.parameters[param_name as keyof Parameters<Task>]
                    )}
                    onChange={(e) =>
                      setParamValue(
                        param_name as keyof Parameters<Task>,
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              {param_def.min != null && param_def.max != null && (
                <input
                  className={styles.paramSlider}
                  type="range"
                  min={param_def.min}
                  max={param_def.max}
                  step={
                    config_def.parameters[param_name as keyof Parameters<Task>]
                      .type === "float"
                      ? 0.01
                      : 1
                  }
                  value={
                    config.parameters[param_name as keyof Parameters<Task>]
                  }
                  onChange={(e) =>
                    setParamValue(
                      param_name as keyof Parameters<Task>,
                      e.target.value
                    )
                  }
                />
              )}
            </div>
          )
        )}
        <TextInput
          label="Stop Sequence"
          value={stopSequences[0] ?? ""}
          onChange={(e) =>
            dispatch({
              type: "set_stop_sequence",
              stopSequences: e.target.value !== "" ? [e.target.value] : [],
            })
          }
        />
      </div>
      <div>
        <Label text={`Prompt Length: ${prompt.length}`} />
        <Button
          label="Copy Prompt"
          onClick={() => navigator.clipboard.writeText(prompt)}
        />
        <div className={styles.spacing}>
          <TextInput
            label="Hugging Face Token"
            value={hfToken}
            onChange={(e) =>
              dispatch({ type: "update_hf_token", token: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
