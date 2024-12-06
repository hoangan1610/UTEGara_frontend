import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';
import AccountScreen from '../screens/AccountScreen';
import EditUserScreen from '../screens/EditUserScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen'; // Import EditTaskScreen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Account-related screens
const AccountStack = ({ user, onLogout }) => (
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

// Bottom Tab Navigator with `onLogout` passed to `AccountStack`
const AppNavigator = ({ user, onLogout }) => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Tasks" component={TaskScreen} />
    <Tab.Screen 
      name="Account" 
      options={{ headerShown: false }}
    >
      {props => <AccountStack {...props} user={user} onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

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
  </Stack.Navigator>
);

export default AppStack;
