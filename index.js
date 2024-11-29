const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render("Home Page");
});

app.get('/signup', (req, res) => {
    res.render("Sign Up");
});

app.get('/login', (req, res) => {
    res.render("Login");
});

app.get('/singapore-flights', (req, res) => {
    res.render("Singapore Flights");
});

app.get('/cebu-flights', (req, res) => {
    res.render("Cebu Flights");
});

app.get('/manila-flights', (req, res) => {
    res.render("Manila Flights");
});

app.get('/flight-selection', (req, res) => {
    res.render("Flight Selection");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});