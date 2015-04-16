let expect = require('chai').expect;
let path = require('path');

let configurez = require('../lib');

describe('!decrypt', function() {

	it('should decrypt values using aes256', function() {
		let failFile = path.resolve(__dirname, 'resources', 'configurez-test-decrypt-tag-file.yml');
		let config = configurez(failFile, {
			env: 'local',
			extraTags: true,
			defaultPassword: 'password'
		});
		expect(config).to.deep.equal({
			username: 'admon',
			password: 'rubber-ducky'
		});
	});

	it('should prompt the user for password', function() {
		this.timeout(60000);
		let failFile = path.resolve(__dirname, 'resources', 'configurez-test-decrypt-tag-file.yml');
		console.log('HINT: The password is "password"');
		let config = configurez(failFile, {
			env: 'local',
			extraTags: true
		});
		expect(config).to.deep.equal({
			username: 'admon',
			password: 'rubber-ducky'
		});
	});

});
