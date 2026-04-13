import React, {memo, useCallback} from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Loader,
} from '../../../design-system/components';
import {designTheme} from '../../../design-system/theme';
import chatTheme from '../theme';

function areMessageBubblePropsEqual(previousProps, nextProps) {
  const previousItem = previousProps.item;
  const nextItem = nextProps.item;

  return (
    previousItem?.id === nextItem?.id &&
    previousItem?.text === nextItem?.text &&
    previousItem?.status === nextItem?.status &&
    previousItem?.formattedTimestamp === nextItem?.formattedTimestamp &&
    previousItem?.fromMe === nextItem?.fromMe
  );
}

const MessageBubble = memo(function MessageBubble({item}) {
  const isMe = item.fromMe;

  const getStatusIcon = () => {
    if (!isMe) {
      return null;
    }

    switch (item.status) {
      case 'sent':
        return (
          <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.8)" />
        );
      case 'delivered':
        return (
          <Ionicons
            name="checkmark-done"
            size={14}
            color="rgba(255,255,255,0.8)"
          />
        );
      case 'seen':
        return <Ionicons name="checkmark-done" size={14} color="#0EA5E9" />;
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.messageRow,
        isMe ? styles.messageRowRight : styles.messageRowLeft,
      ]}>
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
        ]}>
        <Text
          style={[
            styles.messageText,
            isMe ? styles.messageTextRight : styles.messageTextLeft,
          ]}>
          {item.text}
        </Text>

        <View style={styles.messageMeta}>
          <Text
            style={[
              styles.messageTimestamp,
              isMe ? styles.messageTimestampRight : styles.messageTimestampLeft,
            ]}>
            {item.formattedTimestamp}
          </Text>

          {getStatusIcon()}
        </View>
      </View>
    </View>
  );
}, areMessageBubblePropsEqual);

export default function ChatThreadView({
  listRef,
  loading,
  sending,
  error,
  input,
  messages,
  contactLabel,
  contactAvatarLabel,
  contactAvatar,
  presenceLabel,
  onInputChange,
  onSend,
  onBack,
}) {
  const renderItem = useCallback(({item}) => <MessageBubble item={item} />, []);
  const keyExtractor = useCallback(item => item.id, []);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return <Loader label="Loading messages..." />;
    }

    if (error && !messages.length) {
      return (
        <ErrorState title="Conversation unavailable" description={error} />
      );
    }

    return (
      <EmptyState
        title="No messages yet"
        description="Start the conversation with a short introduction."
      />
    );
  }, [error, loading, messages.length]);

  return (
    <LinearGradient colors={chatTheme.moduleGradient} style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.headerShell}>
            <Pressable onPress={onBack} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={20}
                color={designTheme.colors.white}
              />
            </Pressable>

            {contactAvatar ? (
              <Image source={{uri: contactAvatar}} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{contactAvatarLabel}</Text>
              </View>
            )}

            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>{contactLabel}</Text>
              <Text style={styles.headerSubtitle}>{presenceLabel}</Text>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={7}
            removeClippedSubviews
          />

          <Card style={styles.composerCard}>
            {error && messages.length ? (
              <Text style={styles.inlineError}>{error}</Text>
            ) : null}
            <Input
              value={input}
              onChangeText={onInputChange}
              multiline
              placeholder="Type your message"
              containerStyle={styles.composerInput}
              inputStyle={styles.composerField}
            />
            <Button label="Send" onPress={onSend} loading={sending} />
          </Card>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  headerShell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTheme.spacing[4],
    paddingBottom: designTheme.spacing[4],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginLeft: designTheme.spacing[3],
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: designTheme.spacing[3],
  },
  avatarText: {
    ...designTheme.typography.bodyStrong,
    color: designTheme.colors.white,
  },
  headerCopy: {
    flex: 1,
    marginLeft: designTheme.spacing[3],
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: designTheme.colors.white,
  },
  headerSubtitle: {
    ...designTheme.typography.caption,
    marginTop: designTheme.spacing[1],
    color: 'rgba(255,255,255,0.78)',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: designTheme.spacing[4],
    paddingBottom: designTheme.spacing[4],
  },
  messageRow: {
    marginBottom: designTheme.spacing[3],
    flexDirection: 'row',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: designTheme.radii.lg,
    paddingHorizontal: designTheme.spacing[4],
    paddingVertical: designTheme.spacing[3],
  },
  messageBubbleLeft: {
    backgroundColor: designTheme.colors.white,
    borderTopLeftRadius: 6,
  },
  messageBubbleRight: {
    backgroundColor: 'rgba(7, 93, 84, 0.84)',
    borderTopRightRadius: 6,
  },
  messageText: {
    ...designTheme.typography.body,
  },
  messageTextLeft: {
    color: designTheme.semanticColors.textPrimary,
  },
  messageTextRight: {
    color: designTheme.colors.white,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: designTheme.spacing[2],
  },
  messageTimestamp: {
    ...designTheme.typography.caption,
  },
  messageTimestampLeft: {
    color: designTheme.semanticColors.textMuted,
  },
  messageTimestampRight: {
    color: 'rgba(255,255,255,0.72)',
  },
  messageStatusIcon: {
    marginLeft: designTheme.spacing[1],
  },
  composerCard: {
    marginHorizontal: designTheme.spacing[4],
    marginBottom: designTheme.spacing[4],
  },
  composerInput: {
    marginBottom: designTheme.spacing[3],
  },
  composerField: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: designTheme.spacing[3],
  },
  inlineError: {
    ...designTheme.typography.caption,
    marginBottom: designTheme.spacing[2],
    color: designTheme.semanticColors.danger,
  },
});

// import React, { memo, useCallback, useMemo } from 'react';
// import {
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import {
//   Button,
//   Card,
//   EmptyState,
//   ErrorState,
//   Input,
//   Loader,
// } from '../../../design-system/components';
// import { designTheme } from '../../../design-system/theme';
// import chatTheme from '../theme';

// function areMessageBubblePropsEqual(previousProps, nextProps) {
//   const previousItem = previousProps.item;
//   const nextItem = nextProps.item;

//   return (
//     previousItem?.id === nextItem?.id &&
//     previousItem?.text === nextItem?.text &&
//     previousItem?.status === nextItem?.status &&
//     previousItem?.formattedTimestamp === nextItem?.formattedTimestamp &&
//     previousItem?.fromMe === nextItem?.fromMe
//   );
// }

// const MessageBubble = memo(function MessageBubble({ item }) {
//   const isMe = item.fromMe;

//   const getStatusIcon = () => {
//     if (!isMe) return null;

//     switch (item.status) {
//       case 'sent':
//         return (
//           <Ionicons
//             name="checkmark"
//             size={14}
//             color="rgba(255,255,255,0.8)"
//           />
//         );
//       case 'delivered':
//         return (
//           <Ionicons
//             name="checkmark-done"
//             size={14}
//             color="rgba(255,255,255,0.8)"
//           />
//         );
//       case 'seen':
//         return (
//           <Ionicons
//             name="checkmark-done"
//             size={14}
//             color="#0EA5E9"
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <View
//       style={[
//         styles.messageRow,
//         isMe ? styles.messageRowRight : styles.messageRowLeft,
//       ]}
//     >
//       <View
//         style={[
//           styles.messageBubble,
//           isMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
//         ]}
//       >
//         <Text
//           style={[
//             styles.messageText,
//             isMe ? styles.messageTextRight : styles.messageTextLeft,
//           ]}
//         >
//           {item.text}
//         </Text>

//         <View style={styles.messageMeta}>
//           <Text
//             style={[
//               styles.messageTimestamp,
//               isMe
//                 ? styles.messageTimestampRight
//                 : styles.messageTimestampLeft,
//             ]}
//           >
//             {item.formattedTimestamp}
//           </Text>

//           {getStatusIcon()}
//         </View>
//       </View>
//     </View>
//   );
// });

// export default function ChatThreadView({
//   listRef,
//   loading,
//   sending,
//   error,
//   input,
//   messages,
//   contactLabel,
//   contactAvatarLabel,
//   contactAvatar,
//   presenceLabel,
//   onInputChange,
//   onSend,
//   onBack,
// }) {
//   // const renderItem = useCallback(({item}) => <MessageBubble item={item} />, []);
//   const renderItem = useCallback(({ item }) => <MessageBubble item={item} />, []);
//   const keyExtractor = useCallback(item => item.id, []);
//   const listContentStyle = useMemo(
//     () => [
//       styles.listContent,
//       !messages.length ? styles.listContentEmpty : null,
//     ],
//     [messages.length],
//   );

//   const renderEmpty = useCallback(() => {
//     if (loading) {
//       return <Loader label="Loading messages..." />;
//     }

//     if (error && !messages.length) {
//       return (
//         <ErrorState title="Conversation unavailable" description={error} />
//       );
//     }

//     return (
//       <EmptyState
//         title="No messages yet"
//         description="Start the conversation with a short introduction."
//       />
//     );
//   }, [error, loading, messages.length]);

//   return (
//     <LinearGradient colors={chatTheme.moduleGradient} style={styles.screen}>
//       <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView
//           style={styles.keyboard}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//           {/* HEADER */}
//           <View style={styles.headerShell}>
//             <Pressable onPress={onBack} style={styles.backButton}>
//               <Ionicons name="arrow-back" size={20} color="#fff" />
//             </Pressable>

//             {contactAvatar ? (
//               <Image source={{ uri: contactAvatar }} style={styles.avatarImage} />
//             ) : (
//               <View style={styles.avatarFallback}>
//                 <Text style={styles.avatarText}>{contactAvatarLabel}</Text>
//               </View>
//             )}

//             <View style={styles.headerCopy}>
//               <Text style={styles.headerTitle}>{contactLabel}</Text>
//               <Text style={styles.headerSubtitle}>{presenceLabel}</Text>
//             </View>
//           </View>

//           {/* CHAT LIST */}
//           <FlatList
//             ref={listRef}
//             data={messages}
//             keyExtractor={keyExtractor}
//             renderItem={renderItem}
//             ListEmptyComponent={renderEmpty}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//             // ✅ FIXED BOTTOM ALIGN
//             contentContainerStyle={listContentStyle}
//             // ✅ PERFORMANCE
//             initialNumToRender={12}
//             maxToRenderPerBatch={12}
//             windowSize={7}
//             removeClippedSubviews
//           />

//           {/* INPUT */}
//           <Card style={styles.composerCard}>
//             {error && messages.length ? (
//               <Text style={styles.inlineError}>{error}</Text>
//             ) : null}

//             <Input
//               value={input}
//               onChangeText={onInputChange}
//               multiline
//               placeholder="Type your message"
//               containerStyle={styles.composerInput}
//               inputStyle={styles.composerField}
//             />

//             <Button
//               label="Send"
//               onPress={onSend}
//               loading={sending}
//               disabled={!input.trim()}
//             />
//           </Card>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   safeArea: { flex: 1 },
//   keyboard: { flex: 1 },

//   headerShell: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: designTheme.spacing[4],
//     paddingBottom: designTheme.spacing[4],
//   },

//   backButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.14)',
//   },

//   avatarImage: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     marginLeft: designTheme.spacing[3],
//   },

//   avatarFallback: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     marginLeft: designTheme.spacing[3],
//   },

//   avatarText: {
//     ...designTheme.typography.bodyStrong,
//     color: designTheme.colors.white,
//   },

//   headerCopy: {
//     flex: 1,
//     marginLeft: designTheme.spacing[3],
//   },

//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: designTheme.colors.white,
//   },

//   headerSubtitle: {
//     ...designTheme.typography.caption,
//     marginTop: designTheme.spacing[1],
//     color: 'rgba(255,255,255,0.78)',
//   },

//   listContent: {
//     flexGrow: 1,
//     paddingHorizontal: designTheme.spacing[4],
//     paddingBottom: designTheme.spacing[4],
//   },

//   listContentEmpty: {
//     justifyContent: 'flex-end',
//   },

//   messageRow: {
//     marginBottom: designTheme.spacing[3],
//     flexDirection: 'row',
//   },

//   messageRowLeft: { justifyContent: 'flex-start' },
//   messageRowRight: { justifyContent: 'flex-end' },

//   messageBubble: {
//     maxWidth: '82%',
//     borderRadius: designTheme.radii.lg,
//     paddingHorizontal: designTheme.spacing[4],
//     paddingVertical: designTheme.spacing[3],
//   },

//   messageBubbleLeft: {
//     backgroundColor: designTheme.colors.white,
//     borderTopLeftRadius: 6,
//   },

//   messageBubbleRight: {
//     backgroundColor: 'rgba(7, 93, 84, 0.84)',
//     borderTopRightRadius: 6,
//   },

//   messageText: {
//     ...designTheme.typography.body,
//   },

//   messageTextLeft: {
//     color: designTheme.semanticColors.textPrimary,
//   },

//   messageTextRight: {
//     color: designTheme.colors.white,
//   },

//   messageMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: designTheme.spacing[2],
//     alignSelf: 'flex-end',
//   },

//   messageTimestamp: {
//     ...designTheme.typography.caption,
//   },

//   messageTimestampLeft: {
//     color: designTheme.semanticColors.textMuted,
//   },

//   messageTimestampRight: {
//     color: 'rgba(255,255,255,0.72)',
//   },

//   statusIconWrapper: {
//     marginLeft: 4,
//   },

//   composerCard: {
//     marginHorizontal: designTheme.spacing[4],
//     marginBottom: designTheme.spacing[4],
//   },

//   composerInput: {
//     marginBottom: designTheme.spacing[3],
//   },

//   composerField: {
//     minHeight: 96,
//     textAlignVertical: 'top',
//   },

//   inlineError: {
//     ...designTheme.typography.caption,
//     marginBottom: designTheme.spacing[2],
//     color: designTheme.semanticColors.danger,
//   },
// });
