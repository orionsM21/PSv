import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const ApplicationCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const applicant = item.applicant[0]?.individualApplicant;

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <TouchableOpacity onPress={toggleExpand} style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          Application No: {item.applicationNo}
        </Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
      </View>

      {/* Always Visible Content */}
      <Text style={styles.cardText}>
        Name: {applicant?.firstName} {applicant?.middleName} {applicant?.lastName}
      </Text>

      {/* Collapsible Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Product:</Text>
            <Text style={styles.value}>{item.productName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Portfolio:</Text>
            <Text style={styles.value}>{item.portfolioDescription}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>
              {item.applicant[0]?.applicantCategoryCode}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile No.:</Text>
            <Text style={styles.value}>{applicant?.mobileNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Stage:</Text>
            <Text style={styles.value}>{item.stage}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN:</Text>
            <Text style={styles.value}>{applicant?.pan}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: width * 0.95,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: 16,
    color: 'black',
  },
  cardText: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },

  collapsibleContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#999999FF',
    paddingTop: 8,
  },

  expandedContent: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#999999FF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontWeight: '500',
    color: 'black',
    flex: 1,
  },
  value: {
    color: 'black',
    flex: 3, // Allows value to take more space
    textAlign: 'left',
  },
});

export default ApplicationCard;
