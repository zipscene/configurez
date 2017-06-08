// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

const _ = require('lodash');

const Configurator = require('./configurator');
const DirectoryConfigurator = require('./directory-configurator');
const Tag = require('./tag');
const TagTransformer = require('./tag-transformer');

/**
 * Configurez
 * Configuration loading and merging based on the environment with inheritance and other goodies.
 * @class Configurez
 * @static
 */

/**
 * Helper method to instantiate a Configurator and extract the config
 * @static
 * @for Configurez
 * @method configurez
 * @param {Object|String|Object[]|String[]} fullConfig - YAML configuration objects or file paths to load.
 * @param {Object} [opts] - Options object to pass on to the Configurator.
 */
let configurez = (fullConfig, opts) => (new Configurator(fullConfig, opts)).config;

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
 * Helper method to instantiate a DirectoryConfigurator and extract the config
 * @static
 * @for Configurez
 * @method configurez
 * @param {String|RegExp} [basename] - YAML configuration objects or file paths to load.
 * @param {Object} [opts] - Options object to pass on to the Configurator
 */
configurez.dir = function(basename, opts) {
	if ((opts === undefined || opts === null) && !_.isString(basename) && !_.isRegExp(basename)) {
		opts = basename;
		basename = undefined;
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

module.exports = configurez;
