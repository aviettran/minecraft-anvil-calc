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