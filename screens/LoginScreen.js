import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const storedPassword = userData.password;
        const role = userData.role;

        if (password === storedPassword) {
          // Navigate based on the role
          if (role === 'student') {
            navigation.navigate('Student');
          } else if (role === 'driver') {
            navigation.navigate('Home');
          } else {
            Alert.alert('Error', 'Unknown user role.');
          }
        } else {
          Alert.alert('Error', 'Incorrect password.');
        }
      } else {
        Alert.alert('Error', 'User not found.');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.inputIconContainer}>
          <FontAwesome5
            name={passwordVisible ? "eye-slash" : "eye"}
            size={20}
            color="#FFA500"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Go to Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1c1c1c',
  },
  title: {
    fontSize: 28,
    color: '#FFA500',
    marginBottom: 24,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#FFA500',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFF',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: '#FFF',
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#FFA500',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative', // Ensure child elements can be positioned absolutely within this container
  },
  inputIconContainer: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#FFA500',
    borderRadius: 10,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#1c1c1c',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
