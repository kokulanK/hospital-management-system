import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('all');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeedbacks();
    fetchPatients();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/feedback/doctor');
      setFeedbacks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/users/patients');
      setPatients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.patientName}>{item.patient?.name}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.rating}>
          {[1,2,3,4,5].map(star => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={18}
              color="#fbbf24"
            />
          ))}
          <Text style={styles.ratingText}> ({item.rating}/5)</Text>
        </View>
      </View>
      {item.comment && <Text style={styles.comment}>"{item.comment}"</Text>}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;

  const filteredFeedbacks = feedbacks.filter(f => selectedPatientId === 'all' || f.patient?._id === selectedPatientId);

  const dropdownOptions = [{ _id: 'all', name: 'All Patients' }, ...patients].filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedPatientName = selectedPatientId === 'all' 
    ? 'All Patients' 
    : patients.find(p => p._id === selectedPatientId)?.name || 'Select Patient';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.filterContainer}>
        <Text style={styles.label}>Filter by Patient:</Text>
        <TouchableOpacity 
          style={styles.dropdownBtn} 
          onPress={() => setIsDropdownVisible(true)}
        >
          <Text style={styles.dropdownBtnText}>{selectedPatientName}</Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <Modal visible={isDropdownVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={Keyboard.dismiss}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity onPress={() => setIsDropdownVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search patient name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
            />

            <FlatList
              data={dropdownOptions}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item._id}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, selectedPatientId === item._id && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedPatientId(item._id);
                    setIsDropdownVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedPatientId === item._id && styles.dropdownItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptySearch}>No patients match your search.</Text>}
            />
          </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={filteredFeedbacks}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No feedback received yet.</Text>}
      />
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  comment: { marginTop: 12, fontSize: 14, color: '#4b5563', fontStyle: 'italic' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  filterContainer: { marginBottom: 16, zIndex: 1 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#374151' },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  dropdownBtnText: { fontSize: 16, color: '#1f2937' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  searchInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownItemActive: { backgroundColor: '#eff6ff' },
  dropdownItemText: { fontSize: 16, color: '#374151' },
  dropdownItemTextActive: { color: '#3b82f6', fontWeight: 'bold' },
  emptySearch: { textAlign: 'center', color: '#9ca3af', marginTop: 20, marginBottom: 20 },
});