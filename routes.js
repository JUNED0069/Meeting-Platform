const routes = require("next-routes")();

routes
    .add("userPage", '/details', 'userPage')
    .add("videoMeet/conference", '/userPage/meet', 'videoMeet/conference');

module.exports = routes;
