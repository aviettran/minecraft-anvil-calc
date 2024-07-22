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
import Select, { StylesConfig, ActionMeta, GroupBase } from "react-select";
import { checkEnchantmentIsCompatible, getDisplayName } from "../utils/item";
import { getEnchantmentDisplayName } from "../utils/helpers";
import Icon from "./icon";
import { Enchantment, EnchantmentSpecification, ItemData, Settings } from "../models";
import { SelectValue } from "../App";

const smallerSelect: StylesConfig<SelectValue, false, GroupBase<SelectValue>> = {
  control: (provided) => ({
    ...provided,
    minHeight: "31px",
    height: "31px",
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "31px",
  }),
};

interface ItemProps {
  item: ItemData,
  settings: Settings,
  onDelete: React.MouseEventHandler,
  onAddEnchantment: (option: SelectValue, actionMeta: ActionMeta<SelectValue>) => void,
  onDeleteEnchantment: (enchantment: Enchantment) => void,
  onChangeLevel: (fn: React.ChangeEvent<HTMLInputElement>, enchantment: Enchantment) => void,
  onChangePenalty: (fn: React.ChangeEvent<HTMLInputElement>, index: number) => void,
  onCheckPreserve: (fn: React.ChangeEvent<HTMLInputElement>, enchantment: Enchantment) => void,
}

class Item extends React.PureComponent<ItemProps> {
  getPossibleEnchantmentOptions(item: ItemData, settings: Settings) {
    return (enchantments as Array<EnchantmentSpecification>)
      .map((enchantment) => {
        if (this.props.settings.java_edition && enchantment.java_overrides) {
          return {
            ...enchantment,
            ...enchantment.java_overrides,
          }
        }
        return enchantment;
      })
      .filter(
        (filtered_enchantment) =>
          !item.enchantments.some(
            (some_enchantment) =>
              some_enchantment.name === filtered_enchantment.name
          )
          && checkEnchantmentIsCompatible(item, filtered_enchantment, settings)
          && (this.props.settings.java_edition || !filtered_enchantment.java_only)
      )
      .map((enchantment) => {
        return {
          value: enchantment.name,
          label: getEnchantmentDisplayName(enchantment.name),
        };
      });
  }

  getBookMultiplier(enchantmentSpecification?: EnchantmentSpecification): number | null {
    if (!enchantmentSpecification) {
      return null;
    }
    return this.props.settings.java_edition ? enchantmentSpecification.java_overrides?.book_multiplier ?? enchantmentSpecification.book_multiplier : enchantmentSpecification.book_multiplier;
  }

  getItemMultiplier(enchantmentSpecification?: EnchantmentSpecification): number | null {
    if (!enchantmentSpecification) {
      return null;
    }
    return this.props.settings.java_edition ? enchantmentSpecification.java_overrides?.item_multiplier ?? enchantmentSpecification.item_multiplier : enchantmentSpecification.item_multiplier;
  }

  render() {
    const {
      item,
      settings,
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
              <Row className="justify-content-between">
                <Col xs="1">
                  <Icon name={item.name} size={32} />
                </Col>
                <Col xs="5">
                  <h2>{getDisplayName(item.name)}</h2>
                </Col>
                <Col xs="auto">
                  <button onClick={onDelete} className="btn-close">
                  </button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <InputGroup size="sm">
                    <InputGroup.Text>Penalty</InputGroup.Text>
                    <FormControl
                      type="number"
                      value={item.penalty || 0}
                      min="0"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangePenalty(e, item.index)}
                    />
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Select
                    options={this.getPossibleEnchantmentOptions(item, settings)}
                    onChange={(e, actionMeta) => onAddEnchantment(e, actionMeta)}
                    placeholder="Add enchantments..."
                    value={null} //Enchantments added immediately; this should always be null
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
                        max={enchantment.specification?.max_level ?? 1}
                        onChange={(e) => onChangeLevel(e, enchantment)}
                      />
                    </td>
                    <td>{this.getBookMultiplier(enchantment.specification) ?? 0}</td>
                    <td>{this.getItemMultiplier(enchantment.specification) ?? 0}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        onChange={(e) => onCheckPreserve(e, enchantment)}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => onDeleteEnchantment(enchantment)}
                        className="btn-close"
                      >
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
