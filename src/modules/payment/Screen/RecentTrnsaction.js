// import {
//   StyleSheet,
//   Text,
//   Dimensions,
//   View,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import React, { useState } from 'react';

// const tabTitles = [
//   'All', 'Food', 'Travel', 'Shopping', 'Bills',
//   'Recharge', 'Health', 'Groceries', 'Education', 'Others',
// ];

// const { height } = Dimensions.get('screen');

// const RecentTrnsaction = () => {
//   const [activeTab, setActiveTab] = useState('All');

//   return (
//     <View style={styles.wrapper}>
//       {/* Tabs Section */}
//       <View style={styles.tabWrapper}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.tabContainer}
//         >
//           {tabTitles.map((title, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[
//                 styles.tab,
//                 activeTab === title && styles.activeTab,
//               ]}
//               onPress={() => setActiveTab(title)}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeTab === title && styles.activeTabText,
//                 ]}
//               >
//                 {title}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Content Section */}
//       <View style={styles.content}>
//         <Text style={styles.contentText}>Selected Tab: {activeTab}</Text>
//         {/* Additional content goes here */}
//       </View>

//       {/* Sort & Filter Button */}
//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.filterButton}>
//           <Text style={styles.filterButtonText}>⚙️ Sort & Filter</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default RecentTrnsaction;

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   tabWrapper: {
//     height: height * 0.08,
//     paddingTop: 10,
//   },
//   tabContainer: {
//     paddingHorizontal: 10,
//     alignItems: 'center',
//   },
//   tab: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     backgroundColor: '#eee',
//     marginRight: 10,
//   },
//   activeTab: {
//     backgroundColor: '#007BFF',
//   },
//   tabText: {
//     color: '#333',
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   activeTabText: {
//     color: '#fff',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   contentText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   footer: {
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//   },
//   filterButton: {
//     backgroundColor: '#007BFF',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   filterButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });



import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [...updatedMessages],
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiMessage = res.data.choices[0].message;
      setMessages([...updatedMessages, aiMessage]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chat}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.role === 'user' ? styles.user : styles.ai,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputWrapper}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#fff' },
  chat: { flex: 1, padding: 10 },
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
  },
  user: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  ai: { alignSelf: 'flex-start', backgroundColor: '#eee' },
  messageText: { fontSize: 16 },
  inputWrapper: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 20,
  },
  sendText: {
    color: 'white',
    fontSize: 18,
  },
});

