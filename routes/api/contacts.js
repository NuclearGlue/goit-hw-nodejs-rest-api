const express = require('express');
const ctrlContact = require('../../controllers/controllerContact.js');

const authenticate = require('../../midlleware/authenticate.js');

const router = express.Router();

router.get('/', authenticate, ctrlContact.getAll);

router.get('/:contactId', authenticate, ctrlContact.getContactById);

router.post('/', authenticate, ctrlContact.addNewContact);

router.put('/:contactId', authenticate, ctrlContact.updateContact);

router.delete('/:contactId', authenticate, ctrlContact.deleteContact);

router.patch(
  '/:contactId/favorite',
  authenticate,
  ctrlContact.updateContactStatus,
);

module.exports = router;
