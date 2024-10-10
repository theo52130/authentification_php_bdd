import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList } from 'react-native-web';

const CreateFactureScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        client: '',
        date: new Date().toISOString().split('T')[0], // Date actuelle
        montant: 0,
    });

    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [selectedProduits, setSelectedProduits] = useState([{ id: '', quantite: 1 }]);

    useEffect(() => {
        const fetchData = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
                navigation.navigate('LoginScreen');
                return;
            }

            try {
                // Récupérer les clients
                const clientsResponse = await fetch('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getClients', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const clientsData = await clientsResponse.json();
                setClients(clientsData.clients || []);

                // Récupérer les produits
                const produitsResponse = await fetch('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-select.php?method=getProduits', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const produitsData = await produitsResponse.json();
                setProduits(produitsData.produits || []);
            } catch (error) {
                console.error('Erreur lors de la récupération des données!', error);
                Alert.alert('Erreur', 'Erreur lors de la récupération des données.');
            }
        };

        fetchData();
    }, [navigation]);

    const handleChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleProductChange = (index, field, value) => {
        const updatedProduits = [...selectedProduits];
        updatedProduits[index][field] = value;
        setSelectedProduits(updatedProduits);

        // Calculer le montant total
        const total = updatedProduits.reduce((sum, produit) => {
            const selectedProduit = produits.find(p => p.id === produit.id);
            return sum + (selectedProduit ? selectedProduit.prix_unitaire * produit.quantite : 0);
        }, 0);

        setFormData(prevState => ({
            ...prevState,
            montant: total,
        }));
    };

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
            navigation.navigate('LoginScreen');
            return;
        }

        try {
            const response = await fetch('http://192.168.1.143/dashboard/authentification_php_bdd/back-end/api/api-create-facture.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, produits: selectedProduits }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                Alert.alert('Succès', data.message);
                navigation.navigate('AdminScreen');
            } else {
                Alert.alert('Erreur', data.message);
            }
        } catch (error) {
            console.error('Il y a eu une erreur lors de la création de la facture!', error);
            Alert.alert('Erreur', 'Il y a eu une erreur lors de la création de la facture.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Créer une Facture</Text>

                        <RNPickerSelect
                            onValueChange={(value) => handleChange('client', value)}
                            items={[{ label: '*Sélectionner un client', value: '' }, ...clients.map(client => ({ label: client.nom, value: client.id }))]}
                            style={pickerSelectStyles}
                            value={formData.client}
                        />

                        {selectedProduits.map((produit, index) => {
                            const selectedProduit = produits.find(p => p.id === produit.id);
                            const prixUnitaire = selectedProduit ? selectedProduit.prix_unitaire : 0;

                            return (
                                    <View key={index} style={styles.produitContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => handleProductChange(index, 'id', value)}
                                            items={[{ label: 'Sélectionner un produit', value: '' }, ...produits.map(prod => ({ label: prod.description, value: prod.id }))]}
                                            style={pickerSelectStyles}
                                            value={produit.id}
                                        />
                                        <TextInput
                                            placeholder="Qté"
                                            value={produit.quantite.toString()}
                                            onChangeText={(value) => handleProductChange(index, 'quantite', parseInt(value) || 1)}
                                            style={styles.quantityInput}
                                            keyboardType="numeric"
                                        />
                                        <Text style={styles.prixText}>{`Prix: ${prixUnitaire} €`}</Text>
                                    </View>
                            );
                        })}

                        <Button title="Ajouter un produit" onPress={() => setSelectedProduits([...selectedProduits, { id: '', quantite: 1 }])} />

                        <View style={styles.totalContainer}>
                            <Text style={styles.totalText}>Total :</Text>
                            <TextInput
                                value={formData.montant.toFixed(2).toString()}
                                editable={false}
                                style={styles.totalInput}
                            />
                        </View>

                        <Button title="Créer" onPress={handleSubmit} />
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    produitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    prixText: {
        marginLeft: 10,
        fontSize: 16,
        alignSelf: 'center',
    },
    quantityInput: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 5,
        marginLeft: 10,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    totalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 18,
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        color: 'black',
        flex: 1,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        marginBottom: 10,
        flex: 1,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        marginBottom: 10,
        flex: 1,
    },
});

export default CreateFactureScreen;
