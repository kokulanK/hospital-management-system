import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, ActivityIndicator, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorLabRequests() {
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', testType: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchPatients();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/lab-requests/doctor');
      setRequests(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load lab requests');
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

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ patientId: '', testType: '', description: '' });
    setIsDropdownVisible(false);
    setSearchQuery('');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({ 
      patientId: item.patient?._id || '', 
      testType: item.testType || '', 
      description: item.description || '' 
    });
    setIsDropdownVisible(false);
    setSearchQuery('');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.testType) {
      Alert.alert('Error', 'Please select patient and test type');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/lab-requests/${editingId}`, formData);
        Alert.alert('Success', 'Lab request updated');
      } else {
        await api.post('/lab-requests', formData);
        Alert.alert('Success', 'Lab request created');
      }
      setModalVisible(false);
      setFormData({ patientId: '', testType: '', description: '' });
      setEditingId(null);
      setIsDropdownVisible(false);
      setSearchQuery('');
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this pending request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/lab-requests/${id}`);
              Alert.alert('Success', 'Lab request deleted');
              fetchRequests();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.patientName}>{item.patient?.name}</Text>
          <Text style={styles.testType}>Test: {item.testType}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          {item.description && <Text style={styles.desc}>{item.description}</Text>}
          {item.acceptedBy && (
            <Text style={styles.accepted}>Accepted by: {item.acceptedBy.name} on {formatDate(item.acceptedAt)}</Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.status, { color: item.status === 'pending' ? '#f59e0b' : item.status === 'accepted' ? '#3b82f6' : '#10b981' }]}>
            {item.status.toUpperCase()}
          </Text>
          {item.status === 'pending' && (
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>DELETE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {item.status === 'completed' && (
        <>
          {item.resultFile && (
            <Image source={{ uri: item.resultFile }} style={styles.resultImage} />
          )}
          {item.resultText && <Text style={styles.resultText}>{item.resultText}</Text>}
        </>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedPatientName = formData.patientId 
    ? patients.find(p => p._id === formData.patientId)?.name || 'Select Patient'
    : 'Select Patient';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.createBtn} onPress={openCreateModal}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.createBtnText}>New Lab Request</Text>
      </TouchableOpacity>

        <FlatList
          data={requests}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No lab requests.</Text>}
        />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={Keyboard.dismiss}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Lab Request' : 'Create Lab Request'}</Text>
            <View style={styles.selectRow}>
              <Text style={styles.label}>Patient:</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setIsDropdownVisible(!isDropdownVisible)}
              >
                <Text style={styles.dropdownBtnText}>{selectedPatientName}</Text>
                <Ionicons name={isDropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
              </TouchableOpacity>
              
              {isDropdownVisible && (
                <View style={styles.dropdownContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search patient name..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <FlatList
                    data={filteredPatients}
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={(item) => item._id}
                    style={{ maxHeight: 150 }}
                    nestedScrollEnabled
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.dropdownItem, formData.patientId === item._id && styles.dropdownItemActive]}
                        onPress={() => {
                          setFormData({ ...formData, patientId: item._id });
                          setIsDropdownVisible(false);
                          setSearchQuery('');
                        }}
                      >
                        <Text style={[styles.dropdownItemText, formData.patientId === item._id && styles.dropdownItemTextActive]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.emptySearch}>No patients match your search.</Text>}
                  />
                </View>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Test Type"
              value={formData.testType}
              onChangeText={(text) => setFormData({ ...formData, testType: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSubmit} disabled={submitting}>
                <Text style={styles.submitBtnText}>{submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')}</Text>
              </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  createBtn: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  createBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  testType: { fontSize: 14, color: '#4b5563', marginTop: 4 },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  desc: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  accepted: { fontSize: 12, color: '#3b82f6', marginTop: 4 },
  status: { fontSize: 12, fontWeight: 'bold' },
  resultImage: { width: '100%', height: 200, marginTop: 12, borderRadius: 8 },
  resultText: { marginTop: 12, fontSize: 14, color: '#374151' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  selectRow: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  patientOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  patientOptionActive: { backgroundColor: '#3b82f6' },
  patientText: { fontSize: 12, color: '#374151' },
  patientTextActive: { color: 'white' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6', marginRight: 8 },
  cancelBtnText: { color: '#374151', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#3b82f6', marginLeft: 8 },
  submitBtnText: { color: 'white', fontWeight: 'bold' },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: 'white' },
  dropdownBtnText: { fontSize: 16, color: '#1f2937' },
  dropdownContainer: { marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, backgroundColor: '#f9fafb' },
  searchInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginBottom: 8, backgroundColor: 'white' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  dropdownItemActive: { backgroundColor: '#eff6ff' },
  dropdownItemText: { fontSize: 14, color: '#374151' },
  dropdownItemTextActive: { color: '#3b82f6', fontWeight: 'bold' },
  emptySearch: { textAlign: 'center', color: '#9ca3af', marginVertical: 12 },
});