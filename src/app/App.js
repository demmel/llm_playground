import { useEffect, useReducer, useRef } from "react";
import appReducer from "./appReducer";
import { send } from "./hfApi";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { isMobile } from "react-device-detect";
import { getInitialState } from "./hfApi";

export default function App() {
  const [state, dispatch] = useReducer(appReducer, {
    hfToken: localStorage.getItem("hfToken") ?? "",
    hfConfig: getInitialState(),
    actors: {},
    prompt: "",
    waitingForReply: false,
    scrollToBottom: false,
  });
  console.log(state.hfConfig);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("hfToken", state.hfToken);
  }, [state.hfToken]);

  useEffect(() => {
    if (!state.waitingForReply) {
      return;
    }
    send({
      hfToken: state.hfToken,
      task: state.hfConfig.task,
      config: state.hfConfig.configs[state.hfConfig.task],
      prompt: state.prompt,
    })
      .then((response) => {
        if (response.error != null) {
          throw new Error(response.error);
        }
        return response;
      })
      .then((response) => {
        switch (state.hfConfig.task) {
          case "generation":
            return response[0].generated_text.slice(prompt.length);
          case "summarization":
            return response[0].summary_text;
          default:
            throw new Error(
              `Don't know how to handle response for task: ${state.hfConfig.task}`
            );
        }
      })
      .then((addendum) => {
        dispatch({ type: "receive_replies", prompt: state.prompt + addendum });
      })
      .catch((e) => {
        dispatch({ type: "receive_replies", prompt: state.prompt });
        window.alert(e);
      });
  }, [
    state.hfConfig.configs,
    state.hfConfig.task,
    state.hfToken,
    state.prompt,
    state.waitingForReply,
  ]);

  useEffect(() => {
    if (!state.scrollToBottom) {
      return;
    }
    dispatch({ type: "finish_scroll" });
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.scrollToBottom]);

  return isMobile ? (
    <MobileLayout
      hfConfig={state.hfConfig}
      dispatch={dispatch}
      hfToken={state.hfToken}
      prompt={state.prompt}
      scrollRef={scrollRef}
      waitingForReply={state.waitingForReply}
    />
  ) : (
    <DesktopLayout
      hfConfig={state.hfConfig}
      dispatch={dispatch}
      hfToken={state.hfToken}
      prompt={state.prompt}
      scrollRef={scrollRef}
      waitingForReply={state.waitingForReply}
    />
  );
}
