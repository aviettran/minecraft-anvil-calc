import React from "react";
import {
  Container,
  Row,
  Col,
  Table,
  InputGroup,
  FormControl,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import enchantments from "../data/enchantments.json";
import Select from "react-select";
import { checkEnchantmentIsCompatible, getDisplayName } from "../utils/item";
import { getEnchantmentDisplayName } from "../utils/helpers";
import Icon from "./icon";

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
        return {
          value: enchantment.name,
          label: getEnchantmentDisplayName(enchantment.name),
        };
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
      onCheckPreserve,
    } = this.props;

    return (
      <Container>
        <Row>
          <Col sm="auto">
            <Container fluid>
              <Row className="align-items-center">
                <Col xs="1">
                  <Icon name={item.name} size={32} />
                </Col>
                <Col xs="5">
                  <h2>{getDisplayName(item.name)}</h2>
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
                  <th>Item ×</th>
                  <th>Book ×</th>
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id={`tooltip-${item.index}`}>
                        If mutually exclusive enchantments exist, use this
                        checkbox to choose the one you want.
                      </Tooltip>
                    }
                  >
                    <th>Preserve</th>
                  </OverlayTrigger>
                </tr>
              </thead>
              <tbody>
                {item.enchantments.map((enchantment, index) => (
                  <tr key={index}>
                    <td>{getEnchantmentDisplayName(enchantment.name)}</td>
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
                      <Form.Check
                        type="checkbox"
                        onChange={(e) => onCheckPreserve(e, enchantment)}
                      />
                    </td>
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
