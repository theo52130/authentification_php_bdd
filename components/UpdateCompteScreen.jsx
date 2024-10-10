import React, {useState} from 'react';
import {View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';

const UpdateCompteScreen = ({route, navigation}) => {
	const {user} = route.params;
	const [nom, setNom] = useState(user.nom);
	const [email, setEmail] = useState(user.email);
	const [adresse, setAdresse] = useState(user.adresse);
	const [emailEntreprise, setEmailEntreprise] = useState(user.email_entreprise);
	const [siret] = useState(user.siret);
	const [role, setRole] = useState(user.role);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
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

	const handleUpdate = async () => {
		if (!nom || !email || !adresse) {
			Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
			return;
		}

		if (siret === '' && emailEntreprise !== '') {
			Alert.alert('Erreur', 'Veuillez d\'abord renseigner le SIRET avant d\'entrer un email d\'entreprise.');
			return;
		}

		if (password && password !== confirmPassword) {
			Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
			return;
		}

		setLoading(true);
		const data = await apiRequest('http://172.20.10.10/dashboard/authentification_php_bdd/back-end/api/api-update.php', 'PUT', {
			id: user.id,
			nom,
			email,
			adresse,
			email_entreprise: emailEntreprise,
			siret,
			role,
			password: password || undefined,
		});

		if (data && data.status === 'success') {
			Alert.alert('Succès', 'Compte mis à jour avec succès.', [
				{text: 'OK', onPress: () => navigation.navigate('Admin Dashboard')}
			]);
		} else {
			Alert.alert('Erreur', 'Impossible de mettre à jour le compte. Vérifiez vos données.');
		}
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Modifier le Compte</Text>

			<Text style={styles.label}>Nom:</Text>
			<TextInput value={nom} onChangeText={setNom} style={styles.input}/>

			<Text style={styles.label}>Email:</Text>
			<TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address"/>

			<Text style={styles.label}>Adresse:</Text>
			<TextInput value={adresse} onChangeText={setAdresse} style={styles.input}/>

			<Text style={styles.label}>Email Entreprise:</Text>
			<TextInput
				value={emailEntreprise}
				onChangeText={setEmailEntreprise}
				style={styles.input}
				editable={siret !== ''}
				keyboardType="email-address"
			/>

			<Text style={styles.label}>SIRET:</Text>
			<TextInput
				value={siret}
				style={styles.input}
				editable={false}
			/>

			<Text style={styles.label}>Mot de Passe:</Text>
			<TextInput
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={styles.input}
			/>

			{password.length > 0 && (
				<>
					<Text style={styles.label}>Confirmer le Mot de Passe:</Text>
					<TextInput
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						secureTextEntry
						style={styles.input}
					/>
				</>
			)}

			<Text style={styles.label}>Rôle:</Text>
			<RNPickerSelect
				onValueChange={(value) => setRole(value)}
				items={[
					{label: 'Admin', value: 'admin'},
					{label: 'Employé', value: 'employer'},
					{label: 'Client', value: 'client'},
				]}
				style={pickerSelectStyles}
				placeholder={{label: 'Sélectionnez un rôle...', value: null}}
			/>

			{loading ? (
				<ActivityIndicator size="large" color="#0000ff"/>
			) : (
				<Button title="Mettre à jour" onPress={handleUpdate} color="#007BFF"/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#F7F7F7',
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	label: {
		marginBottom: 5,
		fontSize: 16,
		fontWeight: '500',
	},
	input: {
		borderWidth: 1,
		borderColor: '#CED4DA',
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
		backgroundColor: '#FFFFFF',
	},
});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: '#CED4DA',
		borderRadius: 5,
		color: 'black',
		marginBottom: 20,
		backgroundColor: '#FFFFFF',
	},
	inputAndroid: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: '#CED4DA',
		borderRadius: 5,
		color: 'black',
		marginBottom: 20,
		backgroundColor: '#FFFFFF',
	},
});

export default UpdateCompteScreen;
