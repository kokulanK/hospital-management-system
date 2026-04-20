import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const roles = ['patient', 'doctor', 'receptionist', 'labTechnician', 'cleaningStaff'];

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, role });
    setLoading(false);

    if (result.success) {
      if (result.pending) {
        Alert.alert('Registration Submitted', result.message || 'Your account is pending admin approval.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Success', 'Registration successful!');
      }
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our healthcare platform</Text>

          <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <Text style={styles.label}>Select Role:</Text>
          <View style={styles.roleContainer}>
            {roles.map((r) => (
              <TouchableOpacity key={r} style={[styles.roleButton, role === r && styles.roleButtonActive]} onPress={() => setRole(r)}>
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r === 'labTechnician' ? 'Lab Tech' : r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 24, shadowOpacity: 0.05, elevation: 3 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1e3a5f', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#6b7280', marginBottom: 24 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  roleButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  roleButtonActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' },
  roleText: { fontSize: 14, color: '#4b5563' },
  roleTextActive: { color: 'white' },
  button: { backgroundColor: '#1d4ed8', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 20, color: '#1d4ed8', fontSize: 14 },
});