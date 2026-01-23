import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card, SectionTitle, HOmeScreenButton } from '../ReuableComponent/Component';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { DrawerContext } from '../../../Drawer/DrawerContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FlipCard from '../components/FlipCard';
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const { openDrawer } = useContext(DrawerContext);

  const handleViewCardPress = () => {
    setModalVisible(true);
  };

  const handleCardPress = () => {
    navigation.navigate('Recent transaction')
  }
  const [cardKey, setCardKey] = useState(0);

  const closeModal = () => {
    setModalVisible(false);
    setCardKey(prev => prev + 1); // 🔥 force remount
  };

  const onMenuPress = useCallback(() => {
    openDrawer();
  }, [openDrawer]);
  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animatable.View animation="fadeInDown" duration={600}>
        <LinearGradient
          colors={['#2563EB', '#1E40AF']}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={onMenuPress}
              hitSlop={10}
              style={styles.menuButton}
            >
              <MaterialIcons name="menu" size={26} color="#fff" />
            </Pressable>

            <MaterialIcons name="notifications-none" size={24} color="#fff" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.headerGreeting}>Good Evening 👋</Text>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Your NeoBank Account</Text>
          </View>
        </LinearGradient>
      </Animatable.View>


      {/* Account Summary */}
      <Animatable.View animation="fadeInUp" delay={200} duration={800}>
        <Card style={styles.premiumCard}>
          <Text style={styles.accountTitle}>Account Balance</Text>
          <Text style={styles.accountBalance}>$4,550.00</Text>
        </Card>
      </Animatable.View>

      {/* Quick Actions */}
      <Animatable.View animation="fadeInUp" delay={400} duration={800}>
        <Card style={styles.quickActions}>
          <SectionTitle title="Quick Actions" />
          <View style={styles.quickActionRow}>
            <HOmeScreenButton
              title="Send"
              onPress={() => navigation.navigate('FundTransfer')}
            />

            <HOmeScreenButton title="Add Money" />
          </View>
          <View style={styles.quickActionRow}>
            {/* <HOmeScreenButton title="Scan" /> */}
            <HOmeScreenButton title="Pay Bills" />
          </View>
        </Card>
      </Animatable.View>

      {/* Recent Transactions */}
      <Animatable.View animation="fadeInUp" delay={400} duration={800}>
        <Card style={styles.premiumCard} onPress={handleCardPress}>
          <SectionTitle title="Recent Transactions" />
          <View style={styles.transactionItem}>
            <Text style={styles.transactionAmountf}>Payment to Amazon</Text>
            <Text style={styles.transactionAmount}>-$250.00</Text>
          </View>
          <View style={styles.transactionItem}>
            <Text style={styles.transactionAmountf}>Deposit from Employer</Text>
            <Text style={styles.transactionAmount}>+$2,000.00</Text>
          </View>
        </Card>
      </Animatable.View>
      <Animatable.View animation="fadeInUp" delay={400} duration={800}>
        {/* Virtual Card */}
        <Card style={styles.premiumCard}>
          <SectionTitle title="Virtual Card" />
          <Text style={styles.UicardNumber}>**** **** **** 1234</Text>
          <HOmeScreenButton title="View Card" onPress={handleViewCardPress} />
        </Card>
      </Animatable.View>


      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable>
            <Animatable.View animation="zoomIn" duration={600}>


              <FlipCard key={cardKey} />
            </Animatable.View>
          </Pressable>
        </Pressable>
      </Modal>


      {/* Upcoming Bills */}
      <Animatable.View animation="fadeInUp" delay={400} duration={800}>
        <Card style={styles.premiumCard}>
          <SectionTitle title="Upcoming Bills" />
          <View style={styles.billItem}>
            <Text style={styles.transactionAmountf}>Electricity Bill</Text>
            <Text style={styles.billAmount}>$120.00</Text>
          </View>
          <View style={styles.billItem}>
            <Text style={styles.transactionAmountf}>Netflix Subscription</Text>
            <Text style={styles.billAmount}>$15.00</Text>
          </View>
        </Card>
      </Animatable.View>

      {/* Spending Insights */}
      <Animatable.View animation='fadeInUp' delay={400} duration={800}>
        <Card style={styles.premiumCard}>
          <SectionTitle title="Spending Insights" />
          <Text style={styles.insightText}>You have spent $1,250 this month.</Text>
        </Card>
      </Animatable.View>

    </ScrollView>

  );
};

const styles = StyleSheet.create({
  /* ===== SCREEN ===== */
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingBottom: 24,
  },

  /* ===== HEADER ===== */
  header: {
    paddingTop: 22,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    marginTop: 18,
  },

  headerGreeting: {
    fontSize: 12,
    letterSpacing: 0.4,
    color: 'rgba(255,255,255,0.75)',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    fontSize: 13,
    opacity: 0.9,
  },


  /* ===== PREMIUM CARD ===== */
  premiumCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 15,
    marginBottom: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },



  /* ===== BALANCE ===== */
  accountTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },

  accountBalance: {
    fontSize: 30,
    fontWeight: '800',
    color: '#15803D', // darker green = trust
    letterSpacing: 0.3,
  },

  /* ===== QUICK ACTIONS ===== */
  quickActions: {
    marginHorizontal: 15,
    marginBottom: 10,
    marginVertical: 10
  },

  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  /* ===== TRANSACTIONS ===== */
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  transactionAmountf: {
    fontWeight: '700',
    color: '#1A1717',
  },
  transactionAmount: {
    fontWeight: '700',
    color: '#EF4444',
  },

  /* ===== VIRTUAL CARD ===== */
  UicardNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },

  /* ===== MODAL ===== */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  cardGradient: {
    width: 320,
    height: 200,
    borderRadius: 24,
    padding: 22,
    justifyContent: 'space-between',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },

  bankName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'right',
  },

  chip: {
    width: 50,
    height: 35,
    borderRadius: 6,
  },

  cardNumber: {
    fontSize: 22,
    letterSpacing: 2,
    color: '#fff',
    fontWeight: '600',
  },

  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },

  cardHolder: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  cardExpiry: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  cardIssuer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
  },

  /* ===== BILLS & INSIGHTS ===== */
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  billAmount: {
    fontWeight: '700',
    color: '#EF4444',
  },

  insightText: {
    color: '#334155',
    fontSize: 14,
  },

});


export default HomeScreen;
