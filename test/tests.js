let expect = require('chai').expect;
let path = require('path');

let DirLocals = require('../lib');

describe('Dir Locals', function() {

	it('should load the config file in resources', function() {
		let dirLocals = new DirLocals('dir-locals-test-config-file', {
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			env: 'local'
		});
		expect(dirLocals.config).to.deep.equal({ service: { server: 'localhost', port: 4000 } });
	});

	it('should respect recursive flag', function() {
		let dirLocals = new DirLocals('dir-locals-test-config-file', {
			env: 'local',
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			recursive: false
		});
		expect(dirLocals.config).to.deep.equal({ service: { server: 'localhost' } });
	});

	it('should apply the defaults and overrides given to it', function() {
		let dirLocals = new DirLocals('dir-locals-test-config-file', {
			env: 'local',
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			recursive: false,
			defaults: {
				service: {
					server: 'nonlocalhost',
					port: 15,
					db: 'mongo'
				}
			},
			overrides: {
				service: {
					port: 30
				}
			}
		});
		expect(dirLocals.config).to.deep.equal({
			service: {
				server: 'localhost',
				port: 30,
				db: 'mongo'
			}
		});
	});

	it('should inherit configs after merge with !inherit tag', function() {
		let dirLocals = new DirLocals('dir-locals-test-inheritance-test-file', {
			env: 'local',
			dirname: path.resolve(__dirname, 'resources'),
			recursive: false,
			extraTags: true
		});
		expect(dirLocals.config).to.deep.equal({
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
				on: false
			},
			missing: undefined
		});
	});

	// it('should decrypt fields fro !encrypted tags', function() {
	// 	expect(false).to.be.true;
	// });

	// it('should grab fields from pass for !pass tags', function() {
	// 	expect(false).to.be.true;
	// });

});


