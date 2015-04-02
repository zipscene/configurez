let _ = require('lodash');
let extend = require('extend');
let fs = require('fs');
let yaml = require('js-yaml');

let Tag = require('./tag');
let TagTransformer = require('./tag-transformer');

/**
 * Configurator which takes configuration objects, and transfoms them based on NODE_ENV and custom tags.
 * @class
 */
class Configurator {
	/**
	 * @constructor
	 * @param {Object|String|Object[]|String[]} [fullConfig={}] - YAML configuration objects or file paths to load.
	 * @param [opts] - Options object to pass on to the Configurator.
	 *   @param {Boolean|Tag[]} [opts.extraTags=false] - Either a boolean allowing all packaged extra tags,
	 *   or an explicit array of Tags to include in the schema.
	 *   @param {String} [opts.env=process.env.NODE_ENV || 'local'] - The environment to pull the config for.
	 *   @param {Object} [opts.defaults] - Defaults to be applied under the config object.
	 *   @param {Object} [opts.overrides] - Overrides to be applied on top the config object.
	 *   @param {String} [defautlPassword] - Default password to be used by tags like !decrypt
	 */
	constructor(
		fullConfig,
		{
			extraTags = false,
			env = (process.env.NODE_ENV || 'local'),
			defaults,
			overrides,
			defaultPassword
		}
	) {
		this.fullConfig = fullConfig;
		this.extraTags = extraTags;
		this.env = env;
		this.defaults = defaults;
		this.overrides = overrides;
		this.defaultPassword = defaultPassword;

		// Determine the additions to the schema from the extraTags
		let types = [];
		if (extraTags) {
			extraTags = (extraTags === true) ? Tag.EXTRA_TAGS : extraTags;
			types = _.map(extraTags, 'YAML');
		}
		this.schema = yaml.Schema.create(yaml.DEFAULT_SAFE_SCHEMA, types);

		this.reload();
	}

	/**
	 * Reload the config file (processes fullConfig, and applies the transform/overrides/defaults).
	 * @method reload
	 * @returns {Object} The loaded config object.
	 */
	reload() {
		// Load from file if YAML Config comes in as a string
		if (!_.isPlainObject(this.fullConfig)) {
			this.fullConfig = _.isArray(this.fullConfig) ? this.fullConfig : [ this.fullConfig ];
			this.fullConfig = _.map(this.fullConfig, yaml => _.isString(yaml) ? this.loadFile(yaml) : yaml);
			this.fullConfig = extend(true, {}, ...this.fullConfig);
		}

		// Grab config for the environment
		let config = this.fullConfig[this.env] || {};

		if (this.extraTags) {
			// Transform the config based on the extra tags
			let tagTransformer = new TagTransformer(config, this.fullConfig, this.env, this.defaultPassword);
			config = tagTransformer.transform();
		}

		// Merge the defaults/overrides with the config
		if (this.defaults) {
			config = extend(true, {}, this.defaults, config);
		}
		if (this.overrides) {
			config = extend(true, {}, config, this.overrides);
		}

		this.config = config;
		return this.config;
	}

	/**
	 * Read in/safely load the file based on the schema.
	 * @method loadFile
	 * @param {String} file - The file to load.
	 * @returns {Object} the loaded YAML object.
	 */
	loadFile(file) {
		return yaml.safeLoad(fs.readFileSync(file), { schema: this.schema });
	}
}

module.exports = exports = Configurator;
