let _ = require('lodash');
let extend = require('extend');
let XError = require('xerror');
let yaml = require('js-yaml');

let Tag = require('../tag');

/**
 * Inherit Tag handles inheritance for paths tagged with !inherit.
 * @class InheritTag
 * @extends Tag
 */
class InheritTag extends Tag {
	/**
	 * @constructor
	 * @param {Array} data - The data contained in this tag.
	 */
	constructor([ env, overrides, defaults ]) {
		super([ env, overrides, defaults ]);

		this.env = env;
		this.overrides = overrides;
		this.defaults = defaults;
	}

	/**
	 * Transform this Tag into whatever the data should actually be.
	 * @method transform
	 * @param {TagTransformer} transformer - The transformer that called transform on this Tag.
	 * @param {String[]} paths - Array of paths already walked.
	 * @param {String[]} envs - Array of environments already inherited.
	 * @returns {Object} The inherited config.
	 */
	transform(transformer, paths, envs) {
		if (_.contains(envs, this.env)) {
			// Ensure there are no circular inherits
			throw new XError(XError.INTERNAL_ERROR, 'Circular inherit found: ' + envs);
		}

		// Walk the target env's config
		let inheritConfig = transformer.yamlConfig;
		let walkingPaths = [ this.env ].concat(paths);
		let inheritEnvs = envs.concat([ this.env ]);
		let inheritPaths = [];
		for (let path of walkingPaths) {
			if (_.isUndefined(inheritConfig) || _.isNull(inheritConfig)) { return inheritConfig; }
			if (path !== this.env) {
				// Keep track of paths in case we need to transform an object
				inheritPaths.push(path);
			}
			if (Tag.isTag(inheritConfig[path])) {
				// Transform this Tag
				inheritConfig[path] = transformer.transform(inheritConfig[path], inheritPaths, inheritEnvs);
			}
			inheritConfig = inheritConfig[path];
		}
		// Apply defaults and assing the new config var
		if (this.defaults) {
			let configDefaults = transformer.transform(this.defaults, paths, envs);
			inheritConfig = extend(true, {}, configDefaults, inheritConfig);
		}
		if (this.overrides) {
			let configOverrides = transformer.transform(this.overrides, paths, envs);
			inheritConfig = extend(true, {}, inheritConfig, configOverrides);
		}
		return inheritConfig;
	}
}

module.exports = exports = InheritTag;

/**
 * YAML Tag Definition for !inherit.
 * @static
 * @property YAML
 * @type Type
 */
InheritTag.YAML = new yaml.Type('!inherit', {
	kind: 'sequence',
	// Ensure the data coming is good
	resolve(data) {
		return data !== null && data.length <= 3 && data.length >= 1;
	},
	// Construt the InheritTag object
	construct(data) {
		return new InheritTag(data);
	},
	instanceOf: InheritTag,
	// Represent an instance of an InheritTag in the YAML
	represent(inheritInst) {
		return inheritInst.data;
	}
});
