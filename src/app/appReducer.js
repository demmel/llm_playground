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
        messages: [...state.messages, ...action.messages],
        waitingForReply: true,
        scrollToBottom: true,
      };
    case "receive_replies":
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        waitingForReply: false,
        scrollToBottom: true,
      };
    case "finish_scroll":
      return {
        ...state,
        scrollToBottom: false,
      };
    case "delete_message":
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, action.i),
          ...state.messages.slice(action.i + 1),
        ],
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
    default:
      throw new Error(
        `Action Type: ${action.type} does not have a handler defined`
      );
  }
}
