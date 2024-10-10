// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import AdminScreen from './AdminScreen';
// import EmployerScreen from './EmployerScreen';
// import ClientScreen from './ClientScreen';
import RegisterScreen from './RegisterScreen';
import CreateFactureScreen from './CreateFactureScreen';
import UpdateCompteScreen from './UpdateCompteScreen';
import ErrorScreen from './ErrorScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="AdminScreen" component={AdminScreen} />
                {/* <Stack.Screen name="EmployerScreen" component={EmployerScreen} />
                <Stack.Screen name="ClientScreen" component={ClientScreen} /> */}
                <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                <Stack.Screen name="CreateFactureScreen" component={CreateFactureScreen} />
                <Stack.Screen name="UpdateCompte" component={UpdateCompteScreen} />
                <Stack.Screen name="Error" component={ErrorScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;