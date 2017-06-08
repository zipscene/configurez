const path = require('path');
const _ = require('lodash');
const configurez = require('../');

/**
 * Built configuration object, from a series of cascading zs-configurez lookups.
 *
 * @method buildConfig
 * @since v0.1.10
 * @param {Object} [config={}] - Custom config overrides
 * @param {Object} [options={}]
 *   @param {String|Array{String}} options.projectDirs - Extra directories to look for 'project-config.json' files in.
 *     This is useful when the program running this method isn't called directly.
 *   @param {String} options.namespace - Namespace in which project config is stored, returned for convenience.
 * @return {Object} - Merged config
 */
module.exports = function(config = {}, options = {}) {
	// Look for config files
	let dirConfig = configurez.dir();
	let configPaths = [ 'project-config.yml', 'project-config.json' ];

	// Optionally look for config files in the given directories
	if (options.projectDirs) {
		if (!_.isArray(options.projectDirs)) options.projectDirs = [ options.projectDirs ];

		options.projectDirs.forEach((dir) => {
			configPaths.push(
				path.resolve(dir, 'project-config.yml'),
				path.resolve(dir, 'project-config.json')
			);
		});
	}

	// add path to environment-specified config
	if (process.env.ZS_CONFIG) configPaths.push(process.env.ZS_CONFIG);

	let projectConfig = configurez(configPaths, {
		overrides: dirConfig
	});

	config = _.merge({}, projectConfig, config);

	if (options.namespace) return config[options.namespace];
	return config;
};
