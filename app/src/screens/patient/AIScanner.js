import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/axios';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/helpers';

export default function AIScanner() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastScans, setPastScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPastScans();
  }, []);

  const fetchPastScans = async () => {
    try {
      const { data } = await api.get('/skin-images');
      setPastScans(data);
    } catch (error) {
      console.error('Failed to fetch scans', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permission to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult('');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permission to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult('');
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select or take a photo first.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'scan.jpg',
      type: 'image/jpeg',
    });
    // No dummy analysisResult – backend will generate real AI prediction
    try {
      const { data } = await api.post('/skin-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.analysisResult || 'Analysis saved.');
      setImage(null);
      fetchPastScans(); // refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/skin-images/${id}`);
              fetchPastScans();
              setModalVisible(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
        },
      ]
    );
  };

  const renderScanItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scanCard}
      onPress={() => {
        setSelectedScan(item);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.scanImage} />
      <Text style={styles.scanDate}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Skin Scanner</Text>
      <Text style={styles.subtitle}>Upload a photo for preliminary analysis</Text>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImage(null)}>
            <Ionicons name="close-circle" size={28} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={pickImage}>
          <Ionicons name="images" size={24} color="white" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.analyzeButton, loading && styles.disabledButton]}
        onPress={analyzeImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="analytics" size={20} color="white" />
            <Text style={styles.buttonText}>Analyze</Text>
          </>
        )}
      </TouchableOpacity>

      {result !== '' && (
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}

      {/* Past Scans Section */}
      <Text style={styles.sectionTitle}>Past Scans</Text>
      {pastScans.length === 0 ? (
        <Text style={styles.emptyText}>No past scans yet.</Text>
      ) : (
        <FlatList
          data={pastScans}
          keyExtractor={(item) => item._id}
          renderItem={renderScanItem}
          numColumns={2}
          columnWrapperStyle={styles.scanGrid}
          scrollEnabled={false}
        />
      )}

      {/* Modal for scan details */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedScan?.imageUrl }} style={styles.modalImage} />
            <Text style={styles.modalDate}>{selectedScan ? formatDate(selectedScan.createdAt) : ''}</Text>
            {selectedScan?.analysisResult && (
              <Text style={styles.modalResult}>{selectedScan.analysisResult}</Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.deleteModalBtn]}
                onPress={() => handleDelete(selectedScan?._id)}
              >
                <Text style={styles.deleteModalBtnText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.closeModalBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24, textAlign: 'center' },
  imageContainer: { width: '100%', height: 250, marginBottom: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'white', borderRadius: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, width: '100%' },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, marginHorizontal: 6 },
  galleryButton: { backgroundColor: '#3b82f6' },
  cameraButton: { backgroundColor: '#8b5cf6' },
  analyzeButton: { backgroundColor: '#10b981', width: '100%', marginBottom: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  disabledButton: { opacity: 0.6 },
  resultCard: { flexDirection: 'row', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 20 },
  resultText: { marginLeft: 12, fontSize: 14, color: '#065f46', flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', alignSelf: 'flex-start', marginTop: 20, marginBottom: 12, color: '#1f2937' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
  scanGrid: { justifyContent: 'space-between', marginBottom: 12 },
  scanCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scanImage: { width: '100%', height: 120, resizeMode: 'cover' },
  scanDate: { fontSize: 12, color: '#6b7280', textAlign: 'center', padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400, alignItems: 'center' },
  modalImage: { width: '100%', height: 250, borderRadius: 8, marginBottom: 12 },
  modalDate: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  modalResult: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  deleteModalBtn: { backgroundColor: '#fee2e2' },
  deleteModalBtnText: { color: '#ef4444', fontWeight: 'bold' },
  closeModalBtn: { backgroundColor: '#e5e7eb' },
  closeModalBtnText: { color: '#374151', fontWeight: 'bold' },
});