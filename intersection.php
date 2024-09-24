<?php
if ($_SESSION['role'] == 'admin') {
    header("Location: welcome-admin.php");
} elseif ($_SESSION['role'] == 'employer') {
    header("Location: welcome-employer.php");
} elseif ($_SESSION['role'] == 'client') {
    header("Location: welcome-client.php");
}
