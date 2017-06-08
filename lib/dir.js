const _ = require('lodash');
const DirectoryConfigurator = require('./directory-configurator');

/**
 * Helper method to instantiate a DirectoryConfigurator and extract the config
 * @static
 * @for Configurez
 * @method configurez
 * @param {String|RegExp} [basename] - YAML configuration objects or file paths to load.
 * @param {Object} [opts] - Options object to pass on to the Configurator
 */
module.exports = function(basename, opts) {
	if ((opts === undefined || opts === null) && !_.isString(basename) && !_.isRegExp(basename)) {
		opts = basename;
		basename = undefined;
	}
	return (new DirectoryConfigurator(basename, opts)).config;
};
