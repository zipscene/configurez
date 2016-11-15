// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

let _ = require('lodash');
let fs = require('fs');
let path = require('path');
let XError = require('xerror');

/**
 * Base Tag with common functionality with the other traversers.
 * @class Tag
 * @constructor
 * @param {String|Object|Number|Date} data - The data contained in this tag.
 */
class Tag {

	constructor(data) {
		this.data = data;
	}

	/**
	 * Transform this Tag into whatever the data should actually be.
	 * @method transform
	 * @param {TagTransformer} transformer - The transformer that called transform on this Tag.
	 * @param {String[]} paths - Array of paths already walked.
	 * @param {Object} envSet - Set of environments already visited.
	 */
	transform() {
		throw new XError(XError.UNSUPPORTED_OPERATION, 'Unimplemented');
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

/* NOTE: This needs to stay down here to prevent circular dependencies between the subclassed Tags */
let tagDir = path.resolve(__dirname, 'tags');
/**
 * Extra Tags contains all the tags available in the tags directory that ships with this module.
 * @static
 * @property EXTRA_TAGS
 * @type Tag[]
 */
Tag.EXTRA_TAGS = _(fs.readdirSync(tagDir))
  .filter(file => /\.js$/.test(file))
  .map(file => require(path.resolve(tagDir, file)))
  .value();
