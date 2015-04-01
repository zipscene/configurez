let _ = require('lodash');
let fs = require('fs');
let path = require('path');
let XError = require('xerror');

/**
 * Base Tag with common functionality with the other traversers.
 * @class Tag
 */
class Tag {
	/**
	 * @constructor
	 * @param {String|Object|Number|Date} data - The data contained in this tag.
	 */
	constructor(data) {
		this.data = data;
	}

	/**
	 * Transform this Tag into whatever the data should actually be.
	 * @method transform
	 * @param {String[]} path - Array of paths already walked.
	 * @param {String[]} path - Array of environments already inherited.
	 * @param {Object} fullConfig - Full config object.
	 */
	transform(/*path, fullConfig*/) {
		throw new XError(XError.INTERNAL_ERROR, 'Unimplemented');
	}
}
module.exports = exports = Tag;

/**
 * YAML Type to pass into the Schema
 * @static
 * @property YAML
 * @type Type
 */
Tag.YAML = null;

/**
 * Determine if the given object matches the interface for a Tag.
 * @static
 * @method isTag
 * @param {Object|Tag} obj - The object to check.
 * @returns {Boolean} whether or not obj matches the interface.
 */
Tag.isTag = (obj) => {
	return _.isObject(obj) && _.isFunction(obj.transform) && _.isObject(obj.constructor.YAML);
};

let tagDir = path.resolve(__dirname, 'tags');
/**
 * Extra Tags contains all the tags available in the tags directory that ships with this module.
 * @static
 * @property EXTRA_TAGS
 * @type Tag[]
 */
Tag.EXTRA_TAGS = _.map(fs.readdirSync(tagDir), (file) => require(path.resolve(tagDir, file)));
