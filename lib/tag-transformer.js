let _ = require('lodash');

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
	 */
	constructor(config, yamlConfig, env) {
		this.config = config;
		this.yamlConfig = yamlConfig;
		this.env = env;
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
}

module.exports = exports = TagTransformer;
