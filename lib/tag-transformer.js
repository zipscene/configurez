let _ = require('lodash');
let extend = require('extend');
let XError = require('xerror');

let DecryptTag = require('./decrypt-tag');
let InheritTag = require('./inherit-tag');
let PassTag = require('./pass-tag');

/**
 * Tag Transformer walks the config object, looking for tag objects to transform.
 * @class
 */
class TagTransformer {
	/**
	 * @constructor
	 * @param {Object} config - The configuration object to use after taking the environment.
	 * @param {Object} fullConfig - The full configuration object.
	 * @param {String} env - Used to prevent a circular !inherit.
	 */
	constructor(config, fullConfig, env) {
		this.config = config;
		this.fullConfig = fullConfig;
		this.env = env;
	}

	/**
	 * Transform the possible custom tags within a config object.
	 * @param {Object} [config] - The current working config partial.
	 * @param {String[]} [paths] - Paths down to the object.
	 * @param {String[]} [envs] - The inherited envs (used to prevent circular !inherit).
	 */
	transform(config = this.config, paths = [], envs = [ this.env ]) {
		if (!_.isObject(config) || _.isDate(config)) { return config; }

		if (config instanceof InheritTag) {
			// !inherit
			if (_.contains(envs, config.env)) {
				// Ensure there are no circular inherits
				throw new XError(XError.INTERNAL_ERROR, 'Circular inherit found: ' + envs);
			}

			// Ensure the target config is loaded
			this.fullConfig[config.env] = this.transform(this.fullConfig[config.env]);

			// Walk the target env's config
			let inheritConfig = this.fullConfig[config.env];
			for (let path of paths) {
				if (_.isUndefined(inheritConfig) || _.isNull(inheritConfig)) { break; }
				inheritConfig = inheritConfig[path];
			}
			// Apply defaults and assing the new config var
			if (config.defaults) {
				inheritConfig = extend(true, {}, config.defaults, inheritConfig);
			}
			if (config.overrides) {
				inheritConfig = extend(true, {}, inheritConfig, config.overrides);
			}
			config = inheritConfig;

		} else if (config instanceof DecryptTag) {
			// !decrypt
			throw new XError(XError.INTERNAL_ERROR, 'Unimplemented');

		} else if (config instanceof PassTag) {
			// !pass
			throw new XError(XError.INTERNAL_ERROR, 'Unimplemented');

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

function walkObject(obj, paths) {
	for (let path of paths) {
		if (_.isUndefined(obj) || _.isNull(obj)) { break; }
		obj = obj[path];
	}
	return obj;
}
