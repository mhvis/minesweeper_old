/**
 * Game model:
 * game: {
 *   grid: [
 *     [' ', ' ', '0', '1', 'm', ...], // A row
 *     [' ', ...], // Next row
 *     ...
 *   ]
 *   mineCount: 10,
 *   start: 123456789, // Game start moment
 *   end: 123456790, // Game end moment, false when game is still ongoing
 *   mines: [{x: 2, y: 4}, ...] // Mines array, false or empty when not ended
 * }
 */

import React from 'react';
import MinesweeperStore from '../stores/MinesweeperStore';

/**
 * Renders the complete game.
 */
var Minesweeper = React.createClass({
  propTypes: {
    grid: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.oneOf(
      [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', 'm', 'M'])))
      .isRequired,
    mineCount: React.PropTypes.number.isRequired,
    start: React.PropTypes.number.isRequired,
    end: React.PropTypes.number,
    mines: React.PropTypes.arrayOf(React.PropTypes.shape({
      x: React.PropTypes.number, y: React.PropTypes.number}))
  },
  
  render: function() {
    var markCount = 0;
    var dead = false;
    this.props.grid.forEach(function(row) {
      row.forEach(function(cell) {
        if (cell == 'm') {
          markCount++;
        } else if (cell == 'M') {
          dead = true;
        }
      });
    });
    var mood = 'neutral';
    if (dead) {
      mood = 'sad';
    } else if (this.props.end) {
      mood = 'happy';
    }
    return (
      <div className="minesweeper">
        <div className="header">
          <Counter mineCount={this.props.mineCount} markCount={markCount} />
          <Smiley mood={mood}/>
          <Timer start={this.props.start} end={this.props.end} />
        </div>
        <Grid grid={this.props.grid} mines={this.props.mines} />
      </div>
    );
  }
});

/**
 * Renders the grid.
 */
var Grid = React.createClass({
  propTypes: {
    grid: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.oneOf(
      [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', 'm', 'M'])))
      .isRequired,
    mines: React.PropTypes.arrayOf(React.PropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    }))
  },
  render: function() {
    var mineGrid = false;
    if (this.props.mines) {
      // Fill a boolean mine grid with all mines
      mineGrid = [];
      for (var y = 0; y < this.props.grid.length; y++) {
        mineGrid.push([]);
        for (var x = 0; x < this.props.grid[y].length; x++) {
          mineGrid[y][x] = false;
        }
      }
      this.props.mines.forEach(function(mine) {
        mineGrid[mine.y][mine.x] = true;
      });
    }
    var rows = this.props.grid.map(function(row, y) {
      var cells = row.map(function(value, x) {
        var mine = (mineGrid) ? mineGrid[y][x] : false;
        return <Cell x={x} y={y} mine={mine} key={x + ',' + y}>{value}</Cell>;
      });
      return <div className="row" key={y}>{cells}</div>;
    });
    return <div className="grid">{rows}</div>;
  }
});

/**
 * Renders a single cell.
 */
var Cell = React.createClass({
  propTypes: {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    children: React.PropTypes.oneOf([' ', '0', '1', '2', '3', '4', '5', '6',
      '7', '8', 'm', 'M']).isRequired,
    mine: React.PropTypes.bool
  },
  /*
  shouldComponentUpdate: function(nextProps, nextState) {
    return this.props.children != nextProps.children || this.props.mine !=
      nextProps.mine;
  },
  */
  _expose: function(event) {
    if (this.props.children == ' ') {
      MinesweeperStore.expose(this.props.x, this.props.y);
    }
  },
  _mark: function(event) {
    event.preventDefault();
    if (this.props.children == ' ' || this.props.children == 'm') {
      MinesweeperStore.mark(this.props.x, this.props.y);
    }
  },
  render: function() {
    var cls = 'cell';
    var val = '';
    if (this.props.children == ' ' || this.props.children == 'm') {
      cls += ' cell-hidden';
      if (this.props.children == 'm') {
        cls += ' cell-marked';
        val = 'M';
      }
    } else {
      cls += ' cell-exposed';
      if (this.props.children != '0' && this.props.children != 'M') {
        cls += ' cell-' + this.props.children;
        val = this.props.children;
      }
    }
    if (this.props.mine) {
      cls += ' cell-mine';
      val = '*';
    }
    return (
      <div className={cls} onClick={this._expose} onContextMenu={this._mark}>
        {val}
      </div>
    );
  }
});

/**
 * Renders the counter.
 */
var Counter = React.createClass({
  propTypes: {
    mineCount: React.PropTypes.number.isRequired,
    markCount: React.PropTypes.number.isRequired
  },
  render: function() {
    return <div className='header-field'>
      {this.props.mineCount - this.props.markCount}
    </div>;
  }
});

/**
 * Renders the smiley.
 */
var Smiley = React.createClass({
  propTypes: {
    mood: React.PropTypes.oneOf(['neutral', 'happy', 'sad'])
  },
  getDefaultProps: function() {
    return {mood: 'neutral'};
  },
  render: function() {
    //return <img src={this.props.mood + '.svg'} />;
    return <div className='header-field header-smiley'>{this.props.mood}</div>;
  }
});

/**
 * Renders the timer and keeps it running.
 */
var Timer = React.createClass({
  propTypes: {
    start: React.PropTypes.number.isRequired,
    end: React.PropTypes.number
  },
  getInitialState: function() {
    return {elapsed: 0};
  },
  componentDidMount: function() {
    this.timer = setInterval(this.tick, 1000);
  },
  componentWillUnmount: function() {
    clearInterval(this.timer);
  },
  tick: function() {
    this.setState({elapsed: this.getTimeValue()});
  },
  getTimeValue: function() {
    return (this.props.end || Math.round(Date.now() / 1000)) - this.props.start;
  },
  render: function() {
    return <div className='header-field'>{this.state.elapsed}</div>;
  }
});

export default Minesweeper;
