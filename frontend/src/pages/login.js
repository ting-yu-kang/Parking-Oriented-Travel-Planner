import React, { Component } from 'react'
import PropTypes from 'prop-types'

import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import AppIcon from '../images/favicon.ico'

const styles = {
    form: {
        textAlign: 'center'
    },
    image: {
        margin: '20px auto 20px auto'
    }
}

class login extends Component {
    render() {
        const { classes } = this.props
        return (
            < Grid container className={classes.form}>
                < Grid item sm/>
                < Grid item sm>
                    <img src={AppIcon} alt="App icon" className={classes.image} />
                    < Typography variant='h2' className={classes.pageTitle}>
                        Login
                    </Typography>
                </Grid>
                < Grid item sm/>
            </Grid>
        )
    }
}

login.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(login)