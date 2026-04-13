import React from 'react';
import AddContactView from '../components/AddContactView';
import useAddContact from '../hooks/useAddContact';

export default function AddContactScreen() {
  const addContact = useAddContact();

  return <AddContactView {...addContact} />;
}
