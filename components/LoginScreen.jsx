import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-connect.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur de réponse:', errorText);
                Alert.alert('Erreur', 'Erreur HTTP : ' + response.status);
                return;
            }

            const data = await response.json();
            console.log('Réponse de l\'API:', data);

            if (data.status === 'success' && data.user) {
                const { id: userId, role: userRole } = data.user;

                if (userId !== undefined && userRole !== undefined) {
                    await AsyncStorage.setItem('userId', userId.toString());
                    await AsyncStorage.setItem('role', userRole);

                    // Générer le token après la connexion réussie
                    const tokenResponse = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/includes/generate-token.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `userId=${userId}`,
                    });

                    if (!tokenResponse.ok) {
                        throw new Error('Erreur HTTP : ' + tokenResponse.status);
                    }

                    const contentType = tokenResponse.headers.get('content-type');
                    if (contentType && contentType.indexOf('application/json') !== -1) {
                        const tokenData = await tokenResponse.json();
                        if (tokenData.token) {
                            await AsyncStorage.setItem('token', tokenData.token);

                            switch (userRole) {
                                case 'admin':
                                    navigation.navigate('AdminScreen');
                                    break;
                                case 'employer':
                                    // navigation.navigate('EmployerScreen');
                                    navigation.navigate('Error');
                                    break;
                                case 'client':
                                    // navigation.navigate('ClientScreen');
                                    navigation.navigate('Error');
                                    break;
                                default:
                                    Alert.alert('Erreur', 'Rôle utilisateur inconnu.');
                            }
                        } else {
                            Alert.alert('Erreur', 'Échec de la génération du token.');
                        }
                    } else {
                        const errorText = await tokenResponse.text();
                        console.error('Erreur de réponse:', errorText);
                        Alert.alert('Erreur', 'Réponse inattendue du serveur.');
                    }
                } else {
                    Alert.alert('Erreur', 'ID utilisateur ou rôle manquant.');
                }
            } else {
                Alert.alert('Erreur', 'Connexion échouée.');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Problème de connexion : ' + error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'center', padding: 20 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                TBY Innovations
            </Text>
            <TextInput 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                style={{ borderWidth: 1, marginBottom: 10, padding: 5, borderRadius: 5 }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput 
                placeholder="Mot de passe" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={{ borderWidth: 1, marginBottom: 10, padding: 5, borderRadius: 5 }}
            />
            <Button title="Connexion" onPress={handleLogin} />
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;