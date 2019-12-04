import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Map from "../components/Map";
import DetailBlock from "../components/DetailBlock"
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const googleMapsApiKey = "XXX";

const useStyles = theme => ({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    listSection: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: theme.palette.background.paper,
    },
    ui: {
      paddingLeft: theme.spacing(0),
    },
  });

class RestaurantForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = ({
            checkedLunch: [0],
            checkedDinner: [0],
            inputData: null,
            places: [],
            newPlaces: [],

            open: [false,false,false,false,false,false],
            openDinner: [false,false,false,false,false,false],
            checked: [],
            time: {},
            checkedRadioLunch: '',
            checkedRadioDinner: '',
            catagory: []
        })
      }
    
    
    componentDidUpdate(){
        if (this.props.data){
            if (this.state.inputData == null){
                this.setState({
                inputData: this.props.data
                }, () => {
                console.log("Step 3 data: ", this.state.inputData)
                this.processInputData(this.state.inputData)
                this.processMapData(this.state.inputData)
                })
            }
        }
    }

    processInputData = (data) => {
        if (data.restaurants.lunch) {
            this.setState({
            attraction_groups: data.attraction_groups,
            lunchTiming: data.restaurants.lunch.after_group_id,
            lunch: data.restaurants.lunch.restaurants,
            catagory: data.restaurant_categories
            })
        }
        if (data.restaurants.dinner){
            this.setState({
                dinnerTiming: data.restaurants.dinner.after_group_id,
                dinner: data.restaurants.dinner.restaurants
            })
        }
    }

    processMapData = (data) => {
        console.log("processMapData")
        const clonedeep = require('lodash.clonedeep')
        const curLocation = data.current_location
        var curPlaces = this.state.places
        curPlaces.push(curLocation)
        for (var i in data.attraction_groups){
          var location = data.attraction_groups[i].parking_lot.location
          //var curPlaces = this.state.places
          curPlaces.push(location)
          const deepclonedPlaces = clonedeep(curPlaces)
          this.setState({
            places: curPlaces,
            newPlaces: deepclonedPlaces
          })
        }
      }
      
    handleChangeLunch = value => (event) => {
        //console.log(value)
        var setRLunch = this.props.func2
        var np = Object.assign([],this.state.places)
        //console.log(np)
        np.splice(this.state.lunchTiming + 2,0, {latitude: value.latitude, longitude: value.longitude})
        //console.log(np)
        
        this.setState({
            newPlaces: np,
            checkedRadioLunch: value.name
        }, () => {
            setRLunch(value.name)
            console.log("state", this.state.newPlaces)
        })
    }

    handleChangeDinner = value => (event) => {
        //console.log(value)
        var setRDinner = this.props.func3
        var np = Object.assign([],this.state.newPlaces)
        if (this.state.lunchTiming){
            np.splice(this.state.dinnerTiming + 3,0, {latitude: value.latitude, longitude: value.longitude})
        }
        else{
            np.splice(this.state.dinnerTiming + 3,0, {latitude: value.latitude, longitude: value.longitude})
        }
        //console.log(np)
        
        this.setState({
            newPlaces: np,
            checkedRadioDinner: value.name
        }, () => {
            setRDinner(value.name)
            console.log("state", this.state.newPlaces)
        })
    }

    onDirectionFound = result => {
        console.log(result)
        var setStepRinput = this.props.func
        if (result && setStepRinput){
            setStepRinput(result)
        }
    }

    handleClick = (value) => {
        console.log(value)
        var newOpen = this.state.open
        var toTrue = false
        if (newOpen[value] == false) {
            toTrue = true
        }
        newOpen = [false,false,false,false,false,false]
        if (toTrue){
            newOpen[value] = true
        }
        this.setState({
          //open: !this.state.open
          open: newOpen
        })
      };
    
    handleClickDinner = (value) => {
        var newOpen = this.state.openDinner
        var toTrue = false
        if (newOpen[value] == false) {
            toTrue = true
        }
        newOpen = [false,false,false,false,false,false]
        if (toTrue){
            newOpen[value] = true
        }
        this.setState({
          //open: !this.state.open
          openDinner: newOpen
        })
    };

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
            <Map
                googleMapURL={
                'https://maps.googleapis.com/maps/api/js?key=' +
                googleMapsApiKey +
                '&libraries=geometry,drawing,places'
                }
                markers={this.state.newPlaces}
                loadingElement={<div style={{height: `100%`}}/>}
                containerElement={<div style={{height: "45vh"}}/>}
                mapElement={<div style={{height: `100%`}}/>}
                defaultCenter={{lat: 34.043146, lng: -118.267270}}
                defaultZoom={11}
                navigate= {true}
                func = {this.onDirectionFound}
                />
            <Typography variant="h4" color="textPrimary" style={{paddingTop:"30px"}}>
                Seems like you need to have a food break in your trip
            </Typography>
            <Typography variant="h5" color="textSecondary" gutterBottom>
                Let us help you pick a decent restaurant along the way!
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h4" gutterBottom style={{textAlign:"center"}}>
                        Lunch
                    </Typography >
                    <React.Fragment>
                    { this.state.lunch ? (
                        this.state.catagory.map((Rcategory, index) => (
                            <List key={Rcategory + index} className={classes.root} component="nav" aria-labelledby="nested-list-subheader">
                                <ListItem button onClick={() => this.handleClick(index)}>
                                <ListItemText primary= {Rcategory.name} />
                                {this.state.open[index] ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse in={this.state.open[index]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                        {this.state.lunch.map( value => {
                                            if (value.style.includes(Rcategory.key)){
                                                const labelId = `checkbox-list-label-${value.name}`;
                                                return (
                                                    <ListItem 
                                                    key={value.name} 
                                                    role={undefined} 
                                                    dense 
                                                    button 
                                                    onClick={this.handleChangeLunch(value)} 
                                                    >
                                                      <ListItemIcon>
                                                        <FormControlLabel control={<Radio />} 
                                                            checked={this.state.checkedRadioLunch === value.name}
                                                            tabIndex={-1}
                                                            onChange={this.handleChangeLunch(value)}
                                                        />
                                                      </ListItemIcon>
                                                      <ListItemText id={labelId} primary={`${value.name}`} secondary={
                                                            <React.Fragment>
                                                                {value.rating + ' . ' + value.price}
                                                            </React.Fragment>
                                                        }/>
                                                  </ListItem>
                                                )
                                            }
                                        })
                                    }
                                </List>
                                </Collapse>
                            </List>
                        ))

                        ) : (<div></div>)
                    }
                    </React.Fragment>
                </Grid>
                <Grid item xs={12} sm={4} style={{textAlign:"center"}}>
                <Typography variant="h4" gutterBottom>
                    { this.state.lunch ? (
                        <div>
                            <Typography variant="h5" color="textSecondary" gutterBottom style={{textAlign:"center"}}>
                                Lunch Time: 
                            </Typography >
                            {this.state.lunchTiming > 0 ? (
                                <div>
                                    <Typography variant="h5" color="textSecondary" gutterBottom style={{textAlign:"center"}}>
                                        From {this.state.attraction_groups[this.state.lunchTiming].travel_times.estimate_end_time}
                                    </Typography>
                                </div>
                                )
                            : (
                                <div>
                                    <Typography variant="h5" color="textSecondary" gutterBottom style={{textAlign:"center"}}>
                                        From {this.state.attraction_groups[this.state.lunchTiming].travel_times.estimate_end_time}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    ) : (<div></div>)
                    }
                    { this.state.dinner ? (
                        <div>
                            <Typography variant="h5" color="textSecondary" gutterBottom style={{textAlign:"center"}}>
                                Dinner Time: 
                            </Typography >
                            {this.state.dinnerTiming > 0 ? (
                                <div>
                                    <Typography variant="h5" color="textSecondary" gutterBottom style={{textAlign:"center"}}>
                                        From {this.state.attraction_groups[this.state.dinnerTiming].travel_times.estimate_end_time}
                                    </Typography>
                                </div>
                                )
                            : (
                                <div>
                                    <Typography variant="h5" color="textSecondary" gutterBottom style={{textAlign:"center"}}>
                                        From {this.state.attraction_groups[this.state.dinnerTiming].travel_times.estimate_end_time}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    ) : (<div></div>)
                    }
                </Typography >
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h4" gutterBottom style={{textAlign:"center"}}>
                        Dinner
                    </Typography >
                    <React.Fragment>
                    { this.state.dinner ? (
                        this.state.catagory.map((Rcategory, index) => (
                            <List key={Rcategory + index} className={classes.root} component="nav" aria-labelledby="nested-list-subheader">
                                <ListItem button onClick={() => this.handleClickDinner(index)}>
                                <ListItemText primary= {Rcategory.name} />
                                {this.state.openDinner[index] ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse in={this.state.openDinner[index]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                        {this.state.dinner.map( value => {
                                            if (value.style.includes(Rcategory.key)){
                                                const labelId = `checkbox-list-label-${value.name}`;
                                                return (
                                                    <ListItem 
                                                    key={value.name} 
                                                    role={undefined} 
                                                    dense 
                                                    button 
                                                    onClick={this.handleChangeDinner(value)} 
                                                    >
                                                      <ListItemIcon>
                                                        <FormControlLabel control={<Radio />} 
                                                            checked={this.state.checkedRadioDinner === value.name}
                                                            tabIndex={-1}
                                                            disableRipple
                                                            onChange={this.handleChangeDinner(value)}
                                                        />
                                                      </ListItemIcon>
                                                      <ListItemText id={labelId} primary={`${value.name}`} secondary={
                                                            <React.Fragment>
                                                                {value.rating + ' . ' + value.price}
                                                            </React.Fragment>
                                                        }/>
                                                  </ListItem>
                                                )
                                            }
                                        })
                                    }
                                </List>
                                </Collapse>
                            </List>
                        ))

                        ) : (<div></div>)
                    }
                    </React.Fragment>
                </Grid>
            </Grid>
            </React.Fragment>
        );
    }
}

export default withStyles(useStyles)(RestaurantForm)

var places = [
  {latitude: 34.010088,longitude: -118.496493},
  {latitude: 34.068812,longitude: -118.444480},
  {latitude: 34.043146,longitude: -118.267270}
]
