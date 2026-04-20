import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

export default function AdminFeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/admin/feedback');
      setFeedbacks(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this feedback?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await api.delete(`/admin/feedback/${id}`);
            Alert.alert('Success', 'Feedback deleted');
            fetchFeedbacks();
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          } finally {
            setDeletingId(null);
          }
        }
      }
    ]);
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.patient?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.patientName}>{item.patient?.name}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)} disabled={deletingId === item._id}>
          {deletingId === item._id ? <ActivityIndicator size="small" color="#ef4444" /> : <Ionicons name="trash-outline" size={22} color="#ef4444" />}
        </TouchableOpacity>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingStars}>{renderStars(item.rating)}</Text>
        <Text style={styles.ratingText}>({item.rating}/5)</Text>
      </View>
      {item.comment && (
        <View style={styles.commentBox}>
          <Text style={styles.commentText}>"{item.comment}"</Text>
        </View>
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
      <Text style={styles.title}>All Feedback</Text>
      {feedbacks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No feedback yet</Text>
        </View>
      ) : (
        <FlatList data={feedbacks} keyExtractor={(item) => item._id} renderItem={renderItem} />
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
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#d97706' },
  patientName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  ratingStars: { fontSize: 16, color: '#f59e0b' },
  ratingText: { fontSize: 13, color: '#6b7280' },
  commentBox: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, marginTop: 12 },
  commentText: { fontSize: 14, color: '#4b5563', fontStyle: 'italic' },
});