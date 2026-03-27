import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

export default function PatientFeedback() {
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, fbRes] = await Promise.all([
        api.get('/appointments/completed-without-feedback'),
        api.get('/feedback/patient'),
      ]);
      setAppointments(appRes.data);
      setFeedbacks(fbRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingFeedback(null);
    setSelectedAppointment(null);
    setRating(5);
    setComment('');
    setModalVisible(true);
  };

  const openEdit = (fb) => {
    setEditingFeedback(fb);
    setSelectedAppointment(fb.appointment);
    setRating(fb.rating);
    setComment(fb.comment || '');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedAppointment && !editingFeedback) {
      Alert.alert('Error', 'Please select an appointment');
      return;
    }
    setSubmitting(true);
    try {
      if (editingFeedback) {
        await api.put(`/feedback/${editingFeedback._id}`, { rating, comment });
        Alert.alert('Success', 'Feedback updated');
      } else {
        await api.post('/feedback', {
          appointmentId: selectedAppointment._id,
          rating,
          comment,
        });
        Alert.alert('Success', 'Feedback submitted');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.doctorName}>Dr. {item.appointment?.doctor?.name}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map(star => (
            <Ionicons key={star} name={star <= item.rating ? 'star' : 'star-outline'} size={18} color="#fbbf24" />
          ))}
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
            <Ionicons name="pencil" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>
      {item.comment && <Text style={styles.comment}>"{item.comment}"</Text>}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.giveBtn} onPress={openCreate}>
        <Ionicons name="star" size={24} color="white" />
        <Text style={styles.giveBtnText}>Give Feedback</Text>
      </TouchableOpacity>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        renderItem={renderFeedbackItem}
        ListEmptyComponent={<Text style={styles.empty}>No feedback given yet.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingFeedback ? 'Edit Feedback' : 'New Feedback'}</Text>
            {!editingFeedback && (
              <View>
                <Text style={styles.label}>Select Appointment:</Text>
                <FlatList
                  horizontal
                  data={appointments}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedAppointment(item)}
                      style={[
                        styles.appointmentOption,
                        selectedAppointment?._id === item._id && styles.appointmentOptionActive,
                      ]}
                    >
                      <Text style={[styles.appointmentText, selectedAppointment?._id === item._id && styles.appointmentTextActive]}>
                        Dr. {item.doctor?.name} - {formatDate(item.date)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            <Text style={styles.label}>Rating:</Text>
            <View style={styles.ratingSelect}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color="#fbbf24" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  giveBtn: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  giveBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
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
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { marginLeft: 12 },
  comment: { marginTop: 12, fontSize: 14, color: '#4b5563', fontStyle: 'italic' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  appointmentOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8, marginBottom: 8 },
  appointmentOptionActive: { backgroundColor: '#3b82f6' },
  appointmentText: { fontSize: 12, color: '#374151' },
  appointmentTextActive: { color: 'white' },
  ratingSelect: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6', marginRight: 8 },
  cancelBtnText: { color: '#374151', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#3b82f6', marginLeft: 8 },
  submitBtnText: { color: 'white', fontWeight: 'bold' },
});