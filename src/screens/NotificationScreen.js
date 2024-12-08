import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from '../api/config';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState(null);

  // Fetch user role when component mounts
  useEffect(() => {
    const fetchUserRole = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const { role } = JSON.parse(userData);
        setUserRole(role);
      }
    };
    fetchUserRole();
  }, []);

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
      });
      console.log('Fetched notifications:', response.data.notifications); // Log fetched notifications
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data?.message || error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error.response?.data?.message || error.message);
    }
  };

  // Handle mark notification as read
  const handleMarkAsRead = async (notification) => {
    try {
      await axios.put(
        `${BASE_URL}/notifications/${notification.id}`,
        { read: true },
        { headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data?.message || error.message);
    }
  };

  // Handle mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` } }
      );
      console.log(response.data.message);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error.response?.data?.message || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    }
  };
  

  // Render notification item for admin
  const renderAdminNotificationItem = ({ item }) => (
    <View style={[styles.notificationContainer, !item.read ? styles.unreadNotification : null]}>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationStatus}>Status: {item.read ? 'Read' : 'Unread'}</Text>
      </View>
      <View style={styles.iconContainer}>
        {!item.read && (
          <TouchableOpacity onPress={() => handleMarkAsRead(item)}>
            <Icon name="check-circle" size={20} color="green" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDeleteNotification(item.id)}>
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render notification item for employee
  const renderEmployeeNotificationItem = ({ item }) => (
    <View style={[styles.notificationContainer, !item.read ? styles.unreadNotification : null]}>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      {!item.read && (
        <TouchableOpacity style={styles.markAsReadButton} onPress={() => handleMarkAsRead(item)}>
          <Icon name="check-circle" size={20} color="green" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Notifications</Text>
      {(notifications.some((notif) => !notif.read) || notifications.length > 0) && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllButtonText}>Mark All as Read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={
          userRole === 'admin' || userRole === 'SUPER_ADMIN'
            ? renderAdminNotificationItem
            : renderEmployeeNotificationItem
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
    color: '#333',
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#ffebee',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
    justifyContent: 'space-between',
  },
  markAsReadButton: {
    marginLeft: 10,
  },
  markAllButton: {
    alignSelf: 'center',
    marginVertical: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF', // Highlighted blue color
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default NotificationScreen;
