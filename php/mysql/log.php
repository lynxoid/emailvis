<?php
  require_once("credentials.php");

  $log_date = $_GET['logdate'];
  $status = $_GET['status'];
  $message = $_GET['message'];
  
  $query = "INSERT INTO log (log_date, status, message) VALUES ($log_date, '$status', '$message')";

  $result = mysql_query($query, $handler);
?>
