/* eslint-disable no-shadow */
import React, {useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';

const LeadCard = React.memo(({item, setSelectedLead, setModalVisible}) => {
  const [expandedItem, setExpandedItem] = useState(null);

  // Toggle expanded state for the card
  const toggleExpand = itemId => {
    setExpandedItem(prevState => (prevState === itemId ? null : itemId));
  };

  // Handle the card press event to show modal with selected item details
  const handleCardPress = item => {
    // console.log('Selected Item before setting state:=====>>', item); // Log before setting state
    setSelectedLead(item); // Set selected lead
    setModalVisible(true); // Show modal
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      {/* Collapsed View */}
      <View style={styles.collapsedHeader}>
        <View>
          <Text style={styles.cardTitle}>
            Lead Name: {item.firstName} {item?.middleName} {item.lastName}
          </Text>
          <Text style={styles.cardTitle}>id: {item.leadId}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <Text style={styles.expandIcon}>
            {expandedItem === item.id ? '▲' : '▼'} {/* Toggle icon */}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded View */}
      {expandedItem === item.id && (
        <View style={styles.expandedContent}>
          <View style={styles.textRow}>
            <Text style={styles.cardLabel}>Gender:</Text>
            <Text style={styles.cardValue}>{item.gender || 'N/A'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.cardLabel}>MobileNumber:</Text>
            <Text style={styles.cardValue}>{item.mobileNo || 'N/A'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.cardLabel}>Email:</Text>
            <Text style={styles.cardValue}>{item.email || 'N/A'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.cardLabel}>Lead Stage:</Text>
            <Text style={styles.cardValue}>{item.leadStage || 'N/A'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.cardLabel}>PAN:</Text>
            <Text style={styles.cardValue}>{item.pan || 'N/A'}</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.cardLabel}>Assigned To:</Text>
            <Text style={styles.cardValue}>
              {item.assignTo?.firstName || ''}{' '}
              {item.assignTo?.lastName || 'N/A'}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Define styles for the component
const styles = StyleSheet.create({
  card: {
    // your styles for card
  },
  collapsedHeader: {
    // your styles for header
  },
  cardTitle: {
    // your styles for card title
  },
  expandIcon: {
    // your styles for the expand/collapse icon
  },
  expandedContent: {
    // your styles for expanded content
  },
  textRow: {
    // your styles for each row in the expanded content
  },
  cardLabel: {
    // your styles for card labels
  },
  cardValue: {
    // your styles for card values
  },
});

export default LeadCard;
