import React from "react";
import { Container, Row, Badge } from "react-bootstrap";
import {
  numToNumeral,
  levelToExperience,
  getEnchantmentDisplayName,
} from "../utils/helpers";
import { getDisplayName } from "../utils/item";
import Icon from "./icon";

class Step extends React.PureComponent {
  render() {
    const { step } = this.props;
    return (
      <tr>
        <td>
          <Container>
            <Row>
              <Icon name={step.targetItem.name} size={16} />
              {getDisplayName(step.targetItem.name)}
              <Badge pill variant="warning">
                {step.targetItem.penalty}
              </Badge>
            </Row>
            <Row>
              {step.targetItem.enchantments.map((enchantment, index) => {
                return (
                  <Badge
                    key={index}
                    pill
                    variant={enchantment.is_curse ? "danger" : "primary"}
                  >
                    {getEnchantmentDisplayName(enchantment.name)}{" "}
                    {numToNumeral(enchantment.level)}
                  </Badge>
                );
              })}
            </Row>
          </Container>
        </td>
        <td>
          <Container>
            <Row>
              <Icon name={step.sacrificeItem.name} size={16} />
              {getDisplayName(step.sacrificeItem.name)}
              <Badge pill variant="warning">
                {step.sacrificeItem.penalty}
              </Badge>
            </Row>
            <Row>
              {step.sacrificeItem.enchantments.map((enchantment, index) => {
                return (
                  <Badge
                    key={index}
                    pill
                    variant={enchantment.is_curse ? "danger" : "primary"}
                  >
                    {getEnchantmentDisplayName(enchantment.name)}{" "}
                    {numToNumeral(enchantment.level)}
                  </Badge>
                );
              })}
            </Row>
          </Container>
        </td>
        <td>
          <Container>
            <Row>
              <Icon name={step.resultingItem.name} size={16} />
              {getDisplayName(step.resultingItem.name)}
              <Badge pill variant="warning">
                {step.resultingItem.penalty}
              </Badge>
            </Row>
            <Row>
              {step.resultingItem.enchantments.map((enchantment, index) => {
                return (
                  <Badge
                    key={index}
                    pill
                    variant={enchantment.is_curse ? "danger" : "primary"}
                  >
                    {getEnchantmentDisplayName(enchantment.name)}{" "}
                    {numToNumeral(enchantment.level)}
                  </Badge>
                );
              })}
            </Row>
          </Container>
        </td>
        <td>{step.stepCost}</td>
        <td>{levelToExperience(step.stepCost)}</td>
      </tr>
    );
  }
}

export default Step;
