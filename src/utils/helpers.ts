import enchantments from "../data/enchantments.json";
import itemSpecifications from "../data/items.json";
import { ItemSpecification } from "../models";

const numToNumeral = (num: number) => {
  switch (num) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    case 4:
      return "IV";
    case 5:
      return "V";
    default:
      return "Numeral Error";
  }
};

const levelToExperience = (level: number) => {
  if (level < 17) {
    return Math.pow(level, 2) + 6 * level;
  } else if (level < 31) {
    return 2.5 * Math.pow(level, 2) - 40.5 * level + 360;
  } else {
    return 4.5 * Math.pow(level, 2) - 162.5 * level + 2220;
  }
};

const addIndexes = <A>(arrayToIndex: Array<A>) => {
  return arrayToIndex.map((item, index) => {
    return { ...item, index: index };
  });
};

const getEnchantmentDisplayName = (enchantment_name: string) => {
  const enchantment_data = enchantments.find(
    (find_enchantment) => find_enchantment.name === enchantment_name
  );
  return enchantment_data ? enchantment_data.display_name : null;
};

const itemNameToSpecificationMap = (itemSpecifications as Array<ItemSpecification>).reduce((result, item) => {
  result.set(item.name, item);
  return result;
}, new Map<string, ItemSpecification>);

export {
  numToNumeral,
  levelToExperience,
  addIndexes,
  getEnchantmentDisplayName,
  itemNameToSpecificationMap,
};
