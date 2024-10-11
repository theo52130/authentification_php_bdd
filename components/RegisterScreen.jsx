import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        adresse: '',
        email_entreprise: '',
        siret: '',
        password: '',
        role: '',
    });

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
            navigation.navigate('LoginScreen');
            return;
        }

        try {
            const response = await fetch('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-create-account.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                Alert.alert('Succès', data.message);
                navigation.navigate('AdminScreen');
            } else {
                Alert.alert('Erreur', data.message);
            }
        } catch (error) {
            console.error('Il y a eu une erreur lors de la création du compte!', error);
            Alert.alert('Erreur', 'Il y a eu une erreur lors de la création du compte.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <Text style={styles.title}>Créer un compte</Text>

                        <Text style={styles.label}>*Prenom Nom:</Text>
                        <TextInput
                            placeholder="*Prenom Nom"
                            value={formData.nom}
                            onChangeText={(value) => handleChange('nom', value)}
                            style={styles.input}
                        />

                        <Text style={styles.label}>*Email :</Text>
                        <TextInput
                            placeholder="exemple@exemple.fr"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>*Adresse :</Text>
                        <TextInput
                            placeholder="rue, ville, code postal"
                            value={formData.adresse}
                            onChangeText={(value) => handleChange('adresse', value)}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Email entreprise:</Text>
                        <TextInput
                            placeholder="exemple@exemple.fr"
                            value={formData.email_entreprise}
                            onChangeText={(value) => handleChange('email_entreprise', value)}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Siret :</Text>
                        <TextInput
                            placeholder="xxxxxxxxxxxxxx"
                            value={formData.siret}
                            onChangeText={(value) => handleChange('siret', value)}
                            style={styles.input}
                        />

                        <Text style={styles.label}>*Mot de passe :</Text>
                        <TextInput
                            placeholder="*Mot de passe"
                            value={formData.password}
                            onChangeText={(value) => handleChange('password', value)}
                            style={styles.input}
                            secureTextEntry
                        />

                        <Text style={styles.label}>*Role :</Text>
                        <RNPickerSelect
                            onValueChange={(value) => handleChange('role', value)}
                            items={[
                                { label: 'Client', value: 'client' },
                                { label: 'Employer', value: 'employer' },
                                { label: 'Admin', value: 'admin' },
                            ]}
                            style={pickerSelectStyles}
                            value={formData.role}
                            placeholder={{ label: 'Sélectionnez un rôle...', value: null }}
                        />
                        <TouchableOpacity onPress={handleSubmit} style={{
                            flexDirection: 'row', backgroundColor: 'blue', padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 10
                        }}>
                            <Text style={{ color: 'white', marginLeft: 5 }}>Créer</Text>
                        </TouchableOpacity>
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
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 5,
        borderRadius: 5,
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
        paddingRight: 30, // to ensure the text is never behind the icon
        marginBottom: 10,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
        marginBottom: 10,
    },
});

export default RegisterScreen;
