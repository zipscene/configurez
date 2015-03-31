
/**
 * Base Tag with common functionality with the other traversers.
 * @class BaseTag
 */
class BaseTag {
	/**
	 * @constructor
	 * @param {String|Object|Number|Date} data - The data contained in this tag.
	 */
	constructor(data) {
		this.data = data;
	}

	/**
	 * Transform this BaseTag into whatever the data should actually be.
	 * @method transform
	 * @param {String[]} path - Array of paths already walked.
	 * @param {String[]} path - Array of environments already inherited.
	 * @param {Object} fullConfig - Full config object.
	 */
	transform(/*path, fullConfig*/) { return this.data; }
}
module.exports = exports = BaseTag;
