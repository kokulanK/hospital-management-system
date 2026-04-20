import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../api/axios';

export default function AdminSupplyRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/supply-requests');
      setRequests(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load supply requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/supply-requests/${id}`, { status: newStatus });
      Alert.alert('Success', `Request ${newStatus}`);
      fetchRequests();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#3b82f6';
      case 'delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#dbeafe';
      case 'delivered': return '#d1fae5';
      default: return '#f3f4f6';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      {item.notes && <Text style={styles.notes}>Note: {item.notes}</Text>}

      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>Requested by: {item.staff?.name}</Text>
        <Text style={styles.requestDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.buttonRow}>
        {item.status === 'pending' && (
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => updateStatus(item._id, 'approved')} disabled={updatingId === item._id}>
            {updatingId === item._id ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.btnText}>Approve</Text>}
          </TouchableOpacity>
        )}
        {item.status === 'approved' && (
          <TouchableOpacity style={[styles.actionBtn, styles.deliverBtn]} onPress={() => updateStatus(item._id, 'delivered')} disabled={updatingId === item._id}>
            {updatingId === item._id ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.btnText}>Mark Delivered</Text>}
          </TouchableOpacity>
        )}
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
      <Text style={styles.title}>Supply Requests</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No supply requests yet</Text>
        </View>
      ) : (
        <FlatList data={requests} keyExtractor={(item) => item._id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#9ca3af' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  quantity: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  notes: { fontSize: 14, color: '#4b5563', marginTop: 10, fontStyle: 'italic' },
  staffInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  staffName: { fontSize: 13, color: '#6b7280' },
  requestDate: { fontSize: 12, color: '#9ca3af' },
  buttonRow: { marginTop: 12 },
  actionBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#3b82f6' },
  deliverBtn: { backgroundColor: '#10b981' },
  btnText: { color: 'white', fontWeight: '600' },
});