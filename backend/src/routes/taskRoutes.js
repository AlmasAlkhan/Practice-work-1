const express = require('express');
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { taskSchema } = require('../validators/schemas');

const router = express.Router();

router.use(auth);

router.post('/', validate(taskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', validate(taskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
