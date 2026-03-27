import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
    // Navigation will be handled by AppNavigator based on user state
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Ionicons name="medical" size={64} color="#3b82f6" />
          <Text style={styles.title}>Hospital Management</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            {/* Row 1: Patient alone */}
            <View style={styles.registerRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterPatient')}
                style={styles.registerLink}
              >
                <Text style={styles.link}>Patient</Text>
              </TouchableOpacity>
            </View>
            {/* Row 2: Doctor & Receptionist */}
            <View style={styles.registerRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterDoctor')}
                style={styles.registerLink}
              >
                <Text style={styles.link}>Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterReceptionist')}
                style={styles.registerLink}
              >
                <Text style={styles.link}>Receptionist</Text>
              </TouchableOpacity>
            </View>
            {/* Row 3: Cleaning Staff & Lab Technician */}
            <View style={styles.registerRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterCleaningStaff')}
                style={styles.registerLink}
              >
                <Text style={styles.link}>Cleaning Staff</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterLabTechnician')}
                style={styles.registerLink}
              >
                <Text style={styles.link}>Lab Technician</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 12, color: '#1f2937' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  form: { width: '100%' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  loginBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  registerSection: { marginTop: 24, alignItems: 'center' },
  registerText: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  registerLink: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  link: { color: '#3b82f6', fontWeight: '500', fontSize: 14 },
});