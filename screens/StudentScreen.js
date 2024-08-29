import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert, Button, Vibration } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import * as TaskManager from 'expo-task-manager';

// Task name for background location updates
const LOCATION_TASK_NAME = 'background-location-task';

// Function to calculate the distance between two coordinates
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distance in meters
};

// Background task to handle location updates
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const studentLocation = locations[0].coords;

    const db = getFirestore();
    const busDocRef = doc(db, 'buses', 'bus1');
    const busSnapshot = await busDocRef.get();
    const busLocation = busSnapshot.data();

    if (busLocation) {
      const distance = getDistance(
        studentLocation.latitude,
        studentLocation.longitude,
        busLocation.latitude,
        busLocation.longitude
      );

      if (distance < 1000) {
        try {
          const sound = new Audio.Sound();
          await sound.current.loadAsync(require('./assets/alarm.mp3'));
          await sound.playAsync();
          Vibration.vibrate([500, 500, 500], true);
        } catch (error) {
          console.log('Error playing sound in background:', error);
        }
      }
    }
  }
});

const StudentScreen = () => {
  const [studentLocation, setStudentLocation] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const mapRef = useRef(null); // Use ref to access the MapView instance
  const sound = useRef(new Audio.Sound());

  useEffect(() => {
    // Load the sound
    const loadSound = async () => {
      try {
        await sound.current.loadAsync(require('./assets/alarm.mp3'));
      } catch (error) {
        console.log('Error loading sound:', error);
      }
    };
    loadSound();

    return () => {
      sound.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    // Fetch current location of the student
    const fetchStudentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setStudentLocation(location.coords);
    };

    fetchStudentLocation();

    const db = getFirestore();
    const busDocRef = doc(db, 'buses', 'bus1');

    const unsubscribe = onSnapshot(
      busDocRef,
      (snapshot) => {
        const location = snapshot.data();
        if (location) {
          setBusLocation(location);
          setLoading(false);
        } else {
          setError('No location data available.');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firestore error:', error);
        setError('Failed to fetch data from Firestore.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (studentLocation && busLocation) {
      const calculatedDistance = getDistance(
        studentLocation.latitude,
        studentLocation.longitude,
        busLocation.latitude,
        busLocation.longitude
      );
      setDistance(calculatedDistance);

      if (calculatedDistance < 1000 && !alarmActive && alarmEnabled) {
        Alert.alert('Bus Alert', 'The bus is within 1 kilometer from you!');
        triggerAlarm();
      }
    }
  }, [studentLocation, busLocation]);

  const triggerAlarm = async () => {
    setAlarmActive(true);
    Vibration.vibrate([500, 500, 500], true);
    try {
      await sound.current.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const stopAlarm = async () => {
    setAlarmActive(false);
    setAlarmEnabled(false);
    Vibration.cancel();
    try {
      await sound.current.stopAsync();
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
    const now = new Date();
    const snap4am = new Date();
    snap4am.setHours(4,0,0,0);
    if(now.getHours() >= 4) {
      snap4am.setDate(now.getDate() + 1);
    }
    const ans = snap4am - now;
     setTimeout(() => {
      setAlarmEnabled(true);
     }, ans);       
  };

  const handleCenterOnBus = () => {
    if (busLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const handleCenterOnStudent = () => {
    if (studentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: studentLocation.latitude,
        longitude: studentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const getDistanceColor = () => {
    if (distance < 500) return 'green';
    if (distance < 1000) return 'yellow';
    return 'red';
  };

  useEffect(() => {
    const startBackgroundLocation = async () => {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1, // Minimum distance (in meters) to report an update
          deferredUpdatesInterval: 1000, // Minimum time (in ms) between updates
        });
      } else {
        setError('Background location permission is required.');
      }
    };

    startBackgroundLocation();

    return () => {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{error}</Text>
        <Button title="Retry" onPress={() => location.reload()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {studentLocation && busLocation && (
        <>
          <MapView
            ref={mapRef} // Attach ref to MapView
            style={styles.map}
            initialRegion={{
              latitude: (studentLocation.latitude + busLocation.latitude) / 2,
              longitude: (studentLocation.longitude + busLocation.longitude) / 2,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsCompass={true} 
            rotateEnabled={false}
          >
            <Marker
              coordinate={busLocation}
              title="Bus Location"
              description="The bus is here!"
              pinColor="blue"
            />
            <Marker
              coordinate={studentLocation}
              title="Your Location"
              description="You are here"
              pinColor="red"
            />
          </MapView>
          <View style={styles.distanceContainer}>
            <Text style={[styles.distanceText, { color: getDistanceColor() }]}>
              {distance ? `${Math.round(distance)} meters` : 'Calculating...'}
            </Text>
          </View>
          <View style={styles.buttonsContainer}>
            <Button title="Center on Bus" onPress={handleCenterOnBus} />
            <Button title="Center on Me" onPress={handleCenterOnStudent} />
            {alarmActive && (
              <Button title="Stop Alarm" onPress={stopAlarm} color="red" />
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  distanceContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudentScreen;
