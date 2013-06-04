<?php

$DEBUG = false;

ini_set('display_errors',1);
error_reporting(E_ALL);

if ($DEBUG) {
  $dbserver = "localhost";
  $dbuser = "darya";
  $dbpass = "darya";
  $dbname = "jazz_test";  //the name of the database
}
else {
  $dbserver = "cbcbmysql00.umiacs.umd.edu";
  $dbuser = "jazzmap";
  $dbpass = "FU2XX1OJ";
  $dbname = "jazzmap";
}

$handler = mysql_connect($dbserver, $dbuser, $dbpass);


if (!$handler) {
	echo "DEBUG: Could not connect.\n";
	echo mysql_errno($handler) . ": " . mysql_error($handler). "\n";
}
else {
//	echo "DEBUG: connected to server<br>";
	
	mysql_select_db($dbname);
	mysql_query("SET NAMES 'utf8' COLLATE 'utf8_unicode_ci'", $handler);
	mb_language('uni'); 
	mb_internal_encoding('UTF-8');
}

?>
