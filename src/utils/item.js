import enchantments from "../data/echantments.json";

const getEnchantments = (item) => {
  return enchantments.filter((enchantment) =>
    enchantment.applies_to.some((possible_item) => possible_item === item)
  );
};

const getItemData = (item) => {
  item.enchantments = item.enchantments.map((enchantment) => {
    return {
      ...enchantment,
      ...enchantments.find(
        (enchantment_data) => enchantment_data.name === enchantment.name
      ),
    };
  });
  return item;
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
      `Anvil: ${sacrificeItem.name} ${JSON.stringify(
        sacrificeItem.enchantments.map((enchantment) => enchantment.name)
      )} [${sacrificeItem.penalty}] => ${resultingItem.name} ${JSON.stringify(
        resultingItem.enchantments.map((enchantment) => enchantment.name)
      )} [${resultingItem.penalty}], Step Cost: ${stepCost}`,
    ],
  };
  return results;
};

  //Get the cheapest results
  if (allResults.length > 0) {
    return allResults.reduce((cheapestResults, singleResult) => {
      return singleResult.cost < cheapestResults.cost
        ? singleResult
        : cheapestResults;
    }, allResults[0]);
  }
};

export { getEnchantments, getItemData, combineItems };
