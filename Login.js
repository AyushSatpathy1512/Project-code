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
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ─────────────────────────────────────────────
//  Reusable sub-components (props-driven)
// ─────────────────────────────────────────────

/** Decorative background circle / blob */
const Blob = ({ style }) => <View style={[styles.blob, style]} />;

/** Icon + TextInput row */
const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, rightElement }) => (
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
    {rightElement}
  </View>
);

// ─────────────────────────────────────────────
//  Main Login Screen
// ─────────────────────────────────────────────

const Login = ({ navigation }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors]     = useState({});

  // ── Validation ──────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!email.trim())    newErrors.email    = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Login handler ────────────────────────────
  const handleLogin = () => {
    if (!validate()) return;

    setIsLoading(true);
    // Simulated API call (replace with real call later)
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success 🎉', 'You have logged in successfully!');
      // navigation.navigate('Home'); // uncomment when Home screen exists
    }, 1500);
  };

  // ── Forgot password handler ──────────────────
  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset flow coming soon.');
  };

  // ────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* ── Decorative background blobs ── */}
      <Blob style={styles.blobTopLeft} />
      <Blob style={styles.blobTopRight} />
      <Blob style={styles.blobMidLeft} />
      <Blob style={styles.blobMidRight} />
      <Blob style={styles.blobBottomLeft} />
      <Blob style={styles.blobBottomRight} />

      {/* ── Card centred on screen ── */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>

          {/* Heading */}
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          {/* ── Email ── */}
          <InputField
            icon="✉️"
            placeholder="example@email.com"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: null }));
            }}
            keyboardType="email-address"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* ── Password ── */}
          <InputField
            icon="🔒"
            placeholder="••••••••"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: null }));
            }}
            secureTextEntry
            rightElement={
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            }
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

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

const BLOB_COLOR_PURPLE = 'rgba(180, 160, 230, 0.35)';
const BLOB_COLOR_BLUE   = 'rgba(160, 195, 235, 0.35)';

const styles = StyleSheet.create({
  // ── Screen ──────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#EEF0FA',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // ── Blobs ────────────────────────────────────
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTopLeft: {
    width: 170,
    height: 170,
    top: -50,
    left: -50,
    backgroundColor: BLOB_COLOR_PURPLE,
  },
  blobTopRight: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
    backgroundColor: BLOB_COLOR_BLUE,
  },
  blobMidLeft: {
    width: 28,
    height: 28,
    top: '38%',
    left: 16,
    backgroundColor: BLOB_COLOR_BLUE,
  },
  blobMidRight: {
    width: 22,
    height: 22,
    top: '48%',
    right: 20,
    backgroundColor: BLOB_COLOR_PURPLE,
  },
  blobBottomLeft: {
    width: 220,
    height: 260,
    bottom: -80,
    left: -60,
    backgroundColor: BLOB_COLOR_BLUE,
    borderRadius: 130,
  },
  blobBottomRight: {
    width: 160,
    height: 160,
    bottom: -40,
    right: -50,
    backgroundColor: BLOB_COLOR_PURPLE,
  },

  // ── Card ─────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 28,
    // Shadow – Android
    elevation: 12,
    // Shadow – iOS
    shadowColor: '#7B8CDE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D5E',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9E9EB8',
    textAlign: 'center',
    marginBottom: 32,
  },

  // ── Input row ────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4FA',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2D2D5E',
    padding: 0, // remove default Android padding
  },
  forgotText: {
    fontSize: 12,
    color: '#9E9EB8',
    marginLeft: 8,
  },

  // ── Validation ───────────────────────────────
  errorText: {
    color: '#E05C5C',
    fontSize: 11,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 18,
  },

  // ── Button ───────────────────────────────────
  buttonTouchable: {
    marginTop: 10,
  },
  loginButton: {
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Login;
