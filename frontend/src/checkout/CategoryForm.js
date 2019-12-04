import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { checkPropTypes } from 'prop-types';

import preprocess from '../data/preprocess.json'

class CategoryForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = ({
      cate_1: []
    })
  }

  getData = () => {
    console.log(preprocess)
    fetch('https://cse6242-backend.herokuapp.com/travel-planner/0-preprocess', {method:'GET'})
    .then(
      result => {
        return result.json()
      }).then(data => {
        this.setState({
          category: data.attraction_categories,
          isChecked: Array(data.attraction_categories.length).fill(false),
        })
      })

    // Temp
    /*
    this.setState({
      category: preprocess.attraction_categories,
      isChecked: Array(preprocess.attraction_categories.length).fill(false),
    })
    */
  } 

  componentDidMount() {
    this.getData()
  }

  handleCheck = (event) => {
    var number = event.target.name
    number = number.split("-")
    if (event.target.checked){
      this.state.isChecked[number[1]] = true
      // console.log(this.state.isChecked)
      var category = this.state.category
      var cur = []
      this.state.isChecked.forEach(function(element, i){
        if (element == true){
          cur.push(category[i].key)
        }
      })
      var func = this.props.func;
      func(cur)
    }else{
      this.state.isChecked[number[1]] = false
      console.log(this.state.isChecked)
    }
  }

  render() {
    const attractionList = []
    if (this.state.category){
      for (const value of this.state.category){
        attractionList.push(value.name)
      }
    }
    return (   
      <React.Fragment>
        <Typography variant="h6" gutterBottom>
          Destination Categories
        </Typography>
        <Grid container spacing={3}>
          {attractionList.map((item, index) => (
            <Grid key={item.key} item xs={12} sm={6} key={index}>
              <FormControlLabel
                control={<Checkbox color="secondary" name= {"checkedbox-" + index} value="yes" onChange={event => this.handleCheck(event)}/>}
                label= {item}
              />
            </Grid>
          ))}
        </Grid>
      </React.Fragment> 
    );
  };
}

export default CategoryForm