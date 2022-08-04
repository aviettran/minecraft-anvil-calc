// eslint-disable-next-line @typescript-eslint/no-var-requires
const { override, addBabelPresets } = require('customize-cra')

module.exports = override(
    ...addBabelPresets(
        [
            "@babel/env",
            {
                modules: false
            }
        ]
    )
);