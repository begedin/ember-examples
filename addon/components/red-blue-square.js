import Ember from 'ember';


/**

  The component here is defined in the same way as you would any other component
  in an Ember-CLI application.

  Since it's defined in the addon folder, we can import it into our app for
  stuff like extending and overrides by using

    import RedBlueSquare from 'ember-examples/components/red-blue-square'

  With just this file, however, we can't use this component inside our app
  templates directly. '{{red-blue-square}}'' wouldn't work anywhere
  inside our app.

  If we want that to work, we need to do something else to, so take a look into

    app/components/red-blue-square.js
*/
export default Ember.Component.extend({
  classNames: ['red-blue-square'],
  classNameBindings: ['color'],

  color: 'red',

  click: function() {
    var color = this.get('color');
    this.set('color', color === 'red' ? 'blue' : 'red');
  }
});
