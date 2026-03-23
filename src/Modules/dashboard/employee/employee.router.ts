import express from 'express';
import * as employeeController from './employee.controller.js';

const router = express.Router();

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/register', employeeController.createEmployee);
router.post('/login', employeeController.loginEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
