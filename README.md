# Parking Oriented Travel Planner
![Los Angeles](./Los_Angeles.jpg)

### Documents
* [Poster](./Poster.pdf)
* [Report](./Report.pdf)

### There are two folders:
* /CODE/frontend/: Front-end repository
* /CODE/backend/: Back-end repository

## Available on the Clould Server
* Our web application has deployed to the Heroku Web Server.
* Url: https://cse6242-frontend.herokuapp.com/
* Note: This web container is free, so it will be shut down after long idle. Please expect about 30 seconds for the server to reup.

## Environment
* Please install npm before building the project.

## Front-End
* Build: $npm install
* Execute: $npm run start
* Front-End port: http://localhost:3000
* Note: Front-End will send query to the cloud server, not the local backend.

## Back-End
* Build: $npm install
* Execute: $DEBUG=express-locallibrary-tutorial:* npm run devstart
* Back-End port: http://localhost:4000
* You can test the backend connection with http://127.0.0.1:4000/travel-planner (HTTP GET)