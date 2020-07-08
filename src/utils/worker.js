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

    export { combineItems };
