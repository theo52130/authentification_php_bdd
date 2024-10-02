import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api-connect.php', {
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

            if (data.status === 'success') {
                const userId = data.user.id; 
                const userRole = data.user.role; 

                if (userId !== undefined && userRole !== undefined) {
                    await AsyncStorage.setItem('userId', userId.toString());
                    await AsyncStorage.setItem('role', userRole);

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
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <TextInput 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                style={{ borderWidth: 1, marginBottom: 10, padding: 5, borderRadius: 5 }}
            />
            <TextInput 
                placeholder="Mot de passe" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={{ borderWidth: 1, marginBottom: 10, padding: 5, borderRadius: 5 }}
            />
            <Button title="Connexion" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;
