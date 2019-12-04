import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import './App.css';

// MUI Theme
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import pink from '@material-ui/core/colors/pink'
import CssBaseline from '@material-ui/core/CssBaseline';

// Components
import Navbar from './components/Navbar'
//import checkout from './checkout/Checkout'
import Form from './pages/form'

// Pages
import home from './pages/home'
import login from './pages/login'
import signup from './pages/signup'

const theme = createMuiTheme({
  palette: {
    primary: pink,
  },
  typography: {
    useNextVariants: true,
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundImage:
            "url(" + require('./images/la_6.jpg') + ")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          height: "200%",
          marginTop: "-80px",
        },
        html: {
          height: "100%"
        },
      }
    }
  }
})

class App extends Component {
  
  render () {
    const supportHistory = 'pushState' in window.history
    return (
      //<div className="App">
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Router forceRefresh={!supportHistory}>
            {/*<Navbar></Navbar>*/}
            <div className='container'>
              <Switch>
                <Route exact path='/' component={Form}/>
              </Switch>
            </div>
          </Router>
        </MuiThemeProvider>
    //</div>
    )
  }
}

export default App;
