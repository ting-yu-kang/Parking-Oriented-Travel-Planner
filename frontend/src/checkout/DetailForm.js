import React, {MouseEvent} from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Map from "../components/Map";
import DetailBlock from "../components/DetailBlock"
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { withStyles } from '@material-ui/styles';


const googleMapsApiKey = "XXX";

const useStyles = theme => ({
  root: {
    width: '100%',
    maxWidth: 600,
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
  timeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  timeTextField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
});

class DetailForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      totalTime: 0,
      inputData: null,
      places: [],
      selectedPlaces: {},
      places_attraction: [],
      mouseOver: '',
      curLocation: null,
      departureTime: "08:30"
    })
  }

  // Temp
  /*
  componentDidMount(){
    console.log('componentDidMount')
    if (this.props.data){
      if (this.state.inputData == null){
        this.setState({
          inputData: this.props.data
        }, () => {
          this.processInputData(this.state.inputData)
          this.processMapData(this.state.inputData)
        })
      }
    }
  }
  */

  componentDidUpdate(){
    console.log('componentDidUpdate')
    if (this.props.data){
      if (this.state.inputData == null){
        this.setState({
          inputData: this.props.data
        }, () => {
          console.log("Step 1 data: ", this.state.inputData)
          this.processInputData(this.state.inputData)
          this.processMapData(this.state.inputData)
        })
      }
    }
  }

  processInputData = (data) => {
      this.setState({
        attraction_groups: data.attraction_groups
      })
  }

  processMapData = (data) => {
    for (var i in data.attraction_groups){
      var location = data.attraction_groups[i].parking_lot.location
      var curPlaces = this.state.places
      var curAttractions = this.state.places_attraction
      for (var j in data.attraction_groups[i].attractions){
        var location_attractions = data.attraction_groups[i].attractions[j]
        curAttractions.push(location_attractions)
      }
      curPlaces.push(location)
      this.setState({
        places: curPlaces,
        places_attraction: curAttractions,
        curLocation: data.current_location
      })
    }
  }

  handleMouseOver = (value) => {
    //console.log("mouseOver: ", value)
    this.setState({
      mouseOver: value
    })
  }

  handleMouseOut= (value) => {
    //console.log("mouseOut: ", value)
    this.setState({
      mouseOver: ''
    })
  }

  setDepartureTime = (event) => {
    //console.log(event.target)
    var setDepartureTime = this.props.func2
    this.setState({
      departureTime: event.target.value
    }, () => {
      setDepartureTime(this.state.departureTime)
    })
  }

  // Handel time
  handleDetailData = (value) => {
    var setStep2input = this.props.func
    this.setState({
      timeDict: value
    }, () => {
      console.log(this.state.timeDict)
      setStep2input(this.state.selectedPlaces, this.state.timeDict)
    })
  }

  // Handle selection
  handleSelection = (selected, parkingLot) => {
    console.log("handleSelection", selected, parkingLot)
    var selectedPlaces = this.state.selectedPlaces
    var setStep2input = this.props.func
    selectedPlaces[parkingLot] = selected

    this.setState({
      selectedPlaces: selectedPlaces
    }, () => {
      console.log(this.state.selectedPlaces)
      setStep2input(this.state.selectedPlaces, this.state.timeDict)
    })
  }

  render () {
    const { classes } = this.props;
    var selectedData = this.props.data2
    if (selectedData != undefined){
      selectedData = JSON.parse(selectedData)
    }
    
    return (
      <React.Fragment>
        <Map
            googleMapURL={
            'https://maps.googleapis.com/maps/api/js?key=' +
            googleMapsApiKey +
            '&libraries=geometry,drawing,places'
            }
            markers={this.state.places}
            markers_attraction={this.state.places_attraction}
            loadingElement={<div style={{height: `100%`}}/>}
            containerElement={<div style={{height: "45vh"}}/>}
            mapElement={<div style={{height: `100%`}}/>}
            defaultCenter= {{lat: 34.068387,lng: -118.359502}}
            defaultZoom={12}
            navigate= {false}
            mouseOver={this.state.mouseOver}
            curLocation = {this.state.curLocation}
          />
        <Typography variant="h6" gutterBottom>
          More detail of places to visit
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            { this.state.attraction_groups ? (
                this.state.attraction_groups.map((item, index) => (
                    <DetailBlock 
                      key = {index} 
                      item = {item} 
                      handleMouseOver={this.handleMouseOver} 
                      handleMouseOut={this.handleMouseOut}
                      handleData = {this.handleDetailData} 
                      handleSelection = {this.handleSelection} 
                      />
                  ))
            )
              : 
            (<div></div>)
                }
          </Grid>
          <Grid item xs={12} sm={6}>
            <form className={classes.timeContainer} noValidate style={{paddingLeft: '48px'}}>
              <TextField
                id="time"
                label="Departure Time"
                type="time"
                //defaultValue="07:30"
                value= {this.state.departureTime}
                className={classes.timeTextField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                onChange={this.setDepartureTime}
              />
            </form>
            <List disablePadding className={classes.root} subheader={<li />}>
              {
                selectedData ? (
                  selectedData.attraction_groups.map((attraction_group,index) => (
                    <li key={`${index}`} className={classes.listSection}>
                      <ul className={classes.ul}>
                        <ListSubheader>{attraction_group.parking_lot.name}</ListSubheader>
                        {attraction_group.attractions.map((attraction,index2) => (
                          <ListItem key={`attraction-${index}-${index2}`}>
                            <ListItemText primary={attraction.name}/>
                            <Typography variant="body2">{'Stay ' + attraction.estimate_time + ' min'}</Typography>
                          </ListItem>
                        ))}
                      </ul>
                    </li>
                  ))
                ) :
                (<div></div>)
              }
            </List>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

//export default DetailForm
export default withStyles(useStyles)(DetailForm);