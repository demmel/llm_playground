import type { Task, Config, Configs } from "./hfApi";

type State = {
  hfToken: string;
  hfConfig: Config;
  prompt: string;
  stopSequences: ReadonlyArray<string>;
  waitingForReply: boolean;
  scrollToBottom: boolean;
};

export type Action =
  | { type: "update_hf_token"; token: string }
  | { type: "send_prompt"; prompt: string }
  | { type: "receive_replies"; prompt: string }
  | { type: "finish_scroll" }
  | { type: "set_prompt"; prompt: string }
  | { type: "set_task"; task: Task }
  | {
      type: "set_param";
      name: keyof Configs[Task]["parameters"];
      value: number;
    }
  | { type: "set_stop_sequence"; stopSequences: ReadonlyArray<string> };

export default function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "update_hf_token":
      return {
        ...state,
        hfToken: action.token,
      };
    case "send_prompt":
      return {
        ...state,
        prompt: action.prompt,
        waitingForReply: true,
        scrollToBottom: true,
      };
    case "receive_replies":
      return {
        ...state,
        prompt: action.prompt,
        waitingForReply: false,
        scrollToBottom: true,
      };
    case "finish_scroll":
      return {
        ...state,
        scrollToBottom: false,
      };
    case "set_prompt":
      return {
        ...state,
        prompt: action.prompt,
      };
    case "set_task":
      return {
        ...state,
        hfConfig: {
          ...state.hfConfig,
          task: action.task,
        },
      };
    case "set_param":
      const task = state.hfConfig.task;
      const configs = state.hfConfig.configs;
      const config = configs[task];
      const parameters = config.parameters;
      return {
        ...state,
        hfConfig: {
          ...state.hfConfig,
          configs: {
            ...configs,
            [task]: {
              ...config,
              parameters: {
                ...parameters,
                [action.name]: action.value,
              },
            },
          },
        },
      };
    case "set_stop_sequence":
      return {
        ...state,
        stopSequences: action.stopSequences,
      };
  }
}
