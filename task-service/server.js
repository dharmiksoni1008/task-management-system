
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

const DB_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());

// Read tasks from JSON database
function readTasks() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Save tasks to JSON database
function saveTasks(tasks) {
    fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// GET all tasks
app.get('/tasks', (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            error: 'Could not read tasks database'
        });
    }
});

// POST create new task
app.post('/tasks', (req, res) => {
    try {
        const { title, description, completed = false } = req.body;

        if (!title) {
            return res.status(400).json({
                error: 'Task title is required'
            });
        }

        const tasks = readTasks();

        const newTask = {
            id: tasks.length
                ? Math.max(...tasks.map(task => task.id)) + 1
                : 1,
            title,
            description: description || '',
            completed
        };

        tasks.push(newTask);
        saveTasks(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({
            error: 'Could not create task'
        });
    }
});

// PUT update existing task
app.put('/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();
        const id = Number(req.params.id);

        const index = tasks.findIndex(task => task.id === id);

        if (index === -1) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        tasks[index] = {
            ...tasks[index],
            ...req.body,
            id
        };

        saveTasks(tasks);

        res.json({
            message: 'Task updated successfully',
            task: tasks[index]
        });
    } catch (error) {
        res.status(500).json({
            error: 'Could not update task'
        });
    }
});

// DELETE task
app.delete('/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();
        const id = Number(req.params.id);

        const filteredTasks = tasks.filter(task => task.id !== id);

        if (filteredTasks.length === tasks.length) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        saveTasks(filteredTasks);

        res.json({
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Could not delete task'
        });
    }
});

// Invalid routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Task route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Task Service running on port ${PORT}`);
});
