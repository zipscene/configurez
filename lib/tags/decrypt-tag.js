let _ = require('lodash');
let crypto = require('crypto');
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
	constructor(text) {
		super(text);

		this.text = text;
	}

	/**
	 * Transform this DecryptTag into whatever the data should actually be
	 * @method transform
	 * @param {TagTransformer} transformer - The transformer that called transform on this Tag.
	 * @returns {*} The decrypted value.
	 */
	transform(transformer) {
		let decrypted = null;
		while (_.isNull(decrypted)) {
			// Decipher the text
			let decipher = crypto.createDecipher('aes256', transformer.getPassword());
			decrypted = decipher.update(this.text, 'base64', 'utf8');
			decrypted += decipher.final('utf8');
			try {
				// Try parsing hte decryptd text into JSON
				decrypted = JSON.parse(decrypted);
			} catch(ex) {
				// The given password is invalid (did not receive valid JSON from the value)
				decrypted = null;
				transformer.clearPassword();
				console.log('Failed to decrypt enter a new password.');
				continue;
			}
		}
		return decrypted.value;
	}
}

module.exports = exports = DecryptTag;

/**
 * YAML Tag Definition for !decrypt.
 * @static
 * @property YAML
 * @type Type
 */
DecryptTag.YAML = new yaml.Type('!decrypt', {
	kind: 'scalar',
	resolve(text) {
		return _.isString(text);
	},
	construct(text) {
		return new DecryptTag(text);
	},
	instanceOf: DecryptTag,
	represent(decryptInst) {
		return decryptInst.data;
	}
});
