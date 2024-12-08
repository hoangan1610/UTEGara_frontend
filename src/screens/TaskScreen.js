import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from '../api/config';

const TaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
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

  const isAdminOrSuperAdmin = userRole === 'admin' || userRole === 'SUPER_ADMIN';

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data?.message || error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [userRole])
  );

  const handleAddTask = () => {
    navigation.navigate('AddTask', {
      onGoBack: fetchTasks,
    });
  };

  const handleEditTask = (taskId) => {
    navigation.navigate('EditTask', {
      taskId,
      onGoBack: fetchTasks,
    });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error.response?.data?.message || error.message);
    }
  };

  const handleChangeStatus = async (task) => {
    try {
      const nextStatus =
        task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'awaiting_confirmation' : null;

      if (nextStatus) {
        await axios.put(
          `${BASE_URL}/tasks/${task.id}`,
          { status: nextStatus },
          { headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` } }
        );
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error.response?.data?.message || error.message);
    }
  };

  const handleConfirmCompletion = async (task) => {
    try {
      await axios.put(
        `${BASE_URL}/tasks/${task.id}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error confirming task completion:', error.response?.data?.message || error.message);
    }
  };

  const handleRejectTask = async (task) => {
    try {
      await axios.put(
        `${BASE_URL}/tasks/${task.id}`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error rejecting task:', error.response?.data?.message || error.message);
    }
  };

  const convertStatusToVietnamese = (status) => {
    switch (status) {
      case 'pending':
        return 'CHỜ XÁC NHẬN';
      case 'in_progress':
        return 'ĐANG THỰC HIỆN';
      case 'awaiting_confirmation':
        return 'CHỜ XÁC NHẬN HOÀN THÀNH';
      case 'completed':
        return 'ĐÃ HOÀN THÀNH';
      case 'rejected':
        return 'ĐÃ TỪ CHỐI';
      default:
        return status;
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fff3e0';
      case 'in_progress':
        return '#e3f2fd';
      case 'awaiting_confirmation':
        return '#fce4ec';
      case 'completed':
        return '#eeeeee';
      case 'rejected':
        return '#ffebee';
      default:
        return '#fff';
    }
  };

  const calculateRemainingTime = (dueDate) => {
    const now = new Date();
    const deadline = new Date(dueDate);

    if (isNaN(deadline.getTime())) {
      return 0;
    }

    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTaskDetail = (taskId) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  const renderAdminTaskItem = ({ item }) => {
    const remainingDays = calculateRemainingTime(item.deadline);
    const remainingText = remainingDays > 0 ? `${remainingDays} ngày nữa` : 'Đã quá hạn';
    const isUrgent = remainingDays <= 1;

    return (
      <TouchableOpacity
        style={[styles.taskContainer, { backgroundColor: getStatusBackgroundColor(item.status) }]}
        onPress={() => handleTaskDetail(item.id)}
      >
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.assignedTo}>
            Assigned to: {item.employee?.first_name} {item.employee?.last_name}
          </Text>
          <Text style={styles.taskStatus}>
            Status: <Text style={{ fontWeight: 'bold' }}>{convertStatusToVietnamese(item.status)}</Text>
          </Text>
          {item.status === 'completed' && item.completed_at && (
            <Text style={styles.remainingTime}>
              Hoàn thành lúc: {new Date(item.completed_at).toLocaleString()}
            </Text>
          )}
          {item.deadline && (
            <Text
              style={[styles.remainingTime, { fontWeight: isUrgent ? 'bold' : 'normal', color: isUrgent ? 'red' : 'black' }]}
            >
              Deadline: {remainingText}
            </Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => handleEditTask(item.id)}>
            <Icon name="edit" size={20} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
            <Icon name="delete" size={20} color="red" />
          </TouchableOpacity>
          {item.status === 'awaiting_confirmation' && (
            <TouchableOpacity onPress={() => handleConfirmCompletion(item)}>
              <Icon name="check-circle" size={30} color="purple" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmployeeTaskItem = ({ item }) => {
    const remainingDays = calculateRemainingTime(item.deadline);
    const remainingText = remainingDays > 0 ? `${remainingDays} ngày nữa` : 'Đã quá hạn';
    const isUrgent = remainingDays <= 1;

    return (
      <TouchableOpacity
        style={[styles.taskContainer, { backgroundColor: getStatusBackgroundColor(item.status) }]}
        onPress={() => handleTaskDetail(item.id)}
      >
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.assignedTo}>
            Assigned to: {item.employee?.first_name} {item.employee?.last_name}
          </Text>
          <Text style={styles.taskStatus}>
            Status: <Text style={{ fontWeight: 'bold' }}>{convertStatusToVietnamese(item.status)}</Text>
          </Text>
          {item.status === 'completed' && item.completed_at && (
            <Text style={styles.remainingTime}>
              Hoàn thành lúc: {new Date(item.completed_at).toLocaleString()}
            </Text>
          )}
          {item.deadline && (
            <Text
              style={[styles.remainingTime, { fontWeight: isUrgent ? 'bold' : 'normal', color: isUrgent ? 'red' : 'black' }]}
            >
              Deadline: {remainingText}
            </Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          {(item.status === 'pending' || item.status === 'in_progress') && (
            <>
              <TouchableOpacity onPress={() => handleChangeStatus(item)}>
                <Icon name="check-circle" size={30} color="orange" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRejectTask(item)}>
                <Icon name="cancel" size={30} color="red" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const sortedTasks = tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <View style={styles.container}>
      {isAdminOrSuperAdmin && (
        <TouchableOpacity onPress={handleAddTask} style={styles.addTaskButton}>
          <Text style={styles.addTaskButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={isAdminOrSuperAdmin ? renderAdminTaskItem : renderEmployeeTaskItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignedTo: {
    fontSize: 14,
    color: '#666',
  },
  taskStatus: {
    fontSize: 14,
    color: '#333',
  },
  remainingTime: {
    fontSize: 12,
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTaskButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskScreen;
