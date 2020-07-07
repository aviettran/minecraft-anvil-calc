import React from 'react';
import { Table } from 'react-bootstrap';


class Item extends React.Component {
  constructor(props) {
    super(props);
    // props.item.enchantments.forEach(enchantment => {
    //   enchantment.level = enchantment.max_level;
    // });
    this.state = { item: props.item };
  }

  handleEnableEnchantment(enchantment) {
    enchantment.enabled = !enchantment.enabled;
    this.setState({ item: this.state.item });
  }

  render() {
    const item = this.state.item;
    return (
      <div>
        <h3>{item.name}</h3>
        <Table>
          <thead>
            <tr>
              <th>Enchantment</th>
              <th>Level</th>
              <th>Item Multiplier</th>
              <th>Book Multiplier</th>
              <th>Enable</th>
            </tr>
          </thead>
          {item.enchantments.map(enchantment =>
            <tr onClick={() => this.handleEnableEnchantment(enchantment)}>
              <td>{enchantment.name}</td>
              <td><input type="number" value={enchantment.level} min="1" max={enchantment.level}/></td>
              <td>{enchantment.item_multiplier}</td>
              <td>{enchantment.book_multiplier}</td>
              <td><input type="checkbox" checked={enchantment.enabled} /></td>
            </tr>
          )
          }
        </Table></div>
    )
  }
}

export default Item;