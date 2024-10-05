import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        adresse: '',
        email_entreprise: '',
        siret: '',
        password: '',
        role: 'client',
    });

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://192.168.1.77/dashboard/authentification_php_bdd/back-end/api/api-register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                const data = await response.json();
                console.log(data);
                Alert.alert('Succès', 'Compte créé avec succès.');
                navigation.navigate('LoginScreen');
            } else {
                const errorText = await response.text();
                console.error('Réponse inattendue du serveur:', errorText);
                Alert.alert('Erreur', 'Réponse inattendue du serveur.');
            }
        } catch (error) {
            console.error('There was an error creating the account!', error);
            Alert.alert('Erreur', 'Il y a eu une erreur lors de la création du compte.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Créer un compte</Text>
            <TextInput
                placeholder="*Prenom Nom"
                value={formData.nom}
                onChangeText={(value) => handleChange('nom', value)}
                style={styles.input}
            />
            <TextInput
                placeholder="*Email"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="*Adresse"
                value={formData.adresse}
                onChangeText={(value) => handleChange('adresse', value)}
                style={styles.input}
            />
            <TextInput
                placeholder="Email Entreprise"
                value={formData.email_entreprise}
                onChangeText={(value) => handleChange('email_entreprise', value)}
                style={styles.input}
            />
            <TextInput
                placeholder="SIRET"
                value={formData.siret}
                onChangeText={(value) => handleChange('siret', value)}
                style={styles.input}
            />
            <TextInput
                placeholder="*Mot de passe"
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                style={styles.input}
                secureTextEntry
            />
            <Button title="S'inscrire" onPress={handleSubmit} />
        </View>
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
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 5,
        borderRadius: 5,
    },
});

export default RegisterScreen;