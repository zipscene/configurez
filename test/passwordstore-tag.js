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
		let file = path.resolve(__dirname, 'resources', 'configurez-test-passwordstore-tag-file.yml');
		let config = configurez(file, {
			env: 'local',
			extraTags: true
		});
		expect(config).to.deep.equal({ val: 'password' });
	});

	it('should grab values out of Password Store', function() {
		let failFile = path.resolve(__dirname, 'resources', 'configurez-test-fail-passwordstore-tag-file.yml');
		expect(configurez.bind(undefined, failFile, {
			env: 'local',
			extraTags: true
		})).to.throw(XError);
	});

});
