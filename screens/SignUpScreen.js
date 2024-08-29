import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import {  db } from '../firebase';
import { FontAwesome5 } from '@expo/vector-icons';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignUp = async () => {
    try {
      // const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const userDocRef = doc(usersCollection, email);

      // Check if the user already exists
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        Alert.alert('User Exists', 'An account with this email already exists. Please log in.');
        navigation.navigate('Login');
        return;
      }

      // Create new user document
      await setDoc(userDocRef, {
        email,
        password,
        role: 'student',
      });

      Alert.alert('Sign Up Successful!', 'You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing up:', error.message);
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="bus-alt" size={60} color="#FFA500" />
          <Text style={styles.title}>College Bus Tracker</Text>
        </View>
        <Text style={styles.subtitle}>Create an Account</Text>
        <View style={styles.inputContainer}>
          <FontAwesome5 name="envelope" size={20} color="#FFA500" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome5 name="lock" size={20} color="#FFA500" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <FontAwesome5
              name={passwordVisible ? "eye-slash" : "eye"}
              size={20}
              color="#FFA500"
              style={styles.inputIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    color: '#FFA500',
    marginTop: 10,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFA500',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    borderColor: '#FFA500',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFF',
    paddingHorizontal: 10,
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

export default SignUpScreen;