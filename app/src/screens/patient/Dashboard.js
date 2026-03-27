import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDate, getGreeting } from '../../utils/helpers';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, total: 0, scans: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [appRes, scansRes] = await Promise.all([
        api.get('/appointments/patient'),
        api.get('/skin-images'),
      ]);
      const appointments = appRes.data;
      const upcoming = appointments.filter(a => new Date(a.startTime) >= new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setUpcomingAppointments(upcoming.slice(0, 3));
      setStats({
        upcoming: upcoming.length,
        total: appointments.length,
        scans: scansRes.data.length,
      });
      setRecentScans(scansRes.data.slice(0, 3));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to load data. ';
      if (err.response?.status === 401) {
        errorMessage += 'Your session has expired. Please logout and login again.';
      } else if (err.response?.status === 403) {
        errorMessage += 'You don\'t have permission to view this data.';
      } else if (err.response?.status === 404) {
        errorMessage += 'The requested resource was not found.';
      } else if (err.message === 'Network Error') {
        errorMessage += 'Network error. Check your connection.';
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  // Quick actions in the requested order
  const quickActions = [
    { name: 'Book Appointment', icon: 'calendar', screen: 'Appointments', color: '#3b82f6' },
    { name: 'Feedback', icon: 'star', screen: 'Feedback', color: '#10b981' },
    { name: 'AI Scanner', icon: 'camera', screen: 'Scanner', color: '#8b5cf6' },
    { name: 'Profile', icon: 'person', screen: 'Profile', color: '#f59e0b' },
    { name: 'Settings', icon: 'settings', screen: 'Settings', color: '#6b7280' },
  ];

  const statCards = [
    { label: 'Upcoming', value: stats.upcoming, icon: 'calendar', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Visits', value: stats.total, icon: 'checkmark-circle', color: '#10b981', bg: '#f0fdf4' },
    { label: 'Skin Scans', value: stats.scans, icon: 'camera', color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}</Text>
        <Text style={styles.subGreeting}>Welcome back to your health hub</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
            {error.includes('session expired') && (
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            {statCards.map((card, idx) => (
              <View key={idx} style={[styles.statCard, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={28} color={card.color} />
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            ))}
          </View>

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

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            ) : (
              upcomingAppointments.map((app, idx) => (
                <View key={idx} style={styles.appointmentItem}>
                  <View>
                    <Text style={styles.doctorName}>Dr. {app.doctor?.name}</Text>
                    <Text style={styles.appointmentDate}>{formatDate(app.startTime)}</Text>
                    <Text style={styles.appointmentTime}>
                      {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              ))
            )}
          </View>

          {recentScans.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recent Skin Scans</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Scanner')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentScans.map((scan, idx) => (
                  <TouchableOpacity key={idx} style={styles.scanItem} onPress={() => navigation.navigate('Scanner')}>
                    <Image source={{ uri: scan.imageUrl }} style={styles.scanImage} />
                    <Text style={styles.scanDate}>{formatDate(scan.createdAt)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  subGreeting: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  loader: { marginTop: 40 },
  errorCard: { alignItems: 'center', marginTop: 40, padding: 20, backgroundColor: 'white', borderRadius: 12 },
  errorText: { marginTop: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  errorButtons: { flexDirection: 'row', gap: 12 },
  retryBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  logoutBtnText: { color: 'white', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, marginHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8, color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#1f2937' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionCard: { width: '48%', backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  actionLabel: { fontSize: 14, fontWeight: '500', marginTop: 8, color: '#374151', textAlign: 'center' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  seeAll: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  appointmentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  doctorName: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  appointmentDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  appointmentTime: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 20 },
  scanItem: { alignItems: 'center', marginRight: 16 },
  scanImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6' },
  scanDate: { fontSize: 10, color: '#6b7280', marginTop: 6, textAlign: 'center' },
});