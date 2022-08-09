/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  getItemData,
  areEnchantmentsPreserved,
  checkEnchantmentIsCompatible,
  mergeEnchantments,
  anvil,
  combineItems,
  instanceOfAnvilError,
  instanceOfCombineItemsError,
} from "./item";
import enchantments from "../data/enchantments.json";
import { Enchantment, EnchantmentSpecification, ItemData } from "../models";

const createEnchantmentByName = (enchantment_name: string): Enchantment => {
  const enchantment_specification = enchantments.find(
    (enchantment) => enchantment.name === enchantment_name
  )
  if (!enchantment_specification) {
    throw 'Could not find enchantment specification by name';
  }
  return {
    name: enchantment_specification.name,
    level: enchantment_specification.max_level,
    specification: enchantment_specification,
  }
}

const getEnchantmentSpecificationByName = (enchantment_name: string): EnchantmentSpecification => {
  const enchantment_specification = enchantments.find(
    (enchantment) => enchantment.name === enchantment_name
  )
  if (!enchantment_specification) {
    throw 'Could not find enchantment specification by name';
  }
  return enchantment_specification;
}

it("get item data", () => {
  const item: ItemData = {
    name: "boots",
    enchantments: [
      {
        name: "protection",
        level: 4,
      },
    ],
    index: 0,
    penalty: 0
  };
  expect(getItemData(item).enchantments[0].specification?.max_level).toEqual(4);
});

it("test enchantment preservation", () => {
  const filtered_enchantments = [
    createEnchantmentByName("feather_falling"),
    createEnchantmentByName("protection"),
  ];

  const enchant_to_preserve = createEnchantmentByName("thorns");

  const sacrificedItemEnchantments = [
    enchant_to_preserve,
    ...filtered_enchantments,
  ];

  expect(
    areEnchantmentsPreserved(sacrificedItemEnchantments, filtered_enchantments)
  ).toEqual(true);

  enchant_to_preserve.preserve = true;

  expect(
    areEnchantmentsPreserved(sacrificedItemEnchantments, filtered_enchantments)
  ).toEqual(false);
});

it("test item-enchantment compatibility", () => {
  let test_sword = {
    name: "sword",
    enchantments: [
      createEnchantmentByName("sharpness"),
    ],
    index: 0,
    penalty: 0
  };
  test_sword = getItemData(test_sword);
  expect(
    checkEnchantmentIsCompatible(
      test_sword,
      getEnchantmentSpecificationByName("smite")
    )
  ).toEqual(false);
  expect(
    checkEnchantmentIsCompatible(
      test_sword,
      getEnchantmentSpecificationByName("unbreaking")
    )
  ).toEqual(true);
});

it("test trident compatibility", () => {
  let test_trident = {
    name: "trident",
    enchantments: [
      createEnchantmentByName("channeling"),
    ],
    index: 0,
    penalty: 0
  };
  test_trident = getItemData(test_trident);
  expect(
    checkEnchantmentIsCompatible(
      test_trident,
      getEnchantmentSpecificationByName("riptide")
    )
  ).toEqual(false);
  expect(
    checkEnchantmentIsCompatible(
      test_trident,
      getEnchantmentSpecificationByName("loyalty")
    )
  ).toEqual(true);
});

it("test merging enchanntments", () => {
  const settings = { java_edition: false };
  const test_sword = {
    name: "sword",
    enchantments: [
      {
        ...createEnchantmentByName("sharpness"),
        level: 4,
      },
      {
        ...createEnchantmentByName("unbreaking"),
        level: 3,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 1,
      },
    ],
    index: 0,
    penalty: 0
  };

  const test_book = {
    name: "book",
    enchantments: [
      {
        ...createEnchantmentByName("sharpness"),
        level: 4,
      },
      {
        ...createEnchantmentByName("unbreaking"),
        level: 3,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 2,
      },
    ],
    index: 0,
    penalty: 0
  };

  const merge_results = mergeEnchantments(
    test_book,
    test_sword.enchantments,
    [...test_book.enchantments],
    settings
  );

  expect(
    merge_results.resultingEnchantments.find(
      (enchantment) => enchantment.name === "sharpness"
    )?.level
  ).toEqual(5);
  expect(
    merge_results.resultingEnchantments.find(
      (enchantment) => enchantment.name === "unbreaking"
    )?.level
  ).toEqual(3);
  expect(
    merge_results.resultingEnchantments.find(
      (enchantment) => enchantment.name === "looting"
    )?.level
  ).toEqual(2);
  expect(merge_results.cost).toEqual(3);
});

it("test anvil", () => {
  const settings = { java_edition: false };
  const test_sword = {
    name: "sword",
    enchantments: [
      {
        ...createEnchantmentByName("sharpness"),
        level: 4,
      },
      {
        ...createEnchantmentByName("unbreaking"),
        level: 3,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 1,
      },
    ],
    index: 0,
    penalty: 2,
  };

  const test_book = {
    name: "book",
    enchantments: [
      {
        ...createEnchantmentByName("sharpness"),
        level: 4,
      },
      {
        ...createEnchantmentByName("unbreaking"),
        level: 3,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 2,
      },
      {
        ...createEnchantmentByName("loyalty"),
        level: 3,
      },
    ],
    index: 0,
    penalty: 1,
  };

  const anvil_results = anvil(test_sword, test_book, settings);
  expect(instanceOfAnvilError(anvil_results)).toBeFalsy;
  if (!instanceOfAnvilError(anvil_results)) {
    const anvil_enchantments = anvil_results.resultingItem.enchantments;
    expect(
      anvil_enchantments.find(
        (enchantment) => enchantment.name === "sharpness"
      )?.level
    ).toEqual(5);
    expect(
      anvil_enchantments.find(
        (enchantment) => enchantment.name === "unbreaking"
      )?.level
    ).toEqual(3);
    expect(
      anvil_enchantments.find(
        (enchantment) => enchantment.name === "looting"
      )?.level
    ).toEqual(2);
    expect(
      anvil_enchantments.find(
        (enchantment) => enchantment.name === "loyalty"
      )?.level
    ).toEqual(undefined);
    expect(anvil_results.cost).toEqual(7);
  }
});

it("test combine items", () => {
  const settings = { java_edition: false };
  const test_sword = {
    name: "sword",
    enchantments: [
      {
        ...createEnchantmentByName("unbreaking"),
        level: 3,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 1,
      },
    ],
    index: 0,
    penalty: 2,
  };

  const test_book_1 = {
    name: "book",
    enchantments: [
      {
        ...createEnchantmentByName("sharpness"),
        level: 5,
        preserve: true,
      },
      {
        ...createEnchantmentByName("unbreaking"),
        level: 3,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 2,
      },
    ],
    index: 0,
    penalty: 1,
  };

  const test_book_2 = {
    name: "book",
    enchantments: [
      {
        ...createEnchantmentByName("smite"),
        level: 4,
      },
      {
        ...createEnchantmentByName("looting"),
        level: 2,
      },
    ],
    index: 0,
    penalty: 0,
  };

  let combine_results = combineItems(
    [test_sword, test_book_1, test_book_2],
    settings
  );
  expect(instanceOfCombineItemsError(combine_results)).toBeFalsy;
  if (!instanceOfCombineItemsError(combine_results)) {
    const combine_enchantments = combine_results.resultingItem.enchantments;

    // Sharpness
    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "sharpness"
      )?.level
    ).toEqual(5);
    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "unbreaking"
      )?.level
    ).toEqual(3);
    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "looting"
      )?.level
    ).toEqual(3);
    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "loyalty"
      )?.level
    ).toEqual(undefined);
    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "smite"
      )?.level
    ).toEqual(undefined);
    expect(combine_results.cost).toEqual(20);

    // Smite
    const sharpness_result = test_book_1.enchantments.find(
      (enchantment) => enchantment.name === "sharpness"
    )
    if (sharpness_result) {
      sharpness_result.preserve = false;
    }
    const smite_result = test_book_2.enchantments.find(
      (enchantment) => enchantment.name === "smite"
    )
    if (smite_result) {
      smite_result.preserve = true;
    }
  }

  combine_results = combineItems(
    [test_sword, test_book_1, test_book_2],
    settings
  );
  expect(instanceOfCombineItemsError(combine_results)).toBeFalsy;
  if (!instanceOfCombineItemsError(combine_results)) {
    const combine_enchantments = combine_results.resultingItem.enchantments;

    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "smite"
      )?.level
    ).toEqual(4);
    expect(
      combine_enchantments.find(
        (enchantment) => enchantment.name === "sharpness"
      )?.level
    ).toEqual(undefined);
    expect(combine_results.cost).toEqual(19);
  }

  // Java Edition
  settings.java_edition = true;
  combine_results = combineItems(
    [test_sword, test_book_1, test_book_2],
    settings
  );
  expect(instanceOfCombineItemsError(combine_results)).toBeFalsy;
  if (!instanceOfCombineItemsError(combine_results)) {
    expect(combine_results.cost).toEqual(29);
  }
});

it("test java overrides", () => {
  const settings = { java_edition: true };
  const test_trident = {
    name: "trident",
    enchantments: [
    ],
    index: 0,
    penalty: 0,
  };

  const test_book_1 = {
    name: "book",
    enchantments: [
      {
        ...createEnchantmentByName("impaling"),
        level: 5
      },
    ],
    index: 0,
    penalty: 0,
  };

  const combine_results = combineItems(
    [test_trident, test_book_1],
    settings
  );
  expect(instanceOfCombineItemsError(combine_results)).toBeFalsy;
  if (!instanceOfCombineItemsError(combine_results)) {
    expect(combine_results.cost).toEqual(10);
  }
});