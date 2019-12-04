import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import NestedList from './NestedList'

export default function DetailBlock(props) {
    var item = props.item
    var handleData = props.handleData
    var handleSelection = props.handleSelection
    var handleMouseOver = props.handleMouseOver
    var handleMouseOut = props.handleMouseOut
    return (
        <React.Fragment>
            <Grid container spacing={3} style={{width: "100%"}}>
                {
                // each NestedList is a parking lot with surrounding attractions
                }
                <NestedList 
                    item = {item} 
                    handleData={handleData} 
                    handleSelection={handleSelection}
                    handleMouseOver={handleMouseOver}
                    handleMouseOut={handleMouseOut}
                />
            </Grid>
        </React.Fragment>
    );
}