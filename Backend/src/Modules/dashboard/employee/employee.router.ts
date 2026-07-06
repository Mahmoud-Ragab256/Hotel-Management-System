import express from 'express';
import * as employeeController from './employee.controller.js';
import upload from '../../../utils/upload.middleware.js';

const router = express.Router();

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/register', employeeController.createEmployee);
router.post('/login', employeeController.loginEmployee);
router.put('/:id/status', employeeController.setEmployeeActiveStatus);
router.put('/:id/inactive', employeeController.setEmployeeInactive);
router.put('/:id', upload.single("avatar"), employeeController.updateEmployee);
router.get('/:id/avatar', employeeController.getProfileImage);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
