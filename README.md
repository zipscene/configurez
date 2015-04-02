# Configurez

Configuration loading and merging based on the environment with inheritance and other goodies.

Configurez uses [YAML](https://github.com/nodeca/js-yaml) to parse all configuration files , with options to add custom tag types (by default it uses the DEFAULT_SAFE_SCHEMA).

## Usage

### Objects/Files
Merge configurations given to configurez as a path to a file, or a preloaded object:
```js
var configurez = require('configurez');
var config = configurez([ 'path/to/config', loadedConfig ]);
```
This is a helper function that will just return the config property on `Configurator`

### Directory
Find and merge all files found while walking the filesystem from the running script down to root that match `/\.configurez\.[json|ya?ml]/`:
```js
var configurez = require('configurez');
var config = configurez.dir();
```
This is a helper function that will just return the config property on `DirectoryConfigurator`

## Interface

### configurez(fullConfig, opts)
Configurator which takes configuration objects, and transfoms them based on NODE_ENV and custom tags.
* `{Object|String|Object[]|String[]} fullConfig` - YAML configuration objects or file paths to load.
* `{Object} [opts]` - Options object to pass on to the Configurator.
  * `{Boolean|Tag[]} [opts.extraTags=false]` - Allow extra tags (!inherit, !decrypt, !pass).
  * `{String} [opts.env=process.env.NODE_ENV || 'local']` - The environment to pull the config for.
  * `{Object} [opts.defaults]` - Defaults to be applied under the config object.
  * `{Object} [opts.overrides]` - Overrides to be applied on top the config object.
  * `{String} [defautlPassword]` - Default password to be used by tags like !decrypt

### configurez.dir(basename, opts)
Directory Configurator which finds and merges configurations found while walking the filesystem.
* `{String|RegExp} [basename='/\.configurez\.[json|ya?ml]/']` - Basename of the config files.
* `{Object} [opts]` - Options object to pass on to the Configurator.
  * `{String} [opts.dirname=path.dirname(require.main.filename)]` - Directory to start walking.
  * `{Boolean} [opts.checkHome=true]` - Check the home directory for a default file.
  * `{Boolean} [opts.recursive=true]` - Recursively walk the filesystem.
  * `{Boolean|Tag[]} [opts.extraTags=false]` - Allow extra tags (!inherit, !decrypt, !pass).
  * `{String} [opts.env=process.env.NODE_ENV || 'local']` - The environment to pull the config for.
  * `{Object} [opts.defaults]` - Defaults to be applied under the config object.
  * `{Object} [opts.overrides]` - Overrides to be applied on top the config object.
  * `{String} [defautlPassword]` - Default password to be used by tags like !decrypt

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

### !passwordstore key
Pull in value from [pass](http://www.passwordstore.org/).
- `{String} key` - The key to pull from `pass`.
NOTE: in order to run the tests/use this tag, you must have pass installed as binary on your PATH.

#### Example:
```yaml
{
  'local': {
    'password': !passwordstore 'Passtest/pass'
  }
}
```
This will execute `pass "Passtest/pass"`, then pass on the output to the config file.
