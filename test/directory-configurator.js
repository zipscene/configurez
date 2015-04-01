let expect = require('chai').expect;
let path = require('path');

let configurez = require('../lib');

describe('Directory Configurator', function() {

	it('should load the config file in resources', function() {
		let config = configurez.dir(/dir-locals-test-config-file\.[json|ya?ml]/, {
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			env: 'local'
		});
		expect(config).to.deep.equal({ service: { server: 'localhost', port: 4000 } });
	});

	it('should respect recursive flag', function() {
		let config = configurez.dir(/dir-locals-test-config-file\.[json|ya?ml]/, {
			env: 'local',
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			recursive: false
		});
		expect(config).to.deep.equal({ service: { server: 'localhost' } });
	});

	it('should apply the defaults and overrides given to it', function() {
		let config = configurez.dir(/dir-locals-test-config-file\.[json|ya?ml]/, {
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
		expect(config).to.deep.equal({
			service: {
				server: 'localhost',
				port: 30,
				db: 'mongo'
			}
		});
	});

	it('should inherit configs after merge with !inherit tag', function() {
		let config = configurez.dir(/dir-locals-test-inheritance-test-file.json/, {
			env: 'local',
			dirname: path.resolve(__dirname, 'resources'),
			recursive: false,
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

	// it('should decrypt fields from !decrypt tags', function() {
	// 	expect(false).to.be.true;
	// });

});


