let yaml = require('js-yaml');

let BaseTag = require('./base-tag');

/**
 * Pass Tag handles passance for paths tagged with !pass.
 * @class PassTag
 * @extends BaseTag
 */
class PassTag extends BaseTag {
	/**
	 * @constructor
	 * @param {Array} data - The data contained in this tag.
	 */
	constructor(data) {
		super(data);
	}

	/**
	 * Transform this PassTag into whatever the data should actually be
	 * @method transform
	 * @param {String} path - Dot-seperated path
	 * @param {Object} fullConfig - Full config object
	 */
	transform() {
		//TODO: use the contained data/user input with pass
		return this.data;
	}
}

/**
 * YAML Tag Definition for !pass.
 * @static
 * @property YAML
 * @type {Type}
 */
PassTag.YAML = new yaml.Type('!pass', {
	kind: 'scalar',
	construct(data) {
		return new PassTag(data);
	},
	instanceOf: PassTag,
	represent(passInst) {
		return passInst.data;
	}
});

module.exports = exports = PassTag;
