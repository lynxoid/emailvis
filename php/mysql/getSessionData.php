<?php include("credentials.php")?>

<?php

// pass in an id, start, endDate
// get performers that have collaborated with that id within this period of time


$performerID = $_GET['performerID'];


$query1 = "SELECT DISTINCT Sessions.nSessId, Sessions.dSessDate, Sessions.cStudio, Sessions.cCity, CAST(Sessions.lApprxDate as UNSIGNED) as lApprxDate, Sessions.cFreeDate
		FROM Players, Sessions
		WHERE Players.nArtId = $performerID 
		AND Sessions.nSessId = Players.nSessId
		AND Sessions.dSessDate < '2011-01-01'
		ORDER BY Sessions.dSessDate ASC";

$result = mysql_query($query1, $handler);


if (!$result) {
	echo json_encode(array('sqlerror' => mysql_errno($handler) . ": " . mysql_error($handler). "\n"));
    return;
}
else {
	// otherwise get players per session
	$get_ppl = "SELECT DISTINCT nArtId, nAxId, Players.nSessId
		FROM Ax, Players, (SELECT nSessId FROM Players WHERE Players.nArtId = $performerID) AS foo
		WHERE Players.nSessId = foo.nSessID AND Ax.nid = Players.nAxId";
	$ppl_result = mysql_query($get_ppl, $handler);

	if (!$ppl_result) {
	 	return mysql_errno($handler) . ": " . mysql_error($handler). "\n";
	}

	// build a dictionary sessId -> people -> ax
	$sess2Ppl = array();
	while( ($row = mysql_fetch_array($ppl_result, MYSQL_ASSOC)) ) {
		$nSessId = $row["nSessId"];
		$nArtId = $row["nArtId"];
		$nAxId = $row["nAxId"];
		if ( array_key_exists($nSessId, $sess2Ppl) ) {
	          // if added this person already
	          if (array_key_exists($nArtId, $sess2Ppl[$nSessId]) ) {
   	            // add a new instrument
	            $sess2Ppl[$nSessId][$nArtId][] = $nAxId;
	          }
	          else {
	            // create a new array here
	            $instr = array($nAxId);
		    $sess2Ppl[$nSessId][$nArtId] = $instr;		// add person
		  }
		}
		else {
			$sess2Ppl[$nSessId][$nArtId] = array($nAxId);	// create ppl array at that key
		}
	}

	$sessions = array();
	while( ($row = mysql_fetch_array($result, MYSQL_ASSOC)) ) {
		$session_id = $row["nSessId"];
		$date = $row["dSessDate"];
		$description = ""; // "Label: " . $row["cLabel"];
		//if (!$row["cStudio"] || strlen($row["cStudio"])) {
			// $description = $description . "\nStudio: -";
    //}
		//else
		//	$description = $description . $row["cStudio"] . " studio, ";
		$description = $description . $row["cCity"];
		
 		$pplArray = $sess2Ppl[$session_id];
//		$entry = array('start' => $date, 'session_id' => $session_id, 'description' => $description, 'people' => $pplArray);
		if ($row["lApprxDate"] == 1) {
		  $entry = array($date, $session_id, $description, $pplArray, $row["cFreeDate"]);
		}
		else {
		  $entry = array($date, $session_id, $description, $pplArray);
		}
		$sessions[] = $entry;
	}
	
	// wrap in an array
	$json_data = array ('events' => $sessions);
	
	echo json_encode($json_data);
}
?>
