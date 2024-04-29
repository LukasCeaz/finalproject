const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const csurf = require('csurf');
const sanitizeHtml = require('sanitize-html');

const app = express();
const PORT = process.env.PORT || 3000;
//Setting EJS as the view engine, there was unfortunately not another way to make csrf tokens save and be transferred to the HTML form
app.set('view engine', 'ejs');

// MySQL connection
const connection = mysql.createConnection({
host: 'localhost',
user: 'ceazz',
password: 'HomeBeans123',
database: 'all_inventory'
});
connection.connect();

//CSRF protection
const csrfProtection = csurf({ cookie: true });

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(csrfProtection);

//Routes
//Home page
app.get('/', (req, res) => {
//Renders the index.ejs file and pass the CSRF token value to the template
res.render('index', { csrfToken: req.csrfToken() });
});

//Adds a new item to the table
app.post('/add-item', (req, res) => {
const { item_name, item_quantity } = req.body;
connection.query('INSERT INTO current_inventory (item_name, item_quantity) VALUES (?, ?)', [item_name, item_quantity], (error, result) => {
if (error) {
console.error('Error adding item:', error);
res.status(500).send('Error adding item');
} else {
res.send(`<script>alert("Item added: ${item_name}, Quantity: ${item_quantity}"); window.location.href = '/';</script>`);
}
});
});

//Displays all items in the table
app.get('/items', (req, res) => {
connection.query('SELECT * FROM current_inventory', (error, results) => {
if (error) {
console.error('Error fetching items:', error);
res.status(500).send('Error fetching items');
} else {
res.send(results);
}
});
});

//Remove an item
app.post('/remove-item', (req, res) => {
    const { item_id } = req.body;
    connection.query('DELETE FROM current_inventory WHERE id = ?', [item_id], (error, result) => {
if (error) {
console.error('Error removing item:', error);
res.status(500).send('Error removing item');
} else {
res.send(`<script>alert("Item with ID ${item_id} removed."); window.location.href = '/';</script>`);
}
});
});

//Edit an item
app.post('/edit-item', (req, res) => {
const { item_id, item_name, item_quantity } = req.body;
connection.query('UPDATE current_inventory SET item_name = ?, item_quantity = ? WHERE id = ?', [item_name, item_quantity, item_id], (error, result) => {
if (error) {
console.error('Error editing item:', error);
res.status(500).send('Error editing item');
} else {
res.send(`<script>alert("Item with ID ${item_id} edited: ${item_name}, Quantity: ${item_quantity}"); window.location.href = '/';</script>`);
}
});
});

//Starts the server
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});