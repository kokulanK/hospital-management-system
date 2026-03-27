import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import Dashboard from '../screens/patient/Dashboard';
import Appointments from '../screens/patient/Appointments';
import Feedback from '../screens/patient/Feedback';
import AIScanner from '../screens/patient/AIScanner';
import Profile from '../screens/patient/Profile';
import Settings from '../screens/patient/Settings';

// Chatbot component
import Chatbot from '../screens/patient/Chatbot';

const Tab = createBottomTabNavigator();

export default function PatientNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Appointments') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Feedback') iconName = focused ? 'star' : 'star-outline';
            else if (route.name === 'Scanner') iconName = focused ? 'camera' : 'camera-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={Dashboard} />
        <Tab.Screen name="Appointments" component={Appointments} />
        <Tab.Screen name="Feedback" component={Feedback} />
        <Tab.Screen name="Scanner" component={AIScanner} />
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>

      {/* Chatbot appears on all patient screens */}
      <Chatbot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});