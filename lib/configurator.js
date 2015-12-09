let _ = require('lodash');
let extend = require('extend');
let fs = require('fs');
let XError = require('xerror');
let yaml = require('js-yaml');

let Tag = require('./tag');
let TagTransformer = require('./tag-transformer');

/**
 * Configurator which takes configuration objects, and transfoms them based on NODE_ENV and custom tags.
 * @class
 * @constructor
 * @param {Object|String|Object[]|String[]} [rawConfigs={}] - YAML configuration objects or file paths to load.
 * @param [opts] - Options object to pass on to the Configurator.
 *   @param {Boolean|Tag[]} [opts.extraTags=true] - Either a boolean allowing all packaged extra tags,
 *   or an explicit array of Tags to include in the schema.
 *   @param {String} [opts.env=process.env.NODE_ENV || 'local'] - The environment to pull the config for.
 *   @param {Object} [opts.defaults] - Defaults to be applied under the config object.
 *   @param {Object} [opts.overrides] - Overrides to be applied on top the config object.
 *   @param {String} [opts.defaultPassword] - Default password to be used by tags like !decrypt
 */
class Configurator {

	constructor(
		rawConfigs = {},
		{
			extraTags = true,
			env = (process.env.NODE_ENV || 'local'),
			defaults,
			overrides,
			defaultPassword
		} = {}
	) {
		this.rawConfigs = rawConfigs;

		// Determine the additions to the schema from the extraTags
		let types = [];
		if (extraTags) {
			extraTags = (extraTags === true) ? Tag.EXTRA_TAGS : extraTags;
			types = _.map(extraTags, 'YAML');
		}
		let schema = yaml.Schema.create(yaml.DEFAULT_SAFE_SCHEMA, types);

		// Load from file if YAML Config comes in as a string
		let loadedConfigs;
		if (_.isPlainObject(rawConfigs)) {
			loadedConfigs = rawConfigs;
		} else {
			// If rawConfigs is a string, wrap it in an array
			loadedConfigs = _.isString(rawConfigs) ? [ rawConfigs ] : rawConfigs;
			if (!_.isArray(loadedConfigs)) {
				let msg = 'rawConfigs should be type: Object|String|Object[]|String[]';
				throw new XError(XError.INVALID_ARGUMENT, msg);
			}
			// Load all file paths in loadedConfigs using the schema
			loadedConfigs = _.map(loadedConfigs, yaml => {
				return _.isString(yaml) ? Configurator._loadFile(schema, yaml) : yaml;
			});
			// Merge everything together
			loadedConfigs = extend(true, {}, ...loadedConfigs);
		}
		this.loadedConfigs = loadedConfigs;

		// Grab config for the environment
		let config = loadedConfigs[env] || {};

		if (extraTags) {
			// Transform the config based on the extra tags
			let tagTransformer = new TagTransformer(config, loadedConfigs, env, defaultPassword);
			config = tagTransformer.transform();
		}

		// Merge the defaults/overrides with the config
		if (defaults) {
			config = extend(true, {}, defaults, config);
		}
		if (overrides) {
			config = extend(true, {}, config, overrides);
		}

		// Set the finished config object
		this.config = config;
	}

}

/**
 * Read in/safely load the file based on the schema.
 * @method loadFile
 * @static
 * @param {YAML.Schema} schema - The YAML schema to load with.
 * @param {String} file - The file to load.
 * @returns {Object} the loaded YAML object.
 */
Configurator._loadFile = function(schema, file) {
	let result;

	try {
		result = yaml.safeLoad(fs.readFileSync(file), { schema });
	} catch (ex) {
		// Stifle no-exist errors
		if (ex.code !== 'ENOENT') throw ex;
	}

	if (!_.isObject(result)) result = {};

	return result;
};

module.exports = exports = Configurator;
