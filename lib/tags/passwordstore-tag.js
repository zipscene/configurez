// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

let _ = require('lodash');
let execSync = require('sync-exec');
let XError = require('xerror');
let yaml = require('js-yaml');

let Tag = require('../tag');

/**
 * PassMan Tag handles pulling the given variable out of a Password Manager.
 * @class PasswordStoreTag
 * @extends Tag
 * @constructor
 * @param {Array} data - The data contained in this tag.
 *   @param {String} data.program - The program to receive the key from (see PasswordStoreTag.PROGRAMS for support).
 *   @param {String} data.key - Value to default the field to if the PassMan variable isn't found.
 */
class PasswordStoreTag extends Tag {

	constructor(key) {
		super(key);

		this.key = key;
		this.cmd = `pass "${this.key}"`;
	}

	/**
	 * Transform this Tag into whatever the data should actually be.
	 * @method transform
	 * @returns {String} The value from a Password Manager.
	 */
	transform() {
		let result = execSync(this.cmd);
		if (result.status !== 0) {
			throw new XError(XError.INTERNAL_ERROR, result.stderr);
		}
		return _.last(_.filter(result.stdout.split(/\r?\n/)));
	}

}

module.exports = exports = PasswordStoreTag;

/**
 * YAML Tag Definition for !inherit.
 * @static
 * @property YAML
 * @type Type
 */
PasswordStoreTag.YAML = new yaml.Type('!passwordstore', {
	kind: 'scalar',
	// Ensure the data coming is good
	resolve(key) {
		return key && _.isString(key);
	},
	// Construt the PasswordStoreTag object
	construct(data) {
		return new PasswordStoreTag(data);
	},
	instanceOf: PasswordStoreTag,
	// Represent an instance of an PasswordStoreTag in the YAML
	represent(PassManInst) {
		return PassManInst.data;
	}
});
