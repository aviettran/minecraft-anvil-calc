import { addIndexes, getEnchantmentDisplayName } from "./helpers";
import boots_preset from "../data/boots_preset.json";

it("add indexes", () => {
  const boots_preset_with_indexes = addIndexes(boots_preset);
  expect(boots_preset_with_indexes[0].index).toEqual(0);
  expect(boots_preset_with_indexes[3].index).toEqual(3);
});

it("get enchantment display name", () => {
  expect(getEnchantmentDisplayName("fire_protection")).toEqual(
    "Fire Protection"
  );
});
