import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
            navigation.navigate('Connexions');
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
                        const data = await apiRequest('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-delete.php', 'DELETE', {
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
                    navigation.navigate('Connexions');
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

    const downloadPDF = async (id) => {
        try {
            const response = await fetch(`http://172.20.10.10/dashboard/authentification_php_bdd/back-end/includes/generate-pdf.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
    
            if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');
    
            // Obtenez l'ArrayBuffer directement de la réponse
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const base64 = btoa(String.fromCharCode(...bytes)); // Convertir en base64
    
            // Créez un chemin pour le fichier PDF dans le dossier des documents
            const fileUri = `${FileSystem.documentDirectory}mon_document.pdf`;
    
            // Écrire le PDF dans le fichier
            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });
    
            // Partager le fichier
            await Sharing.shareAsync(fileUri, {
                dialogTitle: 'Télécharger le PDF',
                UTI: 'com.adobe.pdf',
            });
    
            Alert.alert('Succès', 'Le PDF a été téléchargé avec succès!');
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de télécharger le fichier PDF : ' + error.message);
        }
    };

    const downloadCSV = async () => {
        try {
            // Remplace l'URL par celle de ton fichier CSV
            const response = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/includes/generate-csv.php', {
                method: 'GET',
            });
    
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du fichier CSV.');
            }
    
            // Récupère le contenu du CSV sous forme de texte
            const csvText = await response.text();
    
            const fileUri = `${FileSystem.documentDirectory}factures.csv`;
    
            // Écriture du contenu dans le fichier
            await FileSystem.writeAsStringAsync(fileUri, csvText, { encoding: FileSystem.EncodingType.UTF8 });
    
            Alert.alert('Succès', 'Le fichier CSV a été téléchargé avec succès.', [
                { text: 'OK', onPress: () => console.log('CSV téléchargé à :', fileUri) },
            ]);
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Impossible de télécharger le fichier CSV : ' + error.message);
        }
    };


    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const empty = (value) => {
        return value === null || value === undefined || value === '';
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
                    keyExtractor={(item) => item.id ? item.id.toString() : item.email}
                    renderItem={({ item }) => (
                        <View style={{
                            padding: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                            marginVertical: 10
                        }}>
                            {categories === 'comptes' ? (
                                <>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.nom}</Text>
                                    <Text>Email: {item.email}</Text>

                                    {!empty(item.email_entreprise) && <Text>Email Entreprise: {item.email_entreprise}</Text>}
                                    {!empty(item.siret) && <Text>SIRET: {item.siret}</Text>}

                                    <Text>Adresse: {item.adresse}</Text>
                                    <Text>Rôle: {item.role}</Text>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                        <TouchableOpacity onPress={() => handleDelete(item.id, 'compte')} style={{
                                            flexDirection: 'row', backgroundColor: 'red', padding: 10, borderRadius: 5, alignItems: 'center'
                                        }}>
                                            <Ionicons name="trash-outline" size={20} color="white" />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => navigation.navigate('Modifier compte', { user: item })}
                                            style={{
                                                flexDirection: 'row', backgroundColor: 'blue', padding: 10, borderRadius: 5, alignItems: 'center'
                                            }}>
                                            <Ionicons name="create-outline" size={20} color="white" />
                                            <Text style={{ marginLeft: 5, color: 'white' }}>Modifier</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Facture #{item.id}</Text>
                                    <Text>Email du client: {item.email}</Text>
                                    <Text>Date de création: {item.date_creation}</Text>
                                    <Text>Montant total: {item.total} € HT</Text>
                                    <Text style={{ textDecorationLine: item.etat === 'payée' ? 'none' : 'underline', color: item.etat === 'payée' ? 'green' : 'red' }}>
                                        État: {item.etat === 'payée' ? 'Payée' : 'Non payée'}
                                    </Text>

                                    {/* Boutons pour les factures alignés en row avec icônes */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                        {/* Bouton pour marquer comme payée */}
                                        {item.etat === 'non payée' && (
                                            <TouchableOpacity onPress={() => handlePaymentChange(item)} style={{
                                                flexDirection: 'row', backgroundColor: 'green', padding: 10, borderRadius: 5, alignItems: 'center'
                                            }}>
                                                <Ionicons name="checkmark-outline" size={20} color="white" />
                                                <Text style={{ color: 'white', marginLeft: 5 }}>Marquer comme payée</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity onPress={() => downloadPDF(item.id)} style={{
                                            flexDirection: 'row', backgroundColor: 'blue', padding: 10, borderRadius: 5, alignItems: 'end'
                                        }}>
                                            <Ionicons name="document-outline" size={20} color="white" />
                                            <Text style={{ color: 'white', marginLeft: 5 }}>PDF</Text>
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
