import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { login } from '../api/api'; // Ensure you're importing the correct login function
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Check for empty fields
    if (!email || !password) {
      Alert.alert('Input Required', 'Please enter both email and password.');
      return; // Prevent further execution if fields are empty
    }

    try {
      const response = await login({ email, password }); // Call the correct login API function

      if (response.data.token) {
        const { token, user } = response.data;

        // Store the token and user in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        console.log('Token stored:', token); // Debug log
        console.log('User stored:', user);   // Debug log

        // Call the onLogin prop to pass user data to parent component
        onLogin(user); // Pass user data to the parent component
        Alert.alert('Login Successful', 'Welcome!'); // Notify the user
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Login error:", error); // Debugging line
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong, please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address" // Optimize keyboard for email input
          autoCapitalize="none" // Prevent auto capitalization for email
          autoCompleteType="email" // Enable email autocomplete
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          autoCompleteType="password" // Enable password autocomplete
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',      // Center content horizontally
    paddingHorizontal: 20,     // Padding to prevent content from touching screen edges
  },
  innerContainer: {
    width: '100%',            // Full width for the inner container
  },
  input: {
    height: 50,               // Height for input fields
    borderColor: '#ccc',      // Border color for the inputs
    borderWidth: 1,           // Border width
    marginBottom: 20,         // Space between inputs
    paddingHorizontal: 10,    // Padding inside the input
    borderRadius: 8,          // Rounded corners for input fields
  },
});

export default Login;
