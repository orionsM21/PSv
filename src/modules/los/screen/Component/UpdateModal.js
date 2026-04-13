import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Progress from 'react-native-progress';

const UpdateModal = ({
  visible,
  progress,
  downloading,
  onDownloadPress,
  onCancelPress,
  onClosePress,
  updateInfo,
}) => {
  const {
    currentVersion = '—',
    latestVersionName = '—',
    changelog = '',
    releaseNotes = '',
  } = updateInfo || {};

  // 🧠 Smart changelog / releaseNotes handling
  const formattedNotes = (releaseNotes || changelog || '')
    .split('\n')
    .filter(Boolean)
    .map((line, index) => `• ${line}`)
    .join('\n');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 🔹 Header */}
          <Text style={styles.title}>🚀 Update Available</Text>

          {/* 🔹 Version comparison */}
          <Text style={styles.versionText}>
            <Text style={styles.versionLabel}>Version:</Text>{' '}
            v{currentVersion} → <Text style={styles.newVersion}>v{latestVersionName}</Text>
          </Text>

          {/* 🔹 What's new */}
          <Text style={[styles.subtitle, { marginTop: 10 }]}>What’s new</Text>
          <ScrollView
            style={styles.notesContainer}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.notes}>
              {formattedNotes || 'Bug fixes and performance improvements.'}
            </Text>
          </ScrollView>

          {/* 🔹 Download / Progress UI */}
          {!downloading ? (
            <TouchableOpacity style={styles.downloadBtn} onPress={onDownloadPress}>
              <Text style={styles.downloadBtnText}>Download & Install</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={progress}
                width={250}
                height={8}
                borderRadius={8}
                color="#2196F3"
                unfilledColor="#E0E0E0"
              />
              <Text style={styles.progressLabel}>
                {Math.round(progress * 100)}%
              </Text>
              <TouchableOpacity onPress={onCancelPress} style={styles.cancelBtn}>
                <Text style={{ color: '#E74C3C', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 🔹 Footer actions */}
          {!downloading && (
            <TouchableOpacity onPress={onClosePress} style={styles.laterBtn}>
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2196F3',
    marginBottom: 12,
  },
  versionText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#444',
    marginBottom: 6,
  },
  versionLabel: {
    fontWeight: '600',
    color: '#666',
  },
  newVersion: {
    color: '#28A745',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesContainer: {
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  notes: {
    fontSize: 13.5,
    color: '#444',
    lineHeight: 20,
  },
  downloadBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  progressLabel: {
    marginTop: 6,
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 10,
  },
  laterBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  laterText: {
    color: '#777',
    fontSize: 14,
  },
});

export default UpdateModal;
