const numToNumeral = (num) => {
  switch (num) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    case 4:
      return "IV";
    case 5:
      return "V";
    default:
      return "Numeral Error";
  }
};

const levelToExperience = (level) => {
  if (level < 17) {
    return Math.pow(level, 2) + 6 * level;
  } else if (level < 31) {
    return 2.5 * Math.pow(level, 2) - 40.5 * level + 360;
  } else {
    return 4.5 * Math.pow(level, 2) - 162.5 * level + 2220;
  }
};

const addIndexes = (arrayToIndex) => {
  return arrayToIndex.map((item, index) => {
    return { ...item, index: index };
  });
};

export { numToNumeral, levelToExperience, addIndexes };
