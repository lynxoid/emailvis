<?php 
include 'credentials.php';

///////////////////////////////////////////////////////////////////////////////
//
// Generates details about a session: people who played, their instruments
//
///////////////////////////////////////////////////////////////////////////////

function getPeopleInstruments($session_id, $handler) {	
	$query = 	"SELECT DISTINCT t1.nArtId, Artists.fName, Artists.lName, 
			(SELECT group_concat(DISTINCT Ax.cAxAbbrev)
			FROM Ax, Players
			WHERE Players.nAxId = Ax.nid AND Players.nArtId = t1.nArtId AND Players.nSessId = $session_id) as inst
			FROM Players AS t1, Artists 
			WHERE t1.nSessId = $session_id AND Artists.nid = t1.nArtId";
	$result = mysql_query($query, $handler);
	
	if (!$result) {
		//echo mysql_errno($result) . ": " . mysql_error($result) . "<br/>" . $query;
		return "No session data";
	}

	$details = array();
	while ( ($row = mysql_fetch_array($result, MYSQL_ASSOC) ) ) {
	//	$details[] = array("f_name"=>$row["fName"], "l_name"=>$row["lName"], "inst"=>$row["inst"]);
		$details[] = array($row["fName"], $row["lName"], $row["inst"]);
	}
	return $details;
}

///////////////////////////////////////////////////////////////////////////////
//
// Get sessions between two people
//
///////////////////////////////////////////////////////////////////////////////
function getSessions($main_id, $collaborator_id, $handler, $start_index) {

	$query = 	"SELECT Sessions.dSessDate as sess_date, Sessions.cCity as sess_city, Sessions.nSessId as session_id " .
				"FROM Sessions, ( " .
				"SELECT DISTINCT p1.nSessId " .
				"FROM Players as p2, " .
						"( SELECT DISTINCT nSessId
						   FROM Players
						   WHERE nArtId = $main_id) as p1  " .
				"WHERE p2.nSessId = p1.nSessId  " .
					"AND p2.nArtId = $collaborator_id) as ids " .
				"WHERE Sessions.nSessId = ids.nSessId ".
				"ORDER BY Sessions.dSessDate";

	$result = mysql_query($query, $handler);

	if (!$result) {
		echo mysql_errno($handler) . ": " . mysql_error($handler). "\n";
		return array("sessions"=>"No session data", "query"=>$query);
}
	else {
		$cnt = mysql_num_rows($result);
		$sessions = array();
		$counter = 0;
		// for every session they had in common
		while ( ($row = mysql_fetch_array($result, MYSQL_ASSOC)) && 
			( ($start_index == 0 && $counter < 15) || 
			  ($start_index > 0) ) ) {
			if ($counter >= $start_index) {
				$session_id = $row["session_id"];
				$session_date = $row["sess_date"];
				$session_city = $row["sess_city"];
				$people = getPeopleInstruments($session_id, $handler);
			//	$session = array("id"=>$session_id, "date"=>$session_date, "city"=>$session_city, "people"=>$people);
				$session = array($session_id, $session_date, $session_city, $people);
				$sessions[] = $session;
			}
			$counter += 1;
		}
		return array("sessions"=>$sessions, "sess_cnt"=>$cnt);
	}
}


///////////////////////////////////////////
//
// Main function body
//
///////////////////////////////////////////

$mainID = $_GET['main_id'];
$collabID = $_GET['collaborator_id'];

if ( array_key_exists('start_index', $_GET) )
  $start_index = $_GET['start_index'];
else
  $start_index = 0;

//$mainID = 25;
//$collabID = 612;
//$startDate = '1930';
//$endDate = '1940';
//$startDate = $_GET['startDate'];
//$endDate = $_GET['endDate'];
	
// get info about this partner
$sessions = getSessions($mainID, $collabID, $handler, $start_index);
echo json_encode($sessions);

?>
