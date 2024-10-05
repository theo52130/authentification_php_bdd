import React, { useState } from 'react';
import { View, TextInput, Button, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://192.168.1.77/dashboard/authentification_php_bdd/back-end/api/api-connect.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            });

            if (!response.ok) {
                throw new Error('Erreur HTTP : ' + response.status);
            }

            const data = await response.json();
            console.log('Réponse de l\'API:', data);

            if (data.status === 'success' && data.user) {
                const { id: userId, role: userRole } = data.user;

                if (userId !== undefined && userRole !== undefined) {
                    await AsyncStorage.setItem('userId', userId.toString());
                    await AsyncStorage.setItem('role', userRole);

                    // Générer le token après la connexion réussie
                    const tokenResponse = await fetch('http://192.168.1.77/dashboard/authentification_php_bdd/back-end/includes/generate-token.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `userId=${userId}`,
                    });

                    if (!tokenResponse.ok) {
                        throw new Error('Erreur HTTP : ' + tokenResponse.status);
                    }

                    const tokenData = await tokenResponse.json();
                    if (tokenData.token) {
                        await AsyncStorage.setItem('token', tokenData.token);

                        switch (userRole) {
                            case 'admin':
                                navigation.navigate('AdminScreen');
                                break;
                            // case 'employer':
                            //     navigation.navigate('EmployerScreen');
                            //     break;
                            // case 'client':
                            //     navigation.navigate('ClientScreen');
                            //     break;
                            default:
                                Alert.alert('Erreur', 'Rôle utilisateur inconnu.');
                        }
                    } else {
                        Alert.alert('Erreur', 'Échec de la génération du token.');
                    }
                } else {
                    Alert.alert('Erreur', 'Les données de l\'utilisateur sont manquantes.');
                }
            } else {
                Alert.alert('Erreur', data.message || 'Échec de la connexion.');
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