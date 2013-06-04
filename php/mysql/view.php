<?php 
    require_once("credentials.php");

    try {
        if (!isset($_GET['id'])) {
            echo 'No id';
            throw new Exception('ID not specified');
            // show all pictures        
        }
 
        $id = (int) $_GET['id'];
        if ($id < 0) {
            throw new Exception('Invalid ID specified');
        }
 
        $query  = "SELECT caption, image_type, image_size, img FROM pic WHERE artist_id = $id";
        $result = mysql_query($query, $handler);
        $num_rows = mysql_num_rows($result);
        if (!$result || $num_rows <= 0) {
            // echo '<br>Errors1! ' . mysql_error();
            // display an alternative photograph - "no photo"
            $query  = "SELECT caption, image_type, image_size, img FROM pic WHERE artist_id = 0";
            $result = mysql_query($query, $handler);
            if (!$result)
                exit;
        }

        $image = mysql_fetch_array($result);
        if (!$image) {
            //echo '<br>Errors2! ' . mysql_error();
            //$folder = '.';
            //$image = $folder.$_GET['no_photo.jpg'];
            exit();
        }


        header('Content-type: ' . $image['image_type']);
        header('Content-length: ' . $image['image_size']);
        echo $image['img'];
    }
    catch (Exception $ex) {
        header('HTTP/1.0 404 Not Found');
        exit;
    }
?>
