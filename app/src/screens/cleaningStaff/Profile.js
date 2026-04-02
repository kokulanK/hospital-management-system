import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from '../../components/Toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfile(data);
      setNameValue(data.name);
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Fall back to AuthContext data
      setProfile(user);
      setNameValue(user?.name || '');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    if (nameValue.trim() === profile?.name) {
      setEditingName(false);
      return;
    }
    try {
      setSavingName(true);
      const { data } = await api.put('/users/profile', { name: nameValue.trim() });
      setProfile(prev => ({ ...prev, name: data.name }));
      setEditingName(false);
      setToast({ message: 'Name updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update name.', type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelName = () => {
    setNameValue(profile?.name || '');
    setEditingName(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    try {
      setSavingPassword(true);
      await api.put('/users/profile', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({ message: 'Password changed successfully!', type: 'success' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color="#3b82f6" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  const PasswordInput = ({ label, value, onChange, show, onToggle }) => (
    <View style={styles.passwordField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordInputRow}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>

        {profileLoading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        ) : (
          <>
            {/* Avatar + Role Banner */}
            <View style={styles.avatarCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {(profile?.name || user?.name || 'C').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.avatarName}>{profile?.name || user?.name}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="sparkles-outline" size={13} color="#3b82f6" />
                <Text style={styles.roleText}>Cleaning Staff</Text>
              </View>
            </View>

            {/* Account Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Account Info</Text>
              </View>

              {/* Name row — editable */}
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person-outline" size={18} color="#3b82f6" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  {editingName ? (
                    <View style={styles.inlineEditRow}>
                      <TextInput
                        style={styles.inlineInput}
                        value={nameValue}
                        onChangeText={setNameValue}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleSaveName}
                      />
                      <TouchableOpacity onPress={handleSaveName} disabled={savingName} style={styles.inlineBtn}>
                        {savingName
                          ? <ActivityIndicator size="small" color="#3b82f6" />
                          : <Ionicons name="checkmark" size={20} color="#3b82f6" />
                        }
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCancelName} style={styles.inlineBtn}>
                        <Ionicons name="close" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.nameDisplayRow}>
                      <Text style={styles.infoValue}>{profile?.name}</Text>
                      <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editNameBtn}>
                        <Ionicons name="pencil-outline" size={15} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <InfoRow icon="mail-outline" label="Email" value={profile?.email || user?.email} />
              <InfoRow icon="shield-checkmark-outline" label="Role" value="Cleaning Staff" />
            </View>

            {/* Change Password Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardSubtitle}>Leave blank if you don't want to change it</Text>

              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent(p => !p)}
              />
              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(p => !p)}
              />
              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(p => !p)}
              />

              {!!passwordError && (
                <View style={styles.formErrorRow}>
                  <Ionicons name="alert-circle" size={15} color="#ef4444" />
                  <Text style={styles.formErrorText}>{passwordError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.savePasswordBtn, savingPassword && styles.btnDisabled]}
                onPress={handleChangePassword}
                disabled={savingPassword}
              >
                {savingPassword
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.savePasswordBtnText}>Update Password</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </>
        )}
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
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
  loader: { marginTop: 40 },

  avatarCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarInitial: { fontSize: 30, fontWeight: 'bold', color: '#3b82f6' },
  avatarName: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 6 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, gap: 4 },
  roleText: { fontSize: 13, color: '#3b82f6', fontWeight: '500' },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '500', marginTop: 2 },

  nameDisplayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editNameBtn: { padding: 2 },
  inlineEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  inlineInput: { flex: 1, borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8, padding: 6, fontSize: 14, color: '#1f2937' },
  inlineBtn: { padding: 4 },

  passwordField: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  passwordInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, backgroundColor: '#f9fafb' },
  passwordInput: { flex: 1, padding: 12, fontSize: 14, color: '#1f2937' },
  eyeBtn: { padding: 12 },

  formErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  formErrorText: { color: '#ef4444', fontSize: 13, flex: 1 },

  savePasswordBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  btnDisabled: { backgroundColor: '#93c5fd' },
  savePasswordBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 12, paddingVertical: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});