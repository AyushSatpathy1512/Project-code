/**
 * Login.js — Secure Login Screen
 *
 * Security implementation:
 *  - Accepted username : Ayush
 *  - Accepted password : Maruti@800  (stored as SHA-256 hash — never in plain text)
 *  - On submit, the entered password is hashed and compared against
 *    the stored hash. The plain-text password never exists in comparison logic.
 *
 * SHA-256("Maruti@800") =
 *   8f97107ab86a14b77221a1bb5aacb4af7dd4f5cddf5aa26471ca8bb80782bd34
 *
 * Library: crypto-js  →  npm install crypto-js
 */
 
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CryptoJS from 'crypto-js';
 
// ─────────────────────────────────────────────
//  Secure Credentials
//  Password is stored as SHA-256 hash ONLY.
//  The plain-text password is NEVER stored.
// ─────────────────────────────────────────────
const ACCEPTED_USERNAME      = 'Ayush';
const ACCEPTED_PASSWORD_HASH = '8f97107ab86a14b77221a1bb5aacb4af7dd4f5cddf5aa26471ca8bb80782bd34';
 
// ─────────────────────────────────────────────
//  Reusable sub-components
// ─────────────────────────────────────────────
 
const Blob = ({ style }) => <View style={[styles.blob, style]} />;
 
const InputField = ({
  icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, autoCapitalize,
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputIcon}>{icon}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#B0B0C0"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType || 'default'}
      autoCapitalize={autoCapitalize || 'none'}
      autoCorrect={false}
    />
  </View>
);
 
// ─────────────────────────────────────────────
//  Main Login Screen
// ─────────────────────────────────────────────
 
const Login = ({ navigation }) => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors]       = useState({});
 
  // ── Validate empty fields ───────────────────
  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  // ── Secure credential check ─────────────────
  // Hash the entered password with SHA-256 and compare to stored hash
  const checkCredentials = () => {
    const enteredHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    return (
      username.trim() === ACCEPTED_USERNAME &&
      enteredHash     === ACCEPTED_PASSWORD_HASH
    );
  };
 
  // ── Login handler ───────────────────────────
  const handleLogin = () => {
    if (!validate()) return;
 
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (checkCredentials()) {
        // replace() removes Login from the stack — back button cannot return here
        if (navigation) navigation.replace('Home');
      } else {
        setErrors({ general: 'Invalid username or password' });
      }
    }, 1000);
  };
 
  // ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
 
      {/* ── Decorative blobs ── */}
      <Blob style={styles.blobTopLeft} />
      <Blob style={styles.blobTopRight} />
      <Blob style={styles.blobMidLeft} />
      <Blob style={styles.blobMidRight} />
      <Blob style={styles.blobBottomLeft} />
      <Blob style={styles.blobBottomRight} />
 
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
 
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
 
          {/* ── Wrong credentials error ── */}
          {errors.general ? (
            <View style={styles.generalErrorBox}>
              <Text style={styles.generalErrorText}>⚠️  {errors.general}</Text>
            </View>
          ) : null}
 
          {/* ── Username ── */}
          <InputField
            icon="👤"
            placeholder="Username"
            value={username}
            onChangeText={text => {
              setUsername(text);
              setErrors(prev => ({ ...prev, username: null, general: null }));
            }}
            autoCapitalize="none"
          />
          {errors.username
            ? <Text style={styles.errorText}>{errors.username}</Text>
            : null}
 
          {/* ── Password ── */}
          <InputField
            icon="🔒"
            placeholder="••••••••"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: null, general: null }));
            }}
            secureTextEntry
          />
          {errors.password
            ? <Text style={styles.errorText}>{errors.password}</Text>
            : null}
 
          {/* ── Login Button ── */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoading}
            style={styles.buttonTouchable}
          >
            <LinearGradient
              colors={['#5BC8F5', '#9B6FE0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginButtonText}>Login</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
 
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
 
// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────
 
const BP = 'rgba(180, 160, 230, 0.35)';
const BB = 'rgba(160, 195, 235, 0.35)';
 
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#EEF0FA' },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
 
  blob:           { position: 'absolute', borderRadius: 999 },
  blobTopLeft:    { width: 170, height: 170, top: -50,  left: -50,  backgroundColor: BP },
  blobTopRight:   { width: 200, height: 200, top: -60,  right: -60, backgroundColor: BB },
  blobMidLeft:    { width: 28,  height: 28,  top: '38%', left: 16,  backgroundColor: BB },
  blobMidRight:   { width: 22,  height: 22,  top: '48%', right: 20, backgroundColor: BP },
  blobBottomLeft: { width: 220, height: 260, bottom: -80, left: -60, backgroundColor: BB, borderRadius: 130 },
  blobBottomRight:{ width: 160, height: 160, bottom: -40, right: -50, backgroundColor: BP },
 
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 28,
    paddingVertical: 40, paddingHorizontal: 28,
    elevation: 12,
    shadowColor: '#7B8CDE', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20,
  },
  title:    { fontSize: 28, fontWeight: '700', color: '#2D2D5E', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#9E9EB8', textAlign: 'center', marginBottom: 24 },
 
  generalErrorBox: {
    backgroundColor: '#FEE8E8', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#F5C6C6',
  },
  generalErrorText: { color: '#D93025', fontSize: 13, fontWeight: '500', textAlign: 'center' },
 
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4FA', borderRadius: 50,
    paddingHorizontal: 18, paddingVertical: 14, marginBottom: 14,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input:     { flex: 1, fontSize: 14, color: '#2D2D5E', padding: 0 },
 
  errorText: { color: '#E05C5C', fontSize: 11, marginTop: -8, marginBottom: 8, marginLeft: 18 },
 
  buttonTouchable: { marginTop: 10 },
  loginButton: {
    borderRadius: 50, paddingVertical: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
 
export default Login;
