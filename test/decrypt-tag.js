let expect = require('chai').expect;
let path = require('path');

let configurez = require('../lib');

describe('!decrypt', function() {


	it('should decrypt values using aes256', function() {
		let testFile = path.resolve(__dirname, 'resources', 'configurez-test-decrypt-tag-file.yml');
		let config = configurez(testFile, {
			env: 'local',
			extraTags: true,
			defaultPassword: 'password'
		});
		expect(config).to.deep.equal({
			username: 'admon',
			password: 'rubber-ducky'
		});
	});

});
