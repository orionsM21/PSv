import React, {memo, useCallback} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
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
import {getAvatarLabel} from '../business/chatDirectory.rules';
import chatTheme from '../theme';

const LIST_ITEM_HEIGHT = 92;

const DirectoryContactCard = memo(function DirectoryContactCard({
  item,
  onPress,
}) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.contactPressable}>
      <Card style={styles.contactCard}>
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {getAvatarLabel(item.displayName)}
          </Text>
        </View>
        <View style={styles.contactCopy}>
          <Text style={styles.contactName}>{item.displayName}</Text>
          <Text style={styles.contactMeta}>{item.phone}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={designTheme.semanticColors.textMuted}
        />
      </Card>
    </Pressable>
  );
});

const getItemLayout = (_, index) => ({
  length: LIST_ITEM_HEIGHT,
  offset: LIST_ITEM_HEIGHT * index,
  index,
});

export default function ChatDashboardView({
  search,
  matchedUsers,
  loading,
  refreshing,
  error,
  directoryCount,
  onLogout,
  onSearchChange,
  onRefresh,
  onOpenChat,
  onOpenAddContact,
}) {
  const renderItem = useCallback(
    ({item}) => <DirectoryContactCard item={item} onPress={onOpenChat} />,
    [onOpenChat],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <LinearGradient
          colors={chatTheme.moduleGradient}
          style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Customer Connect</Text>
              <Text style={styles.heroTitle}>Chat Directory</Text>
              <Text style={styles.heroSubtitle}>
                Start secure conversations with contacts already registered in
                the chat network.
              </Text>
            </View>
            <View style={styles.heroActions}>
              <Button
                label="Add Contact"
                variant="secondary"
                onPress={onOpenAddContact}
                style={styles.heroButton}
              />
              <Button
                label="Logout"
                variant="secondary"
                onPress={onLogout}
                style={styles.logoutButton}
              />
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{directoryCount}</Text>
              <Text style={styles.statLabel}>Directory users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{matchedUsers.length}</Text>
              <Text style={styles.statLabel}>Matched contacts</Text>
            </View>
          </View>
        </LinearGradient>

        <Card style={styles.searchCard}>
          <Input
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search by name or number"
            containerStyle={styles.searchInput}
          />
        </Card>
      </View>
    ),
    [
      directoryCount,
      matchedUsers,
      onLogout,
      onOpenAddContact,
      onSearchChange,
      search,
    ],
  );

  const renderEmpty = useCallback(() => {
    if (loading) {
      return <Loader label="Loading chat directory..." />;
    }

    if (error) {
      return (
        <ErrorState
          title="Chat directory unavailable"
          description={error}
          actionLabel="Retry"
          onActionPress={onRefresh}
        />
      );
    }

    return (
      <EmptyState
        title="No matched contacts yet"
        description="Add a contact to your device or ask them to register in chat to start messaging."
        actionLabel="Add Contact"
        onActionPress={onOpenAddContact}
      />
    );
  }, [error, loading, onOpenAddContact, onRefresh]);

  return (
    <LinearGradient colors={chatTheme.moduleGradient} style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={matchedUsers}
          keyExtractor={item => item.uid || item.phone}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={getItemLayout} // ✅ FIX
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={designTheme.colors.white}
            />
          }
        />
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
  content: {
    padding: designTheme.spacing[4],
    paddingBottom: designTheme.spacing[6],
    flexGrow: 1,
  },
  heroCard: {
    borderRadius: designTheme.radii.xl,
    padding: designTheme.spacing[5],
    marginBottom: designTheme.spacing[4],
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroActions: {
    alignItems: 'flex-end',
  },
  heroCopy: {
    flex: 1,
    paddingRight: designTheme.spacing[3],
  },
  heroEyebrow: {
    ...designTheme.typography.label,
    color: '#D7F9E4',
  },
  heroTitle: {
    marginTop: designTheme.spacing[2],
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: designTheme.colors.white,
  },
  heroSubtitle: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[2],
    color: 'rgba(255,255,255,0.8)',
  },
  heroButton: {
    minWidth: 120,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  logoutButton: {
    minWidth: 120,
    marginTop: designTheme.spacing[2],
    backgroundColor: 'rgba(190,24,93,0.18)',
    borderColor: 'rgba(251,113,133,0.34)',
  },
  statRow: {
    flexDirection: 'row',
    gap: designTheme.spacing[3],
    marginTop: designTheme.spacing[5],
  },
  statCard: {
    flex: 1,
    padding: designTheme.spacing[4],
    borderRadius: designTheme.radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: designTheme.colors.white,
  },
  statLabel: {
    ...designTheme.typography.caption,
    marginTop: designTheme.spacing[1],
    color: 'rgba(255,255,255,0.72)',
  },
  searchCard: {
    marginBottom: designTheme.spacing[3],
    padding: designTheme.spacing[4],
  },
  searchInput: {
    marginBottom: 0,
  },
  contactPressable: {
    marginBottom: designTheme.spacing[3],
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: chatTheme.moduleAccent,
  },
  avatarText: {
    ...designTheme.typography.bodyStrong,
    color: designTheme.colors.white,
  },
  contactCopy: {
    flex: 1,
    marginLeft: designTheme.spacing[3],
  },
  contactName: {
    ...designTheme.typography.bodyStrong,
  },
  contactMeta: {
    ...designTheme.typography.caption,
    marginTop: designTheme.spacing[1],
  },
});
