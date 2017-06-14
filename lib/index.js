// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

/**
 * Configurez
 * Configuration loading and merging based on the environment with inheritance and other goodies.
 * @class Configurez
 * @static
 */

module.exports = require('./configurez');

module.exports.Configurator = require('./configurator');
module.exports.DirectoryConfigurator = require('./directory-configurator');
module.exports.Tag = require('./tag');
module.exports.TagTransformer = require('./tag-transformer');
module.exports.buildConfig = require('./build-config');
module.exports.dir = require('./dir');
