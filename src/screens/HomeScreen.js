import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setRole(parsedUser.role); // Set role for conditionally rendering buttons
        }
      } catch (error) {
        console.error('Error fetching user from AsyncStorage:', error);
      }
    };

    fetchUserData();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
    } catch (error) {
      console.log('Error fetching events:', error);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Upcoming Events</Text>
      <Text style={{ fontSize: 16, color: 'blue' }}>Role: {role}</Text>

      {role === 'admin' ? (
        <View>
          <Button 
            title="Add New Employee" 
            onPress={() => navigation.navigate('AddEmployee')} 
          />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default HomeScreen;
