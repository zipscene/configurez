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
	constructor([ type, code, hint ]) {
		super([ type, code, hint ]);

		this.type = type;
		this.code = code;
		this.hint = hint;
	}

	/**
	 * Transform this DecryptTag into whatever the data should actually be
	 * @method transform
	 * @param {String} path - Dot-seperated path
	 * @param {Object} fullConfig - Full config object
	 */
	transform() {
		//TODO: use the contained data/user input to decrypt based on the given sequence
		return this.data;
	}
}

module.exports = exports = DecryptTag;

/**
 * Types of decryption password stores that can be used.
 * @static
 * @property TYPES
 * @type String[]
 */
DecryptTag.TYPES = [
	'password', // Basic password auth through <some algorithm/library>
	'pass', // [pass](http://www.passwordstore.org/)
	'onepass' // [onepass](https://agilebits.com/onepassword)
];

/**
 * YAML Tag Definition for !decrypt.
 * @static
 * @property YAML
 * @type Type
 */
DecryptTag.YAML = new yaml.Type('!decrypt', {
	kind: 'sequence',
	resolve(data) {
		if (!data || data.length > 3 || data.length < 2) { return false; }
		let [ type, code, hint ] = data;
		if (_.contains(DecryptTag.TYPES, type)) { return false; }
		return _.isString(code) && (_.isUndefined(hint) || _.isString(hint));
	},
	construct(data) {
		return new DecryptTag(data);
	},
	instanceOf: DecryptTag,
	represent(decryptInst) {
		return decryptInst.data;
	}
});
