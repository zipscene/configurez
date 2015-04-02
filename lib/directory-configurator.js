let _ = require('lodash');
let fs = require('fs');
let path = require('path');

let Configurator = require('./configurator');

/**
 * Directory Configurator finds and applies directory local configurations.
 * @class
 */
class DirectoryConfigurator extends Configurator {
	/**
	 * @constructor
	 * @param {String|RegExp} [basename='/\.configurez\.[json|ya?ml]/'] - Basename of the config files.
	 * @param [opts]
	 *   @param {String} [opts.dirname=path.dirname(require.main.filename)] - Directory to start walking.
	 *   @param {Boolean} [opts.checkHome=true] - Check the home directory for a default file.
	 *   @param {Boolean} [opts.recursive=true] - Recursively walk the filesystem.
	 *   @param {Boolean|Tag[]} [opts.extraTags=false] - Allow extra tags (!inherit, !decrypt, !pass).
	 *   @param {String} [opts.env=process.env.NODE_ENV || 'local'] - The environment to pull the config for.
	 *   @param {Object} [opts.defaults] - Defaults to be applied under the config object.
	 *   @param {Object} [opts.overrides] - Overrides to be applied on top the config object.
	 *   @param {String} [defautlPassword] - Default password to be used by tags like !decrypt
	 */
	constructor(
		basename = /\.configurez\.[json|ya?ml]/,
		{
			dirname = path.dirname(require.main.filename),
			checkHome = true,
			recursive = true,
			extraTags = false,
			env = (process.env.NODE_ENV || 'local'),
			defaults,
			overrides,
			defaultPassword
		} = {}
	) {
		this.basename = basename;
		this.dirname = dirname;
		this.checkHome = checkHome;
		this.recursive = recursive;

		// Call super now that we have the list of configs we want loaded/merged/transformed
		super(this.getFullConfig(), { extraTags, env, defaults, overrides, defaultPassword });
	}

	reload() {
		// Reset full config based on the file system
		this.fullConfig = this.getFullConfig();
		return super.reload();
	}

	getFullConfig() {
		// Find YAML Files in the filesystem
		let fullConfig = [];

		// Walk the filesystem to find files to load
		let currentDir = this.dirname;
		// If not recursive, this will stop at only the first directory
		let stopDir = (this.recursive) ? path.dirname('/') : currentDir;
		while (currentDir !== stopDir) {
			// Prepend files, so deeper configs get merged first
			fullConfig = this.findFiles(currentDir).concat(fullConfig);
			currentDir = path.resolve(currentDir, '..');
		}
		// Load files in the stopDir
		fullConfig = this.findFiles(stopDir).concat(fullConfig);

		// Prepend files in the Home directory if checkHome is set
		if (this.checkHome) {
			fullConfig = this.findFiles(path.dirname('~')).concat(fullConfig);
		}

		return fullConfig;
	}

	/**
	 * Helper function to get relevant files from a given directory.
	 * @method findFiles
	 * @param {String} dir - Directory to get files from.
	 * @returns {String[]} Array of relevant files.
	 */
	findFiles(dir) {
		return _(fs.readdirSync(dir))
			.filter(file => _.isRegExp(this.basename) ? this.basename.test(file) : (this.basename === file))
			.map(basename => path.resolve(dir, basename))
			.value();
	}
}

module.exports = exports = DirectoryConfigurator;
