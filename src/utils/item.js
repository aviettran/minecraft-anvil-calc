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

const mergeEnchantments = (
  sacrificeItem,
  targetEnchantments,
  sacrificeEnchantments
) => {
  return sacrificeEnchantments.reduce(
    (mergeResults, sacrificeEnchantment) => {
      const multiplier =
        sacrificeItem.name === "book"
          ? sacrificeEnchantment.book_multiplier
          : sacrificeEnchantment.item_multiplier;

      // Find if target already has enchantment
      const matchedEnchantment = mergeResults.resultingEnchantments.find(
        (resultingEnchantment) =>
          resultingEnchantment.name === sacrificeEnchantment.name
      );
      let newLevel = sacrificeEnchantment.level;
      // Enchantment matched. Check Level.
      if (matchedEnchantment) {
        // Make a copy of the matched enchantment.
        const newMatchedEnchantment = { ...matchedEnchantment };
        let levelDifference =
          sacrificeEnchantment.level - newMatchedEnchantment.level;
        // Levels are the same. Bump level.
        if (levelDifference === 0) {
          levelDifference += 1;
          newLevel += 1;
        }
        if (levelDifference > 0) {
          mergeResults.cost += levelDifference * multiplier;
          newMatchedEnchantment.level = newLevel;
          // Remove old enchantment and replace with new copy
          mergeResults.resultingEnchantments = [
            ...mergeResults.resultingEnchantments.filter(
              (filtered_enchantment) =>
                filtered_enchantment.name !== newMatchedEnchantment.name
            ),
            newMatchedEnchantment,
          ];
        }
      } else {
        // New enchantment. Add.
        mergeResults.resultingEnchantments = [
          ...mergeResults.resultingEnchantments,
          sacrificeEnchantment,
        ];
        mergeResults.cost += newLevel * multiplier;
      }
      return mergeResults;
    },
    { cost: 0, resultingEnchantments: [...targetEnchantments] }
  );
};

const anvil = (targetItem, sacrificeItem) => {
  const targetPenalty = targetItem.penalty || 0;
  const sacrificePenalty = sacrificeItem.penalty || 0;
  // Filter non-applicable enchantments
  const filtered_enchantments = sacrificeItem.enchantments.filter(
    (enchantment) =>
      targetItem.name === "book" ||
      enchantment.applies_to.some((some_item) => some_item === targetItem.name)
  );
  const mergeResults = mergeEnchantments(
    sacrificeItem,
    targetItem.enchantments,
    filtered_enchantments
  );
  const resultingItem = {
    ...targetItem,
    enchantments: mergeResults.resultingEnchantments,
  };
  const stepCost =
    mergeResults.cost +
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
