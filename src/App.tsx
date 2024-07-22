import React from "react";
import "./App.scss";

import items from "./data/items.json";
import enchantments from "./data/enchantments.json";
import Item from "./components/item";
import Step from "./components/step";
import Icon from "./components/icon";
import { getItemData, getDisplayName, AnvilResults, CombineItemsError, instanceOfCombineItemsError } from "./utils/item";
// import { combineItems } from "./utils/item"; //for debugging
import Worker from 'worker-loader!./utils/worker';
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";
import { levelToExperience, addIndexes } from "./utils/helpers";
import Select, { SingleValue } from "react-select";


// Presets
import helmet_preset from "./data/helmet_preset.json";
import chestplate_preset from "./data/chestplate_preset.json";
import leggings_preset from "./data/leggings_preset.json";
import boots_preset from "./data/boots_preset.json";
import sword_sharpness_preset from "./data/sword_sharpness_preset.json";
import axe_sharpness_preset from "./data/axe_sharpness_preset.json";
import bow_preset from "./data/bow_preset.json";
import crossbow_multishot_preset from "./data/crossbow_multishot_preset.json";
import crossbow_piercing_preset from "./data/crossbow_piercing_preset.json";
import trident_channeling_preset from "./data/trident_channeling_preset.json";
import trident_riptide_preset from "./data/trident_riptide_preset.json";
import pickaxe_fortune_preset from "./data/pickaxe_fortune_preset.json";
import pickaxe_silk_touch_preset from "./data/pickaxe_silk_touch_preset.json";
import shovel_fortune_preset from "./data/shovel_fortune_preset.json";
import shovel_silk_touch_preset from "./data/shovel_silk_touch_preset.json";
import hoe_fortune_preset from "./data/hoe_fortune_preset.json";
import hoe_silk_touch_preset from "./data/hoe_silk_touch_preset.json";
import brush_preset from "./data/brush_preset.json";
import elytra_preset from "./data/elytra_preset.json";
import { Enchantment, ItemData, Preset, Settings, StepData } from "./models";

export type SelectValue = SingleValue<{
  value: string,
  label: string | null
}>

const worker = new Worker();
const presets: { [key: string]: Preset } = {
  clear: {
    data: [],
    display_name: "Clear",
  },
  helmet: {
    data: helmet_preset,
    display_name: "Helmet",
  },
  chestplate: {
    data: chestplate_preset,
    display_name: "Chestplate",
  },
  leggings: {
    data: leggings_preset,
    display_name: "Leggings",
  },
  boots: {
    data: boots_preset,
    display_name: "Boots",
  },
  sword_sharpness: {
    data: sword_sharpness_preset,
    display_name: "Sword (Sharpness)",
  },
  axe_sharpness: {
    data: axe_sharpness_preset,
    display_name: "Axe (Sharpness, Silk Touch)",
  },
  bow: {
	data: bow_preset, 
	display_name: "Bow" 
  },
  crossbow_multishot: {
	data: crossbow_multishot_preset, 
	display_name: "Crossbow (Multishot)",
  },
  crossbow_piercing: {
	data: crossbow_piercing_preset, 
	display_name: "Crossbow (Piercing)",
  },
  trident_channeling: {
	data: trident_channeling_preset, 
	display_name: "Trident (Channeling)",
  },
  trident_riptide: {
	data: trident_riptide_preset, 
	display_name: "Trident (Riptide)",
  },
  pickaxe_fortune: {
    data: pickaxe_fortune_preset,
    display_name: "Pickaxe (Fortune)",
  },
  pickaxe_silk_touch: {
    data: pickaxe_silk_touch_preset,
    display_name: "Pickaxe (Silk Touch)",
  },
  shovel_fortune: {
    data: shovel_fortune_preset,
    display_name: "Shovel (Fortune)",
  },
  shovel_silk_touch: {
    data: shovel_silk_touch_preset,
    display_name: "Shovel (Silk Touch)",
  },
  hoe_fortune: {
    data: hoe_fortune_preset,
    display_name: "Hoe (Fortune)",
  },
  hoe_silk_touch: {
    data: hoe_silk_touch_preset,
    display_name: "Hoe (Silk Touch)",
  },
  brush: {
    data: brush_preset,
    display_name: "Brush",
  },
  elytra: {
    data: brush_preset,
    display_name: "Elytra",
  }
};


interface Results {
  steps: Array<StepData>,
  status?: string,
  cost?: number
}

interface AppState {
  items_to_combine: Array<ItemData>,
  results: Results,
  nextIndex: number,
  settings: Settings,
  itemToAdd?: string,
  preset?: string
}

class App extends React.Component<Record<string, never>, AppState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState(): AppState {
    const params = new URLSearchParams(location.search);
    const newState: AppState = {
      items_to_combine: JSON.parse(params.get("items") ?? "null") ?? [],
      results: {
        steps: [],
        status: "No items or items cannot be combined.",
      },
      nextIndex: 0,
      settings: { java_edition: JSON.parse(params.get("settings_java_edition") ?? "null") ?? false },
    }

    return newState;
  }

  componentDidMount() {
    if (this.state.items_to_combine.length > 0) {
      this.combine(this.state.items_to_combine, this.state.settings);
    }
  }

  setUrlState(items_to_combine: Array<ItemData>, settings?: Settings) {
    const url = new URL(location.href);
    const params = new URLSearchParams();
    params.append("items", JSON.stringify(items_to_combine));
    if (settings) {
      params.append("settings_java_edition", settings.java_edition.toString());
    }
    url.search = params.toString();
    history.replaceState(null, '', url);
  }

  getAddOptions() {
    // e.g., if boots is in items_to_combine, the type is boots
    const to_combine_item_type = this.state.items_to_combine.reduce<string | null>(
      (type, item) => {
        return type || item.name === "book" ? type : item.name;
      },
      null
    );
    // Include if there is no type, the type matches, or if it's a book
    const filtered_items = items.filter((item) => {
      return (
        !to_combine_item_type ||
        item.name === to_combine_item_type ||
        item.name === "book"
      );
    });
    return filtered_items.map((item) => {
      return { value: item.name, label: getDisplayName(item.name) };
    });
  }

  // componentDidMount() {
  //Preload preset
  // this.setState({ items_to_combine: addIndexes(test_preset) });
  // this.combineAndSetState(addIndexes(test_preset));

  //   //Use the following line to debug (no worker)
  // combineItems(addIndexes(test_preset));
  // }

  combineAndSetState(items_to_combine: Array<ItemData>, settings?: Settings) {
    this.setUrlState(items_to_combine, settings);
    this.setState({
      items_to_combine: items_to_combine
    });
    this.combine(items_to_combine, settings);
  }

  combine(items_to_combine: Array<ItemData>, settings?: Settings) {
    this.setState({
      results: { steps: [], status: "Loading..." },
    });
    worker.postMessage({ items: items_to_combine, settings: settings || this.state.settings });
    worker.addEventListener("message", (event: MessageEvent<AnvilResults | CombineItemsError>) => {
      const results = event.data;
      let finalResults: Results;
      if (instanceOfCombineItemsError(results)) {
        finalResults = {
          steps: [],
          status: results.status
        }
      } else {
        finalResults = {
          steps: results.steps,
          cost: results.cost,
        }
      }
      this.setState({
        results: finalResults
      });
    });
  }

  changeItemToAdd(e: SelectValue) {
    if (!e?.value) {
      throw 'Error: no item to add';
    }
    this.setState({
      itemToAdd: e.value,
    });
  }

  addItem() {
    if (this.state.itemToAdd) {
      const new_items_to_combine: Array<ItemData> = [
        ...this.state.items_to_combine,
        {
          name: this.state.itemToAdd,
          enchantments: new Array<Enchantment>(),
          index: this.state.nextIndex,
          penalty: 0
        },
      ];
      this.setState({
        nextIndex: this.state.nextIndex + 1,
      });
      this.combineAndSetState(new_items_to_combine);
    }
  }

  deleteItem(index: number) {
    const new_items_to_combine = this.state.items_to_combine.filter(
      (item) => item.index !== index
    );
    this.combineAndSetState(new_items_to_combine);
  }

  getPresetOptions() {
    return Object.entries(presets).map((entry) => {
      return { value: entry[0], label: entry[1].display_name };
    });
  }

  changePreset(e: SelectValue) {
    if (e) {
      this.setState({
        preset: e.value,
      });
    }
  }

  setPreset() {
    if (this.state.preset) {
      const new_items_to_combine = addIndexes(presets[this.state.preset].data).map<ItemData>((item_to_combine) => {
        return {
          ...item_to_combine,
          penalty: 0
        };
      });
      this.setState({
        nextIndex: new_items_to_combine.length,
      });
      this.combineAndSetState(new_items_to_combine);
    }
  }

  changeItemPenalty(e: React.ChangeEvent<HTMLInputElement>, item_index: number) {
    if (!(e.target)) {
      return;
    }
    let new_items_to_combine = [...this.state.items_to_combine];
    const modifiedItem = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (!modifiedItem) {
      throw 'Error: changeItemPenalty could not find modified item';
    }
    modifiedItem.penalty = e.target.valueAsNumber;
    new_items_to_combine = [
      ...new_items_to_combine.filter((item) => item.index !== item_index),
      modifiedItem,
    ];
    new_items_to_combine.sort((item_a, item_b) => item_a.index - item_b.index);
    this.combineAndSetState(new_items_to_combine);
  }

  getEnchantmentMaxLevel(enchantmentName: string): number {
    const max_level = enchantments.find(
      (enchantment) => enchantment.name === enchantmentName
    )?.max_level;
    if (!max_level) {
      throw 'Error: could not get max enchantment level.'
    }
    return max_level;
  }

  addEnchantment(e: SelectValue, item_index: number) {
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (e?.value && new_item) {
      new_item.enchantments = [
        ...new_item.enchantments,
        {
          name: e.value,
          level: this.getEnchantmentMaxLevel(e.value),
        },
      ];
      this.combineAndSetState(new_items_to_combine);
    }
  }

  deleteEnchantment(item_index: number, enchantment: Enchantment) {
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (!new_item) {
      throw 'Error: could not delete Enchantment.';
    }
    new_item.enchantments = new_item.enchantments.filter(
      (filter_enchantment) => filter_enchantment.name !== enchantment.name
    );
    this.combineAndSetState(new_items_to_combine);
  }

  changeEnchantmentLevel(e: React.ChangeEvent<HTMLInputElement>, item_index: number, enchantment: Enchantment) {
    if (!e.target) {
      return;
    }
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (!new_item) {
      throw 'Error: could not change Enchantment level.';
    }
    const new_enchantment = new_item.enchantments.find(
      (find_enchantment) => find_enchantment.name === enchantment.name
    );
    if (!new_enchantment) {
      throw 'Error: could not change Enchantment level.';
    }
    new_enchantment.level = e.target.valueAsNumber;
    this.combineAndSetState(new_items_to_combine);
  }

  checkPreserve(e: React.ChangeEvent<HTMLInputElement>, item_index: number, enchantment: Enchantment) {
    if (!e.target) {
      return;
    }
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (!new_item) {
      throw 'Error: could not check preserve.';
    }
    const new_enchantment = new_item.enchantments.find(
      (find_enchantment) => find_enchantment.name === enchantment.name
    );
    if (!new_enchantment) {
      throw 'Error: could not check preserve.';
    }
    new_enchantment.preserve = e.target.checked;
    this.combineAndSetState(new_items_to_combine);
  }

  checkJavaEdition(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target) {
      return;
    }
    const new_settings = {
      ...this.state.settings,
      java_edition: e.target.checked,
    };
    const new_items_to_combine = this.state.items_to_combine.map((item) => {
      const enchantmentsToKeep = getItemData(item).enchantments
        // Filter according to applies_to overrides  
        .filter((enchantment) => {
          let appliesTo = enchantment.specification?.applies_to ?? [];
          appliesTo = e.target.checked && enchantment.specification?.java_overrides?.applies_to ? enchantment.specification?.java_overrides?.applies_to : appliesTo;
          return appliesTo.includes(item.name) || item.name === "book";
        })
        // Filter when an enchantment is Java exclusive
        .filter((enchantment) => new_settings.java_edition || !enchantment.specification?.java_only).map((enchantment) => enchantment.name);
      return { ...item, enchantments: item.enchantments.filter((enchantment) => enchantmentsToKeep.includes(enchantment.name)) };
    });
    this.setState({
      settings: new_settings,
    });
    this.combineAndSetState(new_items_to_combine, new_settings);
  }

  render() {
    const { results, items_to_combine } = this.state;
    return (
      <div className="App">
        <Container fluid>
          <Row className="justify-content-start">
            <Col xs="auto">
              <Icon name="anvil" size={64} />
            </Col>
            <Col>
              <h1>Minecraft Anvil Calculator</h1>
              <p>
                Add an item or select a preset to begin.
                <a
                  href="https://github.com/aviettran/minecraft-anvil-calc"
                  className="github"
                >
                  [github]
                </a>
              </p>
            </Col>
          </Row>
          <Row xl="auto" className="justify-content-start">
            <Col xs="6" xl="2">
              <Select
                options={this.getAddOptions()}
                onChange={(e) => this.changeItemToAdd(e)}
                placeholder="Items..."
              />
            </Col>
            <Col xl="1">
              <Button variant="outline-primary" onClick={() => this.addItem()}>
                Add
              </Button>
            </Col>
            <Col xs="6" xl="2">
              <Select
                options={this.getPresetOptions()}
                onChange={(e) => this.changePreset(e)}
                placeholder="Presets..."
              />
            </Col>
            <Col xl="1">
              <Button
                variant="outline-primary"
                onClick={() => this.setPreset()}
              >
                Select Preset
              </Button>
            </Col>
            <Col xl="2">
              <Form.Check
                type="checkbox"
                label="Java Edition"
                onChange={(e) => this.checkJavaEdition(e)}
                defaultChecked={this.state.settings?.java_edition ?? false}
              />
            </Col>
          </Row>
          <Row>
            <Col xs="auto">
              {items_to_combine.map((item) => {
                return (
                  <Item
                    item={getItemData(item)}
                    settings={this.state.settings}
                    key={item.index}
                    onDelete={() => this.deleteItem(item.index)}
                    onAddEnchantment={(e) => this.addEnchantment(e, item.index)}
                    onDeleteEnchantment={(enchantment) =>
                      this.deleteEnchantment(item.index, enchantment)
                    }
                    onChangeLevel={(e, enchantment) =>
                      this.changeEnchantmentLevel(e, item.index, enchantment)
                    }
                    onChangePenalty={(e) =>
                      this.changeItemPenalty(e, item.index)
                    }
                    onCheckPreserve={(e, enchantment) =>
                      this.checkPreserve(e, item.index, enchantment)
                    }
                  ></Item>
                );
              })}
            </Col>
            <Col xs="6">
              <h3>Results</h3>
              <p>{results.status}</p>
              <p>Total Levels: {results.cost ?? 0}</p>
              <p>
                Total Experience:{" "}
                {results.steps.reduce(
                  (total, step) => total + levelToExperience(step.stepCost),
                  0
                )}
              </p>
              <Table>
                <thead>
                  <tr>
                    <th>Target</th>
                    <th>Sacrifice</th>
                    <th>Result</th>
                    <th>Step Cost</th>
                    <th>Step Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {results.steps.map((step, index) => {
                    return <Step step={step} key={index} />;
                  })}
                </tbody>
              </Table>
              {/* <p>{`Result JSON: ${JSON.stringify(results)}`}</p> */}
            </Col>
          </Row>
        </Container>
      </div >
    );
  }
}

export default App;
