module.exports = {
    root: true
    , "env": {
        "browser": true
        , "commonjs": true
        , "es6": true
        , "jquery": true
        , "mocha": true
        , "node": true
    }
    , "extends": [
        "eslint:recommended"
        , "plugin:vue/recommended"
    ]
    , "parserOptions": {
        "sourceType": "module"
    }
    , "plugins": [
        "html"
    ]
    , "rules": {
        "indent": [
            "warn"
            , "tab"
        ]
        , "quotes": [
            "warn"
            , "double"
        ]
        , "semi": [
            "error"
            , "always"
        ]
        , "no-var": [
            "error"
        ]
        , "no-console": [
            "off"
        ]
        , "no-unused-vars": [
            "off"
        ]
        , "no-mixed-spaces-and-tabs": [
            "warn"
        ]
        , "vue/html-self-closing": [
            "off"
        ]
        , "comma-spacing": [
            "error"
            , {
                "before": false
                , "after": true
            }
        ]
        , "comma-style" : [
            "error"
            , "first"
        ]
    }
};