import React from "react";

interface IconProps {
  name: string,
  size: number
}

class Icon extends React.PureComponent<IconProps> {
  render() {
    const { name, size } = this.props;
    return (
      <img
        src={`${process.env.PUBLIC_URL}/item_images/${name}.png`}
        alt={name}
        width={size}
        height={size}
      />
    );
  }
}

export default Icon;
