import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from '../api/api'; // Adjust the import path according to your file structure

const EditUserScreen = ({ route, navigation }) => {
  const { user } = route.params; // Only destructure user from route.params
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSaveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Fetch the token for authorization
      const response = await updateUser({ name, email }, token); // Call the API to update user
      const updatedUser = response.data.user; // Access the user property here

      console.log('Updated user:', updatedUser); // Log updated user data

      // Update AsyncStorage with the new user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Navigate back to AccountScreen with updated user data
      navigation.navigate('Account', { updatedUser }); // Pass updated user data back to AccountScreen

      // Show a success message
      Alert.alert('Success', 'User updated successfully');

      // If you want to navigate back instead of pushing a new screen, you can use goBack()
      navigation.goBack();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user information');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit User Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button title="Save Changes" onPress={handleSaveChanges} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});

export default EditUserScreen;
