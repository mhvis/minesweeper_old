import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Minesweeper from './Minesweeper.react';
import MinesweeperNewForm from './MinesweeperNewForm.react';
import MinesweeperStore from '../stores/MinesweeperStore';

/**
 * The full app.
 */
var MinesweeperApp = React.createClass({
  getInitialState: function() {
    return MinesweeperStore.getGame();
  },
  
  componentDidMount: function() {
    MinesweeperStore.setListener(this._onChange);
  },
  
  componentWillUnmount: function() {
    MinesweeperStore.setListener(false);
  },
  
  render: function() {
    var center = {textAlign: 'center'};
    return (
      <div>
        <AppBar />
        <div style={center}>
          <MinesweeperNewForm />
          <Minesweeper grid={this.state.grid} mineCount={this.state.mineCount}
            start={this.state.start} end={this.state.end} mines={this.state.mines}
            />
        </div>
      </div>
    );
  },
  
  _onChange: function() {
    this.setState(MinesweeperStore.getGame());
  }
});

export default MinesweeperApp;
