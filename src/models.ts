interface ItemData {
    name: string;
    enchantments: Array<Enchantment>;
    index: number;
    penalty: number;
}

interface ItemSpecification {
    name: string,
    display_name: string
}

interface StepData {
    stepCost: number,
    targetItem: ItemData,
    sacrificeItem: ItemData,
    resultingItem: ItemData,
}

interface Enchantment {
    name: string,
    level: number,
    preserve?: boolean,
    specification?: EnchantmentSpecification,
    is_curse?: boolean
}

interface EnchantmentSpecification {
    name: string,
    display_name: string,
    max_level: number,
    applies_to: Array<string>,
    item_multiplier: 1,
    book_multiplier: 1,
    group?: string,
    java_only?: boolean
    group_exception?: string
}

interface Preset {
    data: Array<ItemPreset>,
    display_name: string
}

interface ItemPreset {
    name: string,
    enchantments: Array<Enchantment>
}

interface Settings {
    java_edition: boolean
}

export {
    ItemData,
    ItemSpecification,
    StepData,
    Enchantment,
    EnchantmentSpecification,
    Preset,
    ItemPreset,
    Settings
}