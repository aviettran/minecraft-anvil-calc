import React from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import enchantments from "../data/enchantments.json";
import Select from "react-select";

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

  getPossibleEnchantmentOptions(item) {
    const existingEnchantments = item.enchantments.map((enchantment) => {
      return { ...enchantment, enabled: true };
    });
    return enchantments
      .filter(
        (filtered_enchantment) =>
          //Possible enchantment is not in list of existing enchantments
          !existingEnchantments.some(
            (some_enchantment) =>
              some_enchantment.name === filtered_enchantment.name ||
              (some_enchantment.group &&
              filtered_enchantment.group &&
              some_enchantment.group === filtered_enchantment.group && // Not in a mutual exclusion group
                !(
                  some_enchantment.group_exception &&
                  filtered_enchantment.group_exception &&
                  some_enchantment.group_exception ===
                    filtered_enchantment.group_exception
                )) // Rule exception for tridents
          ) &&
          //Possible enchantment is applicable to the given item
          filtered_enchantment.applies_to.some(
            (some_item) => some_item === item.name || item.name === "book"
          )
      )
      .map((enchantment) => {
        return { value: enchantment.name, label: enchantment.name };
      });
  }

  render() {
    const {
      item,
      changeEnchantmentToAdd,
      onDelete,
      onAddEnchantment,
      onDeleteEnchantment,
    } = this.props;

    return (
      <Container fluid>
        <Row>
          <Col xs="4">
            <h2>{item.name}</h2>
          </Col>
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>Enchantment</th>
                  <th>Level</th>
                  <th>Item Multiplier</th>
                  <th>Book Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {item.enchantments.map((enchantment, index) => (
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
                      <Button
                        variant="outline-primary"
                        onClick={() => onDeleteEnchantment(enchantment)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col xs="2">
            <Select
              options={this.getPossibleEnchantmentOptions(item)}
              onChange={(e) => changeEnchantmentToAdd(e)}
            />
          </Col>
          <Col xs="4">
            <Button variant="outline-primary" onClick={onAddEnchantment}>
              Add Enchantment
            </Button>
            <Button variant="outline-primary" onClick={onDelete}>
              Delete Item
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Item;
