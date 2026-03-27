import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const { logout } = useAuth(); // import logout
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailReminders: true,
    smsAppointments: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareData: false,
  });
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
  });

  const handleSave = () => {
    Alert.alert('Settings Saved', 'Your preferences have been saved (demo).');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text>Email Appointment Confirmations</Text>
          <Switch
            value={notifications.emailAppointments}
            onValueChange={(val) => setNotifications({ ...notifications, emailAppointments: val })}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text>Email Reminders</Text>
          <Switch
            value={notifications.emailReminders}
            onValueChange={(val) => setNotifications({ ...notifications, emailReminders: val })}
          />
        </View>
        <View style={styles.settingRow}>
          <Text>SMS Appointment Alerts</Text>
          <Switch
            value={notifications.smsAppointments}
            onValueChange={(val) => setNotifications({ ...notifications, smsAppointments: val })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingRow}>
          <Text>Public Profile Visibility</Text>
          <Switch
            value={privacy.profileVisible}
            onValueChange={(val) => setPrivacy({ ...privacy, profileVisible: val })}
          />
        </View>
        <View style={styles.settingRow}>
          <Text>Share Data for Research</Text>
          <Switch
            value={privacy.shareData}
            onValueChange={(val) => setPrivacy({ ...privacy, shareData: val })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text>Theme</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[styles.themeBtn, appearance.theme === 'light' && styles.themeBtnActive]}
              onPress={() => setAppearance({ ...appearance, theme: 'light' })}
            >
              <Text style={appearance.theme === 'light' ? styles.themeTextActive : styles.themeText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeBtn, appearance.theme === 'dark' && styles.themeBtnActive]}
              onPress={() => setAppearance({ ...appearance, theme: 'dark' })}
            >
              <Text style={appearance.theme === 'dark' ? styles.themeTextActive : styles.themeText}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Text>Language</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[styles.themeBtn, appearance.language === 'en' && styles.themeBtnActive]}
              onPress={() => setAppearance({ ...appearance, language: 'en' })}
            >
              <Text style={appearance.language === 'en' ? styles.themeTextActive : styles.themeText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeBtn, appearance.language === 'si' && styles.themeBtnActive]}
              onPress={() => setAppearance({ ...appearance, language: 'si' })}
            >
              <Text style={appearance.language === 'si' ? styles.themeTextActive : styles.themeText}>Sinhala</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeBtn, appearance.language === 'ta' && styles.themeBtnActive]}
              onPress={() => setAppearance({ ...appearance, language: 'ta' })}
            >
              <Text style={appearance.language === 'ta' ? styles.themeTextActive : styles.themeText}>Tamil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  themeButtons: { flexDirection: 'row' },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginLeft: 8,
  },
  themeBtnActive: { backgroundColor: '#3b82f6' },
  themeText: { fontSize: 12, color: '#374151' },
  themeTextActive: { color: 'white' },
  saveBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoutBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});