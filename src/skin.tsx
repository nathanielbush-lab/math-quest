import { createContext, useContext } from "react";

export type Skin = "playful" | "storybook" | "classic";

/** The current look, for the few places where a skin changes a picture or a word (most of it is CSS). */
export const SkinContext = createContext<Skin>("playful");

export function useSkin(): Skin {
  return useContext(SkinContext);
}
