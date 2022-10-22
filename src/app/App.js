import { useEffect, useReducer, useRef, useCallback } from "react";
import appReducer from "./appReducer";
import sendChatPrompt from "./sendChatPrompt";
import nlp from "compromise";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { isMobile } from "react-device-detect";

function getActorsForPrompt(prompt) {
  return nlp(prompt)
    .people()
    .normalize("heavy")
    .text()
    .replaceAll(/[.?!,/#!$%^&*;:{}=\-_`~()"']/g, "")
    .split(" ")
    .filter((a) => a !== "")
    .map((a) => a.charAt(0).toUpperCase() + a.slice(1));
}

function unpackResponse(response, actors) {
  let prev = response;
  let filtered = response;
  do {
    // Remove repeated messages and phrases.
    prev = filtered;
    filtered = prev.replaceAll(/([\s\S]{2,}?)\1+/g, "$1");
  } while (prev !== filtered);

  const stopActors = new Set(
    Object.entries(actors)
      .filter(([_, props]) => props.stop)
      .map(([name, _]) => name)
  );

  const min = [...stopActors]
    .map((a) => filtered.search(`${a}:`))
    .filter((i) => i > -1)
    .reduce((a, b) => Math.min(a, b), Infinity);

  if (min === Infinity) {
    return response;
  }

  return response.slice(0, min);
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, {
    hfToken: localStorage.getItem("hfToken") ?? "",
    actors: {},
    prompt: "",
    waitingForReply: false,
    scrollToBottom: false,
  });
  const scrollRef = useRef(null);

  const addActors = useCallback(
    (prompt) => {
      const actors = new Set(getActorsForPrompt(prompt));

      for (const actor of Object.keys(state.actors)) {
        actors.delete(actor);
      }

      if (actors.size === 0) {
        return;
      }

      const actorColors = [
        "#1445a7",
        "#872323",
        "#135723",
        "#675708",
        "#451387",
        "#131367",
      ];

      let colorIndex = Object.keys(state.actors).length;
      const newActors = [...actors].reduce((newActors, name) => {
        newActors[name] = {
          name,
          stop:
            Object.keys(state.actors).length === 0 &&
            Object.keys(newActors).length === 0,
          color: actorColors[colorIndex++],
        };
        return newActors;
      }, {});

      dispatch({ type: "add_actors", actors: newActors });
    },
    [state.actors]
  );

  useEffect(() => {
    localStorage.setItem("hfToken", state.hfToken);
  }, [state.hfToken]);

  useEffect(() => {
    if (!state.waitingForReply) {
      return;
    }
    sendChatPrompt({
      hfToken: state.hfToken,
      prompt: state.prompt,
    })
      .then((response) => {
        const addendum = unpackResponse(response, state.actors);
        addActors(addendum);
        dispatch({ type: "receive_replies", prompt: state.prompt + addendum });
      })
      .catch((e) => {
        dispatch({ type: "receive_replies", prompt: state.prompt });
        window.alert(e);
      });
  }, [
    addActors,
    state.actors,
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
      actors={state.actors}
      addActors={addActors}
      dispatch={dispatch}
      hfToken={state.hfToken}
      prompt={state.prompt}
      scrollRef={scrollRef}
      waitingForReply={state.waitingForReply}
    />
  ) : (
    <DesktopLayout
      actors={state.actors}
      addActors={addActors}
      dispatch={dispatch}
      hfToken={state.hfToken}
      prompt={state.prompt}
      scrollRef={scrollRef}
      waitingForReply={state.waitingForReply}
    />
  );
}
