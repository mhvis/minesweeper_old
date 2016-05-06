import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import MinesweeperStore from '../stores/MinesweeperStore';

/**
 * The full app.
 */
var MinesweeperNewForm = React.createClass({
  getInitialState: function() {
    return {width: 16, height: 30, mineCount: 99};
  },
  widthChange: function(event) {
    this.setState({width: event.target.value});
  },
  heightChange: function(event) {
    this.setState({height: event.target.value});
  },
  mineCountChange: function(event) {
    this.setState({mineCount: event.target.value});
  },
  newGame: function(event) {
    MinesweeperStore.newGame(this.state.width, this.state.height,
    this.state.mineCount);
  },
  presetHard: function(event) {
    MinesweeperStore.newGame(16, 30, 99);
  },
  render: function() {
    return (
      <div>
        <TextField value={this.state.width} onChange={this.widthChange} />
        <TextField value={this.state.height} onChange={this.heightChange} />
        <TextField value={this.state.mineCount}
        onChange={this.mineCountChange} />
        <RaisedButton primary={true} onClick={this.newGame}>
          New game
        </RaisedButton>
        <br />
        <span>Presets:</span>
        <RaisedButton onClick={this.presetHard}>Hard</RaisedButton>
      </div>
    );
  }
});

export default MinesweeperNewForm;