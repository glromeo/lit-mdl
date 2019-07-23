module.exports = {
    "plugins": [
        ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}],
        ["@babel/plugin-proposal-class-properties", {"loose": true}],
        ["@babel/plugin-proposal-export-default-from"]
    ],
    "presets": [
        "@babel/preset-typescript"
    ],
    "env": {
        "test": {
            "presets": [["@babel/preset-env", {targets: {node: "current"}}]]
        }
    }
};