import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BellRing, CheckCircle, Info } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/Colors';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'success',
    title: 'Payment Successful',
    message: 'Your payment of ₹5,000 for the 11-Month Gold Scheme was successful.',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Monthly Reminder',
    message: 'Your next installment for the Silver 11 Scheme is due in 3 days.',
    time: '1 day ago',
  },
  {
    id: '3',
    type: 'info',
    title: 'Gold Rate Update',
    message: 'Gold rate has dropped! Check out the current rates to invest.',
    time: '2 days ago',
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="#4CAF50" size={24} />;
      case 'reminder':
        return <BellRing color="#C89F7A" size={24} />;
      case 'info':
      default:
        return <Info color="#2196F3" size={24} />;
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <View style={[styles.notificationCard, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
      <View style={styles.iconContainer}>
        {renderIcon(item.type)}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  listContainer: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
  },
});

export default NotificationScreen;
