import enchantments from "../data/enchantments.json";
import { levelToExperience } from "../utils/helpers";
import itemSpecifications from "../data/items.json";
import { Enchantment, EnchantmentSpecification, ItemData, ItemSpecification, Settings, StepData } from "../models";

const getEnchantments = (item: string) => {
  return enchantments.filter((enchantment) =>
    enchantment.applies_to.some((possible_item) => possible_item === item)
  );
};

const getItemData = (item: ItemData) => {
  const new_item: ItemData = { ...item };
  new_item.enchantments = new_item.enchantments.map((enchantment) => {
    return {
      ...enchantment,
      specification: (enchantments as Array<EnchantmentSpecification>).find(
        (enchantment_data) => enchantment_data.name === enchantment.name
      ),
    };
  });
  return new_item;
};

//If the box is checked on preserve enchantment, the end result must contain it
const areEnchantmentsPreserved = (
  sacrificedItemEnchantments: Array<Enchantment>,
  filtered_enchantments: Array<Enchantment>
) => {
  const removedEnchantments = sacrificedItemEnchantments.filter(
    (sacrificed_enchantment) =>
      !filtered_enchantments.includes(sacrificed_enchantment)
  );
  return !removedEnchantments.some(
    (removed_enchantment) => removed_enchantment.preserve
  );
};

const checkEnchantmentIsCompatible = (targetItem: ItemData, newEnchantment: EnchantmentSpecification, settings: Settings) => {
  return (
    // There isn't an existing enchantment in a mutal exclusion group
    !targetItem.enchantments.some(
      (some_enchantment) =>
        some_enchantment.specification &&
        some_enchantment.name !== newEnchantment.name &&
        some_enchantment.specification.group &&
        newEnchantment.group &&
        some_enchantment.specification.group === newEnchantment.group &&
        !(
          some_enchantment.specification.group_exception &&
          newEnchantment.group_exception &&
          some_enchantment.specification.group_exception === newEnchantment.group_exception
        ) && // Rule exception for tridents
        !(
          some_enchantment.specification.group === "protection" && settings.allow_multiple_armor_enhancements
        ) // Special case for v1.14 -1.14.2 where multiple armor enhancements are allowed
    ) &&
    //Possible enchantment is applicable to the given item
    (newEnchantment.applies_to.some(
      (some_item) => some_item === targetItem.name
    ) ||
      targetItem.name === "book")
  );
};

const getMultiplier = (item: ItemData, enchantmentSpecification: EnchantmentSpecification, isJavaEdition: boolean): number => {
  if (isJavaEdition) {
    return item.name === "book"
      ? (enchantmentSpecification.java_overrides?.book_multiplier ?? enchantmentSpecification.book_multiplier)
      : (enchantmentSpecification.java_overrides?.item_multiplier ?? enchantmentSpecification.item_multiplier);
  }
  return item.name === "book"
    ? enchantmentSpecification.book_multiplier
    : enchantmentSpecification.item_multiplier;
}

const mergeEnchantments = (
  sacrificeItem: ItemData,
  targetEnchantments: Array<Enchantment>,
  sacrificeEnchantments: Array<Enchantment>, //mutable
  settings: Settings
) => {
  return sacrificeEnchantments.reduce(
    (mergeResults, sacrificeEnchantment) => {
      if (!sacrificeEnchantment.specification) {
        throw 'Error: no specification for Enchantment.';
      }

      const multiplier = getMultiplier(sacrificeItem, sacrificeEnchantment.specification, settings.java_edition);

      // Find if target already has enchantment
      const matchedEnchantment = mergeResults.resultingEnchantments.find(
        (resultingEnchantment) =>
          resultingEnchantment.name === sacrificeEnchantment.name
      );
      let newLevel = sacrificeEnchantment.level;
      // Enchantment matched. Check Level.
      if (matchedEnchantment) {
        // Make a copy of the matched enchantment.
        const newMatchedEnchantment: Enchantment = { ...matchedEnchantment };
        let levelDifference =
          sacrificeEnchantment.level - newMatchedEnchantment.level;
        // Levels are the same. Bump level.
        if (
          levelDifference === 0 &&
          newMatchedEnchantment.specification &&
          newMatchedEnchantment.specification.max_level > newMatchedEnchantment.level
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

export interface AnvilResults {
  resultingItem: ItemData;
  cost: number;
  exp: number;
  steps: {
    targetItem: ItemData;
    sacrificeItem: ItemData;
    resultingItem: ItemData;
    stepCost: number;
  }[]
}

interface AnvilError {
  error: boolean,
  status: string
}

export function instanceOfAnvilError(result: AnvilResults | AnvilError): result is AnvilError {
  return 'error' in result;
}

const anvil = (targetItem: ItemData, sacrificeItem: ItemData, settings: Settings): AnvilResults | AnvilError => {
  const targetPenalty = targetItem.penalty || 0;
  const sacrificePenalty = sacrificeItem.penalty || 0;
  // Filter non-applicable enchantments
  const filtered_enchantments = sacrificeItem.enchantments.filter(
    (enchantment) => enchantment.specification && checkEnchantmentIsCompatible(targetItem, enchantment.specification, settings)
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
  const resultingItem: ItemData = {
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

export interface CombineItemsError {
  targetItem: ItemData,
  steps: Array<StepData>,
  error: boolean,
  status: string
}

export function instanceOfCombineItemsError(result: AnvilResults | CombineItemsError): result is CombineItemsError {
  return 'error' in result;
}

const combineItems = (items: Array<ItemData>, settings: Settings): AnvilResults | CombineItemsError => {
  items = items.map(getItemData);

  //For each item, determine what can be combined into it, use anvil, then call combineItems with what remains
  let allResults: Array<AnvilResults> = [];
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
        if ((instanceOfAnvilError(anvilResults)) && anvilResults.error) {
          return;
        }
        anvilResults = anvilResults as AnvilResults;
        const remaining_items = nonTargets.filter(
          (item) => item !== sacrificeItem
        );

        if (remaining_items.length > 0) {
          const remaining_items_results = combineItems(
            [anvilResults.resultingItem, ...remaining_items],
            settings
          );

          //Error found in the recursive call means that a constraint was violated; return
          if (instanceOfCombineItemsError(remaining_items_results)) {
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

const getDisplayName = (item_name: string) => {
  const item_data = (itemSpecifications as Array<ItemSpecification>).find((find_item) => find_item.name === item_name);
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
