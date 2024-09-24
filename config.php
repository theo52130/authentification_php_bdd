<?php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'lampp');
define('DB_PASSWORD', 'mdplampp');
define('DB_NAME', 'users_db');

$conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if ($conn === false) {
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
