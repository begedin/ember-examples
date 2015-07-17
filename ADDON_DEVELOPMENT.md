# Overview

* [Creating and running an addon](#creating-and-running-an-addon)
  * [How to initialize an addon](#how-to-createinitialize-an-ember-cli-addon)
  * [How to run the addon](#how-to-run-the-addon)
    * [Running the addon directly through the generated dummy app](#running-the-addon-directly-through-the-generated-dummy-app)
    * [Running the addon through an external app with live-reload](#running-the-addon-through-an-external-app-with-live-reload) 
      * [Using npm link to link to avoid constant reinstalling](#using-npm-link-to-link-to-avoid-constant-reinstalling)
      * [Enabling live-reloading in a linked addon](#enabling-live-reloading-in-a-linked-addon)
* [The anatomy of an addon](#the-anatomy-of-an-addon)
  * [package.json](#packagejson)
  * [index.js or some other entry script](#indexjs-or-some-other-entry-script)
    * [Hook order of execution](#hook-order-of-execution)
  * [The app and addon folders](#the-app-and-addon-folders)
  * [Special consideration: Components](#special-consideration-components)
  * [Special consideration: Styles](#special-consideration-styles)
    * [Including addon-specific styles](#including-addon-specific-styles)
    * [Including bower/vendor styles](#including-bowervendor-styles)
    * [Using sass](#using-sass)
* Addon dependencies and nesting (not written)
  
# Creating and running an addon
  
## How to initialize an Ember-CLI addon

Starting the development of an Ember-CLI addon is a pretty simple process, really. Ember-CLI provides a generator that does the initial work for you.

All we need to do is go to a folder and type in a command. For me, that folder is `~/git/`. 

Let's make an addon called `my-square`.

```
cd ~/git
ember addon my-square
```

After a few minutes, everything will be ready. A folder will be created with an initialized npm/bower package and all the required dependencies downloaded and installed. 

From that point on, it's just a matter of following conventions.

## How to run the addon

Before we do anything else, we should probably try to run the created addon.

My instinct tells me I should create an app and include the addon within the app, so I can try it out in that app. Often, that's exactly what I'm going to be doing, especially if I'm developing the app and the addon in parallel.

However, there's a simpler way to do it. 

### Running the addon directly through the generated dummy app

The addon generator creates a folder at `addonRoot/tests/dummy`. This is where the addon's dummy app resides. 

When we run the `ember server` command inside an app folder, you run the app and it's accessible (by default) at http://localhost:4200. When we run the same command inside an addon folder, the dummy app is served in the same way. The advantage of this is less clutter, no need to install dependencies twice (once for the app, once for the addon) and probably a bunch of other things I'm not thinking off right now.

In any case, the simplest way to quickly try out the addon is to use it from within the dummy app. It also works with live-reloading

### Running the addon through an external app, with live-reload

The first thing we want is to not have to reinstall the addon into a consuming app every time we want to make a modification. For that, we can use `npm link`.

#### Using `npm link` to link to avoid constant reinstalling

We position ourselves inside the addon folder and execute the `npm link` command

```
cd ~/git/my-square`
npm link
```

Now, we position ourselves into the consuming app's folder and execute the `npm link` command again, this time providing the addon name as a parameter:

```
cd ~/git/my-app
npm link my-square
```

Now, there's a symbolic link within the app's `node_modules` folder, so if we modify any addon file, it will be modified here as well.

That's one part done, but live-reloading still isn't working.

#### Enabling live-reloading in a linked addon

There's a hook inside the ember `Addon` model for this exact purpose.

We modify the addon's `index.js`.

```JavaScript
module.exports = {
  name: 'my-square',
  isDevelopingAddon: function() {
    return true;
  }
}
```

In theory, the addon will now be considered as 'in development', but we're not quite done yet. Since we used `npm link` instead of `npm install --save[-dev]`, the addon isn't added to `package.json` as a list of dependencies, so it's still being ignored during live-reload. We just need to add it as an entry to `package.json`.

```JSON
"devDependencies": {
  ...
  "ember-export-application-global": "^1.0.2",
  "my-square": "*"
}
```

Now we just run the app using `ember server` and any modification of the addon will trigger a live-reload, except for one exception - the addon's entry file, `index.js` still isn't being watched. For modifications to `index.js` to manifest themselves, we will have to restart the app.

# The anatomy of an addon

I like to breakdown an ember addon into four major parts. There's the `package.json` which makes it an ember addon. There's `index.js`, which is its entry point. There are the `app` and `addon` folders where most of what the addon does resides. Finally, there's the `blueprints` folder, which is difficult to describe in one sentence, but let's just say it contains a set of generators for now.

## `package.json`

First order of business. For Ember-CLI to detect an npm package as an ember addon, the `package.json` needs to contain  `ember-addon` in the `keywords` section. This was added automatically when you were generating the initial addon.

```JSON
"keywords": [
  "ember-addon",
  ...
]
```

There's also an `ember-addon` section within the `package.json`, with which you can configure some of the addon's behavior.

```JSON
"ember-addon" {
  "configPath": "tests/dummy/config",
  "before": "single-addon",
  "defaultBlueprint": "blueprint-that-isnt-package-name",
  "demoURL": "http://example.com/ember-addon/demo.html",
  "after": [
    "after-addon-1",
    "after-addon-2"
  ]
}
```

The only property you get at the start, from the generated addon, is `configPath` and it's set to the value you see in the example above. This points to a location the addon will look for its configuration script in.

`before` and `after` work in about the same way as they do in ember initializers. You assing the value of an addon name, or an array of addon names and then Ember-CLI will make sure this addon gets loaded before or after those addons.

With `defaultBlueprint`, you can assign a differently named default blueprint to the addon. There's more about that in the blueprint section.

`demoURL` doesn't really do anything for development, but it helps when listing the published addon.

## `index.js` or some other entry script

npm conventions dictate that `index.js` is the entry point of any package, unless differently specified by the `main` property in `package.json`, so Ember-CLI follows that convention.

`index.js` can export either an object, or a function.

Ember-CLI internally defines an [`Addon` model](https://github.com/ember-cli/ember-cli/blob/master/lib/models/addon.js). If your `index.js` is exporting an object, then Ember-CLI will extend the Addon model with that object and then instantiate it. If, on the other hand, `index.js` is exporting a function, then Ember-CLI will simply instantiate that function. In most cases, you will be exporting an object.

Since we're using `index.js` to basically extend the default addon model, there's a bunch of things we can do with it, most of which involves using the available functions/hooks.

### Hook order of execution

Let's just cut to the chase. This is the (cleaned up) order the hooks execute in:

0. config
1. included
3. treeForApp
4. jshintAddonTree
5. addonJsFiles
6. moduleName
7. treeForTemplates
8. treeForAddon
9. compileAddon
10. addonJsFiles
11. moduleName
12. compileTemplates
13. compileStyles
14. treeForVendor
15. treeForTestSupport
16. treeForStyles
17. treeForPublic
18. preBuild
19. serverMiddleware
20. config -- test
21. contentFir
22. postBuild

Notes:

* `isDevelopingAddon` gets called on multiple occasions throughout the  process
* `config` also gets called multiple times, after the initial call. Only the first config call for each environment is logged here. 
* Basically, for both `isDevelopingAddon` and `config` get called whenever one of those values needs checking, so it's not a good idea to make the logic in those hooks too performance intensive.
* `isEnabled` gets called right at the start, after the first config call
* `treeForX` actually gets called via `treeFor(name)`, meaning we can override `treeFor(name)` as a lower level override, if it makes sense to do so.
* The application starts being served on localhost between #20 and #21

#### `config(env, baseConfig)`

We use this hook when we want to pro grammatically modify the application/addon configuration. 

There are two arguments for this hook. `env` tells us if we're in `test`, or `development`, while `baseConfig` is the initial configuration object.

This hook **needs to return** a config object. Whatever is returned here, gets merged with the application config object, with the application config getting priority over this one.

#### `included(app, parentAddon)`

We can use the `included` hook for a couple of different things, but since it's being called when the addon is being included in the build, we typically use it to perform additional, manual imports of various things. It provides us with two arguments - the `app` and the `parentAddon`. If the app is using our addon directly, then `parentAddon` will be unset. On the other hand, if our addon is being used by another addon, then `parentAddon` will be set to that addon. `app` will still be set to the root app, though.

Due to these reasons, we commonly do something along the lines of

```JavaScript
included: function(app, parentAddon) {
  var target = parentAddon || app;
  // do something with target
}
```


We can use the hook to, for example, include something from the addon's `bower_components`, or `vendor` directories

This can only be done with the two mentioned folders. Trying to include something from some other folder this way will simply be ignored.

```JavaScript
included: function(app, parentAddon) {
  app.import(app.bowerDirectory + '/some/path/in/bower/directory.js');
  app.import('vendor/some/path/in/vendor.js');
}
```

Import can also accept an object, so you can import different things based on environment (development or production). There's an [example of that in ember-data](https://github.com/emberjs/data/blob/master/lib/ember-addon/index.js). 

We also have access to `app.options` here, so we can decide on what to do based on the value of those options. An example of that is in the [`ember-notify` addon](https://github.com/aexmachina/ember-notify/blob/master/index.js).

#### `treeFor(name)`

Returns a name-specific tree. Here's how this works.

By default, we have a number of possible `treeFor{Name}` methods in `Addon.prototype.treeForMethods`, as well as a number of path mappings for each method in `Addon.prototype.treePaths`.

The default behavior of the `treeFor` method is as follows:

* Determine the full root path to all the files for this name-specific tree by joining the project root with the `treePath` mapping.
* Get the proper `treeForMethod`
* If the tree path exists, generate a tree from that path
* If the `treeFor{Name}` method exists, call the method to generate the tree. If a tree was already generated in the previous step, it gets overriden
* Return the generated tree

The conclusion here is that we should in most cases override a specific `treeFor{Name}` method and that method should generate and return a tree. However, there is the option to override the `Addon.prototype.treeForMethods` as well as `Addon.prototype.treePaths` mappings, as well as the base `treeFor` method, for some extremely customized behavior.

Just to provide a list, the available `treeFor{Name}` methods are (in the order they execute in):

* treeForApp - maps the `app` folder by default
* treeForTemplates - `app/templates` folder
* treeForAddon - `addon` folder
* treeForVendor - `vendor` folder
* treeForTestSupport - `test-support` folder
* treeForStyles - `app/styles` folder
* treeForPublic - `public` folder

#### `jshintAddonTree`

This one get's called from within `treeFor` if the addon is in development mode and hinting is enabled. In all but the most specific cases, there probably isn't a need to override it.

#### `addonJsFiles`

Another one which is rarely overriden. It filters the addon tree to return only the `.js` files.

#### `moduleName`

Also rarely overriden. The default implementation returns either a dasherized modulePrefix or a dasherized name, in that order of priority.

#### `compileTemplates(tree)`

Checks if there are templates in the `addon` or `addonTemplates` folders and compiles them, if a processor for the found template type is registered.

Internally, the `treePath` for "addonTemplates" is used, so there's also the option to override `Addon.prototype.treePath['addonTemplates']` to change the behavior of where addon templates should be placed. Note that there is no `treeForAddonTemplates` hook, so this is pretty much the place to affect this behavior, but we should probably refrain from doing it, unless there's a good reason to.

#### `compileStyles(tree)`

Finds styles in the provided tree and compiles them. Used from within `treeForAddon` as one half of the tree the `treeForAddon` hook returns. Generally, the behavior should probably be overwritten there, since that hook is explicitly documented by Ember-CLI, while this one isn't, but overriding `compileStyles` is an option to.

#### `preBuild(result)`

There is no default implementation for this method. The hook is provided to implement custom behavior where something special needs to be done before the build takes place. For instance, [ember-cli-rails-addon](https://github.com/rondale-sc/ember-cli-rails-addon/blob/master/index.js#L41) uses it to create a lock file.

The `result` argument is an object created by the broccoli build process.

#### `serverMiddleware(config)`

This is a hook we use in development mode in order to manipulate web requests. There is no default implementation, but a standard Ember-CLI addon or application these days uses [ember-cli-content-security-policy](https://github.com/rwjblue/ember-cli-content-security-policy/blob/v0.3.0/index.js#L25) which uses this hook to enforce CSP rules in development mode.

The provided `config` argument can be used for programmatic decisions based on configuration values, but isn't directy involved in request manipulation  otherwise.

#### `contentFor(type, config)`

Used to insert string value into one of the `{{content-for}}` tags in `index.html`. The `type` determines which tag we're dealing with. Should return a string to be inserted. It get's called a whole bunch of times between `serverMiddleware` and `postBuild`, once for each of the possible types.

#### `postBuild(result)`

Similar to `preBuild`, this hook is not implemented by default, but it can be used to perform specific tasks that need to be done after a build has taken place. For instance, to clean up stuff done in `preBuild`.

#### `preprocessTree`, `postprocessTree`, `lintTree`

These 3 hooks aren't placed anywhere in the timeline, even though they are technically part of the process.

The issue is, they get called multiple times, for multiple different trees. The processing methods are used to perform some additional operation on the provided tree, while the output of the lint method merges with tests to insert lint results into the test tree.

#### `blueprintsPath`

Doesn't get called during the normal process. Instead, it get's called when we try to run a blueprint to determine where to search for blueprints for that specific addon. Has a default implementation, which returns the default blueprint path ('blueprints').

#### `buildError`

Not called during the normal process, only if there was a build error. We can use it for notifying or performing operations that should only happen in the case of a build error.

#### `includedCommands`

This one is similar to `blueprintsPath` in that it doesn't get executed during the normal process. Instead, when we try to run an ember command (`ember x`), Ember-CLI will first look for a core command with that name. If not found, it will go through all of the globally and locally installed ember addons and execute their `includedCommands` hook. If the hook for an addon returns an object with a method with the same name as command, then that method will get executed.

The common way to implement included commands is for our addon to have a folder, for instance, `lib\commands`, with, for example, the following files:

* `index.js`
* `first-command.js`
* `second-command.js`
* ...


```JavaScript
//lib/commands/index js
module.exports = {
  'first-command': require('first-command'),
  'second-command': require('second-command')
}
```

Both first and second command export a function.

Then, in our addon's `index.js`, we implement an `includedCommands` hook:

```JavaScript
// addon's index.js
module.exports = {
  name: 'my-addon',
  includedCommands: function() {
    return require('lib/commands');
  }
}
```

This way, our addon exposes two new ember commands
* `ember first-command`
* `ember second-command`

## The `app` and `addon` folders.

This is something that tends to confuse a moderate amount of people when first approaching ember addon development.

Let's try and make it as simple as possible.

If you put something in the `app` folder, it automatically becomes part of the app that uses the addon. Doesn't matter which subfolder it's in, doesn't matter how it's named, it's accessible from the app directly.

If you have an app named `my-app`, which uses an addon named `my-addon` and the following two files:

* `my-app\app\models\first-model.js`
* `my-addon\app\models\second-model.js` 

Both `first-model` and `second-model` will be available within the app.

You could also, technically, create  `my-app\app\models\third-model.js` with the following contents

```JavaScript
import SecondModel from 'my-app/models/second-model';

export default SecondModel.extend({ 
  // do some modifications here
});
```

On the other hand, if you include something in the `addon` folder, then it doesn't merge with the app (other than one exception which gets its very own subtitle. Instead, you can import it from the addon path. What does that mean?

In the above example, if these two files exist:

* `my-app\app\models\first-model.js`
* `my-addon\addon\models\second-model.js` 

Whem you run the app, only the first model is available to it. You cant use the second model right out of the box. What you can do, though, is create `my-app\app\models\third-model.js`:

```JavaScript
import SecondModel from 'my-addon/models/second-model';

export default SecondModel.extend({ 
  // do some modifications here
});
```

Note that we're importing from the `my-addon` namespace this time, not `my-app` anymore. That's what happens when we add files to the addon folder. They become part of the addon's name space, from where they can be manually imported into the app when necessary.

With that explained, there are some special considerations worth mentioning


### Special consideration: Components

When the purpose of an addon, among potential other things, is to provide a component to the app, then we usually do it in a slightly unexpected way. 

Let's create a component named `funny-square`.

First, we create `addon\components\funny-square.js`.

```JavaScript
import Ember from 'ember';

export default Ember.Component.extend({
  // fun stuff with squares goes here
});
```

Next, we also create `app\components\funny-square.js`

```JavaScript
import FunnySquare from 'my-addon/components/funny-square';

export default FunnySquare;
```

A component needs a template. The slightly confusing part is that this template has to go into `app\templates\compomonents\funny-square.hbs`. 

```Handlebars
<p>Pretend this is a square or something</p>
```

#### Why did we do it this way?

First of all, **it doesn't have to be done this way**. The alternative option is to simply define the component in `app\components` and skip the `addon\components` part altogether.

There is a reason to do it this way, though.

Let's say `my-app` is using `my-addon`'s `funny-square` component, but it wants to do something extra. The obvious way to achieve this is to extend the component.

If the component was defined in `my-addon\app` directly, instead of `my-app\addon`, here's what it would look like:

```JavaScript
import FunnySquare from 'my-app/components/funny-square';
export default FunnySquare.extend({
  // do the extra stuff here
});
```

Some random developer is going to look at this file and get confused. `funny-square.js` should be in `my-app\app\components\` but it isn't. An experienced developer will assume it's actually part of an addon, but they will still have no idea which addon it is. What if the component is causing trouble? How does the developer figure out where it is?

On the other hand, if the component is defined in the `my-addon\addon` folder alone, then we can override it simply and make it clear where it's coming from:

```JavaScript
import FunnySquare from 'my-addon/components/funny-square';
export default FunnySquare.extend({
  // do the extra stuff here
});
```

This still isn't perfect, though, because we now can't use it without overriding it first. If we add `{{funny-square}}` somewhere inside one of our app's templates, Ember-CLI wont be able to figure out where the component is. 

This is why we add the script which does a simple import-export to `my-addon\app\components\funny-square.js`.

The result of that is that we get to use the component in the app directly, but at the same time are able to extend it with custom behavior in a clear way.

**So why does the template have to go into the `app` folder directly?** Simply put, due to limitations. ES6 modules are namespaced, so we can deal with importing and exporting. Handlebars templates have no concept of namespaces. It's just the way it is, at least right now.

### Special consideration: Styles

So now we want our addon to add styles to the app using it. Generally speaking, this isn't a good idea. The application should have its own consistent set of styles.

However, sometimes it can make sense. Maybe we have a component with bits that should appear or disappear depending on some logic. Visibility is pretty universally styled and if the app developer has to implement it manually, there's little point to use our component.

In other cases, maybe our addon is actually a wrapper for some non-ember library or UI element, so we need to include its styles in order to not break some core functionality, or provide a style baseline.

#### Including addon-specific styles

It's simple, really. **We save all the styles to `/addon/styles/`**

For example we can define a basic style for our `funny-square` component in `addon/styles/funny-square.css`

```CSS
.funny-square {
  height: 100px;
  width: 100px;
  float: left;
  background-color: red;
}
```

The parent application fill find this file and and automatically add it to the applications `vendor.css` file. 

We don't have to limit ourselves to one file either. All .css filies inside `addon/styles/` get concatenated into `vendor.css`.

There's one exception to the rule, though. If we name one of the files the same name as the addon, then that's the only file we can have. This is likely an issue with Ember-CLI file operations which result in all the .css files being concatenated into `vendor.css`, but it's easily avoided.

Just for the sake of making it clearer, in our case, since our addon is called `my-addon`, if we create `addon/styles/my-addon.css` we wont be able to create any other `.css` file inside the `addon/styles/` folder.

#### Including bower/vendor styles

There's an `included` hook provided by the `Addon` model, which we can use to import stuff into `vendor.js` or `vendor.css` depending on the file type. Here's how it works

```JavaScript
module.exports = {
  name: 'my-addon',
  included: function (app, parentAddon) {
    this._super.included(app, parentAddon);
    
    app.import(app.bowerDirectory + '/some_bower_package/dist/css/some_package_style.css');
    app.import('vendor/some_unmanaged_package/some_unmanaged_style.css');
  }
}
```

What the `vendor` folder is for will be explained in a separate section.

For now, I will emphasize that this sort of importing results in the same outcome as does defining styles in the `addon/styles` folder - they get concatenated into `vendor.css`. The difference is the intent. **Styles in `addon/styles` are styles we create as addon developers. Styles in `vendor` or `bower_components` are styles we inherit through 3rd party dependencies.**

#### Using sass

If the addon deals with UI and is even remotely complex, we will most likely end up wanting to use `.sass` with it. 

We need to install and use [`ember-cli-sass`](https://github.com/aexmachina/ember-cli-sass)

The procedure for that should be relatively simple, and it generally is, but **it doesn't work at the moment**, [due to a bug](https://github.com/aexmachina/ember-cli-sass/issues/56). There is a [pull request with a fix](https://github.com/aexmachina/ember-cli-sass/pull/57) for it, so the workaround is to use the pull request branch directly.

```
cd ~/git/my-addon
// this one will work when the issue I mentioned is fixed
npm install --save ember-cli-sass
// this one works right now
npm install --save https://github.com/dukex/ember-cli-sass.git#bugfix/addon-styles
```

Note that we're saving the addon under dependencies instead of dev dependencies. The reason for that is that the parent app might not be using ember-cli-sass, so we need to ensure it's available to the addon.

Once that is done, we also need to modify the addon's `index.js` a bit.

```JavaScript
// index.js
module.exports = {
  name: 'my-addon',
  included: function (app) {
    this._super.included(app);
  }
}
```

It seems a bit weird, having to do this, but without this minimal change to the `included` hook, running the addon will throw an error:

```
Cannot read property 'sassOptions' of undefined
TypeError: Cannot read property 'sassOptions' of undefined
at Class.module.exports.sassOptions (~/my-addon/node_modules/ember-cli-sass/index.js:43:48)
```

From this point on, we simply use `addon/styles/addon.scss` as our style entry point. We can define other `.scss` modules in the same folder and then `@import` them into `addon.scss`, as we would with `app.scss` in an Ember-CLI application.

With these changes in place, `addon.scss` will end up pulling all of its imports, then it will be compiled into `addon.css` and finally merged into `vendor.css` of the parent app.

With all of this in place, `.scss` will work with the dummy app. To make it also work in an external app, we use `npm link` in the same way we did before:

```
cd ~/git/my-addon
npm link
cd ~/git/my-app
npm link my-addon
```

Just don't forget to also **add a `devDependency` to `package.json` of `my-app` or the addon wont load at all.

```JSON
"devDependencies": {
  ...
  "my-addon": "*"
}
```

##### Related links
* [Open issue describing the problem of sass not working properly](https://github.com/aexmachina/ember-cli-sass/issues/56)
* [PR that fixes the issue](https://github.com/aexmachina/ember-cli-sass/pull/57)
* [Related issue on the ember-cli repo. Should contain a lot of aggregated information](https://github.com/ember-cli/ember-cli/issues/4345)
