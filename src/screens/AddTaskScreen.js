import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import MultiSelect from 'react-native-multiple-select';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure to install this package

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]); // Changed to array for multiple selection
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Retrieve token from AsyncStorage
        const response = await axios.get('http://192.168.1.6:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to fetch employees. Please try again.');
      }
    };

    fetchEmployees();
  }, []);

  const handleAddTask = async () => {
    // Validate fields
    if (!title || !description || !dueDate || assignedTo.length === 0) {
      Alert.alert('Error', 'Please fill all fields and assign at least one employee.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve token for adding the task
      const newTask = { title, description, assignedTo, dueDate }; // assignedTo is now an array
      await axios.post('http://192.168.1.6:5000/api/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });
      Alert.alert('Success', 'Task added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding task:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task description"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Due Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <Text style={styles.label}>Assign To</Text>
      <MultiSelect
        items={employees.map(employee => ({ id: employee.id, name: employee.name }))}
        uniqueKey="id"
        onSelectedItemsChange={setAssignedTo}
        selectedItems={assignedTo}
        selectText="Pick Employees"
        searchInputPlaceholderText="Search Employees..."
        styleMainWrapper={styles.multiSelect}
        styleDropdownMenu={styles.dropdownMenu}
        styleTextDropdown={styles.textDropdown}
        styleInputGroup={styles.inputGroup}
        styleTextInput={styles.textInput}
        styleListContainer={styles.listContainer}
      />

      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  multiSelect: {
    marginBottom: 20,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
  },
  textDropdown: {
    color: '#000',
  },
  inputGroup: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  textInput: {
    paddingHorizontal: 10,
    height: 40,
  },
  listContainer: {
    maxHeight: 200,
  },
});

export default AddTaskScreen;
