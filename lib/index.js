let DirectoryConfigurator = require('./directory-configurator');
let Configurator = require('./configurator');
let Tag = require('./tag');
let TagTransformer = require('./tag-transformer');

/* Regular Configurator */
let configurez = (rawConfig, opts) => {
	return (new Configurator(rawConfig, opts)).config;
};
configurez.Configurator = Configurator;

/* Directory Configurator */
configurez.DirectoryConfigurator = DirectoryConfigurator;
configurez.dir = (basename, opts) => {
	return (new DirectoryConfigurator(basename, opts)).config;
};

/* Tags */
configurez.Tag = Tag;
configurez.EXTRA_TAGS = Tag.EXTRA_TAGS;
configurez.TagTransformer = TagTransformer;

module.exports = exports = configurez;
