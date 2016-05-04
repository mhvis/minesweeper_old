import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Minesweeper from './minesweeper';

const Layout = () => (
  <div>
    <AppBar />
    <RaisedButton primary={true}>Reset</RaisedButton>
    <Minesweeper />
  </div>
);

export default Layout;
