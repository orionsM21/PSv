import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, useWindowDimensions, TouchableOpacity, Alert, ActivityIndicator, PermissionsAndroid } from 'react-native';
// import Voice from '@react-native-voice/voice';

// First route component
const FirstRoute = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [field3, setField3] = useState('');
  const [field4, setField4] = useState('');
  const [field5, setField5] = useState('');
  const [field6, setField6] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);  // To show error if speech recognition fails
  const [progress, setProgress] = useState(0);  // To track progress
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Start voice recognition when component mounts
  const startListening = () => {
    // Voice.start('en-US');
    setIsListening(true);
  };

  // Stop voice recognition
  const stopListening = () => {
    // Voice.stop();
    setIsListening(false);
  };

  // Handle errors in voice recognition
  const onSpeechError = (e) => {
    setIsError(true);
    Alert.alert('Voice Recognition Error', 'There was an issue with recognizing your speech.');
    console.log(e.error);
  };

  // Handle results from voice recognition
  const badWords = [
    'gandu', 'madarchod', 'bhosdi ke', 'bhenchod', 'teri maa ki choot', 'bahan ke loade'
  ];

  const onSpeechResults = (e) => {
    const spokenText = e.value[0].toLowerCase();
    // console.log('Recognized Speech:', spokenText);

    // Check if any bad word is present in the spoken text
    if (badWords.some(badWord => spokenText.includes(badWord))) {
      Alert.alert("Gaali ko paper pe likh aur dal le apne ..... mein");
    } else {
      // Detect name and update the name field
      if (spokenText.includes('my name is')) {
        const nameMatch = spokenText.match(/my name is (\w+)/i); // Capture the name after "my name is"
        if (nameMatch && nameMatch[1]) {
          setName(nameMatch[1]);
        }
      }

      // Handle the status input specifically
      if (spokenText.includes('active') || spokenText.includes('inactive')) {
        setStatus(spokenText);
      }

      // Command for moving to the next field
      if (spokenText.includes('next') || spokenText.includes('next field')) {
        moveToNextField();
      }
    }

    // Handle the start and stop commands
    if (spokenText.includes('start') && !isListening) {
      startListening();
    } else if (spokenText.includes('stop') && isListening) {
      stopListening();
    } else if (spokenText.includes('field 1')) {
      inputRefs[0].current.focus();
    } else if (spokenText.includes('field 2')) {
      inputRefs[1].current.focus();
    } else if (spokenText.includes('field 3')) {
      inputRefs[2].current.focus();
    } else if (spokenText.includes('field 4')) {
      inputRefs[3].current.focus();
    } else if (spokenText.includes('field 5')) {
      inputRefs[4].current.focus();
    } else if (spokenText.includes('field 6')) {
      inputRefs[5].current.focus();
    }
  };

  // Move focus to the next field
  const moveToNextField = () => {
    const currentIndex = inputRefs.findIndex(ref => ref.current && ref.current.isFocused());
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % inputRefs.length;
    inputRefs[nextIndex].current.focus();
  };

  // Update progress
  useEffect(() => {
    const totalFields = 6;
    const filledFields = [name, status, field3, field4, field5, field6].filter(field => field.length > 0).length;
    setProgress((filledFields / totalFields) * 100);
  }, [name, status, field3, field4, field5, field6]);

  // Start listening when component mounts and keep it active
  useEffect(() => {
    // Voice.onSpeechResults = onSpeechResults;
    // Voice.onSpeechError = onSpeechError;

    startListening();

    return () => {
      // Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);  // Runs once when the component mounts

  const handleInputChange = (fieldName, value) => {
    if (isListening) {
      startListening();  // Restart listening if needed
    }
    // Update the respective state
    switch (fieldName) {
      case 'name':
        setName(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'field3':
        setField3(value);
        break;
      case 'field4':
        setField4(value);
        break;
      case 'field5':
        setField5(value);
        break;
      case 'field6':
        setField6(value);
        break;
    }
  };


  const requestAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Audio Permission",
          message: "This app needs access to your microphone to recognize speech.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Audio permission granted");
      } else {
        console.log("Audio permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestAudioPermission();
  }, []);

  
  return (
    <View style={{ flex: 1, backgroundColor: '#ddd', padding: 16 }}>
      {/* Voice feedback */}
      {/* <TouchableOpacity onPress={isListening ? stopListening : startListening}>
        <Text style={styles.voiceButton}>{isListening ? 'Stop Listening' : 'Start Listening'}</Text>
      </TouchableOpacity>
      {isError && <Text style={styles.errorText}>Voice recognition error occurred</Text>} */}

      {/* Form Fields */}
      <TextInput
        ref={inputRefs[0]}
        placeholder="Enter a Text"
        placeholderTextColor="#888"
        style={styles.input}
        value={name}
        onChangeText={(value) => handleInputChange('name', value)}
      />
      <TextInput
        ref={inputRefs[1]}
        placeholder="Enter Status"
        placeholderTextColor="#888"
        style={styles.input}
        value={status}
        onChangeText={(value) => handleInputChange('status', value)}
      />
      <TextInput
        ref={inputRefs[2]}
        placeholder="Field 3"
        placeholderTextColor="#888"
        style={styles.input}
        value={field3}
        onChangeText={(value) => handleInputChange('field3', value)}
      />
      <TextInput
        ref={inputRefs[3]}
        placeholder="Field 4"
        placeholderTextColor="#888"
        style={styles.input}
        value={field4}
        onChangeText={(value) => handleInputChange('field4', value)}
      />
      <TextInput
        ref={inputRefs[4]}
        placeholder="Field 5"
        placeholderTextColor="#888"
        style={styles.input}
        value={field5}
        onChangeText={(value) => handleInputChange('field5', value)}
      />
      <TextInput
        ref={inputRefs[5]}
        placeholder="Field 6"
        placeholderTextColor="#888"
        style={styles.input}
        value={field6}
        onChangeText={(value) => handleInputChange('field6', value)}
      />
      {/* <View style={styles.progressBar}>
        <Text>Form Completion: {Math.round(progress)}%</Text>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View> */}
    </View>
  );
};

// Second route component

// Define the routes for tabs

// Render scenes

// VOiceCOmmand component

// Styles
const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#000',
    marginBottom: 12,
  },
  voiceButton: {
    backgroundColor: '#4caf50',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    marginTop: 20,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default FirstRoute;


















// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   PermissionsAndroid,
//   Animated,
// } from 'react-native';
// import Voice from '@react-native-voice/voice';

// // First Route Component
// const FirstRoute = () => {
//   const [name, setName] = useState('');
//   const [status, setStatus] = useState('');
//   const [field3, setField3] = useState('');
//   const [field4, setField4] = useState('');
//   const [field5, setField5] = useState('');
//   const [field6, setField6] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [progress, setProgress] = useState(new Animated.Value(0));

//   const inputRefs = Array.from({ length: 6 }, () => useRef(null));

//   const startListening = () => {
//     Voice.start('en-US');
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     Voice.stop();
//     setIsListening(false);
//   };

//   const handleCommand = (command) => {
//     const lowerCommand = command.toLowerCase();

//     // Check for bad words
//     const badWords = ['gandu', 'madarchod', 'bhosdi ke'];
//     if (badWords.some((word) => lowerCommand.includes(word))) {
//       Alert.alert('Warning', 'Please avoid using inappropriate language!');
//       return;
//     }

//     // Commands for form fields
//     if (lowerCommand.includes('next field')) moveToNextField();
//     if (lowerCommand.includes('field 1')) inputRefs[0].current.focus();
//     if (lowerCommand.includes('field 2')) inputRefs[1].current.focus();
//     if (lowerCommand.includes('field 3')) inputRefs[2].current.focus();

//     // Handle name input
//     if (lowerCommand.includes('my name is')) {
//       const nameMatch = lowerCommand.match(/my name is (\w+)/);
//       if (nameMatch) setName(nameMatch[1]);
//     }

//     // Status input
//     if (lowerCommand.includes('active') || lowerCommand.includes('inactive')) {
//       setStatus(lowerCommand);
//     }
//   };

//   const onSpeechResults = (e) => {
//     if (e.value && e.value[0]) {
//       handleCommand(e.value[0]);
//     }
//   };

//   const onSpeechError = (e) => {
//     Alert.alert('Voice Recognition Error', e.error.message);
//     setIsListening(false);
//   };

//   const moveToNextField = () => {
//     const currentIndex = inputRefs.findIndex((ref) => ref.current && ref.current.isFocused());
//     const nextIndex = (currentIndex + 1) % inputRefs.length;
//     inputRefs[nextIndex].current.focus();
//   };

//   useEffect(() => {
//     Voice.onSpeechResults = onSpeechResults;
//     Voice.onSpeechError = onSpeechError;

//     return () => {
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, []);

//   useEffect(() => {
//     const totalFields = 6;
//     const filledFields = [name, status, field3, field4, field5, field6].filter((f) => f).length;
//     const progressValue = (filledFields / totalFields) * 100;

//     Animated.timing(progress, {
//       toValue: progressValue,
//       duration: 500,
//       useNativeDriver: false,
//     }).start();
//   }, [name, status, field3, field4, field5, field6]);

//   const requestAudioPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
//         title: 'Audio Permission',
//         message: 'This app needs access to your microphone to recognize speech.',
//         buttonNeutral: 'Ask Me Later',
//         buttonNegative: 'Cancel',
//         buttonPositive: 'OK',
//       });
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Audio permission granted');
//       } else {
//         console.log('Audio permission denied');
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   useEffect(() => {
//     requestAudioPermission();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={isListening ? stopListening : startListening} style={[styles.voiceButton, isListening && styles.voiceButtonActive]}>
//         <Text style={styles.voiceButtonText}>{isListening ? 'Stop Listening' : 'Start Listening'}</Text>
//       </TouchableOpacity>

//       {['name', 'status', 'field3', 'field4', 'field5', 'field6'].map((field, index) => (
//         <TextInput
//           key={index}
//           ref={inputRefs[index]}
//           placeholder={`Enter ${field}`}
//           placeholderTextColor="#888"
//           style={styles.input}
//           value={eval(field)}
//           onChangeText={(value) => eval(`set${field.charAt(0).toUpperCase() + field.slice(1)}`)(value)}
//         />
//       ))}

//       <View style={styles.progressBar}>
//         <Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ddd',
//     padding: 16,
//   },
//   input: {
//     height: 40,
//     borderColor: '#888',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     color: '#000',
//     marginBottom: 12,
//   },
//   voiceButton: {
//     backgroundColor: '#4caf50',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   voiceButtonActive: {
//     backgroundColor: '#f44336',
//   },
//   voiceButtonText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   progressBar: {
//     height: 10,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 5,
//     marginTop: 20,
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#4caf50',
//     borderRadius: 5,
//   },
// });

// export default FirstRoute;
