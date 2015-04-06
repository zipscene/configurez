# Configurez

Configuration loading and merging based on the environment with inheritance and other goodies.
This README provides information on common use cases. More extensive documentation is available in the docs directory.

## Environment Based
`NODE_ENV` is used to determine which configuration to pull from the full configuration file.
If `NODE_ENV` is not set, Configurez will use `"local"`.

For example, if your full configuration is:
```json
{
  "local": {
    "port": 9000
  },
  "production": {
    "port": 8000
  }
}
```
And `NODE_ENV=production`, the resulting config will be:
```json
{
  "production": {
    "port": 8000
  }
}
```

## Other Goodies
Configurez use [YAML](https://github.com/nodeca/js-yaml) to parse all configuration files, which means
you can write your configurations can range from strict JSON with comments, to taking full advantage of
the YAML spec.

Configurez also includes extra tag types (turn on by default) to allow extras, such as inheritance and decryption.

## Configurators
Configurators are helper objects that do the work of merging and transforming the configurations.

### configurez.Configurator(configs, opts)
Configurator takes an array of configs, which it merges, and transforms into a single configuration.  
These configs can be loaded Objects, or a filesystem path to some config on disk.  
For example:
```json
// ./project-config.json
{
  "local": {
    "server": "localhost",
    "port": 9000
  }
}
```
```js
var configurez = require('zs-configurez');
var loadedConfig = {
  "local": {
    "port": 8000
  }
};
var configurator = new configurez.Configurator([ './project-config.json', loadedConfig ]);
// configurator.config = {
//   "server: "localhost",
//   "port": 8000
// }
```
The `Configurator` builds the config object while being instantiated. You can access it directly with
`configurator.config`, and reload/rebuild it by calling `configurator.reload()`.

#### Options
* `{Boolean|Tag[]} extraTags` - Allow extra tags (!inherit, !decrypt, !pass). (Defaults to `true`)
* `{String} env` - The environment to pull the config for. (Defaults to `process.env.NODE_ENV || 'local'`)
* `{Object} defaults` - Defaults to be applied under the config object.
* `{Object} overrides` - Overrides to be applied on top the config object.
* `{String} defautlPassword` - Default password to be used by tags like !decrypt

#### configurez(configs, opts)
Configurez includes a helper function for instantiating, and accessing the `config` field on a `Configurator`:
```js
var config = configurez([ './project-config.json', loadedConfig ]);
```

### configurez.DirectoryConfigurator(basename, opts)
This will walk the filesystem to find config files that match a given basename.  
By default, this is: `/\.configurez\.[json|ya?ml]/`.  
For example:
```js
var configurez = require('zs-configurez');
var configurator = new configurez.DirectoryConfigurator('project-config.json');
// configurator.config = {
//   "server: "localhost",
//   "port": 9000
// }
```

#### Options
All options in `Configurator`, plus:
* `{String} dirname` - Directory to start walking. (Defaults to the directory of the file starting the node process)
* `{Boolean} checkHome` - Check the home directory for a default file. (Defaults to `true`)
* `{Boolean} recursive` - Recursively walk the filesystem. (Defaults to `true`)

#### configurez.dir(basename, opts)
Configurez includes a helper function for instantiating, and accessing the `config` field on a `DirectoryConfigurator`:
```js
var config = configurez.dir('project-config.json');
```

## Extra YAML Tags
These are tags that will be turned on if you pass the `extra Tags: true` option to Configurez.  
The interface for each of the tags is defined below, with an example of their usage.

### !inherit [ env, overrides, defaults ]
Inherit specific fields from another environment.
* `{String} env` - The environment to pluck this field from.
* `{Object} [overrides]` - Overrides to apply over the inherited config.
* `{Object} [defaults]` - Defaults to before the inherited config.
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
Configurez will yield the following config with `NODE_ENV` set to `'local'`:
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
* `{String} text` - The encrypted value.
The decrypted text must take on the form: `{ value: <VALUE> }`, where `<VALUE>` is valid JSON.  
NOTE: you should never create encrypted values yourself. Instead use the `bin/encrypt.js` script:
```
$ node dist/bin/encrypt.js
Welcome to the Configurez encypt script
Value: rubber ducky
Password: password
Encrypted: SkOk3YRCECx2Ezp2n77rk5JjO9KQR2HBKxyhRw0jztw=
```
The `Password: ` prompt is hidden while typing.

You can also access the encrypt script if you install Configurez globally:
```bash
$ npm -i -g zs-configurez
$ configurez-encrypt
```

This restriction is so the password can be validated. If the currently stored password fails, the user will be prompted to enter it in again.
NOTE: only one password should be used per configuration.

#### Example:
```yaml
{
  'local': {
    'username': 'admin',
    'password': !decrypt 'SkOk3YRCECx2Ezp2n77rkxWyrHmwRiGcpgDICV+CYio='
  }
}
```
This encrypted value evaluates to: `'{"value":"rubber ducky"}'` with password: `'password'`.

#### Encrypt Script:
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
* `{String} variable` - The environment variable to pull.
* `{Mixed}` - The fallback value if the environment variable wasn't found.

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
* `{String} key` - The key to pull from `pass`.
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
