import enchantments from "../data/enchantments.json";
import { levelToExperience } from "../utils/helpers";
import items from "../data/items.json";

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

//If the box is checked on preserve enchantment, the end result must contain it
const areEnchantmentsPreserved = (
  sacrificedItemEnchantments,
  filtered_enchantments
) => {
  const removedEnchantments = sacrificedItemEnchantments.filter(
    (sacrificed_enchantment) =>
      !filtered_enchantments.includes(sacrificed_enchantment)
  );
  return !removedEnchantments.some(
    (removed_enchantment) => removed_enchantment.preserve
  );
};

const checkEnchantmentIsCompatible = (targetItem, newEnchantment) => {
  return (
    // There isn't an existing enchantment in a mutal exclusion group
    !targetItem.enchantments.some(
      (some_enchantment) =>
        some_enchantment.name !== newEnchantment.name &&
        some_enchantment.group &&
        newEnchantment.group &&
        some_enchantment.group === newEnchantment.group &&
        !(
          some_enchantment.group_exception &&
          newEnchantment.group_exception &&
          some_enchantment.group_exception === newEnchantment.group_exception
        ) // Rule exception for tridents
    ) &&
    //Possible enchantment is applicable to the given item
    (newEnchantment.applies_to.some(
      (some_item) => some_item === targetItem.name
    ) ||
      targetItem.name === "book")
  );
};

const mergeEnchantments = (
  sacrificeItem,
  targetEnchantments,
  sacrificeEnchantments, //mutable
  settings
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
        if (
          levelDifference === 0 &&
          newMatchedEnchantment.max_level > newMatchedEnchantment.level
        ) {
          levelDifference += 1;
          newLevel += 1;
        }
        if (levelDifference > 0) {
          mergeResults.cost += settings.java_edition
            ? 0
            : levelDifference * multiplier;
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
        // If Java Edition, cost is always just multiplier * new level
        mergeResults.cost += settings.java_edition ? newLevel * multiplier : 0;
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

const anvil = (targetItem, sacrificeItem, settings) => {
  const targetPenalty = targetItem.penalty || 0;
  const sacrificePenalty = sacrificeItem.penalty || 0;
  // Filter non-applicable enchantments
  const filtered_enchantments = sacrificeItem.enchantments.filter(
    (enchantment) => checkEnchantmentIsCompatible(targetItem, enchantment)
  );
  if (
    !areEnchantmentsPreserved(sacrificeItem.enchantments, filtered_enchantments)
  ) {
    return { error: true, status: "Preserved enchantments have been lost" };
  }
  const mergeResults = mergeEnchantments(
    sacrificeItem,
    targetItem.enchantments,
    filtered_enchantments,
    settings
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
    1 +
    (settings.java_edition
      ? sacrificeItem.enchantments.length - filtered_enchantments.length // JE only: add 1 per non-applicable enchantment
      : 0);
  resultingItem.penalty = Math.max(targetPenalty, sacrificePenalty) + 1;
  const results = {
    resultingItem: resultingItem,
    cost: stepCost,
    exp: levelToExperience(stepCost),
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

const combineItems = (items, settings) => {
  items = items.map(getItemData);

  //For each item, determine what can be combined into it, use anvil, then call combineItems with what remains
  let allResults = [];
  items.forEach((targetItem) => {
    const nonTargets = items.filter(
      (sacrificeItem) => sacrificeItem !== targetItem
    );
    let eligibleItems = nonTargets.filter(
      (sacrificeItem) =>
        sacrificeItem.name === "book" || targetItem.name !== "book"
    );

    if (eligibleItems.length > 0) {
      //Optimize - if book -> book, choose cheapest book
      if (targetItem.name === "book") {
        eligibleItems = [
          eligibleItems.reduce((cheapestBook, item) => {
            return mergeEnchantments(
              item,
              targetItem.enchantments,
              item.enchantments,
              settings
            ).cost <
              mergeEnchantments(
                cheapestBook,
                targetItem.enchantments,
                cheapestBook.enchantments,
                settings
              ).cost
              ? item
              : cheapestBook;
          }, eligibleItems[0]),
        ];
      }
      //For each eligible item
      eligibleItems.forEach((sacrificeItem) => {
        let anvilResults = anvil(targetItem, sacrificeItem, settings);
        //Constraint violated in anvil call; return
        if (anvilResults.error) {
          return;
        }
        const remaining_items = nonTargets.filter(
          (item) => item !== sacrificeItem
        );

        if (remaining_items.length > 0) {
          const remaining_items_results = combineItems(
            [anvilResults.resultingItem, ...remaining_items],
            settings
          );

          //Error found in the recursive call means that a constraint was violated; return
          if (remaining_items_results.error) {
            return;
          }

          anvilResults.resultingItem = remaining_items_results.resultingItem;
          anvilResults.cost += remaining_items_results.cost;
          anvilResults.exp += remaining_items_results.exp;
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
      return singleResult.exp < cheapestResults.exp
        ? singleResult
        : cheapestResults;
    }, allResults[0]);
  } else {
    return {
      targetItem: items[0],
      steps: [],
      error: true,
      status: "No items or items cannot be combined.",
    };
  }
};

const getDisplayName = (item_name) => {
  const item_data = items.find((find_item) => find_item.name === item_name);
  return item_data ? item_data.display_name : null;
};

export {
  getEnchantments,
  getItemData,
  areEnchantmentsPreserved,
  checkEnchantmentIsCompatible,
  mergeEnchantments,
  anvil,
  combineItems,
  getDisplayName,
};
