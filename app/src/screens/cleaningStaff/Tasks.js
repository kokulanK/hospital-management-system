import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/helpers';
import Toast from '../../components/Toast';

const FILTERS = ['All', 'Pending', 'Completed'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [completing, setCompleting] = useState(null); // task _id being completed
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setError(null);
      const { data } = await api.get('/cleaning-tasks/my');
      // Sort: pending first, then by date descending
      const sorted = [...data].sort((a, b) => {
        if (a.status === b.status) return new Date(b.date) - new Date(a.date);
        return a.status === 'completed' ? 1 : -1;
      });
      setTasks(sorted);
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  const handleComplete = async (taskId) => {
    try {
      setCompleting(taskId);
      const { data } = await api.put(`/cleaning-tasks/${taskId}/complete`);
      setTasks(prev =>
        prev.map(t => (t._id === taskId ? { ...t, status: 'completed', completedAt: data.completedAt } : t))
      );
      setToast({ message: 'Task marked as completed!', type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete task.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setCompleting(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return t.status !== 'completed';
    if (activeFilter === 'Completed') return t.status === 'completed';
    return true;
  });

  const isToday = (dateStr) => new Date(dateStr).toDateString() === new Date().toDateString();
  const isTomorrow = (dateStr) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(dateStr).toDateString() === tomorrow.toDateString();
  };

  const getDateLabel = (dateStr) => {
    if (isToday(dateStr)) return 'Today';
    if (isTomorrow(dateStr)) return 'Tomorrow';
    return formatDate(dateStr);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
      >
        <Text style={styles.pageTitle}>My Tasks</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchTasks}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={56} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No {activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}tasks</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View key={task._id} style={styles.taskCard}>
              <View style={styles.taskCardTop}>
                {/* Left: icon + area */}
                <View style={styles.taskLeft}>
                  <View style={[styles.areaIcon, task.status === 'completed' ? styles.areaIconGreen : styles.areaIconBlue]}>
                    <Ionicons
                      name={task.status === 'completed' ? 'checkmark' : 'location'}
                      size={18}
                      color={task.status === 'completed' ? '#10b981' : '#3b82f6'}
                    />
                  </View>
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskArea}>{task.area}</Text>
                    <Text style={styles.taskDateLabel}>{getDateLabel(task.date)}</Text>
                  </View>
                </View>
                {/* Right: status badge */}
                <View style={[styles.badge, task.status === 'completed' ? styles.badgeGreen : styles.badgeYellow]}>
                  <Text style={[styles.badgeText, task.status === 'completed' ? styles.badgeTextGreen : styles.badgeTextYellow]}>
                    {task.status === 'completed' ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </View>

              {!!task.description && (
                <Text style={styles.taskDescription}>{task.description}</Text>
              )}

              {task.status === 'completed' && task.completedAt && (
                <View style={styles.completedRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.completedAt}>
                    Completed on {formatDate(task.completedAt)}
                  </Text>
                </View>
              )}

              {task.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.completeBtn, completing === task._id && styles.completeBtnDisabled]}
                  onPress={() => handleComplete(task._id)}
                  disabled={completing === task._id}
                >
                  {completing === task._id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                      <Text style={styles.completeBtnText}>Mark as Complete</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  loader: { marginTop: 40 },

  filterRow: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'white', borderRadius: 10, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  filterTabActive: { backgroundColor: '#3b82f6' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  filterTextActive: { color: 'white' },

  errorCard: { alignItems: 'center', marginTop: 40, padding: 24, backgroundColor: 'white', borderRadius: 12 },
  errorText: { marginTop: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#9ca3af', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#d1d5db', marginTop: 6 },

  taskCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  taskCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  areaIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  areaIconBlue: { backgroundColor: '#eff6ff' },
  areaIconGreen: { backgroundColor: '#d1fae5' },
  taskMeta: { marginLeft: 10, flex: 1 },
  taskArea: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  taskDateLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  taskDescription: { fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 18 },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  completedAt: { fontSize: 12, color: '#10b981' },

  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 10, marginTop: 4, gap: 6 },
  completeBtnDisabled: { backgroundColor: '#93c5fd' },
  completeBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeYellow: { backgroundColor: '#fef3c7' },
  badgeGreen: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextYellow: { color: '#92400e' },
  badgeTextGreen: { color: '#065f46' },
});