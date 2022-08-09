import { ItemData, Settings } from "../models";
import { combineItems } from "./item";

export interface CombineMessage { items: Array<ItemData>, settings: Settings }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

ctx.addEventListener("message", (event: MessageEvent<CombineMessage>) => {
  ctx.postMessage(combineItems(event.data.items, event.data.settings));
}
);