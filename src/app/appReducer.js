export default function appReducer(state, action) {
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
    case "add_actors":
      return {
        ...state,
        actors: {
          ...state.actors,
          ...action.actors,
        },
      };
    case "set_actor_props":
      return {
        ...state,
        actors: {
          ...state.actors,
          [action.actor]: action.props,
        },
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
    default:
      throw new Error(
        `Action Type: ${action.type} does not have a handler defined`
      );
  }
}
