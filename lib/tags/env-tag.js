let _ = require('lodash');
let yaml = require('js-yaml');

let Tag = require('../tag');

/**
 * Env Tag handles pulling the given variable out of the environment.
 * @class EnvTag
 * @extends Tag
 */
class EnvTag extends Tag {
	/**
	 * @constructor
	 * @param {Array} data - The data contained in this tag.
	 *   @param {String} data.env - The environemnt variable to pull the value from.
	 *   @param {String||Obejct} [data.defaults] - Value to default the field to if the env variable isn't found.
	 */
	constructor([ env, defaults ]) {
		super([ env, defaults ]);

		this.env = env;
		this.defaults = defaults;

		let val = process.env[this.env];
		this.val =(_.isUndefined(val) || _.isNull(val)) ? this.defaults : val;
	}

	/**
	 * Transform this Tag into whatever the data should actually be.
	 * @method transform
	 * @returns {String} The environment value.
	 */
	transform() {
		return this.val;
	}
}

module.exports = exports = EnvTag;

/**
 * YAML Tag Definition for !inherit.
 * @static
 * @property YAML
 * @type Type
 */
EnvTag.YAML = new yaml.Type('!env', {
	kind: 'sequence',
	// Ensure the data coming is good
	resolve([ env ]) {
		return env && _.isString(env);
	},
	// Construt the EnvTag object
	construct(data) {
		return new EnvTag(data);
	},
	instanceOf: EnvTag,
	// Represent an instance of an EnvTag in the YAML
	represent(envInst) {
		return envInst.data;
	}
});
