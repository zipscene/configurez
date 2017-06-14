const Configurator = require('./configurator');

/**
 * Helper method to instantiate a Configurator and extract the config
 * @static
 * @for Configurez
 * @method configurez
 * @param {Object|String|Object[]|String[]} fullConfig - YAML configuration objects or file paths to load.
 * @param {Object} [opts] - Options object to pass on to the Configurator.
 */
module.exports = function(fullConfig, opts) {
	return (new Configurator(fullConfig, opts)).config;
};
