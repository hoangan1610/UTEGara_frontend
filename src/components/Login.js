import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API configuration (update with the correct backend URL)
const api = axios.create({
  baseURL: 'http://192.168.1.3:3001/api/v1', 
});

const Login = ({ onLogin, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Manage loading state

  const handleLogin = async () => {
    // Check for empty fields
    if (!email || !password) {
      Alert.alert('Input Required', 'Please enter both email and password.');
      return; // Prevent further execution if fields are empty
    }

    setLoading(true); // Show loading indicator

    try {
      const response = await api.post('/auth/login', { email, password }); // API call

      // Check if the response has a valid access_token
      if (response.data.access_token) {
        const { access_token, user } = response.data;

        // Store the token and user data in AsyncStorage
        await AsyncStorage.setItem('token', access_token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        console.log('Token stored:', access_token);
        console.log('User stored:', user);

        // Pass user data to the parent component
        onLogin(user);

        // Show success alert after successful login
        Alert.alert('Login Successful', 'Welcome!');
        navigation.replace('MainTabs'); // Điều hướng tới màn hình Công việc sau khi đăng nhập
// Navigate to Home screen after login
      } else {
        // In case the response does not contain access_token
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Login error:", error);

      // In case of an error, show failure alert
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || 'Something went wrong, please try again.';
        Alert.alert('Login Failed', errorMessage);
      } else {
        Alert.alert('Login Failed', 'Network error or server issue');
      }
    } finally {
      setLoading(false); // Hide loading indicator after request completes
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Logo: HAQ */}
        <Text style={styles.logo}>HAQ</Text>

        {/* Software Name under HAQ */}
        <Text style={styles.softwareName}>ỨNG DỤNG QUẢN LÝ CÔNG VIỆC GARA UTE</Text>

        {/* Email input */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCompleteType="email"
        />

        {/* Password input */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          autoCompleteType="password"
        />

        {/* Login Button */}
        {loading ? (
          <TouchableOpacity style={styles.buttonDisabled}>
            <Text style={styles.buttonText}>Loading...</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center', // Center align all child components
  },
  logo: {
    fontFamily: 'RahereSans-Regular', // Use RahereSans-Regular for HAQ logo
    fontSize: 48,  // Adjust the font size as needed
    fontWeight: 'bold',
    marginBottom: 20, // Reduced space below the logo
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#f9f9f9', // Light background color
  },
  softwareName: {
    marginTop: 0, 
    marginBottom: 30, // Reduced margin to bring it closer to the logo
    fontSize: 16,  // Slightly larger font size for better visibility
    fontWeight: '600',  // Slightly bolder text
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',  // Blue background color
    paddingVertical: 12,          // Padding for button height
    paddingHorizontal: 30,        // Padding for button width
    borderRadius: 8,              // Rounded corners
    marginBottom: 20,             // Space below the button
  },
  buttonDisabled: {
    backgroundColor: '#c7c7c7',  // Grey background for disabled button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',  // White text color
    fontSize: 18,   // Adjust font size for the button text
    textAlign: 'center',  // Center the text inside the button
    fontWeight: 'bold',   // Bold text
  },
});

export default Login;
