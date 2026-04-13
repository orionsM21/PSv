import {signInToChat} from '../api/chatAuthApi';
import {validateChatPhone} from '../business/chatAuth.rules';

export async function loginToChat(userId) {
  const validation = validateChatPhone(userId);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return signInToChat({
    phone: validation.value,
  });
}
