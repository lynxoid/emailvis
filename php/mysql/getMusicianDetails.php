<?php 
    require_once("credentials.php");

$performerID = $_GET['performerID'];

$query_select = "SELECT dob, dod, place_of_birth, place_of_death " .
				"FROM artist_details " .
				"WHERE artist_details.id = $performerID ";

$result = mysql_query($query_select, $handler);

if (!$result) {
	echo json_encode('fail');
	echo '<br/>' . $query_select . '<br/>';
	echo mysql_errno($handler) . ": " . mysql_error($handler). "\n";
}
else {
	$data = array();
	while ( ($row = mysql_fetch_array($result, MYSQL_ASSOC) ) ) {
		$entry = array();
		$entry[] = ($row["dob"] == "0000-00-00")  ? "-" : $row["dob"]; // trimmed dob 
		$entry[] = ($row["dod"] != NULL) ? $row["dod"] : "-"; // trimmed dod $row["dod;
		$entry[] = ($row["place_of_birth"] != Null) ? $row["place_of_birth"]: '-';
		$entry[] = ($row["place_of_death"] != Null) ? $row["place_of_death"]: '-';
		$data[] = $entry;
	}
	
	echo json_encode($data);
}

mysql_free_result($result);
?>
