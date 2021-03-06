// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

let expect = require('chai').expect;
let path = require('path');

let configurez = require('../lib');

describe('Directory Configurator', function() {

	it('should load the config file in resources', function() {
		let config = configurez.dir(/configurez-test-config-file\.[json|ya?ml]/, {
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			env: 'local'
		});
		expect(config).to.deep.equal({ service: { server: 'localhost', port: 4000 } });
	});

	it('should be able to get the env from NODE_ENV', function() {
		let oldVal = process.env.NODE_ENV;
		process.env.NODE_ENV = 'local';
		let config = configurez.dir(/configurez-test-config-file\.[json|ya?ml]/, {
			dirname: path.resolve(__dirname, 'resources', 'inner')
		});
		expect(config).to.deep.equal({ service: { server: 'localhost', port: 4000 } });
		process.env.NODE_ENV = oldVal;
	});

	it('should respect recursive flag', function() {
		let config = configurez.dir(/configurez-test-config-file\.[json|ya?ml]/, {
			env: 'local',
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			recursive: false
		});
		expect(config).to.deep.equal({ service: { server: 'localhost' } });
	});

	it('should apply the defaults and overrides given to it', function() {
		let config = configurez.dir(/configurez-test-config-file\.[json|ya?ml]/, {
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

	it('Should not load swap files', function() {
		let config = configurez.dir(undefined, {
			dirname: path.resolve(__dirname, 'resources', 'inner'),
			env: 'local'
		});

		expect(config).to.have.property('shouldExist', true);
		expect(config).to.not.have.property('shouldNotExist');
	});

});


