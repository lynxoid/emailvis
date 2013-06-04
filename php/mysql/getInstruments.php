<?php 
include 'credentials.php';

///////////////////////////////////////////////////////////////////////////////
//
// Get all musical instruments ids and abbreviations
//
///////////////////////////////////////////////////////////////////////////////

	$query = 	"SELECT DISTINCT cAxAbbrev, nid FROM Ax";

	$result = mysql_query($query, $handler);

	if (!$result) {
		echo mysql_errno($handler) . ": " . mysql_error($handler). "\n";
		return array("sessions"=>"No session data", "query"=>$query);
  }
	else {
		$instruments = array();

		// for every session they had in common
		while ( ($row = mysql_fetch_array($result, MYSQL_ASSOC) ) ) {
				$abbrev = $row["cAxAbbrev"];
				$id = $row["nid"];
				$people[$id] = $abbrev;
    }
    echo json_encode($people);
	}
?>
