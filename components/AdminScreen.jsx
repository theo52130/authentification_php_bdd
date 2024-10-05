import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log('Token récupéré:', token); // Ajoutez ce log

      if (!token) {
        Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
        navigation.navigate('LoginScreen');
        return;
      }

      try {
        const response = await fetch('http://192.168.1.77/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getUsers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status); // Ajoutez ce log


        if (!response.ok) {
          const errorText = await response.text(); // Récupérer le corps de la réponse
          console.error('Erreur de réponse:', errorText);
          throw new Error('Erreur HTTP : ' + response.status);
        }

        const data = await response.json();
        console.log('Données reçues:', data); // Ajoutez ce log

        if (data.status === 'success') {
          setUsers(data.users);
        } else {
          Alert.alert('Erreur', 'Impossible de récupérer les utilisateurs.');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Problème de connexion au serveur : ' + error.message);
      }
    };

    fetchUsers();
  }, [navigation]);

  const handleDeleteUser = async (userId) => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
      navigation.navigate('LoginScreen');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.77/dashboard/authentification_php_bdd/back-end/api/api-connect.php?method=deleteUser&id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur HTTP : ' + response.status);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId)); // Use functional form of setUsers
        Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion au serveur : ' + error.message);
    }
  };

  const handleLogOut = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: async () => {
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('role');
            await AsyncStorage.removeItem('token');
            navigation.navigate('LoginScreen'); // Corrected screen name
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Gestion des utilisateurs</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontSize: 18 }}>{item.nom}</Text>
            <Text>Email: {item.email}</Text>
            <Button title="Supprimer" onPress={() => handleDeleteUser(item.id)} />
          </View>
        )}
      />
      <Button title="Se déconnecter" onPress={handleLogOut} />
    </View>
  );
};

export default AdminScreen;