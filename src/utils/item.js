import enchantments from "../data/enchantments.json";
import { levelToExperience } from "../utils/helpers";

const getEnchantments = (item) => {
  return enchantments.filter((enchantment) =>
    enchantment.applies_to.some((possible_item) => possible_item === item)
  );
};

const getItemData = (item) => {
  const new_item = { ...item };
  new_item.enchantments = new_item.enchantments.map((enchantment) => {
    return {
      ...enchantment,
      ...enchantments.find(
        (enchantment_data) => enchantment_data.name === enchantment.name
      ),
    };
  });
  return new_item;
};

const totalEnchantmentCosts = (item) => {
  return item.enchantments.reduce((total, enchantment) => {
    return (
      total +
      enchantment.level *
        (item.name === "book"
          ? enchantment.book_multiplier
          : enchantment.item_multiplier)
    );
  }, 0);
};

const anvil = (targetItem, sacrificeItem) => {
  const targetPenalty = targetItem.penalty || 0;
  const sacrificePenalty = sacrificeItem.penalty || 0;
  const resultingItem = {
    ...targetItem,
    enchantments: [...targetItem.enchantments, ...sacrificeItem.enchantments],
  };
  const stepCost =
    totalEnchantmentCosts(sacrificeItem) +
    Math.pow(2, targetPenalty) -
    1 +
    Math.pow(2, sacrificePenalty) -
    1;
  resultingItem.penalty = Math.max(targetPenalty, sacrificePenalty) + 1;
  const results = {
    resultingItem: resultingItem,
    cost: stepCost,
    steps: [
      {
        targetItem: targetItem,
        sacrificeItem: sacrificeItem,
        resultingItem: resultingItem,
        stepCost: stepCost,
      },
    ],
  };
  return results;
};

const combineItems = (items) => {
  items = items.map(getItemData);

  //For each item, determine what can be combined into it, use anvil, then call combineItems with what remains
  let allResults = [];
  items.forEach((targetItem) => {
    const nonTargets = items.filter(
      (sacrificeItem) => sacrificeItem !== targetItem
    );
    const eligibleItems = nonTargets.filter(
      (sacrificeItem) =>
        sacrificeItem.name === "book" || targetItem.name !== "book"
    );

    if (eligibleItems.length > 0) {
      //For each eligible item
      eligibleItems.forEach((sacrificeItem) => {
        let anvilResults = anvil(targetItem, sacrificeItem);
        const remaining_items = nonTargets.filter(
          (item) => item !== sacrificeItem
        );

        if (remaining_items.length > 0) {
          const remaining_items_results = combineItems([
            anvilResults.resultingItem,
            ...remaining_items,
          ]);

          anvilResults.resultingItem = remaining_items_results.resultingItem;
          anvilResults.cost += remaining_items_results.cost;
          anvilResults.steps = [
            ...anvilResults.steps,
            ...remaining_items_results.steps,
          ];
        }
        allResults = [...allResults, anvilResults];
      });
    }
  });

  //Get the cheapest results
  if (allResults.length > 0) {
    return allResults.reduce((cheapestResults, singleResult) => {
      return levelToExperience(singleResult.cost) <
        levelToExperience(cheapestResults.cost)
        ? singleResult
        : cheapestResults;
    }, allResults[0]);
  } else {
    return { targetItem: items[0], steps: [], status: "No items to combine" };
  }
};

export { getEnchantments, getItemData, combineItems };
