import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminPendingScreen from '../screens/admin/AdminPendingScreen';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminSupplyRequestsScreen from '../screens/admin/AdminSupplyRequestsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard:    { focused: 'home',         unfocused: 'home-outline' },
  Users:        { focused: 'people',       unfocused: 'people-outline' },
  Pending:      { focused: 'hourglass',    unfocused: 'hourglass-outline' },
  Appointments: { focused: 'calendar',     unfocused: 'calendar-outline' },
  Feedback:     { focused: 'chatbubbles',  unfocused: 'chatbubbles-outline' },
  Supplies:     { focused: 'cube',         unfocused: 'cube-outline' },
  Profile:      { focused: 'person',       unfocused: 'person-outline' },
};

export default function AdminStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"    component={AdminDashboardScreen} />
      <Tab.Screen name="Users"        component={AdminUsersScreen} />
      <Tab.Screen name="Pending"      component={AdminPendingScreen} />
      <Tab.Screen name="Appointments" component={AdminAppointmentsScreen} />
      <Tab.Screen name="Feedback"     component={AdminFeedbackScreen} />
      <Tab.Screen name="Supplies"     component={AdminSupplyRequestsScreen} />
      <Tab.Screen name="Profile"      component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}