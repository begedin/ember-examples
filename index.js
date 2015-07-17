/* jshint node: true */
'use strict';

/**
  Whatever is inside the 'index.js' (or whichever other file we designated as
  an addon entry file), becomes part of the actual addon in the end.

  This can happen in one of two ways.

  If 'index.js' exports a function, then that function is used by Ember-CLI as
  a constructor, and the default 'Addon' model provided by Ember-CLI is not
  used at all.

  If 'index.js' exports an object, such as the one in this case, then that
  object is used to extend the default 'Addon' model.

  In that case, the Addon model also exposes some hooks we can use, together
  with or instead of overriding the default Addon methods.
*/

module.exports = {
  name: 'ember-examples',

  /**
    Typically, we use the 'included' hook to import additional scripts and
    styles from the app's bower_components or vendor folders.

    While the bower_components folder is pretty straightforward (it stores the
    addon's bower dependencies), for some people, the vendor folder is not quite
    as clear.

    The way I understand it, we use it to store 3rd party libraries that aren't
    bower-managed.
  */
  included: function(app, parentAddon) {
    /**
      Back in the day, we didn't consider addon-nesting here, so we didn't have
      'parentAddon'. These days, if this addon is being used not by an app
      directly but by another addon, then the instance of that addon will be
      the value of 'parentAddon'.

      If we want our addon to support nesting, we typically do something like

        var target = parentAddon || app;

      Then we use the 'target' variable, for whatever we need it for.

      In this specific case, however, we want the styles to be present in the
      actual app, not just the parent addon, since there's no guarantee the
      parent addon will use those files.
    */
    app.import('vendor/general-styles.css');

    /**
      Similarly, if we want to import something from the bower directory, we
      also use 'app.import'. In that case, however, we have acces to a variable
      which tells us where the bower directory is.

        app.import(this.bowerDirectory + 'some/bower/library/path.js');

      Note that for both folders, we can import both .css and .js

      .css ends up in the 'vendor.css' file, while .js goes to 'vendor.js'

      Also note that we cannot use 'app.import' to get anything from any other
      folder. If we try to import from anywhere other than 'vendor' or
      'bower_components', it will simply be ignored.

    */

    this._super.included(app, parentAddon);
  }
};
