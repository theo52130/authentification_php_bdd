<?php
// Configuration de la base de données
$host = 'localhost'; // L'hôte de la base de données
$db = 'test_cube_trois'; // Le nom de la base de données
$user = 'cubeTrois'; // L'utilisateur de la base de données
$pass = 'mdpcubetrois'; // Le mot de passe de l'utilisateur de la base de données
$charset = 'utf8mb4'; // Le jeu de caractères

// DSN (Data Source Name) pour la connexion
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Options de connexion
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

// Essayer de se connecter à la base de données
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Afficher un message d'erreur approprié
    die('Erreur de connexion à la base de données : ' . $e->getMessage());
}
