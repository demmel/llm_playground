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
      };
    case "receive_replies":
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        waitingForReply: false,
      };
    case "add_actors":
      const actors = { ...state.actors };
      for (const name of action.actors) {
        actors[name] = { stopAt: true };
      }
      return {
        ...state,
        actors,
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
