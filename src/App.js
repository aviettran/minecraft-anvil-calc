import React from 'react';
import './App.scss';

import items_to_combine from './data/items_to_combine.json'
import Item from './components/item'
import { getItemData, combineItems } from './utils/item'

function App() {
  const results = combineItems(items_to_combine, 0);

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <body>
        <div class="container">
          <div class="row">
            <div class="col-sm">
              {items_to_combine.map(item => {
                return <Item item={getItemData(item)}></Item>
              })}
            </div>
            <div class="col-sm">
              <h3>Steps</h3>
              <p>{`Total Cost: ${results.cost}`}</p>
              <p>{`Target Item: ${JSON.stringify(results.targetItem)}`}</p>
              {results.steps.map(step => {
                return <li>{step}</li>
              })}
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App; 