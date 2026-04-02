import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';
import { getGreeting, formatDate } from '../../utils/helpers';
import { useNavigation } from '@react-navigation/native';

export default function CleaningStaffDashboard() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, pendingSupplies: 0 });
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [tasksRes, supplyRes] = await Promise.all([
        api.get('/cleaning-tasks/my'),
        api.get('/supply-requests/my'),
      ]);
      const tasks = tasksRes.data;
      const todayStr = new Date().toDateString();
      const todays = tasks.filter(t => new Date(t.date).toDateString() === todayStr);
      setTodayTasks(todays.slice(0, 3));
      setStats({
        total: tasks.length,
        pending: tasks.filter(t => t.status !== 'completed').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pendingSupplies: supplyRes.data.filter(r => r.status === 'pending').length,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { name: 'My Tasks', icon: 'clipboard', screen: 'Tasks', color: '#3b82f6' },
    { name: 'Supplies', icon: 'cube', screen: 'Supplies', color: '#10b981' },
    { name: 'Profile', icon: 'person', screen: 'Profile', color: '#f59e0b' },
  ];

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: 'clipboard', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending', value: stats.pending, icon: 'time', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Completed', value: stats.completed, icon: 'checkmark-circle', color: '#10b981', bg: '#f0fdf4' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'Staff'}</Text>
        <Text style={styles.subGreeting}>Here's your cleaning overview for today.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Stat Cards */}
          <View style={styles.statsContainer}>
            {statCards.map((card, idx) => (
              <View key={idx} style={[styles.statCard, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={28} color={card.color} />
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

          {/* Pending supplies nudge */}
          {stats.pendingSupplies > 0 && (
            <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('Supplies')}>
              <Ionicons name="alert-circle" size={18} color="#92400e" />
              <Text style={styles.alertText}>
                {stats.pendingSupplies} supply request{stats.pendingSupplies > 1 ? 's' : ''} awaiting approval
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#92400e" />
            </TouchableOpacity>
          )}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Ionicons name={action.icon} size={32} color={action.color} />
                <Text style={styles.actionLabel}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's Tasks */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Tasks</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {todayTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks assigned for today</Text>
            ) : (
              todayTasks.map((task, idx) => (
                <View key={idx} style={[styles.taskItem, idx < todayTasks.length - 1 && styles.taskBorder]}>
                  <View style={styles.taskLeft}>
                    <Ionicons
                      name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={task.status === 'completed' ? '#10b981' : '#9ca3af'}
                    />
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskArea}>{task.area}</Text>
                      {!!task.description && (
                        <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>
                      )}
                      <Text style={styles.taskDate}>{formatDate(task.date)}</Text>
                    </View>
                  </View>
                  <View style={[styles.badge, task.status === 'completed' ? styles.badgeGreen : styles.badgeYellow]}>
                    <Text style={[styles.badgeText, task.status === 'completed' ? styles.badgeTextGreen : styles.badgeTextYellow]}>
                      {task.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: '#1f2937' },
  subGreeting: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  loader: { marginTop: 40 },

  errorCard: { alignItems: 'center', marginTop: 40, padding: 24, backgroundColor: 'white', borderRadius: 12 },
  errorText: { marginTop: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontWeight: 'bold' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, marginHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8, color: '#1f2937' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },

  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', borderRadius: 10, padding: 12, marginBottom: 20, gap: 8 },
  alertText: { flex: 1, color: '#92400e', fontSize: 13, fontWeight: '500' },

  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1f2937' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionCard: { width: '31%', backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  actionLabel: { fontSize: 13, fontWeight: '500', marginTop: 8, color: '#374151', textAlign: 'center' },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  seeAll: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 20, fontSize: 14 },

  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  taskBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskInfo: { marginLeft: 10, flex: 1 },
  taskArea: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  taskDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  taskDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeYellow: { backgroundColor: '#fef3c7' },
  badgeGreen: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  badgeTextYellow: { color: '#92400e' },
  badgeTextGreen: { color: '#065f46' },
});