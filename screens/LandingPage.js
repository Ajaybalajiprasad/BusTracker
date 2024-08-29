import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LandingPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.glassContainer}>
        <Text style={styles.title}>Welcome to College Bus Tracker</Text>
        <Text style={styles.subtitle}>Are you from No 6 Bus?</Text>
        <TouchableOpacity
          style={[styles.button, styles.driverButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.driverButton]}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e', // Dark background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Translucent white with opacity for glass effect
    padding: 20,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff9500', // Vibrant orange color
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#f2f2f7', // Light grey text color for contrast
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  driverButton: {
    backgroundColor: '#ff9500', // Orange button for Driver
  },
  studentButton: {
    backgroundColor: '#f2f2f7', // Light grey button for Student
  },
  buttonText: {
    color: '#1c1c1e', // Dark text color for button text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LandingPage;