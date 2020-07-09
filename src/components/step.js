import React from "react";
import { Container, Row, Badge } from "react-bootstrap";
import { numToNumeral, levelToExperience } from "../utils/helpers";

class Step extends React.PureComponent {
  render() {
    const { step } = this.props;
    return (
      <tr>
        <td>
          <Container>
            <Row>
              {step.targetItem.name}
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
                    {enchantment.name} {numToNumeral(enchantment.level)}
                  </Badge>
                );
              })}
            </Row>
          </Container>
        </td>
        <td>
          <Container>
            <Row>
              {step.sacrificeItem.name}
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
                    {enchantment.name} {numToNumeral(enchantment.level)}
                  </Badge>
                );
              })}
            </Row>
          </Container>
        </td>
        <td>
          <Container>
            <Row>
              {step.resultingItem.name}
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
                    {enchantment.name} {numToNumeral(enchantment.level)}
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
