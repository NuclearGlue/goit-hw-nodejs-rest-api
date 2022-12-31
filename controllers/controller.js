const {
  Contact,
  addValidate,
  updateValidate,
  updateStatus,
} = require('../models/contacts');

const getAll = async (req, res, next) => {
  try {
    const allContacts = await Contact.find();
    res.status(200).json(allContacts);
  } catch (e) {
    res.status(404).json({ message: 'No contacts found' });
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      throw new Error();
    }
    res.status(200).json(contact);
  } catch (e) {
    res.status(404).json({ message: 'Contact with such id not found!' });
    next(e);
  }
};

const addNewContact = async (req, res, next) => {
  const { error } = addValidate.validate(req.body);

  try {
    if (error) {
      throw error;
    }
    const contact = await Contact.create(req.body);
    if (!contact) {
      throw new Error('This contact is already in your contact list');
    }
    res.status(201).json({ contact: contact });
  } catch (e) {
    res.status(400).json({ message: e.message });
    next(e);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.contactId);
    if (!contact) {
      throw new Error();
    }
    res.status(200).json({ message: 'Success! Contact deleted!' });
  } catch (e) {
    res.status(404).json({ message: 'Contact with such index not found!' });
    next();
  }
};

const updateContact = async (req, res, next) => {
  const { error, value } = updateValidate.validate(req.body);
  try {
    if (error || Object.keys(value).length === 0) {
      const message = error ? error.message : 'Some fields are missing';
      res.status(400).json(message);
      return;
    }
    const contact = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
    );
    if (contact === null) {
      throw new Error('Not found');
    }
    res.json(await Contact.findById(req.params.contactId));
  } catch (e) {
    res.status(404).json({ message: e.message });
    next(e);
  }
};

const updateContactStatus = async (res, req, next) => {
  const { error } = updateStatus.validate(req.body);
  try {
    if (error || Object.keys(value).length === 0) {
      const message = error ? error.message : 'Some fields are missing';
      res.status(400).json(message);
      return;
    }
    const contact = await Contact.findByIdAndUpdate(req.params.contactId, {
      favorite: req.body.favorite,
    });
    if (contact === null) {
      throw new Error('Not found');
    }
    res.json(await Contact.findById(req.params.contactId));
  } catch (e) {
    res.status(404).json({ message: e.message });
    next(e);
  }
};

module.exports = {
  getAll,
  getContactById,
  addNewContact,
  deleteContact,
  updateContact,
  updateContactStatus,
};
