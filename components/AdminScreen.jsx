import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('Token récupéré:', token); // Ajoutez ce log

    if (!token) {
      Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
      navigation.navigate('LoginScreen');
      return;
    }

    try {
      const response = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getUsers', { // Corrected endpoint
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

  useEffect(() => {
    fetchUsers();
  }, [navigation]);

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
              Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
              navigation.navigate('LoginScreen');
              return;
            }

            try {
              const response = await fetch(`http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-delete.php`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: userId }),
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur de réponse:', errorText);
                Alert.alert('Erreur', 'Erreur HTTP : ' + response.status);
                return;  // Stop further execution if there's an error
              }

              const contentType = response.headers.get('content-type');
              if (contentType && contentType.indexOf('application/json') !== -1) {
                const data = await response.json();

                if (data.status === 'success') {
                  setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                  Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
                } else {
                  Alert.alert('Erreur', data.message || 'Impossible de supprimer l\'utilisateur.');
                }
              } else {
                const errorText = await response.text();
                console.error('Erreur de réponse:', errorText);
                Alert.alert('Erreur', 'Réponse inattendue du serveur.');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Problème de connexion au serveur : ' + error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Gestion des utilisateurs</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={fetchUsers} style={{ marginRight: 10 }}>
            <Ionicons name="reload" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Ionicons name="person-add" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontSize: 18 }}>{item.nom}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Rôle: {item.role}</Text>
            <Button title="Supprimer" onPress={() => handleDeleteUser(item.id)} />
          </View>
        )}
      />
      <Button title="Se déconnecter" onPress={handleLogOut} />
    </View>
  );
};

export default AdminScreen;