const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const app = express();
const exphbs  = require('express-handlebars');



// Configure PostgreSQL connection
const pool = new pg.Pool({
    user: 'krhypwqm',
    host: 'suleiman.db.elephantsql.com',
    database: 'krhypwqm',
    password: '0s9wUh-JU1SkxoXswFTv_zGYlicaX2Pp',
    port: 5432
});

pool.query(
    `CREATE TABLE IF NOT EXISTS users (
           id SERIAL             PRIMARY KEY,
           name VARCHAR(255)     NOT NULL,
           email VARCHAR(255)    NOT NULL UNIQUE,
           created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
        );`
    );


app.use(express.static("./public/"));

// Define a custom Handlebars helper function to format dates
const hbs = exphbs.create({
    helpers: {
        formatDate: function (date) {
            return date.toLocaleDateString();
        }
    },
    extname:".hbs"
});

// Register handlebars as the rendering engine for views
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");


// Use body-parser middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve the HTML form
app.get('/update-user', (req, res) => {

    const id = req.query.id;

    pool.query(`SELECT * FROM users WHERE id = ${id}`, (error, results) => {
        // Handle any errors that occur
        if (error) {
            console.error(error);
            res.status(500).send('Internal server error');
            return;
        }
        // Render the 'index' template with the list of users as a context object
        res.render('edit', { users: results.rows[0], layout:false });
    });
    
});




// Update user data in database
app.post('/update-user', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const email = req.body.email;
  
    // Update user data in database
    const result = pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email,id],

    (error) => {
        if (error) {
            console.log(error); res.status(500).json({ message: 'Error Updating data into PostgreSQL' });
        } else {
            res.redirect("/");
        }
    });

  });

// Delete user data in database
app.get('/delete-user', (req, res) => {
    const id = req.query.id;
  
    // Delete user data from database
    const result = pool.query(
    'DELETE FROM users WHERE id = $1',
    [id],

    (error) => {
        if (error) {
            console.log(error); res.status(500).json({ message: 'Error Delete data from PostgreSQL' });
        } else {
            res.redirect("/");
        }
    });

  });

// Handle form submission
app.post('/insert-user', (req, res) => {
    const { name, email } = req.body;
    // Insert data into PostgreSQL
    pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        [name, email],
        (error, results) => {
            if (error) {
                console.log(error); res.status(500).json({ message: 'Error inserting data into PostgreSQL' });
            } else {
                res.redirect("/");
            }
        });
});


app.get('/', (req, res) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        // Handle any errors that occur
        if (error) {
            console.error(error);
            res.status(500).send('Internal server error');
            return;
        }
        // Render the 'index' template with the list of users as a context object
        res.render('index', { users: results.rows, layout:false });
    });
});


// Start the server
app.listen(5000, () => {
    console.log('Server started on http://localhost:5000');
});