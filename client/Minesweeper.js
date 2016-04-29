import React from 'react';

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

var Face

var Timer

var Counter

var Header = React.createClass({
  render: function() {
    return (
      <Counter /><Face /><Timer />
    );
  }
});

var Minesweeper = React.createClass({
  render: function() {
    return (
    
    );
  }
});
