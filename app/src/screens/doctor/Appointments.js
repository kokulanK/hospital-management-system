import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../api/axios';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/doctor');
      setAppointments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.patientName}>{item.patient?.name}</Text>
          <Text style={styles.date}>{formatDate(item.startTime || item.date)}</Text>
          <Text style={styles.time}>{formatTime(item.startTime || item.date)}</Text>
        </View>
        <View style={styles.actions}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
          {item.status === 'scheduled' && (
            <View style={styles.statusButtons}>
              <TouchableOpacity
                onPress={() => handleStatusChange(item._id, 'completed')}
                disabled={updatingId === item._id}
                style={styles.completeBtn}
              >
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleStatusChange(item._id, 'cancelled')}
                disabled={updatingId === item._id}
                style={styles.cancelBtn}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;

  const filteredAppointments = appointments.filter(a => filterCategory === 'all' || a.status === filterCategory);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['all', 'scheduled', 'completed', 'cancelled'].map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.filterBtn, filterCategory === cat && styles.filterBtnActive]}
            onPress={() => setFilterCategory(cat)}
          >
            <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>
               {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No appointments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  date: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  time: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  actions: { alignItems: 'flex-end' },
  status: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  statusButtons: { flexDirection: 'row' },
  completeBtn: { marginRight: 12 },
  cancelBtn: {},
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  filterContainer: { flexDirection: 'row', marginBottom: 16, justifyContent: 'space-around' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e5e7eb' },
  filterBtnActive: { backgroundColor: '#3b82f6' },
  filterText: { fontSize: 12, color: '#374151', fontWeight: 'bold' },
  filterTextActive: { color: 'white' },
});