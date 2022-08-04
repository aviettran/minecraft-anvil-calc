import { ItemData, Settings } from "../models";
import { combineItems } from "./item";

export function combineItemsExecute(items: Array<ItemData>, settings: Settings) {
  return combineItems(items, settings);
}
