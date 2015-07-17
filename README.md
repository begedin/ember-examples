# Ember-examples

This ember-addon serves as an example of how to achieve certain things with addons. The code is well commented, so most people having trouble with some things when developing ember-addons should find this repository helpful.

Here's what's covered:

1. The addon can be tested using the dummy app defined in the `/tests` folder. Nothing special was needed to achieve this, but a lot of people aren't familiar with this option. Simply run `ember server|serve|s` from the addon folder to serve the dummy app.
2. The addon uses the  `included` hook to import a style from the `vendor` folder and also explains how to import things from the `bower_components` folder.
3. The addon auto-uses styles defined in `addon/styles` and explains how that works.
4. The addon has sass enabled. How that works is explained partially in `index.js` and in more detail in `addon/styles/addon.scss`.
5. The addon adds a default `application.index` template which is displayed when the dummy app runs. It provides a lot of additional information on how things work.
6. The addon defines a component with behavior based on user input. The component files are well documented and explain in a lot of detail why the component was implemented in that specific way, as well as describing some other ways to implement it.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
