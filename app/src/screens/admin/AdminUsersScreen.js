import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, TextInput,
  Modal, StyleSheet, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'patient' });
    setModalVisible(true);
  };

  const openEdit = (user) => {
    if (user.role === 'admin') {
      Alert.alert('Forbidden', 'Admin accounts cannot be edited');
      return;
    }
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || (!editingUser && !form.password)) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, form);
        Alert.alert('Success', 'User updated');
      } else {
        await api.post('/admin/users', form);
        Alert.alert('Success', 'User created');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, role) => {
    if (role === 'admin') {
      Alert.alert('Forbidden', 'Admin accounts cannot be deleted');
      return;
    }
    Alert.alert('Confirm', 'Delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
            Alert.alert('Success', 'User deleted');
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          }
        }
      }
    ]);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'doctor': return '#3b82f6';
      case 'patient': return '#10b981';
      case 'receptionist': return '#f59e0b';
      case 'labTechnician': return '#8b5cf6';
      case 'cleaningStaff': return '#ec489a';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
          <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
            {item.role === 'cleaningStaff' ? 'Cleaning Staff' : item.role}
          </Text>
        </View>
      </View>
      {item.role !== 'admin' ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => openEdit(item)}>
            <Ionicons name="create-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id, item.role)}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.protectedBadge}>Protected</Text>
      )}
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
      <View style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList data={users} keyExtractor={(item) => item._id} renderItem={renderItem} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingUser ? 'Edit User' : 'Create User'}</Text>
            <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
            <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder={editingUser ? "New Password (optional)" : "Password"} value={form.password} onChangeText={(text) => setForm({ ...form, password: text })} secureTextEntry />
            
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleSelectContainer}>
              {['patient', 'doctor', 'receptionist', 'labTechnician', 'cleaningStaff'].map((r) => (
                <TouchableOpacity key={r} style={[styles.roleSelectBtn, form.role === r && styles.roleSelectBtnActive]} onPress={() => setForm({ ...form, role: r })}>
                  <Text style={[styles.roleSelectText, form.role === r && styles.roleSelectTextActive]}>
                    {r === 'labTechnician' ? 'Lab Tech' : r === 'cleaningStaff' ? 'Cleaning' : r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : (editingUser ? 'Update' : 'Create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f' },
  addButton: { backgroundColor: '#1d4ed8', borderRadius: 30, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowOpacity: 0.05, elevation: 2 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  userEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  roleText: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  actionButtons: { flexDirection: 'row', gap: 16 },
  protectedBadge: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#1e3a5f' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  roleSelectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  roleSelectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  roleSelectBtnActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  roleSelectText: { fontSize: 13, color: '#4b5563' },
  roleSelectTextActive: { color: 'white' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelButtonText: { color: '#6b7280', fontWeight: '600' },
  submitButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#1d4ed8', alignItems: 'center' },
  submitButtonText: { color: 'white', fontWeight: '600' },
});