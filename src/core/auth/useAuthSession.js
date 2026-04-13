import {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';

import {resolveActiveChatSession} from '../../modules/chatApp/services/chatIdentity.service';

export default function useAuthSession() {
  const [uid, setUid] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (!active) {
        return;
      }

      if (!user?.uid) {
        setUid(null);
        setInitializing(false);
        return;
      }

      try {
        const session = await resolveActiveChatSession(user.uid);

        if (!active) {
          return;
        }

        setUid(session?.uid || null);
      } catch {
        if (!active) {
          return;
        }

        setUid(null);
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {uid, initializing};
}
