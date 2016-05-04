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
  /*
  propTypes: {
    grid: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    mines: React.PropTypes.arrayOf(React.PropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    }))
  },
  */
  render: function() {
    return (
      <div>
        <div>
          <Counter mineCount={10} markCount={0} />
          <Smiley />
          <Timer start={Math.round(Date.now() / 1000)} />
        </div>
        <Grid />
      </div>
    );
  }
});

/**
 * Renders the grid.
 */
var Grid = React.createClass({
  propTypes: {
    grid: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    mines: React.PropTypes.arrayOf(React.PropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    }))
  },
  render: function() {
    return <div></div>;
  }
});

/**
 * Renders a single cell.
 */
var Cell = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOf([' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', 'm']).isRequired,
    mine: React.PropTypes.bool,
    onReveal: React.PropTypes.func,
    onMark: React.PropTypes.func
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return this.props.children != nextProps.children || this.props.mine != nextProps.mine;
  },
  reveal: function(event) {
    if (this.props.children == ' ') {
      if (this.props.onReveal) this.props.onReveal();
    }
  },
  mark: function(event) {
    if (this.props.children == ' ') {
      if (this.props.onMark) this.props.onMark();
    }
  },
  render: function() {
    return (
      <div onClick={this.reveal} onContextMenu={this.mark}>
        {this.props.children}
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
  shouldComponentUpdate: function(nextProps, nextState) {
  },
  render: function() {
    return <div>{this.props.mineCount - this.props.markCount}</div>;
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
    return <div>{this.props.mood}</div>;
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
    return {elapsed: this.getTimeValue()};
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
    return this.props.end || Math.round(Date.now() / 1000) - this.props.start;
  },
  render: function() {
    return <div>{this.state.elapsed}</div>;
  }
});

export default Minesweeper;
