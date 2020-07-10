import React from "react";
import {
  Container,
  Row,
  Col,
  Table,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import enchantments from "../data/enchantments.json";
import Select from "react-select";
import { checkEnchantmentIsCompatible } from "../utils/item";

const smallerSelect = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "31px",
    height: "31px",
  }),
  input: (provided, state) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: "31px",
  }),
};

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
            <Container fluid>
              <Row className="align-items-center">
                <Col xs="6">
                  <h2>{item.name}</h2>
                </Col>
                <Col>
                  <button onClick={onDelete} className="close">
                    ×
                  </button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <InputGroup size="sm">
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
              <Row>
                <Col>
                  <Select
                    options={this.getPossibleEnchantmentOptions(item)}
                    onChange={(e) => onAddEnchantment(e)}
                    placeholder="Add enchantments..."
                    value={
                      item.enchantmentToAdd
                        ? {
                            value: item.enchantmentToAdd,
                            label: item.enchantmentToAdd,
                          }
                        : null
                    }
                    styles={smallerSelect}
                  />
                </Col>
              </Row>
            </Container>
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
                      <button
                        onClick={() => onDeleteEnchantment(enchantment)}
                        className="close"
                      >
                        ×
                      </button>
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
