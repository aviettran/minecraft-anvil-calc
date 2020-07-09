import React from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import enchantments from "../data/echantments.json";

class Item extends React.PureComponent {
  addDisabledEnchantments(item) {
    const existingEnchantments = item.enchantments.map((enchantment) => {
      return { ...enchantment, enabled: true };
    });
    const possibleEnchantments = enchantments
      .filter(
        (filtered_enchantment) =>
          //Possible enchantment is not in list of existing enchantments
          !existingEnchantments.some(
            (some_enchantment) =>
              some_enchantment.name === filtered_enchantment.name
          ) &&
          //Possible enchantment is applicable to the given item
          filtered_enchantment.applies_to.some(
            (some_item) => some_item === item.name || item.name === "book"
          )
      )
      .map((enchantment) => {
        return { ...enchantment, level: enchantment.max_level, enabled: false };
      });
    return [...existingEnchantments, ...possibleEnchantments];
  }

  render() {
    const { item, onEnableEnchantment } = this.props;
    const extendedItem = {
      ...item,
      enchantments: this.addDisabledEnchantments(item),
    };

    return (
      <Container fluid>
        <Row>
          <Col xs="2">{extendedItem.name}</Col>
          <Col xs="2">
            <Button variant="outline-primary" onClick={this.props.onDelete}>
              Delete
            </Button>
          </Col>
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>Enchantment</th>
                  <th>Level</th>
                  <th>Item Multiplier</th>
                  <th>Book Multiplier</th>
                  <th>Enabled</th>
                </tr>
              </thead>
              <tbody>
                {extendedItem.enchantments.map((enchantment, index) => (
                  <tr key={index}>
                    <td>{enchantment.name}</td>
                    <td>
                      <input
                        type="number"
                        value={enchantment.level}
                        min="1"
                        max={enchantment.level}
                      />
                    </td>
                    <td>{enchantment.item_multiplier}</td>
                    <td>{enchantment.book_multiplier}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={enchantment.enabled}
                        onClick={() => onEnableEnchantment(enchantment)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Item;
