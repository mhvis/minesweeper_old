/**
 * Game model:
 * game: {
 *   grid: [
 *     [' ', ' ', '0', '1', 'm', ...], // A row
 *     [' ', ...], // Next row
 *     ...
 *   ]
 *   mineCount: 10,
 *   timestamp: 123456789, // Game start moment
 *   end: { // Null object when game is still ongoing
 *     mines: [],
 *     timestamp: 123457890
 *   }
 * }
 */

import React from 'react';

/**
 * Renders the complete game.
 */
var Minesweeper = React.createClass({
  propTypes: {
    grid: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    mines: React.PropTypes.arrayOf(React.PropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    }))
  },
  render: function() {
    return (
      <div>
        <div>
          <div>{remaining}</div>
          <div><img src={smiley} /></div>
          <div>{time}</div>
        </div>
        <div>
          // Todo render all cells
        </div>
       </div>
    );
  }
});

/**
 * Renders a single cell.
 */
var Cell = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOf([' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', 'm']).isRequired,
    mine: React.PropTypes.bool
  },
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

export default Minesweeper;
