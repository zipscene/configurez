# Configurez

Configuration loading and merging based on the environment with inheritance and other goodies.

Configurez uses [YAML](https://github.com/nodeca/js-yaml) to parse all configuration files , with options to add custom tag types (by default it uses the DEFAULT_SAFE_SCHEMA).

## Usage

Merge configurations; one from disk and one generated before calling:
```js
var configurez = require('configurez');
var config = configurez([ 'path/to/config', loadedConfig ]);
```

Find and merge all files from the running script down the filesystem that match /\.configurez\.[json|ya?ml]:
```js
var configurez = require('configurez');
var config = configurez.dir();
```

## Features

### Environment
Configurez will pull the configuration based on the value of `NODE_ENV`.  
For example, the following:
```json
{
  "local": {
    "server": "localhost:3000"
  },
  "production": {
    "server": "http://a.great.website.com"
  }
}
```
If `NODE_ENV` isn't set, or is set to `'local'`, configurez will yeild:
```json
{
  "server": "localhost:3000"
}
```

### !inherit
Inherit specific fields from another environment. The easiest way to explain how this works is with examples:
```yaml
{
  'local': {
    'service': !inherit [ 'production', {
	  'server': 'localhost:3000'
	}]
  },
  'production': {
    'service': {
	  'server': 'http://a.great.website.com',
	  'db': 'mongo'
	}
  }
}
```
Configurez will yeild the following config with `NODE_ENV` set to `'local'`:
```json
{
  "service": {
    "server": "localhost:3000",
	"db": "mongo"
  }
}
```
For more complex examples, see `test/inheritance.js` and `test/resources/configurez-test-inheritance-file.yml`.

### !decrypt
TODO

### !env
TODO

## Progress

### TODOS
- Override individual options with env vars
- Decrypt fields using a simple password
- Pull values from password manager (pass, onepass)

### DONE
- Recursively find config files
- Always specify a file name to look for instead of hardcoding a static name; default to "config.???"
- Allow different environments based on NODE_ENV
- Inheritance between environments
