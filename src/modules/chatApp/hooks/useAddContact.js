import {useCallback, useMemo, useState} from 'react';
import {Linking} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {addChatContact} from '../services/chatContact.service';

export default function useAddContact() {
  const navigation = useNavigation();
  const route = useRoute();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canOpenSettings = useMemo(
    () => error.toLowerCase().includes('settings'),
    [error],
  );

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await addChatContact({name, phone});
      route?.params?.onGoBack?.();
      navigation.goBack();
    } catch (submitError) {
      setError(submitError?.message || 'Unable to add this contact.');
    } finally {
      setLoading(false);
    }
  }, [name, navigation, phone, route?.params]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    name,
    phone,
    loading,
    error,
    canOpenSettings,
    onNameChange: setName,
    onPhoneChange: setPhone,
    onSubmit: handleSubmit,
    onOpenSettings: handleOpenSettings,
    onBack: handleBack,
  };
}
