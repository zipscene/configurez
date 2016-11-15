// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

let expect = require('chai').expect;
let fs = require('fs');
let path = require('path');

let configurez = require('../lib');

describe('Configurator', function() {

	let testFile = path.resolve(__dirname, 'resources', 'inner', 'configurez-test-config-file.json');
	let testFile2 = path.resolve(__dirname, 'resources', 'configurez-test-config-file.yml');

	it('should default to using empty options object', function() {
		let config = configurez({
			[`${process.env.NODE_ENV || 'local'}`]: { service: 'hello' }
		});
		expect(config).to.deep.equal({ service: 'hello' });
	});

	it('should read in, load, and transform a valid JSON file', function() {
		let config = configurez(testFile, {
			env: 'local',
			defaults: { service: { server: 'nonlocalhost' } }
		});
		expect(config).to.deep.equal({ service: { server: 'localhost' } });
	});

	it('should be able to get the env from NODE_ENV', function() {
		let oldVal = process.env.NODE_ENV;
		process.env.NODE_ENV = 'local';
		let config = configurez(testFile, {
			defaults: { service: { server: 'nonlocalhost' } }
		});
		expect(config).to.deep.equal({ service: { server: 'localhost' } });
		process.env.NODE_ENV = oldVal;
	});

	it('should merge together and transform files', function() {
		let config = configurez([ testFile2, testFile ], { env: 'local' });
		expect(config).to.deep.equal({ service: { server: 'localhost', port: 4000 } });
	});

	it('should handle a mix of file paths and objects', function() {
		let config = configurez([ testFile2, JSON.parse(fs.readFileSync(testFile)) ], { env: 'local' });
		expect(config).to.deep.equal({
			service: {
				server: 'localhost',
				port: 4000
			}
		});
	});

});
