import React, { Component } from 'react'
import PropTypes from 'prop-types'

import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Checkout from '../checkout/Checkout'

const styles = {
    form: {
        textAlign: 'center'
    },
    image: {
        margin: '20px auto 20px auto'
    }
}

class form extends Component {
    constructor(props) {
        super(props)
        this.state = {
            displayWelcome: true
        }
    }

    componentDidMount() {
    }
    
    setWelcomeVisible = (arg) => {
        console.log(arg)
        this.setState({
            displayWelcome: arg
        })
    }

    render() {
        return (
            <div>
                {this.state.displayWelcome === true ? (
                    <div style={{ textAlign: 'left', paddingTop: '60px'}}>
                        <Typography variant="h2" color="primary" gutterBottom style={{fontWeight: "bold"}}>
                            Good morning!
                        </Typography>
                        <Typography variant="h2" color="primary" style={{color:"white", fontWeight: "bold"}}>
                            Where you feel like going today?
                        </Typography>
                    </div>
                ) : (<div></div>)}
                <Checkout setWelcomeVisible = {this.setWelcomeVisible}/>
            </div>
            
        )
    }
}

form.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(form)