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
    default:
      throw new Error(
        `Action Type: ${action.type} does not have a handler defined`
      );
  }
}
