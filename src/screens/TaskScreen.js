import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const TaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const { role, id } = JSON.parse(userData);
        setUserRole(role);
        setUserId(id);
      }
    };
    fetchUserRole();
  }, []);

  const fetchTasks = async () => {
    try {
      const endpoint = userRole === 'admin'
        ? 'http://192.168.1.6:5000/api/tasks'
        : `http://192.168.1.6:5000/api/tasks/employee/${userId}`;
      const response = await axios.get(endpoint);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error); // Enhanced logging
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [userRole, userId])
  );

  const handleAddTask = () => navigation.navigate('AddTask');
  const handleEditTask = (taskId) => navigation.navigate('EditTask', { taskId });
  
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://192.168.1.6:5000/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error); // Added logging
    }
  };

  const handleViewDetails = (taskId) => navigation.navigate('TaskDetails', { taskId });
  
  const handleChangeStatus = async (task) => {
    try {
      const updatedStatus = task.status === 'Chưa xử lý' ? 'Đang thực hiện' : 'Chờ xác nhận hoàn thành';
      await axios.put(`http://192.168.1.6:5000/api/tasks/${task.id}/status`, { status: updatedStatus });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error); // Added logging
    }
  };

  const handleConfirmCompletion = async (task) => {
    try {
      await axios.put(`http://192.168.1.6:5000/api/tasks/${task.id}/status`, { status: 'Hoàn thành' });
      fetchTasks();
    } catch (error) {
      console.error("Error confirming task completion:", error); // Added logging
    }
  };

  const renderAdminTaskItem = ({ item }) => (
    <View style={[styles.taskContainer, item.status === 'Chờ xác nhận hoàn thành' ? styles.pendingTask : null]}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.assignedTo}>Assigned to: {item.employee.name}</Text>
        <Text style={styles.taskStatus}>Status: {item.status}</Text>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleEditTask(item.id)}>
          <Icon name="edit" size={20} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleViewDetails(item.id)}>
          <Icon name="info" size={20} color="green" />
        </TouchableOpacity>
        {item.status === 'Chờ xác nhận hoàn thành' && (
          <TouchableOpacity onPress={() => handleConfirmCompletion(item)}>
            <Icon name="check-circle" size={20} color="purple" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmployeeTaskItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskStatus}>Status: {item.status}</Text>
      </View>
      {item.status === 'Chưa xử lý' && (
        <TouchableOpacity onPress={() => handleChangeStatus(item)}>
          <Icon name="check-circle" size={20} color="purple" />
        </TouchableOpacity>
      )}
      {item.status === 'Đang thực hiện' && (
        <TouchableOpacity onPress={() => handleChangeStatus(item)}>
          <Icon name="done" size={20} color="orange" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Sort tasks: put pending confirmation tasks at the top
  const sortedTasks = tasks.sort((a, b) => {
    if (a.status === 'Chờ xác nhận hoàn thành') return -1;
    if (b.status === 'Chờ xác nhận hoàn thành') return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Task List</Text>
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={userRole === 'admin' ? renderAdminTaskItem : renderEmployeeTaskItem}
      />
      {userRole === 'admin' && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Icon name="add-circle" size={50} color="green" />
        </TouchableOpacity>
      )}
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  taskContainer: {
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
  pendingTask: {
    backgroundColor: '#ffebee', // Light red background for pending tasks
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  assignedTo: {
    fontSize: 14,
    color: '#666',
  },
  taskStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'space-around',
  },
});

export default TaskScreen;
