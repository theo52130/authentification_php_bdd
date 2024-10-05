<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../objects/compte.php';

$database = new Database();
$db = $database->getConnection();

$compte = new Compte($db);

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->nom) &&
    !empty($data->email) &&
    !empty($data->adresse) &&
    !empty($data->password) &&
    !empty($data->role)
) {
    $compte->nom = $data->nom;
    $compte->email = $data->email;
    $compte->adresse = $data->adresse;
    $compte->email_entreprise = $data->email_entreprise;
    $compte->siret = $data->siret;
    $compte->password = password_hash($data->password, PASSWORD_BCRYPT);
    $compte->role = $data->role;
    $compte->token = bin2hex(random_bytes(16));

    if ($compte->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Compte was created."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create compte."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create compte. Data is incomplete."));
}
