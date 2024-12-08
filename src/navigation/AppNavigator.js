import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';

import TaskScreen from '../screens/TaskScreen';
import AccountScreen from '../screens/AccountScreen';
import EditUserScreen from '../screens/EditUserScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import NotificationScreen from '../screens/NotificationScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Account-related screens
const AccountStack = ({ route }) => {
  const { user, onLogout } = route.params || {}; // Retrieve params if using initialParams
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AccountDetails"
        options={{ title: 'Account' }}
      >
        {props => <AccountScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="EditUser"
        options={{ title: 'Edit User' }}
      >
        {props => <EditUserScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator
const AppNavigator = ({ user, onLogout }) => {
  const [unreadNotifications, setUnreadNotifications] = useState(1);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Công việc"
        component={TaskScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="tasks" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Thông báo"
        component={NotificationScreen}
        initialParams={{ setUnreadNotifications }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : null,
        }}
      />
      <Tab.Screen
        name="Tài Khoản"
        component={AccountStack}
        initialParams={{ user, onLogout }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack that wraps the Tab Navigator and other screens
const AppStack = ({ user, onLogout }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      options={{ headerShown: false }}
    >
      {props => <AppNavigator {...props} user={user} onLogout={onLogout} />}
    </Stack.Screen>
    <Stack.Screen
      name="AddEmployee"
      component={AddEmployeeScreen}
      options={{ title: 'Add Employee' }}
    />
    <Stack.Screen
      name="AddTask"
      component={AddTaskScreen}
      options={{ title: 'Add Task' }}
    />
    <Stack.Screen
      name="EditTask"
      component={EditTaskScreen}
      options={{ title: 'Edit Task' }}
    />
    <Stack.Screen
      name="TaskDetail"
      component={TaskDetailScreen}
      options={{ title: 'Task Detail' }}
    />
    <Stack.Screen
      name="NotificationDetails"
      component={NotificationDetailScreen}
      options={{ title: 'Notification Details' }}
    />
  </Stack.Navigator>
);

export default AppStack;
