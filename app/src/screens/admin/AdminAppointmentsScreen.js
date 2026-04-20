import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function AdminAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/admin/appointments');
      setAppointments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await api.delete(`/admin/appointments/${id}`);
            Alert.alert('Success', 'Appointment deleted');
            fetchAppointments();
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          } finally {
            setDeletingId(null);
          }
        }
      }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.patient?.name?.[0]?.toUpperCase() || 'P'}</Text>
          </View>
          <View>
            <Text style={styles.patientName}>{item.patient?.name}</Text>
            <Text style={styles.doctorName}>Dr. {item.doctor?.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)} disabled={deletingId === item._id}>
          {deletingId === item._id ? <ActivityIndicator size="small" color="#ef4444" /> : <Ionicons name="trash-outline" size={22} color="#ef4444" />}
        </TouchableOpacity>
      </View>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Appointments</Text>
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No appointments found</Text>
        </View>
      ) : (
        <FlatList data={appointments} keyExtractor={(item) => item._id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#1d4ed8' },
  patientName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  doctorName: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 13, color: '#6b7280', marginTop: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 10 },
  statusText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
});