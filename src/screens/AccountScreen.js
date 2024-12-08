import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountScreen = ({ navigation, route, onLogout }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error fetching user from AsyncStorage:', error);
      }
    };
    fetchUserData();
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, [navigation]);

  const handleEdit = () => {
    navigation.navigate('EditUser', { user });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      onLogout(); // Calls the logout function from App.js
      navigation.navigate('Login'); // Navigates back to Login screen
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout failed', 'Please try again.');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No user information available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <Text style={styles.text}>Email: {user.email}</Text>
      <Text style={styles.text}>Role: {user.role}</Text>
      
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
  },
});

export default AccountScreen;
