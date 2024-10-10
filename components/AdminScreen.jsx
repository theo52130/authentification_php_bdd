import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'; // Remplacer RNFS par FileSystem d'Expo

const defaultProfileImage = require('../assets/silhouette-profile.jpeg'); // Chemin vers l'image par défaut

const AdminScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [factures, setFactures] = useState([]);
    const [categories, setCategories] = useState('comptes');
    const [loading, setLoading] = useState(false);

    const apiRequest = async (url, method, body = null) => {
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
                body: body ? JSON.stringify(body) : null,
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
        const data = await apiRequest('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getUsers', 'GET');
        if (data && data.status === 'success') {
            setUsers(data.users);
        } else {
            Alert.alert('Erreur', 'Impossible de récupérer les utilisateurs.');
        }
        setLoading(false);
    };

    const fetchFactures = async () => {
        setLoading(true);
        const data = await apiRequest('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getFactures', 'GET');
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
                        const data = await apiRequest('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-delete.php', 'DELETE', {
                            id,
                            type
                        });
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
            {
                text: 'Oui', onPress: async () => {
                    await AsyncStorage.clear();
                    navigation.navigate('LoginScreen');
                }
            },
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
                        const data = await apiRequest('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-payments.php', 'POST', { id: facture.id });
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

    const downloadPDF = async (id) => {
        try {
            const response = await fetch(`http://192.168.1.143/dashboard/authentification_php_bdd/back-end/includes/csv-pdf/pdfTest.js`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });
            const blob = await response.blob();
            const fileUri = `${FileSystem.documentDirectory}facture_${id}.pdf`;

            await FileSystem.writeAsStringAsync(fileUri, blob, { encoding: FileSystem.EncodingType.Base64 });
            Alert.alert('Succès', 'Le fichier PDF a été téléchargé avec succès.');
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de télécharger le fichier PDF.');
        }
    };

    const downloadCSV = async () => {
        try {
            const response = await fetch('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/includes/csv-pdf/csv.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const blob = await response.blob();
            const fileUri = `${FileSystem.documentDirectory}factures.csv`;

            await FileSystem.writeAsStringAsync(fileUri, blob, { encoding: FileSystem.EncodingType.Base64 });
            Alert.alert('Succès', 'Le fichier CSV a été téléchargé avec succès.');
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de télécharger le fichier CSV.');
        }
    };


    return (
        <View style={{ flex: 1, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setCategories('comptes')}>
                    <Text style={{
                        textDecorationLine: categories === 'comptes' ? 'underline' : 'none',
                        fontSize: 20,
                        color: 'blue'
                    }}>
                        Comptes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setCategories('factures')}>
                    <Text style={{
                        textDecorationLine: categories === 'factures' ? 'underline' : 'none',
                        fontSize: 20,
                        color: 'blue'
                    }}>
                        Factures
                    </Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => categories === 'comptes' ? fetchUsers() : fetchFactures()} style={{ marginRight: 10 }}>
                        <Ionicons name="reload" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate(categories === 'comptes' ? 'Creer compte' : 'Creer facture')}>
                        <Ionicons name={categories === 'comptes' ? "person-add" : "add"} size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }} />
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={categories === 'comptes' ? users : factures}
                    keyExtractor={item => item.id ? item.id.toString() : item.email ? item.email : Math.random().toString()}
                    renderItem={({ item }) => (
                        <View style={{
                            padding: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            {categories === 'comptes' ? (
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={item.profile_image || defaultProfileImage} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                        <Text style={{ fontSize: 18, marginLeft: 10 }}>{item.nom}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item.id, 'user')}>
                                        <Ionicons name="trash" size={24} color="red" />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={{ fontSize: 18 }}>Facture #{item.id}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => handlePaymentChange(item)}>
                                            <Ionicons name="checkmark" size={24} color={item.etat === 'payée' ? 'green' : 'gray'} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(item.id, 'facture')}>
                                            <Ionicons name="trash" size={24} color="red" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => downloadPDF(item.id)}>
                                            <Ionicons name="download" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                />
            )}

            {categories === 'factures' && (
                <View>
                    <TouchableOpacity onPress={downloadCSV} style={{
                backgroundColor: 'green', padding: 10, borderRadius: 5, alignItems: 'center', marginVertical: 10
            }}>
                <Text style={{ color: 'white' }}>Télécharger CSV</Text>
            </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity onPress={handleLogOut} style={{
                backgroundColor: 'red', padding: 10, borderRadius: 5, alignItems: 'center'
            }}>
                <Text style={{ color: 'white' }}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AdminScreen;
