let expect = require('chai').expect;
let path = require('path');

let configurez = require('../lib');

describe('!env', function() {


	it('should pulls value from process.env', function() {
		let testFile = path.resolve(__dirname, 'resources', 'configurez-test-env-tag-file.yml');
		let oldVal = process.env.ENV_TAG_TEST;
		process.env.ENV_TAG_TEST = 'a value!!';
		let config = configurez(testFile, {
			env: 'local',
			extraTags: true
		});
		expect(config).to.deep.equal({
			val: 'a value!!',
			missing: 'default val...'
		});
		process.env.ENV_TAG_TEST = oldVal;
	});

});
