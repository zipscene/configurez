let yaml = require('js-yaml');

let Tag = require('../tag');

/**
 * Decrypt Tag handles decryption fo fields tagged with !decrypt
 * @class DecryptTag
 * @extends Tag
 */
class DecryptTag extends Tag {
	/**
	 * @constructor
	 * @param {String} data - The data contained in this tag.
	 */
	constructor(data) {
		super(data);
	}

	/**
	 * Transform this DecryptTag into whatever the data should actually be
	 * @method transform
	 * @param {String} path - Dot-seperated path
	 * @param {Object} fullConfig - Full config object
	 */
	transform() {
		//TODO: use the contained data/user input to decrypt
		return this.data;
	}
}

/**
 * YAML Tag Definition for !decrypt.
 * @static
 * @property YAML
 * @type Type
 */
DecryptTag.YAML = new yaml.Type('!decrypt', {
	kind: 'sequence',
	construct(data) {
		return new DecryptTag(data);
	},
	instanceOf: DecryptTag,
	represent(decryptInst) {
		return decryptInst.data;
	}
});

module.exports = exports = DecryptTag;
