import React from "react";
import "./App.scss";

import items from "./data/items.json";
import enchantments from "./data/enchantments.json";
import Item from "./components/item";
import Step from "./components/step";
import Icon from "./components/icon";
import { getItemData, getDisplayName } from "./utils/item";
// import { combineItems } from "./utils/item"; //for debugging
import worker from 'workerize-loader!./utils/worker'; // eslint-disable-line import/no-webpack-loader-syntax
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";
import { levelToExperience, addIndexes } from "./utils/helpers";
import Select from "react-select";

// Presets
import helmet_preset from "./data/helmet_preset.json";
import chestplate_preset from "./data/chestplate_preset.json";
import leggings_preset from "./data/leggings_preset.json";
import boots_preset from "./data/boots_preset.json";
import sword_sharpness_preset from "./data/sword_sharpness_preset.json";
import pickaxe_fortune_preset from "./data/pickaxe_fortune_preset.json";
import pickaxe_silk_touch_preset from "./data/pickaxe_silk_touch_preset.json";
import bow_preset from "./data/bow_preset.json";
import hoe_fortune_preset from "./data/hoe_fortune_preset.json";
import hoe_silk_touch_preset from "./data/hoe_silk_touch_preset.json";

let instance = worker();
const presets = {
  clear: { data: [], display_name: "Clear" },
  helmet: { data: helmet_preset, display_name: "Helmet" },
  chestplate: { data: chestplate_preset, display_name: "Chestplate" },
  leggings: { data: leggings_preset, display_name: "Leggings" },
  boots: { data: boots_preset, display_name: "Boots" },
  sword_sharpness: {
    data: sword_sharpness_preset,
    display_name: "Sword (Sharpness)",
  },
  pickaxe_fortune: {
    data: pickaxe_fortune_preset,
    display_name: "Pickaxe (Fortune)",
  },
  pickaxe_silk_touch: {
    data: pickaxe_silk_touch_preset,
    display_name: "Pickaxe (Silk Touch)",
  },
  bow: { data: bow_preset, display_name: "Bow" },
  hoe_fortune: {
    data: hoe_fortune_preset,
    display_name: "Hoe (Fortune)",
  },
  hoe_silk_touch: {
    data: hoe_silk_touch_preset,
    display_name: "Hoe (Silk Touch)",
  },
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items_to_combine: [],
      results: {
        targetItem: {},
        steps: [],
        status: "No items or items cannot be combined.",
      },
      nextIndex: 0,
      settings: { java_edition: false },
    };
  }

  getAddOptions() {
    // e.g., if boots is in items_to_combine, the type is boots
    const to_combine_item_type = this.state.items_to_combine.reduce(
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

  combineAndSetState(items_to_combine, settings) {
    this.setState({
      results: { targetItem: {}, steps: [], status: "Loading..." },
    });
    instance.terminate();
    instance = worker();
    instance
      .combineItemsExecute(items_to_combine, settings || this.state.settings)
      .then((results) => {
        this.setState({ results: results });
      });
  }

  changeItemToAdd(e) {
    this.setState({
      itemToAdd: e.value,
    });
  }

  addItem() {
    if (this.state.itemToAdd) {
      const new_items_to_combine = [
        ...this.state.items_to_combine,
        {
          name: this.state.itemToAdd,
          enchantments: [],
          index: this.state.nextIndex,
        },
      ];
      this.setState({
        items_to_combine: new_items_to_combine,
        nextIndex: this.state.nextIndex + 1,
      });
      this.combineAndSetState(new_items_to_combine);
    }
  }

  deleteItem(index) {
    const new_items_to_combine = this.state.items_to_combine.filter(
      (item) => item.index !== index
    );
    this.setState({
      items_to_combine: new_items_to_combine,
    });
    this.combineAndSetState(new_items_to_combine);
  }

  getPresetOptions() {
    return Object.entries(presets).map((entry) => {
      return { value: entry[0], label: entry[1].display_name };
    });
  }

  changePreset(e) {
    this.setState({
      preset: e.value,
    });
  }

  setPreset() {
    const new_items_to_combine = addIndexes(presets[this.state.preset].data);
    this.setState({
      items_to_combine: new_items_to_combine,
      nextIndex: new_items_to_combine.length,
    });
    this.combineAndSetState(new_items_to_combine);
  }

  changeItemPenalty(e, item_index) {
    if (!e.target) {
      return;
    }
    let new_items_to_combine = [...this.state.items_to_combine];
    const modifiedItem = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    modifiedItem.penalty = e.target.valueAsNumber;
    new_items_to_combine = [
      ...new_items_to_combine.filter((item) => item.index !== item_index),
      modifiedItem,
    ];
    new_items_to_combine.sort((item_a, item_b) => item_a.index - item_b.index);
    this.setState({
      items_to_combine: new_items_to_combine,
    });
    this.combineAndSetState(new_items_to_combine);
  }

  getEnchantmentMaxLevel(enchantmentName) {
    return enchantments.find(
      (enchantment) => enchantment.name === enchantmentName
    ).max_level;
  }

  addEnchantment(e, item_index) {
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (e.value) {
      new_item.enchantments = [
        ...new_item.enchantments,
        {
          name: e.value,
          level: this.getEnchantmentMaxLevel(e.value),
        },
      ];
      this.setState({
        items_to_combine: new_items_to_combine,
      });
      this.combineAndSetState(new_items_to_combine);
    }
  }

  deleteEnchantment(item_index, enchantment) {
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    new_item.enchantments = new_item.enchantments.filter(
      (filter_enchantment) => filter_enchantment.name !== enchantment.name
    );
    this.setState({
      items_to_combine: new_items_to_combine,
    });
    this.combineAndSetState(new_items_to_combine);
  }

  changeEnchantmentLevel(e, item_index, enchantment) {
    if (!e.target) {
      return;
    }
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    const new_enchantment = new_item.enchantments.find(
      (find_enchantment) => find_enchantment.name === enchantment.name
    );
    new_enchantment.level = e.target.valueAsNumber;
    this.setState({
      items_to_combine: new_items_to_combine,
    });
    this.combineAndSetState(new_items_to_combine);
  }

  checkPreserve(e, item_index, enchantment) {
    if (!e.target) {
      return;
    }
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    const new_enchantment = new_item.enchantments.find(
      (find_enchantment) => find_enchantment.name === enchantment.name
    );
    new_enchantment.preserve = e.target.checked;
    this.setState({
      items_to_combine: new_items_to_combine,
    });
    this.combineAndSetState(new_items_to_combine);
  }

  checkJavaEdition(e) {
    if (!e.target) {
      return;
    }
    const new_settings = {
      ...this.state.settings,
      java_edition: e.target.checked,
    };
    this.setState({
      settings: new_settings,
    });
    this.combineAndSetState(this.state.items_to_combine, new_settings);
  }

  render() {
    const { results, items_to_combine } = this.state;
    return (
      <div className="App">
        <Container fluid>
          <Row className="align-items-center">
            <Col xs="auto">
              <Icon name="anvil" size="64" />
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
          <Row xl="auto" className="align-items-center">
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
              />
            </Col>
          </Row>
          <Row>
            <Col xs="auto">
              {items_to_combine.map((item) => {
                return (
                  <Item
                    item={getItemData(item)}
                    key={item.index}
                    onDelete={() => this.deleteItem(item.index)}
                    onAddEnchantment={(e) => this.addEnchantment(e, item.index)}
                    onDeleteEnchantment={(enchantment) =>
                      this.deleteEnchantment(item.index, enchantment)
                    }
                    changeEnchantmentToAdd={(e) =>
                      this.changeEchantmentToAdd(e, item.index)
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
              <p>Total Levels: {results.cost || 0}</p>
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
      </div>
    );
  }
}

export default App;
