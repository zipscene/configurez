let expect = require('chai').expect;
let fs = require('fs');
let path = require('path');

let configurez = require('../lib');

describe('Configurator', function() {

	let testFile = path.resolve(__dirname, 'resources', 'inner', 'configurez-test-config-file.json');
	let testFile2 = path.resolve(__dirname, 'resources', 'configurez-test-config-file.yml');

	it('should read in, load, and transform a valid JSON file', function() {
		let config = configurez(testFile, {
			env: 'local',
			defaults: {
				service: {
					server: 'nonlocalhost'
				}
			}
		});
		expect(config).to.deep.equal({
			service: {
				server: 'localhost'
			}
		});
	});

	it('should merge together and transform files', function() {
		let config = configurez([ testFile2, testFile ], { env: 'local' });
		expect(config).to.deep.equal({
			service: {
				server: 'localhost',
				port: 4000
			}
		});
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
