import React from "react";
import "./App.scss";

import items from "./data/items.json";
import enchantments from "./data/enchantments.json";
import Item from "./components/item";
import Step from "./components/step";
import { getItemData } from "./utils/item";
import worker from "workerize-loader!./utils/worker.js"; // eslint-disable-line import/no-webpack-loader-syntax
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { levelToExperience, addIndexes } from "./utils/helpers";
import Select from "react-select";

// Presets
import helmet_preset from "./data/helmet_preset.json";
import chestplate_preset from "./data/chestplate_preset.json";
import leggings_preset from "./data/leggings_preset.json";
import boots_preset from "./data/boots_preset.json";
import sword_sharpness_preset from "./data/sword_sharpness_preset.json";

let instance = worker();
const presets = {
  reset: [],
  helmet: helmet_preset,
  chestplate: chestplate_preset,
  leggings: leggings_preset,
  boots: boots_preset,
  sword_sharpness: sword_sharpness_preset,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items_to_combine: [],
      results: { targetItem: {}, steps: [], status: "Loading..." },
      nextIndex: 0,
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
        item === to_combine_item_type ||
        item === "book"
      );
    });
    return filtered_items.map((item) => {
      return { value: item, label: item };
    });
  }

  componentDidMount() {
    this.combineAndSetState(this.state.items_to_combine);
    //this.setState({ results: mock });
    //Use the following line to debug (no worker)
    // this.setState({ results: combineItems(this.state.items_to_combine) });
  }

  combineAndSetState(items_to_combine) {
    this.setState({
      results: { targetItem: {}, steps: [], status: "Loading..." },
    });
    instance.terminate();
    instance = worker();
    instance.combineItemsExecute(items_to_combine).then((results) => {
      this.setState({ results: results });
    });
  }

  changeItemToAdd(e) {
    this.setState({
      itemToAdd: e.label,
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
      return { value: entry[0], label: entry[0] };
    });
  }

  changePreset(e) {
    this.setState({
      preset: e.label,
    });
  }

  setPreset() {
    const new_items_to_combine = addIndexes(presets[this.state.preset]);
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

  changeEchantmentToAdd(e, item_index) {
    const new_items_to_combine = [...this.state.items_to_combine];
    new_items_to_combine.find(
      (item) => item.index === item_index
    ).enchantmentToAdd = e.label;
    this.setState({
      items_to_combine: new_items_to_combine,
    });
  }

  getEnchantmentMaxLevel(enchantmentName) {
    return enchantments.find(
      (enchantment) => enchantment.name === enchantmentName
    ).max_level;
  }

  addEnchantment(item_index) {
    const new_items_to_combine = [...this.state.items_to_combine];
    const new_item = new_items_to_combine.find(
      (item) => item.index === item_index
    );
    if (new_item.enchantmentToAdd) {
      new_item.enchantments = [
        ...new_item.enchantments,
        {
          name: new_item.enchantmentToAdd,
          level: this.getEnchantmentMaxLevel(new_item.enchantmentToAdd),
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

  render() {
    const { results, items_to_combine } = this.state;
    return (
      <div className="App">
        <Container fluid>
          <Row>
            <Col xs="2">
              <Select
                options={this.getAddOptions()}
                onChange={(e) => this.changeItemToAdd(e)}
                placeholder="Items..."
              />
            </Col>
            <Col xs="1">
              <Button variant="outline-primary" onClick={() => this.addItem()}>
                Add
              </Button>
            </Col>
            <Col xs="2">
              <Select
                options={this.getPresetOptions()}
                onChange={(e) => this.changePreset(e)}
                placeholder="Presets..."
              />
            </Col>
            <Col xs="2">
              <Button
                variant="outline-primary"
                onClick={() => this.setPreset()}
              >
                Select Preset
              </Button>
            </Col>
            <Col xs="6"></Col>
          </Row>
          <Row>
            <Col>
              {items_to_combine.map((item) => {
                return (
                  <Item
                    item={getItemData(item)}
                    key={item.index}
                    onDelete={() => this.deleteItem(item.index)}
                    onAddEnchantment={() => this.addEnchantment(item.index)}
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
                  ></Item>
                );
              })}
            </Col>
            <Col>
              <h3>Results</h3>
              <p>{results.status}</p>
              <p>Total Levels: {results.cost}</p>
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
