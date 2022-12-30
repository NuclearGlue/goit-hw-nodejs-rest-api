const express = require('express');
const ctrlContact = require('../../controllers/controller.js');

const router = express.Router();

router.get('/', ctrlContact.getAll);

router.get('/:contactId', ctrlContact.getContactById);

router.post('/', ctrlContact.addNewContact);

router.put('/:contactId', ctrlContact.updateContact);

router.delete('/:contactId', ctrlContact.deleteContact);

router.patch('/:contactId/favorite', ctrlContact.updateContactStatus);

module.exports = router;
