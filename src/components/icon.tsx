import React from "react";
import { itemNameToSpecificationMap } from "../utils/helpers";

interface IconProps {
  name: string,
  size: number,
}

class Icon extends React.PureComponent<IconProps> {
  render() {
    const { name, size } = this.props;
    const specification = itemNameToSpecificationMap.get(name);
    const filename = specification?.image ? specification.image : `${name}.png`;
    return (
      <img
        src={`${process.env.PUBLIC_URL}/item_images/${filename}`}
        alt={specification?.display_name ?? name}
        width={size}
        height={size}
      />
    );
  }
}

export default Icon;
