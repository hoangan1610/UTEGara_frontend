import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddEmployeeScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');

  const handleAddEmployee = async () => {
    // Check for empty fields
    if (!name || !email || !role || !password) {
      Alert.alert('Input Required', 'Please fill out all fields.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You must log in to add a new employee.');
        navigation.navigate('Login'); // Adjust if needed
        return;
      }

      // Make API request to add employee
      const response = await axios.post(
        'http://192.168.1.6/api/users/employees', // Use the correct endpoint for employees
        { name, email, role, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Employee added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding employee:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add employee. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          placeholder="Employee Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Employee Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Role"
          value={role}
          onChangeText={setRole}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Button title="Add Employee" onPress={handleAddEmployee} />
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
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default AddEmployeeScreen;
