let _ = require('lodash');

let Configurator = require('./configurator');
let DirectoryConfigurator = require('./directory-configurator');
let Tag = require('./tag');
let TagTransformer = require('./tag-transformer');

/**
 * Configurez
 * Configuration loading and merging based on the environment with inheritance and other goodies.
 * @class Configurez
 * @static
 */

/**
 * Static interface to create a Configurator and extract the config
 * @static
 * @for Configurez
 * @method configurez
 * @param {Object|String|Object[]|String[]} fullConfig - YAML configuration objects or file paths to load.
 * @param {Object} [opts] - Options object to pass on to the Configurator
 */
let configurez = (fullConfig, opts) => {
	return (new Configurator(fullConfig, opts)).config;
};

/**
 * Reexport of Configurator constructor
 * @static
 * @for Configurez
 * @property Configurator
 * @type Function
 */
configurez.Configurator = Configurator;

/**
 * Reexport of DirectoryConfigurator constructor
 * @static
 * @for Configurez
 * @property DirectoryConfigurator
 * @type Function
 */
configurez.DirectoryConfigurator = DirectoryConfigurator;

/**
 * Static interface to create a DirectoryConfigurator and extract the config
 * @static
 * @for Configurez
 * @method configurez
 * @param {String|RegExp} [basename] - YAML configuration objects or file paths to load.
 * @param {Object} [opts] - Options object to pass on to the Configurator
 */
configurez.dir = (basename, opts) => {
	if ((_.isUndefined(opts) || _.isNull(opts)) && !_.isString(basename) && !_.isRegExp(basename)) {
		opts = basename;
		basename = null;
	}
	return (new DirectoryConfigurator(basename, opts)).config;
};

/**
 * Reexport of Tag constructor
 * @static
 * @for Configurez
 * @property Tag
 * @type Function
 */
configurez.Tag = Tag;

/**
 * Reexport of TagTransformer constructor
 * @static
 * @for Configurez
 * @property TagTransformer
 * @type Function
 */
configurez.TagTransformer = TagTransformer;

module.exports = exports = configurez;
