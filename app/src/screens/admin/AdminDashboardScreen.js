import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const STATS = [
  { label: 'Total Users', icon: 'people', color: '#3b82f6', bg: '#dbeafe' },
  { label: 'Doctors', icon: 'medkit', color: '#10b981', bg: '#d1fae5' },
  { label: 'Patients', icon: 'person', color: '#8b5cf6', bg: '#ede9fe' },
  { label: 'Appointments', icon: 'calendar', color: '#f59e0b', bg: '#fed7aa' },
];

export default function AdminDashboardScreen() {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.name}>{user?.name || 'Admin'}</Text>
        <Text style={styles.subtitle}>Welcome to your admin dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        {STATS.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: stat.bg }]}>
            <Ionicons name={stat.icon} size={28} color={stat.color} />
            <Text style={[styles.statValue, { color: stat.color }]}>0</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="person-add" size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Add User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="checkmark-done" size={24} color="#10b981" />
            <Text style={styles.actionText}>Pending Approvals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="cube" size={24} color="#f59e0b" />
            <Text style={styles.actionText}>Supply Requests</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  greeting: { fontSize: 14, color: '#6b7280' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginTop: 4 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#4b5563', marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 16, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center', shadowOpacity: 0.05, elevation: 2 },
  actionText: { fontSize: 12, fontWeight: '500', color: '#4b5563', marginTop: 8 },
});