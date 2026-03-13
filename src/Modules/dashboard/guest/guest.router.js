import express from 'express';
import * as guestController from './guest.controller.js';

const router = express.Router();

// Guest routes
router.get('/', guestController.getAllGuests);
router.get('/:id', guestController.getGuestById);
router.post('/register', guestController.createGuest);
router.post('/login', guestController.loginGuest);
router.put('/:id', guestController.updateGuest);
router.delete('/:id', guestController.deleteGuest);

export default router;
