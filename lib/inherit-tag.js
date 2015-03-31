let yaml = require('js-yaml');

let BaseTag = require('./base-tag');

/**
 * Inherit Tag handles inheritance for paths tagged with !inherit.
 * @class InheritTag
 * @extends BaseTag
 */
class InheritTag extends BaseTag {
	/**
	 * @constructor
	 * @param {Array} data - The data contained in this tag.
	 */
	constructor(data) {
		super(data);

		this.env = data[0];
		this.overrides = data[1];
		this.defaults = data[2];
	}
}

/**
 * YAML Tag Definition for !inherit.
 * @static
 * @property YAML
 * @type {Type}
 */
InheritTag.YAML = new yaml.Type('!inherit', {
	kind: 'sequence',
	construct(data) {
		return new InheritTag(data);
	},
	instanceOf: InheritTag,
	represent(inheritInst) {
		return inheritInst.data;
	}
});

module.exports = exports = InheritTag;
