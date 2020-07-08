import React from "react";
import { Container, Row, Badge } from "react-bootstrap";
import { numToNumeral, levelToExperience } from "../utils/helpers";

class Step extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { step } = this.props;
    return (
      <tr>
        <td>
          <Container>
            <Row>
              {step.targetItem.name} [{step.targetItem.penalty}]
            </Row>
            <Row>
              {step.targetItem.enchantments.map((enchantment) => {
                return (
                  <Badge pill variant="primary">
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
              {step.sacrificeItem.name} [{step.sacrificeItem.penalty}]
            </Row>
            <Row>
              {step.sacrificeItem.enchantments.map((enchantment) => {
                return (
                  <Badge pill variant="primary">
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
              {step.resultingItem.name} [{step.resultingItem.penalty}]
            </Row>
            <Row>
              {step.resultingItem.enchantments.map((enchantment) => {
                return (
                  <Badge pill variant="primary">
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
