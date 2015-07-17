import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['red-blue-square'],
  classNameBindings: ['color'],

  color: 'red',

  actions: {
    click: function() {
      var color = this.get('color');
      this.set('color', color === 'red' ? 'blue' : 'red');
    }
  }
});
