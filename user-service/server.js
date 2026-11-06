
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const DB_FILE = path.join(__dirname, 'users.json');

app.use(express.json());

// Read database
function readUsers() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Write database
function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

// GET all users
app.get('/users', (req, res) => {
    res.json(readUsers());
});

// POST new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: 'Name and email are required'
        });
    }

    const users = readUsers();

    const newUser = {
        id: users.length
            ? Math.max(...users.map(u => u.id)) + 1
            : 1,
        name,
        email
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json(newUser);
});

// PUT update user
app.put('/users/:id', (req, res) => {
    const users = readUsers();
    const id = Number(req.params.id);

    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'User not found'
        });
    }

    users[index] = {
        ...users[index],
        ...req.body,
        id
    };

    saveUsers(users);

    res.json(users[index]);
});

// DELETE user
app.delete('/users/:id', (req, res) => {
    const users = readUsers();
    const id = Number(req.params.id);

    const filteredUsers = users.filter(user => user.id !== id);

    if (filteredUsers.length === users.length) {
        return res.status(404).json({
            error: 'User not found'
        });
    }

    saveUsers(filteredUsers);

    res.json({
        message: 'User deleted successfully'
    });
});

// Invalid routes
app.use((req, res) => {
    res.status(404).json({
        error: 'User route not found'
    });
});

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
