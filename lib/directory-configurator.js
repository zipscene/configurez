let _ = require('lodash');
let fs = require('fs');
let path = require('path');

let Configurator = require('./configurator');

/**
 * Directory Configurator which finds and merges configurations found while walking the filesystem.
 * @class
 */
class DirectoryConfigurator extends Configurator {
	/**
	 * @constructor
	 * @param {String|RegExp} [basename='/\.configurez\.[json|ya?ml]/'] - Basename of the config files.
	 * @param [opts] - Options object to pass on to the Configurator.
	 *   @param {String} [opts.dirname=path.dirname(require.main.filename)] - Directory to start walking.
	 *   @param {Boolean} [opts.recursive=true] - Recursively walk the filesystem.
	 *   @param {Boolean} [opts.checkHome=true] - Check the home directory for a default file.
	 *   @param {Boolean|Tag[]} [opts.extraTags=true] - Allow extra tags (!inherit, !decrypt, !pass).
	 *   @param {String} [opts.env=process.env.NODE_ENV || 'local'] - The environment to pull the config for.
	 *   @param {Object} [opts.defaults] - Defaults to be applied under the config object.
	 *   @param {Object} [opts.overrides] - Overrides to be applied on top the config object.
	 *   @param {String} [opts.defaultPassword] - Default password to be used by tags like !decrypt
	 */
	constructor(
		basename = /\.configurez\.[json|ya?ml]/,
		{
			dirname = path.dirname(require.main.filename),
			recursive = true,
			checkHome = true,
			extraTags = true,
			env = (process.env.NODE_ENV || 'local'),
			defaults,
			overrides,
			defaultPassword
		} = {}
	) {
		// Get the lsit of raw config files from the filesystem
		let rawConfigs = DirectoryConfigurator._getRawConfigs(basename, dirname, recursive, checkHome);
		// Call super now that we have the list of rawConfigs we want loaded/merged/transformed
		super(rawConfigs, { extraTags, env, defaults, overrides, defaultPassword });
	}
}

/**
 * Find raw config files in the filesystem.
 * @method _getRawConfigs
 * @private
 * @static
 * @param {RegExp|String} basename - Basename of the config files.
 * @param {String} dirname - Directory to start walking.
 * @param {Boolean} recursive - Recursively walk the filesystem.
 * @param {Boolean} checkHome - Check the home directory for a default file.
 */
DirectoryConfigurator._getRawConfigs = function(basename, dirname, recursive, checkHome) {
	// Find YAML Files in the filesystem
	let rawConfigs = [];

	// Walk the filesystem to find files to load
	let currentDir = dirname;
	// If not recursive, this will stop at only the first directory
	let stopDir = (recursive) ? path.dirname('/') : currentDir;
	while (currentDir !== stopDir) {
		// Prepend files, so deeper rawConfigs get merged first
		rawConfigs = DirectoryConfigurator._findFiles(basename, currentDir).concat(rawConfigs);
		currentDir = path.resolve(currentDir, '..');
	}
	// Load files in the stopDir
	rawConfigs = DirectoryConfigurator._findFiles(basename, stopDir).concat(rawConfigs);

	// Prepend files in the Home directory if checkHome is set
	if (checkHome) {
		rawConfigs = DirectoryConfigurator._findFiles(basename, path.dirname('~')).concat(rawConfigs);
	}

	return rawConfigs;
};

/**
 * Helper function to get relevant files from a given directory.
 * @method findFiles
 * @static
 * @param {RegExp|String} basename - Basename of the config files.
 * @param {String} dir - Directory to get files from.
 * @returns {String[]} Array of relevant files.
 */
DirectoryConfigurator._findFiles = function(basename, dir) {
	return _(fs.readdirSync(dir))
		.filter(file => _.isRegExp(basename) ? basename.test(file) : (basename === file))
		.map(file => path.resolve(dir, file))
		.value();
};

module.exports = exports = DirectoryConfigurator;
