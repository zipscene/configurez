let _ = require('lodash');
let prompt = require('sync-prompt').prompt;

let Tag = require('./tag');

/**
 * Tag Transformer walks the config object, looking for tag objects to transform.
 * @class
 */
class TagTransformer {
	/**
	 * @constructor
	 * @param {Object} config - The configuration object to use after taking the environment.
	 * @param {Object} yamlConfig - The full configuration object.
	 * @param {String} env - Used to prevent a circular !inherit.
	 * @param {String} [defautlPassword] - Default password to be used by tags like !decrypt
	 */
	constructor(config, yamlConfig, env, defaultPassword) {
		this.config = config;
		this.yamlConfig = yamlConfig;
		this.env = env;

		// So Tags can share passwords
		this._password = defaultPassword;
		this._passwordTimeoutId = setTimeout(this.clearPassword, 10000);
	}

	/**
	 * Transform the possible custom tags within a config object.
	 * @param {Object} [config=this.config] - The current working config partial.
	 * @param {String[]} [paths=[]] - Paths down to the object.
	 * @param {String[]} [envs=[this.env]] - The inherited envs (used to prevent circular inheritence).
	 */
	transform(config = this.config, paths = [], envs = [ this.env ]) {
		if (!_.isObject(config) || _.isDate(config)) { return config; }

		if (Tag.isTag(config)) {
			config = config.transform(this, paths, envs);

		} else if (_.isArray(config)) {
			for (let i = 0, len = config.length; i < len; ++i) {
				let val = config[i];
				let valPaths = _.clone(paths);
				valPaths.push('' + i);
				config[i] = this.transform(val, valPaths, envs);
			}

		} else {
			for (let key in config) {
				let val = config[key];
				let valPaths = _.clone(paths);
				valPaths.push(key);
				config[key] = this.transform(val, valPaths, envs);
			}

		}
		return config;
	}

	/**
	 * Get Password input from the user.
	 * NOTE: this needs to be here, so all DecryptTag instances can share the password without interfering
	 * with other instances of a Configurator.
	 * @returns {String} the user input password
	 */
	getPassword() {
		clearTimeout(this._passwordTimeoutId);
		if (_.isUndefined(this._password) || _.isNull(this._password)) {
			// Call out to sync prompt to get the password
			this._password = prompt.hidden('Configurez Password: ');
		}
		this._passwordTimeoutId = setTimeout(this.clearPassword, 5000);
		return this._password;
	}

	/**
	 * Clear the password
	 * @static
	 * @method clearPassword
	 */
	clearPassword() {
		this._password = null;
		clearTimeout(this._passwordTimeoutId);
	}
}

module.exports = exports = TagTransformer;
