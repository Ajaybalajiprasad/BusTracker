import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const DriverScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const startTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      setIsTracking(true);
      console.log('Tracking started');
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3, // Update every 5 seconds
          distanceInterval: 6, // Update when moved 5 meters
        },
        (newLocation) => {
          console.log('Location updated:', newLocation);
          setLocation(newLocation);
          sendLocationToFirestore(newLocation);
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg('Failed to start location tracking.');
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
    Alert.alert('Tracking stopped', 'Your location is no longer being shared.');
    console.log('Tracking stopped');
  }, [locationSubscription]);

  const sendLocationToFirestore = async (position) => {
    const db = getFirestore();
    const busId = 'bus1';
    const busDocRef = doc(db, 'buses', busId);

    try {
      await setDoc(busDocRef, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(position.timestamp).toISOString(),
        speed: position.coords.speed || 0,
        heading: position.coords.heading || 0,
      }, { merge: true });
      console.log('Location data sent to Firestore');
    } catch (error) {
      console.error('Error sending location to Firestore:', error);
      setErrorMsg('Failed to send location data.');
    }
  };

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      {location && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Lat: {location.coords.latitude.toFixed(4)}, Lon: {location.coords.longitude.toFixed(4)}
          </Text>
          <Text style={styles.infoText}>
            Speed: {((location.coords.speed || 0) * 3.6).toFixed(2)} km/h
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
        onPress={isTracking ? stopTracking : startTracking}
      >
        <FontAwesome name={isTracking ? "stop-circle" : "play-circle"} size={24} color="white" />
        <Text style={styles.buttonText}>
          {isTracking ? 'Stop Sharing' : 'Start Sharing'}
        </Text>
      </TouchableOpacity>
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Bus Location"
          >
            <FontAwesome name="bus" size={30} color="#4A89F3" />
          </Marker>
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  map: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default DriverScreen;