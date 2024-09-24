<?php
if ($_SESSION['role'] == 'admin') {
    header("Location: welcome-admin.php");
    exit();
} elseif ($_SESSION['role'] == 'employer') {
    header("Location: welcome-employer.php");
    exit();
} elseif ($_SESSION['role'] == 'client') {
    header("Location: welcome-client.php");
    exit();
}
