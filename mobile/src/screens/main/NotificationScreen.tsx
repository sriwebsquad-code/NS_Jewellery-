import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BellRing, CheckCircle, Info } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { formatDistanceToNow } from 'date-fns';

const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const { token, updateActivity } = useAuthStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (updateActivity) updateActivity();
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

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
    <View style={[styles.notificationCard, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }, item.isRead ? {} : styles.unreadCard]}>
      <View style={styles.iconContainer}>
        {renderIcon(item.type || 'info')}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'Recently'}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <BellRing color={colors.border} size={64} style={{ marginBottom: 15 }} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '900', fontFamily: 'serif' },
  listContainer: { padding: 20 },
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  unreadCard: {
    backgroundColor: mode === 'dark' ? 'rgba(212, 175, 55, 0.1)' : '#FDF8F0',
  },
  iconContainer: { marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  time: { fontSize: 12 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    alignSelf: 'center',
    marginLeft: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  }
});

export default NotificationScreen;
