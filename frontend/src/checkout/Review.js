import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Map from "../components/Map";
import { ListItemSecondaryAction } from '@material-ui/core';

const googleMapsApiKey = "XXX";

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(1, 0),
  },
  total: {
    fontWeight: '700',
  },
  title: {
    marginTop: theme.spacing(2),
  },
}));

const calculateTotalTime = (data) => {
  var dataPoint = data.routes[0].legs
  let totalTime = 0
  dataPoint.forEach(element => {
    totalTime += element.duration.value
  });
  var min = 0
  var hr = 0
  if (totalTime >= 60){
    min = Math.floor(totalTime / 60)
    totalTime %= 60
    if (min >= 60){
      hr = Math.floor(min / 60)
      min %= 60
    }
  }
  return hr.toString() + ' hr ' + min.toString() + ' min ' + totalTime.toString() + ' sec'
}

export default function Review(props) {
  const classes = useStyles();
  console.log(props.data)
  var totalTime = calculateTotalTime(props.data)
  return (
    <React.Fragment>
      <Map
          googleMapURL={
          'https://maps.googleapis.com/maps/api/js?key=' +
          googleMapsApiKey +
          '&libraries=geometry,drawing,places'
          }
          markers={places}
          loadingElement={<div style={{height: `100%`}}/>}
          containerElement={<div style={{height: "60vh"}}/>}
          mapElement={<div style={{height: `100%`}}/>}
          defaultCenter={{lat: 25.798939, lng: -80.291409}}
          defaultZoom={11}
          navigate= {false}
          navigationResult = {props.data}
      />
      <Typography variant="h6" gutterBottom>
        Ready to set off!
      </Typography>
      <List disablePadding>
        {
          props.data2.attraction_groups.map((attraction_group,index) => (
            <div>
              {props.data2.restaurants.lunch ? (
                props.data2.restaurants.lunch.after_group_id + 1 == index ? (
                  <ListItem className={classes.listItem} key={'restaurant' + index}>
                    <ListItemText secondary={
                      <React.Fragment>
                        Lunch here
                      </React.Fragment>
                    } primary= {props.lunch}/>
                    <ListItemSecondaryAction>
                      <ListItemText secondary={
                        <React.Fragment>
                          ---
                        </React.Fragment>
                      } primary={"Stop for 60 min"}/>
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : (<div></div>)
              )
              :(<div></div>)
              }
              {props.data2.restaurants.dinner ? (
                props.data2.restaurants.dinner.after_group_id + 1 == index ? (
                  <ListItem className={classes.listItem} key={'restaurant' + index}>
                    <ListItemText secondary={
                      <React.Fragment>
                        Dinner here
                      </React.Fragment>
                    } primary= {props.dinner}/>
                    <ListItemSecondaryAction>
                      <ListItemText secondary={
                        <React.Fragment>
                          ---
                        </React.Fragment>
                      } primary={"Stop for 60 min"}/>
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : (<div></div>)
              )
              :(<div></div>)
              }
              {attraction_group.attractions.map((attraction) => (

                  <ListItem className={classes.listItem} key={index}>
                    <ListItemText secondary={
                      <React.Fragment>
                        { attraction_group ?
                          ("Park at: " + attraction_group.parking_lot.name)
                          :
                          ("From current location")
                        }
                      </React.Fragment>
                    } primary={attraction.name}/>
                    <ListItemSecondaryAction>
                      <ListItemText secondary={
                        <React.Fragment>
                          { 
                            attraction_group.travel_times.estimate_start_time + ' - ' + attraction_group.travel_times.estimate_end_time
                          }
                        </React.Fragment>
                      } primary={"Stop for " + attraction.estimate_time + " min"}/>
                    </ListItemSecondaryAction>
                    {/*<Typography variant="body2">{"Stop for " + attraction.estimate_time + " min"}</Typography>*/}
                  </ListItem>
              ))
              }
            </div>
          ))
        }
        <ListItem className={classes.listItem}>
          <ListItemText primary="Total Driving Time" />
          <Typography variant="subtitle1" className={classes.total}>
            {totalTime}
          </Typography>
        </ListItem>
      </List>
    </React.Fragment>
  );
}

const places = [
  {latitude: 25.8103146,longitude: -80.1751609},
  {latitude: 27.9947147,longitude: -82.5943645},
  {latitude: 28.4813018,longitude: -81.4387899}
]