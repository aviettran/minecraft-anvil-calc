import React from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import enchantments from "../data/enchantments.json";
import Select from "react-select";
import { checkEnchantmentIsCompatible } from "../utils/item";

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
    return enchantments
      .filter(
        (filtered_enchantment) =>
          !item.enchantments.some(
            (some_enchantment) =>
              some_enchantment.name === filtered_enchantment.name
          ) && checkEnchantmentIsCompatible(item, filtered_enchantment)
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
      onChangeLevel,
      onChangePenalty,
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
                        max={enchantment.max_level}
                        onChange={(e) => onChangeLevel(e, enchantment)}
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
          <Col xs="3">
            <Select
              options={this.getPossibleEnchantmentOptions(item)}
              onChange={(e) => changeEnchantmentToAdd(e)}
              placeholder="Enchantments..."
              value={
                item.enchantmentToAdd
                  ? {
                      value: item.enchantmentToAdd,
                      label: item.enchantmentToAdd,
                    }
                  : null
              }
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
          <Col xs="3">
            <InputGroup className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text>Penalty</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                type="number"
                value={item.penalty || 0}
                min="0"
                onChange={(e) => onChangePenalty(e, item.index)}
              />
            </InputGroup>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Item;
