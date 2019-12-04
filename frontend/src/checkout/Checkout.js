import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import CategoryForm from './CategoryForm';
import DetailForm from './DetailForm';
import Review from './Review';
import RestaurantForm from './RestaurantForm';
import axios from 'axios';

//import TEMPsetp1input from '../data/setp1input.json'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        996 Studio
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    paddingTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.up(1200 + theme.spacing(1) * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto'
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

const steps = ['Destination categories', 'Places to visit', 'Restaurant choice', 'Journey summary'];


export default function Checkout(props) {
  const classes = useStyles();
  // initialize the starting state
  const [activeStep, setActiveStep] = React.useState(0);
  const [intervalId, setIntervalId] = React.useState();
  const [step0result, setStep0result] = React.useState();
  const [step1input, setStep1input] = React.useState();
  const [step2output, setStep2output] = React.useState();
  const [step3input, setStep3input] = React.useState();
  const [stepRinput, setStepRinput] = React.useState();
  const [RLunch, setRLunch] = React.useState();
  const [RDinner, setRDinner] = React.useState();
  const [timeList, setTimeList] = React.useState(new Map());
  const [departureTime, setDepartureTime] = React.useState('07:30');

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <CategoryForm func = {setStep0result}/>;
      case 1:
        return <DetailForm data = {step1input} data2 = {step2output} func = {handleStep2output} func2 = {handleDepartureTime}/>;
      case 2:
        return <RestaurantForm data = {step3input} func = {setStepRinput} func2 = {setRLunch} func3 = {setRDinner}/>;
      case 3: 
        return <Review data = {stepRinput} data2 = {step3input} lunch = {RLunch} dinner = {RDinner}/>;
      default:
        throw new Error('Unknown step');
    }
  }

  const handleDepartureTime = (time) => {
    var t = time.split(':')
    var hr = parseInt(t[0])
    var min = parseInt(t[1])
    setDepartureTime(time)
    if (step2output){
      var newStep2 = JSON.parse(step2output)
      newStep2["departure_time"] = [hr,min]
      //console.log(newStep2)
      setStep2output(JSON.stringify(newStep2))
      //step2output["departure_time"] = [hr,min]
    }
    else {
      var newStep2 = {
        "departure_time": [hr,min],
        "attraction_groups": []
      }
      //console.log(newStep2)
      setStep2output(JSON.stringify(newStep2))
    }
  }

  const handleStep2output = (places, time) => {
    //console.log(places)
    //console.log(time)
    for (var key in time){
      setTimeList(new Map(timeList.set(key, time[key])))
    }

    if (places) {
      var attraction_groups = step1input.attraction_groups
      var new_attraction_groups = []
      if (step2output){
        new_attraction_groups = step2output.attraction_groups || []
        // console.log("step2output exists")
      }
      attraction_groups.forEach(element => {
        var parketing_lot_name = element.parking_lot.name
        //console.log(places[parketing_lot_name], parketing_lot_name, places)
        if (places[parketing_lot_name]){
          //console.log(places[parketing_lot_name])
          var placesList = places[parketing_lot_name]
          var attractionList = []

          element.attractions.forEach(attraction => {
            if (placesList.indexOf(attraction.name) !== -1){
              var name = attraction.name
              if (timeList.get(name)){
                attraction.estimate_time = parseInt(timeList.get(name))
              }
              else{
                attraction.estimate_time = 30
              }
              attractionList.push(attraction)
            }
          })
          
          var isFound = false
          new_attraction_groups.forEach((parkingLotArea, index) => {
            if (parkingLotArea.name == parketing_lot_name){
              new_attraction_groups[index]["attractions"] = attractionList
              isFound = true
            }
          })

          if (!isFound){
            var parking_lot_area = {
              "parking_lot": element.parking_lot,
              "attractions": attractionList
            }
            new_attraction_groups.push(parking_lot_area)
          }

        }
      });
      //console.log(new_attraction_groups)
      var t = departureTime.split(':')
      var hr = parseInt(t[0])
      var min = parseInt(t[1])
      var newStep2 = {
        "departure_time": [hr, min],
        "attraction_groups": new_attraction_groups
      }
      console.log(newStep2)
      setStep2output(JSON.stringify(newStep2))
    }
    else {
      console.log('not ready yet')
    }
  }

  const handleNext = () => {
    var handleWelcomeText = props.setWelcomeVisible;
    scrollToTop()
    if (activeStep == 0){
        handleWelcomeText(false)
        console.log(step0result)
        let userData = {
          "attraction_categories": step0result
        }

        fetch('https://cse6242-backend.herokuapp.com/travel-planner/1-get-attraction-groups', 
          {
            method:'POST',
            body: JSON.stringify(userData),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            }
        }).then(
          result => {
            return result.json()
          }).then(data => {
            //console.log(data)
            setStep1input(data)
          })
      }
    else if (activeStep == 1){
      fetch('https://cse6242-backend.herokuapp.com/travel-planner/2-get-route-restaurant/', 
        {
          method:'POST',
          body: step2output, // check when server back if page 3 is loaded properly
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
      }).then(
        result => {
          return result.json()
        }).then(data => {
          //console.log(data)
          setStep3input(data)
        })
    }
    setActiveStep(activeStep + 1);
    
  };

  const scrollToTop = () => {
    console.log(window.pageYOffset )
    window.scroll(0, - window.pageYOffset);
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
          {activeStep === steps.length ? ("Hope to see you soon") : ("Tailor your next journey")}
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Thank you for planning your next trip with us!
                </Typography>
                <Typography variant="subtitle1">
                  Hope you have a wonderful trip.
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep)}
                <div className={classes.buttons}>
                  {activeStep !== 0 && (
                    <Button onClick={handleBack} className={classes.button}>
                      Back
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Ready to go' : 'Next'}
                  </Button>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
        <Copyright />
      </main>
    </React.Fragment>
  );
}