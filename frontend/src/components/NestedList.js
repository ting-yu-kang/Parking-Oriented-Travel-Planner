import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'

import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { TextField } from 'material-ui';
import { withStyles } from '@material-ui/styles';

const useStyles = theme => ({
  root: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

class NestedList extends React.Component{
  constructor(props){
    super(props)
    this.state = ({
      open: false,
      checked: [],
      time: {}
    })
  }

  handleMouseOver = value => () => {
    var handleMouseOver = this.props.handleMouseOver
    handleMouseOver(value)
  }

  handleMouseOut = value => () => {
    var handleMouseOut = this.props.handleMouseOut
    handleMouseOut(value)
  }

  handleClick = () => {
    this.setState({
      open: !this.state.open
    })
  };

  handleToggle = value => () => {
    const currentIndex = this.state.checked.indexOf(value);
    const newChecked = [...this.state.checked];
    var handleSelection = this.props.handleSelection

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    this.setState({
      checked: newChecked
    })
    // newChecked: a list of item being checked
    //console.log(newChecked);
    handleSelection(newChecked, this.props.item.parking_lot.name)
  };

  handleTime = target => (event) => {
    var timeDict = this.state.time
    timeDict[target] = event.target.value

    var handleData = this.props.handleData
    //console.log(event.target.value);
    //console.log(target);

    this.setState({
      time: timeDict
    }, () => {
      //console.log(this.state.time)
    })
    handleData(timeDict)
  };

  render () {
    const { classes } = this.props;
    var c = this.state.checked
    return (
      <List
        className={classes.root}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            
          </ListSubheader>
        }
      >
        <ListItem button onClick={this.handleClick}>
          <ListItemText primary={this.props.item.parking_lot.name} />
          {this.state.open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
              {this.props.item.attractions.map(value => {
                  const labelId = `checkbox-list-label-${value.name}`;
                  return (
                  <ListItem 
                    key={value.name} 
                    role={undefined} 
                    dense 
                    button 
                    onClick={this.handleToggle(value.name)} 
                    onMouseOver={this.handleMouseOver(value.name)}
                    onMouseOut={this.handleMouseOut(value.name)}
                    >
                      <ListItemIcon>
                      <Checkbox
                          edge="start"
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                          checked={this.state.checked.indexOf(value.name) !== -1}
                      />
                      </ListItemIcon>
                      <ListItemText id={labelId} primary={`${value.name}`} />

                      <ListItemSecondaryAction>
                      <input
                          type="number"
                          onChange={this.handleTime(value.name)}
                          placeholder = {(this.state.time[value.name])? this.state.time[value.name] : '30'}
                          disabled = {(this.state.checked.indexOf(value.name) == -1)? "disabled" : ""}
                          />
                      </ListItemSecondaryAction>
                  </ListItem>
                  );
              })}
          </List>
        </Collapse>
      </List>
    );
  }
}

export default withStyles(useStyles)(NestedList);