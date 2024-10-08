import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const defaultProfileImage = require('../assets/silhouette-profile.jpeg'); // Chemin vers l'image par défaut


const AdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [factures, setFactures] = useState([]);
  const [categories, setCategories] = useState('comptes');
  const [loading, setLoading] = useState(false);

  const apiRequest = async (url, method, body) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
      navigation.navigate('LoginScreen');
      return null;
    }
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Erreur HTTP : ' + response.status);
      return await response.json();
    } catch (error) {
      Alert.alert('Erreur', 'Problème de connexion au serveur : ' + error.message);
      return null;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const data = await apiRequest('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getUsers', 'GET');
    if (data && data.status === 'success') {
      setUsers(data.users);
    } else {
      Alert.alert('Erreur', 'Impossible de récupérer les utilisateurs.');
    }
    setLoading(false);
  };

  const fetchFactures = async () => {
    setLoading(true);
    const data = await apiRequest('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getFactures', 'GET');
    if (data && data.status === 'success') {
      setFactures(data.factures);
    } else {
      Alert.alert('Erreur', 'Impossible de récupérer les factures.');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (categories === 'comptes') {
        fetchUsers();
      } else {
        fetchFactures();
      }
    }, [categories])
  );

  const handleDelete = async (id, type) => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer cet ${type === 'user' ? 'utilisateur' : 'facture'} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            const data = await apiRequest('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-delete.php', 'DELETE', { id, type });
            if (data && data.status === 'success') {
              if (type === 'user') {
                setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
              } else {
                setFactures(prevFactures => prevFactures.filter(facture => facture.id !== id));
              }
              Alert.alert('Succès', `${type === 'user' ? 'Utilisateur' : 'Facture'} supprimé avec succès.`);
            } else {
              Alert.alert('Erreur', `Impossible de supprimer l${type === 'user' ? 'utilisateur' : 'a facture'}.`);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogOut = async () => {
    Alert.alert('Confirmation', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', onPress: async () => {
        await AsyncStorage.clear();
        navigation.navigate('LoginScreen');
      }},
    ]);
  };

  const handlePaymentChange = async (facture) => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir marquer la facture ${facture.id} comme payée ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            const data = await apiRequest('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-payments.php', 'POST', { id: facture.id });
            if (data && data.status === 'success') {
              setFactures(prevFactures => prevFactures.map(f => 
                f.id === facture.id ? { ...f, etat: 'payée' } : f
              ));
              Alert.alert('Succès', 'Facture marquée comme payée avec succès.');
            } else {
              Alert.alert('Erreur', 'Impossible de mettre à jour l\'état de la facture.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button title="Comptes" onPress={() => { setCategories('comptes'); fetchUsers(); }} />
        <Button title="Factures" onPress={() => { setCategories('factures'); fetchFactures(); }} />
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => { categories === 'comptes' ? fetchUsers() : fetchFactures(); }} style={{ marginRight: 10 }}>
            <Ionicons name="reload" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate(categories === 'comptes' ? 'RegisterScreen' : 'CreateFactureScreen')}>
            <Ionicons name={categories === 'comptes' ? "person-add" : "add"} size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={categories === 'comptes' ? users : factures}
          keyExtractor={item => item.id ? item.id.toString() : item.email ? item.email : Math.random().toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', alignItems: 'center' }}>
              {categories === 'comptes' && (
                <Image 
                  source={item.image_url ? { uri: item.image_url } : defaultProfileImage}
                  style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} 
                />
              )}
              <View>
                <Text style={{ fontSize: 18 }}>{categories === 'comptes' ? item.nom : `Ref : ${item.id}`}</Text>

                {categories === 'comptes' ? (
                  <>
                    <Text>Email: {item.email}</Text>
                    <Text>Rôle: {item.role}</Text>
                  </>
                ) : (
                  <>
                    <Text>Client : {item.email}</Text>
                    <Text>Date création : {item.date_creation}</Text>
                    <Text>Montant total : {item.total} HT</Text>
                    <Text>État : {item.etat}</Text>

                    {item.etat === 'non payée' && (
                      <Button 
                        title="Marquer comme payée" 
                        onPress={() => handlePaymentChange(item)} 
                      />
                    )}
                  </>
                )}

                {categories === 'comptes' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                    <Button 
                      title="Supprimer" 
                      onPress={() => handleDelete(item.id, 'user')} 
                    />
                    <Button 
                      title="Modifier" 
                      onPress={() => navigation.navigate('UpdateCompte', { user: item })} 
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Button title="Se déconnecter" onPress={handleLogOut} />
    </View>
  );
};

export default AdminScreen;
