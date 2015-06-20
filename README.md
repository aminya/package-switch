package-switch
==============
[![Build Status](https://travis-ci.org/deprint/package-switch.svg)](https://travis-ci.org/deprint/package-switch) [![Dependency Status](https://david-dm.org/deprint/package-switch.svg)](https://david-dm.org/deprint/package-switch) [![apm](https://img.shields.io/apm/dm/package-switch.svg)](https://github.com/deprint/package-switch) [![apm](https://img.shields.io/apm/v/package-switch.svg)](https://github.com/deprint/package-switch)

## Put packages into "Bundles" and enable/disable them all at once
![package-switch-2](https://cloud.githubusercontent.com/assets/7817714/8269467/947642ce-17a9-11e5-8602-3a1de749edd1.png)

## Usage
### Create a Bundle
1. Run `package-switch:create`
2. Each package has one of three "actions" (Select a package and press `Enter` to cycle through them):
  * Ignored (`/`) packages do not change when a bundle is executed
  * Added (`+`) packages will be enabled
  * Removed (`-`) packages will be disabled
![package-switch-create](https://cloud.githubusercontent.com/assets/7817714/8269547/deb667ca-17ad-11e5-9124-b5c3a4f42e74.png)
3. Press `Escape` once you've finished your list ( to abort: Press `Escape` twice )
4. A new dialog box will open where you enter the name of your bundle
![package-switch-name](https://cloud.githubusercontent.com/assets/7817714/8269546/d4a422ae-17ad-11e5-8384-8a9b72a9fd92.png)
5. Press `Enter` to create the bundle

### Execute a Bundle
1. Run `package-switch:start-bundle` or `package-switch:stop-bundle`
2. Select the Bundle
  * Added (`+`) packages will be enabled
  * Removed (`-`) packages will be disabled
  * `package-switch:stop-bundle` does the opposite of `package-switch:start-bundle`

## Debugging
All the data is stored in `~/.atom/package-switch.bundles` or your OS-equivalent.
Include this file in bug reports if you think the bug is in this file.

## Roadmap
* Run bundle at start-up
* Bug fixes, etc.

## Contributing
* Let me know if you encounter any bugs.
* Feature requests are always welcome.
