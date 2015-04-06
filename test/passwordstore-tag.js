let execSync = require('sync-exec');
let expect = require('chai').expect;
let path = require('path');
let XError = require('xerror');

let configurez = require('../lib');

describe('!passwordstore', function() {

	let whichPass = execSync('which pass');
	if (whichPass.status !== 0) {
		console.log('Pass doesn\'t exist on this system, skipping these tests.');
		return;
	}

	it('should grab values out of Password Store', function() {
		this.timeout(60000);
		let file = path.resolve(__dirname, 'resources', 'configurez-test-passwordstore-tag-file.yml');
		let config = configurez(file, {
			env: 'local',
			extraTags: true
		});
		expect(config).to.deep.equal({ val: 'password' });
	});

	it('should grab values out of Password Store', function() {
		this.timeout(60000);
		let failFile = path.resolve(__dirname, 'resources', 'configurez-test-fail-passwordstore-tag-file.yml');
		try {
			configurez(failFile, {
				env: 'local',
				extraTags: true
			});
		} catch(ex) {
			expect(XError.isXError(ex)).to.be.true;
			expect(ex.code).to.be.equal(XError.INTERNAL_ERROR);
			return;
		}
		throw new Error('Invalid Password Store entry did not throw an error.');
	});

});
