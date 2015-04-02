# Configurez

Configuration loading and merging based on the environment with inheritance and other goodies.

Configurez uses [YAML](https://github.com/nodeca/js-yaml) to parse all configuration files , with options to add custom tag types (by default it uses the DEFAULT_SAFE_SCHEMA).

## Usage

Merge configurations; one from disk and one generated before calling:
```js
var configurez = require('configurez');
var config = configurez([ 'path/to/config', loadedConfig ]);
```

Find and merge all files from the running script down the filesystem that match `/\.configurez\.[json|ya?ml]/`:
```js
var configurez = require('configurez');
var config = configurez.dir();
```

## Environment Specific Configuration
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

## Extra YAML Tags
These are tags that will be turned on if you pass the `extra Tags: true` option to Configurez.  
The interface for each of the tags is defined below, with an example of their usage.

### !inherit [ env, overrides, defaults ]
Inherit specific fields from another environment.
- `{String} env` - The environment to pluck this field from.
- `{Object} [overrides]` - Overrides to apply over the inherited config.
- `{Object} [defaults]` - Defaults to before the inherited config.
NOTE: overrides and defaults should only be used if the value pulled from the other environment is an `Object`.

#### Example:
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

### !decrypt text
Decrypt a `base64`, `aes-256-ctr` encrypted value object.
- `{String} text` - The encrypted value.
The decrypted text must take on the form: `{ value: <VALUE> }`, where `<VALUE>` is valid JSON.  
This restriction is so the password can be validated. If the currently stored password fails, the user will be prompted to enter it in again.
NOTE: only one password should be used per configuration.

#### Example:
```yaml
{
  'local': {
    'username': 'admon',
    'password': !decrypt 'SkOk3YRCECx2Ezp2n77rkxWyrHmwRiGcpgDICV+CYio='
  }
}
```
This encrypted value evaluates to: `'{"value":"rubber ducky"}'` with password: `'password'`.

#### Helper Script:
There is a helper script for generating !decrypt text fields. Simply follow the prompts after running:
```bash
$ node bin/encrypt.js
```
Or install the this package globally, and use the script installed in the npm bin:
```bash
$ npm i -g configurez
$ configurez-encrypt
```

### !env [ variable, fallback ]
Pull in values from the environment, with the ability to set the fallback value.
- `{String} variable` - The environment variable to pull.
- `{*}` - The fallback value if the environment variable wasn't found.

#### Example:
```yaml
{
  'local': {
    'log': {
      'level': !env [ 'APP_LOG_LEVEL', 'info' ]
    }
  }
}
```
This will look for `APP_LOG_LEVEL` in the environment variables and will set it to `'info'` if it wasn't found.

## Progress

### TODOS
- Pull values from password manager (pass, onepass)

### DONE
- Recursively find config files
- Always specify a file name to look for instead of hardcoding a static name; default to "config.???"
- Allow different environments based on NODE_ENV
- Inheritance between environments
- Override individual options with env vars
- Decrypt fields using a simple password
