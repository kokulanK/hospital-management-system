import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Modal, RefreshControl,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/helpers';
import Toast from '../../components/Toast';

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', text: '#92400e' },
  approved:  { bg: '#dbeafe', text: '#1e40af' },
  delivered: { bg: '#d1fae5', text: '#065f46' },
};

const STATUS_ICONS = {
  pending:   'time-outline',
  approved:  'checkmark-circle-outline',
  delivered: 'cube',
};

export default function SupplyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError(null);
      const { data } = await api.get('/supply-requests/my');
      setRequests(data);
    } catch (err) {
      console.error('Supply requests fetch error:', err);
      setError('Failed to load supply requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, []);

  const resetForm = () => {
    setItemName('');
    setQuantity('');
    setNotes('');
    setFormError('');
  };

  const handleOpenModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      setFormError('Item name is required.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!quantity || isNaN(qty) || qty < 1) {
      setFormError('Please enter a valid quantity (minimum 1).');
      return;
    }
    try {
      setFormError('');
      setSubmitting(true);
      const { data } = await api.post('/supply-requests', {
        itemName: itemName.trim(),
        quantity: qty,
        notes: notes.trim(),
      });
      setRequests(prev => [data, ...prev]);
      setModalVisible(false);
      setToast({ message: 'Supply request submitted successfully!', type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Supply Requests</Text>
          <TouchableOpacity style={styles.newBtn} onPress={handleOpenModal}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Banner */}
        {!loading && !error && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryChip, { backgroundColor: '#fef3c7' }]}>
              <Text style={[styles.summaryChipText, { color: '#92400e' }]}>{pendingCount} Pending</Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: '#dbeafe' }]}>
              <Text style={[styles.summaryChipText, { color: '#1e40af' }]}>
                {requests.filter(r => r.status === 'approved').length} Approved
              </Text>
            </View>
            <View style={[styles.summaryChip, { backgroundColor: '#d1fae5' }]}>
              <Text style={[styles.summaryChipText, { color: '#065f46' }]}>
                {requests.filter(r => r.status === 'delivered').length} Delivered
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchRequests}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={56} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No supply requests yet</Text>
            <Text style={styles.emptySubtitle}>Tap "New" to submit your first request</Text>
          </View>
        ) : (
          requests.map((req) => {
            const colors = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
            const icon = STATUS_ICONS[req.status] || 'time-outline';
            return (
              <View key={req._id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <View style={styles.requestLeft}>
                    <Text style={styles.itemName}>{req.itemName}</Text>
                    <Text style={styles.itemQty}>Qty: {req.quantity}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Ionicons name={icon} size={13} color={colors.text} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {!!req.notes && (
                  <Text style={styles.requestNotes}>{req.notes}</Text>
                )}

                <View style={styles.requestDates}>
                  <Text style={styles.dateText}>Requested: {formatDate(req.createdAt)}</Text>
                  {req.approvedAt && (
                    <Text style={styles.dateText}>Approved: {formatDate(req.approvedAt)}</Text>
                  )}
                  {req.deliveredAt && (
                    <Text style={styles.dateText}>Delivered: {formatDate(req.deliveredAt)}</Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* New Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Supply Request</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Item Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Disinfectant spray"
              placeholderTextColor="#9ca3af"
              value={itemName}
              onChangeText={setItemName}
            />

            <Text style={styles.inputLabel}>Quantity <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 5"
              placeholderTextColor="#9ca3af"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Any additional details..."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {!!formError && (
              <View style={styles.formErrorRow}>
                <Ionicons name="alert-circle" size={15} color="#ef4444" />
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#1f2937' },
  newBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
  newBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  loader: { marginTop: 40 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  summaryChipText: { fontSize: 12, fontWeight: '600' },

  errorCard: { alignItems: 'center', marginTop: 40, padding: 24, backgroundColor: 'white', borderRadius: 12 },
  errorText: { marginTop: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#9ca3af', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#d1d5db', marginTop: 6 },

  requestCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  requestTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  requestLeft: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  itemQty: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  requestNotes: { fontSize: 13, color: '#6b7280', marginBottom: 8, lineHeight: 18 },
  requestDates: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8, gap: 2 },
  dateText: { fontSize: 11, color: '#9ca3af' },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  required: { color: '#ef4444' },
  optional: { color: '#9ca3af', fontWeight: '400' },
  textInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 14, color: '#1f2937', marginBottom: 14, backgroundColor: '#f9fafb' },
  textArea: { height: 80 },
  formErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  formErrorText: { color: '#ef4444', fontSize: 13, flex: 1 },
  submitBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});