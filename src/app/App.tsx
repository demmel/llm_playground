import * as React from "react";
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
    prompt: "",
    stopSequences: [],
    waitingForReply: false,
    scrollToBottom: false,
  });
  const scrollRef = useRef<HTMLTextAreaElement>(null);

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
            return response[0].generated_text.slice(state.prompt.length);
          case "summarization":
            return response[0].summary_text;
        }
      })
      .then((addendum) => {
        const ssi = state.stopSequences
          .map((ss) => addendum.indexOf(ss))
          .filter((i) => i !== -1)
          .reduce((a, b) => Math.min(a, b), Infinity);
        if (ssi !== Infinity) {
          addendum = addendum.slice(0, ssi);
        }
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
    state.stopSequences,
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
  }, [state.scrollToBottom]);

  return isMobile ? (
    <MobileLayout
      stopSequences={state.stopSequences}
      hfConfig={state.hfConfig}
      dispatch={dispatch}
      hfToken={state.hfToken}
      prompt={state.prompt}
      scrollRef={scrollRef}
      waitingForReply={state.waitingForReply}
    />
  ) : (
    <DesktopLayout
      stopSequences={state.stopSequences}
      hfConfig={state.hfConfig}
      dispatch={dispatch}
      hfToken={state.hfToken}
      prompt={state.prompt}
      scrollRef={scrollRef}
      waitingForReply={state.waitingForReply}
    />
  );
}
