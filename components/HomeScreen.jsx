import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminScreen from './AdminScreen';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    id: null,
    nom: '',
    role: '',
  });

  useEffect(() => {
    const getUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      const nom = await AsyncStorage.getItem('nom');
      const role = await AsyncStorage.getItem('role');

      if (id && nom && role) {
        setUserData({ id, nom, role });
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les données utilisateur.');
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    // Supprimer l'userId et autres informations de AsyncStorage pour déconnecter l'utilisateur
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('nom');
    await AsyncStorage.removeItem('role');
    navigation.navigate('LoginScreen');
  };

  const handleRoleRedirect = () => {
    switch (userData.role) {
      case 'admin':
        navigation.navigate('AdminScreen');
        break;
      case 'employer':
        navigation.navigate('EmployerScreen');
        break;
      case 'client':
        navigation.navigate('ClientScreen');
        break;
      default:
        Alert.alert('Erreur', 'Rôle utilisateur inconnu.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Bienvenue, {userData.nom}!</Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>Votre rôle: {userData.role}</Text>
      <Button title="Accéder aux fonctionnalités" onPress={handleRoleRedirect} />
      <Button title="Se déconnecter" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
