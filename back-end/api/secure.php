<?php
// secure.php
include_once '../includes/token.php'; // Inclure le fichier de vérification du token

function secureApi()
{
    $headers = apache_request_headers(); // Récupérer les en-têtes de la requête
    if (isset($headers['Authorization'])) { // Vérifier si l'en-tête 'Authorization' est présent
        $token = $headers['Authorization']; // Extraire le token de l'en-tête 'Authorization'
        if (verifyToken($token)) { // Vérifier la validité du token
            return true; // Si le token est valide, retourner true
        }
    }
    http_response_code(401); // Répondre avec un code de statut 401 (Non autorisé)
    echo json_encode(["message" => "Unauthorized"]); // Envoyer un message d'erreur en JSON
    exit(); // Terminer le script
}
