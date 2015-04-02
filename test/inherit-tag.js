let expect = require('chai').expect;
let path = require('path');
let XError = require('xerror');

let configurez = require('../lib');

describe('!inherit', function() {

	it('should inherit configs after merge with !inherit tag', function() {
		let testFile = path.resolve(__dirname, 'resources', 'configurez-test-inherit-tag-file.yml');
		let config = configurez(testFile, {
			env: 'local',
			extraTags: true
		});
		expect(config).to.deep.equal({
			service: {
				server: 'localhost',
				port: 3001
			},
			database: {
				server: 'https://a.database.website.space',
				port: 9999
			},
			'other-service': {
				server: 'https://a.other.service.website.space',
				db: 'mongo'
			},
			missing: undefined
		});
	});

	it('should throw on circular dependencies', function() {
		let failFile = path.resolve(__dirname, 'resources', 'configurez-test-circular-inherit-tag-file.yml');
		expect(configurez.bind(null, failFile, {
			env: 'local',
			extraTags: true
		})).to.throw(XError);
	});

});
