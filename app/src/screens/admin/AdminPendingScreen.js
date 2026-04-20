import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function AdminPendingScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/admin/pending-users');
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/approve-user/${id}`);
      Alert.alert('Success', 'User approved');
      fetchPending();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/reject-user/${id}`);
      Alert.alert('Success', 'User rejected');
      fetchPending();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return '#3b82f6';
      case 'receptionist': return '#f59e0b';
      case 'labTechnician': return '#8b5cf6';
      case 'cleaningStaff': return '#ec489a';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
          <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
            {item.role === 'cleaningStaff' ? 'Cleaning Staff' : item.role}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => handleApprove(item._id)} disabled={processingId === item._id}>
          <Ionicons name="checkmark-circle" size={32} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleReject(item._id)} disabled={processingId === item._id}>
          <Ionicons name="close-circle" size={32} color="#ef4444" />
        </TouchableOpacity>
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
      <Text style={styles.title}>Pending Approvals</Text>
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="hourglass-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No pending approvals</Text>
        </View>
      ) : (
        <FlatList data={users} keyExtractor={(item) => item._id} renderItem={renderItem} />
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
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowOpacity: 0.05, elevation: 2 },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  roleText: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  actionButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});