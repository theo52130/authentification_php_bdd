import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ErrorScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>404 - Accès Non Autorisé</Text>
            <Text style={styles.message}>Désolé, la page que vous recherchez n'existe pas ou vous n'avez pas l'autorisation d'y accéder.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.link}>Retour à l'accueil</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: '#343a40',
        marginBottom: 20,
        textAlign: 'center',
    },
    message: {
        fontSize: 18,
        color: '#6c757d',
        marginBottom: 20,
        textAlign: 'center',
    },
    link: {
        fontSize: 18,
        color: '#007bff',
        textDecorationLine: 'underline',
    },
});

export default ErrorScreen;