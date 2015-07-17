/**

  So what's going on here? Why do we need this?

  It's simple. We want the component our addon provides to be available directly
  from app templates, so we can use it like.

    {{red-blue-square}}

  In order to do that, we need it to be part of the app's, not the addon's
  namespace, because, when we use

    {{component-name}}

  Ember is looking for that component under

    appName/components/component-name

  Similarly, it's looking for templates, if there are any, under

    appName/templates/components/component-name

  For that to work, we import the component here from the addon namespace and
  immediately export it. Since this is merged with the app namespace, due to
  being in the 'app' folder, it will automatically become available under

    appName/components/red-blue-square

  So why not just define the component here, then? Why do the whole process of
    * Define it in the addon folder
    * Import it from the addon folder and immediately export

  We could, and it would work, and we could do everything we can do right now.
  The only problem is in coding style and clarity, really. If we just define it
  here, then if we want to extend this component inside our application, we
  would have to:

    import RedBlueSquare from 'appName/components/red-blue-square';

    export default RedBlueSquare.extend({
      // extend the component here
    });

  That works just fine, but we're importing the base from the app namespace, so
  it looks like we're extending a component that's defined somewhere in the app,
  instead of a third party addon, which is the actual thing that's happening.

  Simply put, the code would be misleading.

  Because of that, we have this semi-offical convention, in that it's documented
  in the official documentation, but nothing is really enforcing us to do it
  this  way.

  Note that the same convention is used with any Ember entity that needs to be
  available from within the app template. Among others, these would likely be

    * components
    * helpers
    * controllers
    * initializers
    * routes
    * models

  However, only components and helpers really, absolutely need to be part of the
  app namespace for us to use them directly from app templates.

  Everything probably doesn't really need to be in the app-namespace. The app
  developer themselves should probably import and extend it from within their
  app.

  In the end, we use our judgement.
*/

import RedBlueSquare from 'ember-examples/components/red-blue-square';

export default RedBlueSquare;
