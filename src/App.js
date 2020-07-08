import React from "react";
import "./App.scss";

import boots_sample from "./data/boots_sample.json";
import items from "./data/items.json";
import Item from "./components/item";
import Step from "./components/step";
import { getItemData } from "./utils/item";
import worker from "workerize-loader!./utils/worker.js"; // eslint-disable-line import/no-webpack-loader-syntax
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { levelToExperience, addIndexes } from "./utils/helpers";
import Select from "react-select";

//Mock
import mock from "./data/mock.json";

let instance = worker();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items_to_combine: addIndexes(boots_sample),
      results: { targetItem: {}, steps: [], status: "Loading..." },
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
    //combineAndSetState(addIndexes(boots_sample))
    this.setState({ results: mock });
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
      itemToAdd: e.value,
    });
  }

  addItem() {
    if (this.state.itemToAdd) {
      const new_items_to_combine = [
        ...this.state.items_to_combine,
        { name: this.state.itemToAdd, enchantments: [] },
      ];
      this.setState({
        items_to_combine: new_items_to_combine,
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

  render() {
    const { results, items_to_combine } = this.state;
    return (
      <div className="App">
        <Container fluid>
          <Row>
            <Col>
              <Select
                options={this.getAddOptions()}
                onChange={(e) => this.changeItemToAdd(e)}
              />
            </Col>
            <Col>
              <Button variant="outline-primary" onClick={() => this.addItem()}>
                Add
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
