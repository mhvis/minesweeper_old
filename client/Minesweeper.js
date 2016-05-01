import React from 'react';

var Grid = React.createClass({
  render: function() {
    return ();
  }
});

var Cell = React.createClass({
  handleClick: function(event) {
  },
  render: function() {
    return (
      <div className="cell" onClick={if (this.props.value == -1) {this.handleClick}}>
        {this.props.children}
      </div>
    );
  }
});

var Counter = React.createClass({
  render: function() {
    return ();
  }
});

var Face = React.createClass({
  render: function() {
    return ();
  }
});

var Timer = React.createClass({
  render: function() {
    return ();
  }
});

var Game = React.createClass({
  render: function() {
    return (
        
    );
  }
});
