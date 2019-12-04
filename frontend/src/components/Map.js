/* global google */
import React from "react";
import {
  withGoogleMap,
  GoogleMap,
  withScriptjs,
  Marker,
  DirectionsRenderer,
  InfoWindow
} from "react-google-maps";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import { width } from "@material-ui/system";
import { Circle } from "react-google-maps"
import mapStyle from '../styles/mapStyle'

//const { DrawingManager } = require("react-google-maps/lib/components/drawing/DrawingManager");

class MapDirectionsRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      directions: null,
      error: null,
      length: 0
    };
  }

  componentDidMount() {
    console.log(this.props.places)
    const { places, travelMode, navigate } = this.props;
    //console.log('navigate',navigate)
    if (navigate){
      if (this.props.places.length > 0){
        this.findNavigationRoute(places, travelMode)
      }
    }
    }

  componentDidUpdate(prevProps, prevState) {
      //console.log(this.props.places, this.state.places)
      if (this.props.places !== this.state.places) {
        const { places, travelMode } = this.state;
        this.setState({
          length: this.props.places.length,
          places: this.props.places,
        }, () => {
          if (this.props.navigate && this.state.places.length > 0) {
            this.findNavigationRoute(this.state.places, this.props.travelMode)
          }
        })
      }
      return null
    }

    findNavigationRoute = (places, travelMode) => {
      const waypoints = places.map(p =>({
          location: {lat: p.latitude, lng:p.longitude},
          stopover: true
      }))
      const origin = waypoints.shift().location;
      const destination = waypoints.pop().location;

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: travelMode,
          waypoints: waypoints,
          avoidHighways: true,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            var onDirectionFound = this.props.onDirectionFound
            console.log(result)
            if (onDirectionFound !== undefined){
              onDirectionFound(result)
            }
            this.setState({
              directions: result
            });
          } else {
            this.setState({ error: result });
          }
        }
      );
    }

    render() {
      if (this.state.error) {
        return <h1>{this.state.error}</h1>;
      }
      return (
        <div>
          <div>
            {this.props.navigate ? (
              this.state.directions && <DirectionsRenderer directions={this.state.directions} />
            )
            :(
              this.props.navigationResult && <DirectionsRenderer directions={this.props.navigationResult} />
            )
            }
          </div>
          <div>
            {
              !this.props.navigate && this.props.navigationResult &&
              <Marker style={{ height: `15px`, zIndex: -100}} position={this.props.navigationResult.routes[ 0 ].legs[ 0 ].start_location} icon = {{
                    url: require('../images/blue_circle.svg'),
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20,20)
                  }}/>
            }
          </div>
          <div>
            {
              this.state.directions && 
              <Marker style={{ height: `15px`, zIndex: -100}} position={this.state.directions.routes[ 0 ].legs[ 0 ].start_location} icon = {{
                    url: require('../images/blue_circle.svg'),
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20,20)
                  }}/>
            }
          </div>
        </div>
        
        //this.state.directions && <DirectionsRenderer panel={document.getElementById('panel')} directions={this.state.directions} />
        )
    }
}

const Map = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultCenter={props.defaultCenter}
      defaultZoom={props.defaultZoom}
      defaultOptions={{styles: mapStyle}}
    >
      {
        props.markers ? (
          props.markers.map((marker, index) => {
            const position = { lat: marker.latitude, lng: marker.longitude };
            return props.navigate ? (null) : (
              <div key={'map_div' + index}>
                <Marker style={{ height: `15px` }} key={index} position={position} icon = {{
                  url: require('../images/parking.svg'),
                  scaledSize: new google.maps.Size(40, 40)
                }}/>
                <Circle
                  key={'circle' + index}
                  defaultCenter={position}
                  // radius in meter
                  radius= {500}
                  options={{
                    strokeWeight : 0,
                    fillColor: '#78CEAC'
                  }}
                />
              </div>
              )
          })
        ):(<div></div>)
      }
      {
        props.curLocation ? (
          <Marker style={{ height: `15px` }} position={{ lat: props.curLocation.latitude, lng: props.curLocation.longitude }} icon = {{
            url: require('../images/blue_circle.svg'),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15,15)
          }}/>
        ) : (<div></div>)
      }
      {
        props.markers_attraction ? (
          props.markers_attraction.map((marker, index) => {
            //console.log(marker)
            const position = { lat: marker.location.latitude, lng: marker.location.longitude };
            return props.navigate ? (null) : (
                <Marker 
                  style={{ height: `15px` }} 
                  key={'2'+index} 
                  position={position} 
                  icon = {{
                    url: require('../images/place.svg'),
                    scaledSize: new google.maps.Size(30, 30)
                  }}
                >
                  {props.mouseOver == marker.name ? (
                    <InfoWindow>
                      <div style={{'color':'black'}}>
                          {marker.name}
                      </div>
                    </InfoWindow>
                    )
                  :
                    (<div></div>)
                  }
                </Marker>
              );
          })
        ): (<div></div>)
      }
      {
        <MapDirectionsRenderer
          places={props.markers}
          travelMode={google.maps.TravelMode.DRIVING}
          navigate = {props.navigate}
          onDirectionFound = {props.func}
          navigationResult = {props.navigationResult}
        />
      }
 
      <div id="panel"></div>
    </GoogleMap>
  ))
);

export default Map;