const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const frontendPath = path.join(__dirname, '../frontend');

if (!fs.existsSync(path.join(frontendPath, 'index.html'))) {
  console.error('Frontend not found at:', frontendPath);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    frontend: fs.existsSync(path.join(frontendPath, 'index.html')),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
