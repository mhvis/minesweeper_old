import React from 'react';
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
        <div style={center}>
          <MinesweeperNewForm />
          <Minesweeper grid={this.state.grid} mineCount={this.state.mineCount}
            start={this.state.start} end={this.state.end} mines={this.state.mines}
            />
          <a href='https://github.com/mhvis/minesweeper'>GitHub link</a>
        </div>
      </div>
    );
  },
  
  _onChange: function() {
    this.setState(MinesweeperStore.getGame());
  }
});

export default MinesweeperApp;
