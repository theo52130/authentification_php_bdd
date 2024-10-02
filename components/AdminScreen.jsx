import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const role = await AsyncStorage.getItem('role');
      if (role !== 'admin') {
        Alert.alert('Accès interdit', 'Vous devez être un administrateur pour accéder à cette page.');
        navigation.navigate('HomeScreen');
        return;
      }

      try {
        const response = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api-select.php?method=getUsers');
        const data = await response.json();

        if (data.status === 'success') {
          setUsers(data.users);
        } else {
          Alert.alert('Erreur', 'Impossible de récupérer les utilisateurs.');
        }
      } catch (error) {
        Alert.alert('Erreur', 'Problème de connexion au serveur.');
      }
    };

    fetchUsers();
  }, [navigation]);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api-connect.php?method=deleteUser&id=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUsers(users.filter(user => user.id !== userId));
        Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer l utilisateur.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion au serveur.');
    }
  };

  const handleLogOut = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('role');
    navigation.navigate('LoginScreen');
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
