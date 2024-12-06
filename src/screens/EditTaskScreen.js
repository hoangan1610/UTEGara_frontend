import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const EditTaskScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.1.6:5000/api/tasks/${taskId}`);
        setTask(response.data);
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    };
    fetchTaskDetails();
  }, [taskId]);

  const handleSave = async () => {
    try {
      await axios.put(`http://192.168.1.6:5000/api/tasks/${taskId}`, task);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
      />
      <Text style={styles.label}>Due Date</Text>
      <TextInput
        style={styles.input}
        value={task.dueDate}
        onChangeText={(text) => setTask({ ...task, dueDate: text })}
      />
      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default EditTaskScreen;
