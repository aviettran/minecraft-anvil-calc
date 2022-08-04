import React from "react";
import { Container, Row, Badge } from "react-bootstrap";
import { StepData } from "../models";
import {
  numToNumeral,
  levelToExperience,
  getEnchantmentDisplayName,
} from "../utils/helpers";
import { getDisplayName } from "../utils/item";
import Icon from "./icon";

interface StepProps {
  step: StepData
}

class Step extends React.PureComponent<StepProps> {
  render() {
    const { step } = this.props;
    return (
      <tr>
        <td>
          <Container>
            <Row>
              <Icon name={step.targetItem.name} size={16} />
              {getDisplayName(step.targetItem.name)}
              <Badge pill bg="warning">
                {step.targetItem.penalty}
              </Badge>
            </Row>
            <Row>
              {step.targetItem.enchantments.map((enchantment, index) => {
                return (
                  <Badge
                    key={index}
                    pill
                    bg={enchantment.is_curse ? "danger" : "primary"}
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
              <Badge pill bg="warning">
                {step.sacrificeItem.penalty}
              </Badge>
            </Row>
            <Row>
              {step.sacrificeItem.enchantments.map((enchantment, index) => {
                return (
                  <Badge
                    key={index}
                    pill
                    bg={enchantment.is_curse ? "danger" : "primary"}
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
              <Badge pill bg="warning">
                {step.resultingItem.penalty}
              </Badge>
            </Row>
            <Row>
              {step.resultingItem.enchantments.map((enchantment, index) => {
                return (
                  <Badge
                    key={index}
                    pill
                    bg={enchantment.is_curse ? "danger" : "primary"}
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
