import {
  getItemData,
  areEnchantmentsPreserved,
  checkEnchantmentIsCompatible,
  mergeEnchantments,
  anvil,
  combineItems,
} from "../item";
import enchantments from "../../data/enchantments.json";

it("get item data", () => {
  let item = {
    name: "boots",
    enchantments: [
      {
        name: "protection",
        level: 4,
      },
    ],
  };
  expect(getItemData(item).enchantments[0].max_level).toEqual(4);
});

it("test enchantment preservation", () => {
  const filtered_enchantments = [
    enchantments.find((enchantment) => enchantment.name === "feather_falling"),
    enchantments.find((enchantment) => enchantment.name === "protection"),
  ];
  const enchant_to_preserve = enchantments.find(
    (enchantment) => enchantment.name === "thorns"
  );
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
      enchantments.find((enchantment) => enchantment.name === "sharpness"),
    ],
  };
  test_sword = getItemData(test_sword);
  expect(
    checkEnchantmentIsCompatible(
      test_sword,
      enchantments.find((enchantment) => enchantment.name === "smite")
    )
  ).toEqual(false);
  expect(
    checkEnchantmentIsCompatible(
      test_sword,
      enchantments.find((enchantment) => enchantment.name === "unbreaking")
    )
  ).toEqual(true);
});

it("test trident compatibility", () => {
  let test_trident = {
    name: "trident",
    enchantments: [
      enchantments.find((enchantment) => enchantment.name === "channeling"),
    ],
  };
  test_trident = getItemData(test_trident);
  expect(
    checkEnchantmentIsCompatible(
      test_trident,
      enchantments.find((enchantment) => enchantment.name === "riptide")
    )
  ).toEqual(false);
  expect(
    checkEnchantmentIsCompatible(
      test_trident,
      enchantments.find((enchantment) => enchantment.name === "loyalty")
    )
  ).toEqual(true);
});

it("test merging enchanntments", () => {
  const settings = { java_edition: false };
  let test_sword = {
    name: "sword",
    enchantments: [
      {
        ...enchantments.find((enchantment) => enchantment.name === "sharpness"),
        level: 4,
      },
      {
        ...enchantments.find(
          (enchantment) => enchantment.name === "unbreaking"
        ),
        level: 3,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 1,
      },
    ],
  };

  let test_book = {
    name: "book",
    enchantments: [
      {
        ...enchantments.find((enchantment) => enchantment.name === "sharpness"),
        level: 4,
      },
      {
        ...enchantments.find(
          (enchantment) => enchantment.name === "unbreaking"
        ),
        level: 3,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 2,
      },
    ],
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
    ).level
  ).toEqual(5);
  expect(
    merge_results.resultingEnchantments.find(
      (enchantment) => enchantment.name === "unbreaking"
    ).level
  ).toEqual(3);
  expect(
    merge_results.resultingEnchantments.find(
      (enchantment) => enchantment.name === "looting"
    ).level
  ).toEqual(2);
  expect(merge_results.cost).toEqual(3);
});

it("test anvil", () => {
  const settings = { java_edition: false };
  let test_sword = {
    name: "sword",
    enchantments: [
      {
        ...enchantments.find((enchantment) => enchantment.name === "sharpness"),
        level: 4,
      },
      {
        ...enchantments.find(
          (enchantment) => enchantment.name === "unbreaking"
        ),
        level: 3,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 1,
      },
    ],
    penalty: 2,
  };

  let test_book = {
    name: "book",
    enchantments: [
      {
        ...enchantments.find((enchantment) => enchantment.name === "sharpness"),
        level: 4,
      },
      {
        ...enchantments.find(
          (enchantment) => enchantment.name === "unbreaking"
        ),
        level: 3,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 2,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "loyalty"),
        level: 3,
      },
    ],
    penalty: 1,
  };

  const anvil_results = anvil(test_sword, test_book, settings);
  const anvil_enchantments = anvil_results.resultingItem.enchantments;

  expect(
    anvil_enchantments.find((enchantment) => enchantment.name === "sharpness")
      .level
  ).toEqual(5);
  expect(
    anvil_enchantments.find((enchantment) => enchantment.name === "unbreaking")
      .level
  ).toEqual(3);
  expect(
    anvil_enchantments.find((enchantment) => enchantment.name === "looting")
      .level
  ).toEqual(2);
  expect(
    anvil_enchantments.find((enchantment) => enchantment.name === "loyalty")
  ).toEqual(undefined);
  expect(anvil_results.cost).toEqual(7);
});

it("test combine items", () => {
  const settings = { java_edition: false };
  let test_sword = {
    name: "sword",
    enchantments: [
      {
        ...enchantments.find(
          (enchantment) => enchantment.name === "unbreaking"
        ),
        level: 3,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 1,
      },
    ],
    penalty: 2,
  };

  let test_book_1 = {
    name: "book",
    enchantments: [
      {
        ...enchantments.find((enchantment) => enchantment.name === "sharpness"),
        level: 5,
        preserve: true,
      },
      {
        ...enchantments.find(
          (enchantment) => enchantment.name === "unbreaking"
        ),
        level: 3,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 2,
      },
    ],
    penalty: 1,
  };

  let test_book_2 = {
    name: "book",
    enchantments: [
      {
        ...enchantments.find((enchantment) => enchantment.name === "smite"),
        level: 4,
      },
      {
        ...enchantments.find((enchantment) => enchantment.name === "looting"),
        level: 2,
      },
    ],
  };

  let combine_results = combineItems(
    [test_sword, test_book_1, test_book_2],
    settings
  );
  let combine_enchantments = combine_results.resultingItem.enchantments;

  // Sharpness
  expect(
    combine_enchantments.find((enchantment) => enchantment.name === "sharpness")
      .level
  ).toEqual(5);
  expect(
    combine_enchantments.find(
      (enchantment) => enchantment.name === "unbreaking"
    ).level
  ).toEqual(3);
  expect(
    combine_enchantments.find((enchantment) => enchantment.name === "looting")
      .level
  ).toEqual(3);
  expect(
    combine_enchantments.find((enchantment) => enchantment.name === "loyalty")
  ).toEqual(undefined);
  expect(
    combine_enchantments.find((enchantment) => enchantment.name === "smite")
  ).toEqual(undefined);
  expect(combine_results.cost).toEqual(20);

  // Smite
  test_book_1.enchantments.find(
    (enchantment) => enchantment.name === "sharpness"
  ).preserve = false;
  test_book_2.enchantments.find(
    (enchantment) => enchantment.name === "smite"
  ).preserve = true;

  combine_results = combineItems(
    [test_sword, test_book_1, test_book_2],
    settings
  );
  combine_enchantments = combine_results.resultingItem.enchantments;

  expect(
    combine_enchantments.find((enchantment) => enchantment.name === "smite")
      .level
  ).toEqual(4);
  expect(
    combine_enchantments.find((enchantment) => enchantment.name === "sharpness")
  ).toEqual(undefined);
  expect(combine_results.cost).toEqual(19);

  // Java Edition
  settings.java_edition = true;
  combine_results = combineItems(
    [test_sword, test_book_1, test_book_2],
    settings
  );
  expect(combine_results.cost).toEqual(29);
});
