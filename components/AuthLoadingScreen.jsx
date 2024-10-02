import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthLoadingScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      // Vérifier si un userId est stocké dans AsyncStorage
      const userId = await AsyncStorage.getItem('userId');

      // Rediriger vers l'écran approprié en fonction de l'état de connexion
      if (userId) {
        navigation.navigate('HomeScreen'); // Utilisateur connecté, rediriger vers l'écran d'accueil
      } else {
        navigation.navigate('LoginScreen'); // Utilisateur non connecté, rediriger vers l'écran de connexion
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLoadingScreen;
