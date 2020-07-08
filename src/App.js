import React from "react";
import "./App.scss";

import boots_sample from "./data/boots_sample.json";
import Item from "./components/item";
import Step from "./components/step";
import { getItemData } from "./utils/item";
import worker from "workerize-loader!./utils/worker.js"; // eslint-disable-line import/no-webpack-loader-syntax
import { Table } from "react-bootstrap";

//Mock
import mock from "./data/mock.json";
import { levelToExperience } from "./utils/helpers";

let instance = worker();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items_to_combine: boots_sample,  results: { targetItem: {}, steps: [], status: "pending" } };
  }

  componentDidMount() {
    // instance.combineItemsExecute(items_to_combine).then((results) => {
    //   this.setState({results: results});
    // })
    this.setState({ results: mock });
  }

  render() {
    const { results, items_to_combine } = this.state;
    return (
      <div className="App">
        <header className="App-header"></header>

        <body>
          <div class="container">
            <div class="row">
              <div class="col-sm">
                {items_to_combine.map((item) => {
                  return <Item item={getItemData(item)}></Item>;
                })}
              </div>
              <div class="col-sm">
                <h3>Results</h3>
                <p>{results.status}</p>
                <p>Total Levels: {results.cost}</p>
                <p>Total Experience: {results.steps.reduce((total, step) => total + levelToExperience(step.stepCost),0)}</p>
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
                  {results.steps.map((step) => {
                    return <Step step={step}/>;
                  })}
                </Table>
                {/* <p>{`Result JSON: ${JSON.stringify(results)}`}</p> */}
              </div>
            </div>
          </div>
        </body>
      </div>
    );
  }
}

export default App;
