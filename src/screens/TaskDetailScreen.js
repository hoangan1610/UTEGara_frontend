import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import BASE_URL from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';  // Import thư viện moment

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;  // Lấy taskId từ navigation params
  const [task, setTask] = useState(null);

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const convertStatusToVietnamese = (status) => {
    switch (status) {
      case 'awaiting_confirmation':
        return 'Đang chờ xác nhận';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Chưa xác định';
    }
  };

  // Fetch task detail
  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${await AsyncStorage.getItem('token')}` },
        });
        setTask(response.data.task);  // Lưu thông tin task (bao gồm cả thông tin nhân viên)
      } catch (error) {
        console.error('Error fetching task details:', error.response?.data?.message || error.message);
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Loading task details...</Text>
      </View>
    );
  }

  // Chuyển đổi deadline sang định dạng ngày tháng năm giờ phút
  const formatDeadline = (deadline) => {
    return moment(deadline).format('DD/MM/YYYY, HH:mm'); // Định dạng: 06/12/2024, 12:00
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.details}>Status: {convertStatusToVietnamese(task.status)}</Text>
      {task.deadline && (
        <Text style={styles.details}>Deadline: {formatDeadline(task.deadline)}</Text>
      )}
      <Text style={styles.details}>Description: {task.description}</Text>

      {/* Back Button */}
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 16,
    marginVertical: 8,
  },
});

export default TaskDetailScreen;
