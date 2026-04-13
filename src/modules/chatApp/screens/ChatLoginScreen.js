import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import useAuthSession from '../../../core/auth/useAuthSession';
import {loginSuccess} from '../../../redux/moduleSlice';
import ChatLoginView from '../components/ChatLoginView';
import useChatLogin from '../hooks/useChatLogin';

export default function ChatLoginScreen() {
  const login = useChatLogin();
  const dispatch = useDispatch();
  const {uid, initializing} = useAuthSession();

  useEffect(() => {
    if (initializing || !uid) {
      return;
    }

    dispatch(loginSuccess({uid}));
  }, [dispatch, initializing, uid]);

  return <ChatLoginView {...login} />;
}
