import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid';
import SearchBar from 'material-ui-search-bar'
import Map from "../components/Map";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import withStyles from '@material-ui/core/styles/withStyles'
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';

const googleMapsApiKey = "XXX";

const AirbnbSlider = withStyles({
    root: {
      color: '#3a8589',
      height: 3,
      padding: '13px 0',
    },
    thumb: {
      height: 20,
      width: 20,
      backgroundColor: '#fff',
      border: '1px solid currentColor',
      marginTop: -8,
      marginLeft: -13,
      boxShadow: '#ebebeb 0px 2px 2px',
      '&:focus,&:hover,&$active': {
        boxShadow: '#ccc 0px 2px 3px 1px',
      },
      '& .bar': {
        // display: inline-block !important;
        height: 9,
        width: 1,
        backgroundColor: 'currentColor',
        marginLeft: 1,
        marginRight: 1,
      },
    },
    active: {},
    valueLabel: {
      left: 'calc(-50% + 4px)',
    },
    track: {
      height: 3,
    },
    rail: {
      color: '#d8d8d8',
      opacity: 1,
      height: 3,
    },
  })(Slider);
  
  function AirbnbThumbComponent(props) {
    return (
      <span {...props}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </span>
    );
  }

class home extends Component {

    state = {
        screams: null
    }
    componentDidMount(){
    }

    render() {
         
        return (
            <MuiThemeProvider>
                <div className="phase1" style={styles.header}>
                    <SearchBar
                        onChange={() => console.log('onChange')}
                        onRequestSearch={() => console.log('onRequestSearch')}
                        style={{
                            position: 'relative',
                            top: '50%',
                            margin: '0 auto',
                            maxWidth: 800,
                            marginTop: 'auto',
                            marginBottom: 'auto'
                        }}
                    />
                </div>
                
                <Grid container spacing={3} >
                    <Grid item sm={2} xs={12}>
                        <Paper>
                            <Typography gutterBottom>Travel Duration</Typography>
                            <AirbnbSlider
                                ThumbComponent={AirbnbThumbComponent}
                                getAriaLabel={index => (index === 0 ? 'Minimum price' : 'Maximum price')}
                                defaultValue={[20, 40]}
                            />
                            <Typography gutterBottom>Travel Distance</Typography>
                            <AirbnbSlider
                                ThumbComponent={AirbnbThumbComponent}
                                getAriaLabel={index => (index === 0 ? 'Minimum price' : 'Maximum price')}
                                defaultValue={[20, 40]}
                            />
                            <TextField
                                id="standard-search"
                                label="First Priority"
                                type="search"
                                className= 'textField'
                                margin="normal"
                            />
                            <TextField
                                id="standard-search"
                                label="Secondary Priority"
                                type="search"
                                className= 'textField'
                                margin="normal"
                            />
                            <TextField
                                id="standard-search"
                                label="Third Priority"
                                type="search"
                                className= 'textField'
                                margin="normal"
                            />
                            

                        </Paper>
                        <Grid item xs zeroMinWidth><p>Search results</p></Grid>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                        <Map
                            googleMapURL={
                            'https://maps.googleapis.com/maps/api/js?key=' +
                            googleMapsApiKey +
                            '&libraries=geometry,drawing,places'
                            }
                            markers={places}
                            loadingElement={<div style={{height: `100%`}}/>}
                            containerElement={<div style={{height: "80vh"}}/>}
                            mapElement={<div style={{height: `100%`}}/>}
                            defaultCenter={{lat: 25.798939, lng: -80.291409}}
                            defaultZoom={11}
                        />
                    </Grid>
                    <Grid item sm={2} xs={12}>
                        <Grid item xs zeroMinWidth>Suggesting Route</Grid>
                    </Grid>
                </Grid>
            </MuiThemeProvider>
        )
    }
}

const places = [
    {latitude: 25.8103146,longitude: -80.1751609},
    {latitude: 27.9947147,longitude: -82.5943645},
    {latitude: 28.4813018,longitude: -81.4387899}
  ]


const styles = {
    header: {
        height: 400,
        backgroundImage: 'url(' + require('../images/city2.png') + ')',
        backgroundSize: 'cover',
        overflow: 'hidden',
        marginBottom: '10px',
        marginTop: '-20px',
        marginLeft: '-40%',
        width: '180%',
    },
    textField: {
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 200,
      },
}

export default withStyles(styles)(home)
