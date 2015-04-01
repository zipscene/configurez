let yaml = require('js-yaml');

let InheritTag = require('./inherit-tag');
let DecryptTag = require('./decrypt-tag');

let types = [ InheritTag.YAML, DecryptTag.YAML ];

/* Define a Safe Schema with our extra YAML Tags. */
let schema = yaml.Schema.create(yaml.DEFAULT_SAFE_SCHEMA, types);
module.exports = exports = schema;
