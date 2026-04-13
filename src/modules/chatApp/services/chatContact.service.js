import {requestContactsPermission, saveContact} from '../api/chatContactsApi';
import {validateContactForm} from '../business/addContact.rules';

export async function addChatContact(values) {
  const validation = validateContactForm(values);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const permission = await requestContactsPermission('write');

  if (!permission.granted) {
    throw new Error(
      permission.blocked
        ? 'Contacts permission is disabled. Enable it from settings to add a contact.'
        : 'Contacts permission is required to add a contact.',
    );
  }

  await saveContact(validation.value);
  return validation.value;
}
