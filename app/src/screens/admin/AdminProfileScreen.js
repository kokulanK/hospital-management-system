import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const updateData = { name };
      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      const { data } = await api.put('/users/profile', updateData);
      Alert.alert('Success', 'Profile updated successfully');
      user.name = data.name;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Confirm', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput style={[styles.input, styles.disabledInput]} value={user?.email} editable={false} />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Text style={styles.sectionHint}>Leave blank to keep current password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Current Password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="key-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        </View>
        <View style={styles.inputWrapper}>
          <Ionicons name="key-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.updateButtonText}>Update Profile</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff', padding: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 20 },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '600', color: 'white' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  userEmail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  roleBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#1d4ed8' },
  formSection: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20, shadowOpacity: 0.05, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  sectionHint: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 12, backgroundColor: '#f9fafb' },
  inputIcon: { marginLeft: 12 },
  input: { flex: 1, padding: 14, fontSize: 16 },
  disabledInput: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
  updateButton: { backgroundColor: '#1d4ed8', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  updateButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2', marginBottom: 30 },
  logoutButtonText: { color: '#ef4444', fontWeight: '600', fontSize: 16 },
});