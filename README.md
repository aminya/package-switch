package-switch
==============

![Build Status (Github Actions)](https://github.com/aminya/AcuteML.jl/workflows/CI/badge.svg)
[![Dependency Status](https://david-dm.org/aminya/package-switch.svg)](https://david-dm.org/aminya/package-switch)
[![apm](https://img.shields.io/apm/dm/package-switch.svg)](https://github.com/aminya/package-switch)
[![apm](https://img.shields.io/apm/v/package-switch.svg)](https://github.com/aminya/package-switch)

## Easy and Fast package activation/deactivation
![package-switch-2](https://cloud.githubusercontent.com/assets/7817714/8269467/947642ce-17a9-11e5-8602-3a1de749edd1.png)

## Features
* Enable/disable packages without having to navigate settings-view
* Put multiple packages into `Bundles` to enable/disable them all at once
* Store local bundles in `.package-switch.json` files
* Auto-execute local bundle if only one project is active
* Save and restore package states to save start-up time
* package-switch is very fast and loads in 8ms.

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

### Execute a Bundle/Package
1. Run `package-switch:start-packages` or `package-switch:stop-packages`
2. Select the Bundle/Package
  * Added (`+`) packages will be enabled
  * Removed (`-`) packages will be disabled
  * `package-switch:stop-packages` does the opposite of `package-switch:start-packages`

### "Auto-enable" packages
To auto-enable packages you have to create a local configuration file called `.package-switch.json` in your project's root folder.
This config file can store one bundle that will be executed when Atom starts in the project folder.

### "Auto-disable" packages
You may want to enable as few packages at startup as possible in order to reduce Atom's startup time. When "Save and restore packages" is enabled, you can define a blacklist or whitelist for packages. By default, all entries in "Package States" will be disabled when you close Atom, which means that, when you restart, these packages will be disabled and not waste start-up time.

You can invert "Package States" (and thus create a whitelist) by enabling "Invert Package States".
__package-switch with a whitelist will disable ALL packages except those in "Package States", as well as `tree-view`, `settings-view`, `tabs` and `command-palette` if a local config file could not be found and `package-switch` itself (because just core Atom is pretty much unusable). If you provide a local config file then make sure that the important core modules stay enabled. It is also recommended to enable "Do not disable language packages", so you don't have to micro-manage every grammar.__

__A wrong whitelist configuration can render Atom unusable because even `atom --safe` adheres to this package's rules!!!!__

## Debugging
Global bundles are stored in `~/.atom/package-switch.bundles` or your OS-equivalent.
Include this file in bug reports if you think the bug is in this file.
Local configuration files can be opened as a text editor by right-clicking the file in tree-view and clicking on `Open as Text`.

## Roadmap
* Replacing atom-space-pen-views with atom-select-list and other new packages
* Typing for variables

## Contributing
* Let me know if you encounter any bugs.
* Feature requests are always welcome.
