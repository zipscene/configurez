let _ = require('lodash');
let extend = require('extend');
let fs = require('fs');
let path = require('path');
let yaml = require('js-yaml');

let schema = require('./schema');
let TagTransformer = require('./tag-transformer');

/**
 * Dir Locals finds and applies directory local configurations.
 * @class
 */
class DirLocals {
	/**
	 * @constructor
	 * @param {String} [basename='.dir-locals'] - Basename of the file to look for (\.[json|ya?ml]).
	 * @param [opts]
	 *   @param {String} [opts.dirname=path.dirname(require.main.filename)] - Directory to start walking.
	 *   @param {Boolean} [opts.checkHome=true] - Check the home directory for a default file.
	 *   @param {Boolean} [opts.recursive=true] - Recursively walk the filesystem.
	 *   @param {Boolean} [opts.extraTags=false] - Allow extra tags (!inherit, !decrypt, !pass).
	 *   @param {String} [opts.env=process.env.NODE_ENV || 'local'] - The environment to pull the config for.
	 *   @param {Object} [opts.defaults] - Defaults to be applied under the config object.
	 *   @param {Object} [opts.overrides] - Overrides to be applied on top the config object.
	 */
	constructor(
		basename = '.dir-locals',
		{
			dirname = path.dirname(require.main.filename),
			checkHome = true,
			recursive = true,
			extraTags = false,
			env = (process.env.NODE_ENV || 'local'),
			defaults,
			overrides
		} = {}
	) {
		this.basename = basename;
		this.regexpBasename = new RegExp(this.basename + '\.[json|ya?ml]');
		this.dirname = dirname;
		this.checkHome = checkHome;
		this.recursive = recursive;
		this.schema = extraTags ? schema : yaml.DEFAULT_SAFE_SCHEMA;
		this.extraTags = extraTags;
		this.env = env;
		this.defaults = defaults;
		this.overrides = overrides;
		this.reload();
	}

	/**
	 * Reload the configuration.
	 * @method reload
	 * @returns {Object} The transformed config object.
	 */
	reload() {
		let fullConfig = {};
		if (this.checkHome) {
			// Use config in the home directory as the default
			this.loadAll(fullConfig, this.getFiles(path.dirname('~')));
		}

		let filesToLoad = [];

		if (this.recursive) {
			// Walk the filesystem to find files to load
			let currentDir = this.dirname;
			let fsRoot = path.dirname('/');
			while (currentDir !== fsRoot) {
				// Shift files, so deeper configs get merged first
				filesToLoad = this.getFiles(currentDir).concat(filesToLoad);
				currentDir = path.resolve(currentDir, '..');
			}
			// Load Root files
			filesToLoad = this.getFiles(fsRoot).concat(filesToLoad);
		} else {
			// Just grab files form this the dirname directory
			filesToLoad = this.getFiles(this.dirname);
		}

		// Load all the flattened files
		this.loadAll(fullConfig, _.flatten(filesToLoad));

		// Grab config for the environment
		let config = fullConfig[this.env] || {};

		if (this.extraTags) {
			// Transform the config based on the extra tags
			let tagTransformer = new TagTransformer(config, fullConfig, this.env);
			config = tagTransformer.transform();
		}

		if (this.defaults) {
			// Apply defaults
			let newConfig = this.defaults;
			this.mergeConfig(newConfig, config);
			config = newConfig;
		}
		if (this.overrides) {
			// Apply overrides
			this.mergeConfig(config, this.overrides);
		}

		this.config = config;
		return this.config;
	}

	/**
	 * Helper functio to merge two configs together.
	 * @method mergeConfig
	 * @param {Object} config
	 * @param {Object} otherConfig
	 */
	mergeConfig(config, otherConfig) {
		extend(true, config, otherConfig);
	}

	/**
	 * Helper function to load all files and merge them into a given config.
	 * @method loadAll
	 * @param {Object} config - The current working config.
	 * @param {String[]} files - Files to load and merge.
	 */
	loadAll(config, files) {
		for (let file of files) {
			this.mergeConfig(config, this.loadFile(file));
		}
	}

	/**
	 * Helper function to load the YAML/JSON file.
	 * @method loadFile
	 * @param {String} file - The file to load.
	 * @returns {Object} A loaded YAML object.
	 */
	loadFile(file) {
		return yaml.safeLoad(fs.readFileSync(file), { schema: this.schema });
	}

	/**
	 * Helper function to get relevant files from a given directory.
	 * @method getFiles
	 * @param {String} dir - Directory to get files from.
	 * @returns {String[]} Array of relevant files.
	 */
	getFiles(dir) {
		return _(fs.readdirSync(dir))
			.filter((file) => this.regexpBasename.test(file))
			.map((file) => path.resolve(dir, file)).value();
	}
}

module.exports = exports = DirLocals;
