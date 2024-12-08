import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import MultiSelect from 'react-native-multiple-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../api/config';
import { Picker } from '@react-native-picker/picker';

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hours, setHours] = useState(new Date().getHours());
  const [minutes, setMinutes] = useState(new Date().getMinutes());
  const [assignedTo, setAssignedTo] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Lỗi', 'Không tìm thấy token xác thực');
          return;
        }
        const response = await axios.get(`${BASE_URL}/admin/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredEmployees = response.data.filter(employee => employee.role === 'EMPLOYEE');
        setEmployees(filteredEmployees);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Không tải được danh sách nhân viên';
        Alert.alert('Lỗi', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddTask = async () => {
    if (!title || !description || !day || !month || !year || !hours || !minutes || assignedTo.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin và gán ít nhất một nhân viên.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Không có token xác thực');
        return;
      }

      const formattedDate = new Date(year, month - 1, day, hours, minutes).toISOString();

      const newTask = { 
        title,
        description,
        employee_id: assignedTo[0],
        deadline: formattedDate, 
      };

      await axios.post(`${BASE_URL}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Thành công', 'Thêm công việc thành công');
      navigation.goBack();

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Thêm công việc thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tiêu đề công việc"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mô tả công việc"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Thời hạn</Text>

      <View style={styles.dateSelectors}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Ngày</Text>
          <Picker
            selectedValue={day}
            style={styles.picker}
            onValueChange={(itemValue) => setDay(itemValue)}
          >
            {[...Array(31).keys()].map((_, index) => (
              <Picker.Item key={index} label={`${index + 1}`} value={index + 1} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Tháng</Text>
          <Picker
            selectedValue={month}
            style={styles.picker}
            onValueChange={(itemValue) => setMonth(itemValue)}
          >
            {[...Array(12).keys()].map((_, index) => (
              <Picker.Item key={index} label={`${index + 1}`} value={index + 1} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Năm</Text>
          <Picker
            selectedValue={year}
            style={styles.picker}
            onValueChange={(itemValue) => setYear(itemValue)}
          >
            {[...Array(10).keys()].map((_, index) => (
              <Picker.Item key={index} label={`${new Date().getFullYear() + index}`} value={new Date().getFullYear() + index} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.timePickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Giờ</Text>
          <Picker
            selectedValue={hours}
            style={styles.picker}
            onValueChange={(itemValue) => setHours(itemValue)}
          >
            {[...Array(24).keys()].map((_, index) => (
              <Picker.Item key={index} label={`${index}`} value={index} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Phút</Text>
          <Picker
            selectedValue={minutes}
            style={styles.picker}
            onValueChange={(itemValue) => setMinutes(itemValue)}
          >
            {[...Array(60).keys()].map((_, index) => (
              <Picker.Item key={index} label={`${index}`} value={index} />
            ))}
          </Picker>
        </View>
      </View>

      <Text style={styles.label}>Giao cho</Text>
      <MultiSelect
        items={employees.map((employee) => ({
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
        }))}
        uniqueKey="id"
        onSelectedItemsChange={setAssignedTo}
        selectedItems={assignedTo}
        selectText="Chọn nhân viên"
        searchInputPlaceholderText="Tìm nhân viên..."
        styleMainWrapper={styles.multiSelect}
      />

      <Button title={loading ? 'Đang thêm công việc...' : 'Thêm công việc'} onPress={handleAddTask} disabled={loading} />
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
    fontWeight: 'bold',
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
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: 100,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  multiSelect: {
    marginBottom: 20,
  },
});

export default AddTaskScreen;
