<?php
session_start();

if (isset($_SESSION['role'])) {
    if ($_SESSION['role'] == 'admin') {
        header("Location: ./app/welcome-admin.php");
        exit();
    } elseif ($_SESSION['role'] == 'employer') {
        header("Location: ./app/welcome-employer.php");
        exit();
    } elseif ($_SESSION['role'] == 'client') {
        header("Location: ./app/welcome-client.php");
        exit();
    } else {
        echo "Rôle non reconnu.";
    }
} else {
    echo "Session non démarrée ou rôle non défini.";
}
