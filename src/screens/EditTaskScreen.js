import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import MultiSelect from 'react-native-multiple-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../api/config';

const EditTaskScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState({
    title: '',
    description: '',
    deadline: '',
    employee_id: '',
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading state true

  // Fetch task and employee details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Authentication token not found');
          return;
        }

        // Fetch task details
        const taskResponse = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const taskData = taskResponse.data.task;  // Assuming task is inside 'task' property
        console.log('Fetched Task Data:', taskData); // Debug task data
        setTask({
          title: taskData.title,
          description: taskData.description,
          deadline: taskData.deadline,
          employee_id: taskData.employee_id,
        });

        // Fetch employee list
        const employeeResponse = await axios.get(`${BASE_URL}/admin/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filteredEmployees = employeeResponse.data.filter(emp => emp.role === 'EMPLOYEE');
        setEmployees(filteredEmployees);

        console.log('Fetched Employee Data:', filteredEmployees); // Debug employee data
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false); // Set loading to false when data is fetched
      }
    };

    fetchData();
  }, [taskId]);

  // Handle save task
  const handleSave = async () => {
    if (!task.title || !task.description || !task.deadline || !task.employee_id) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(task.deadline);
    if (!isValidDate) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token is missing');
        return;
      }

      await axios.put(`${BASE_URL}/tasks/${taskId}`, task, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Task updated successfully');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
      Alert.alert('Error', errorMessage);
    }
  };

  // Show loading spinner while waiting for data
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        value={task.title} // Ensure the state value is passed here
        onChangeText={(text) => setTask({ ...task, title: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task description"
        value={task.description} // Ensure the state value is passed here
        onChangeText={(text) => setTask({ ...task, description: text })}
      />

      <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={task.deadline} // Ensure the state value is passed here
        onChangeText={(text) => setTask({ ...task, deadline: text })}
      />

      <Text style={styles.label}>Assign To</Text>
      <MultiSelect
        items={employees.map((employee) => ({
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`, // Ensure correct display name
        }))}
        uniqueKey="id"
        onSelectedItemsChange={(selected) => {
          console.log('Selected Employee ID:', selected[0]); // Debugging selected employee ID
          setTask({ ...task, employee_id: selected[0] });
        }}
        selectedItems={task.employee_id ? [task.employee_id] : []}  // Ensure selectedItems are always an array
        single
        selectText="Pick Employee"
        searchInputPlaceholderText="Search Employees..."
        styleMainWrapper={styles.multiSelect}
      />

      <Button
        title={loading ? 'Saving...' : 'Save Changes'}
        onPress={handleSave}
        disabled={loading}
      />
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
});

export default EditTaskScreen;
