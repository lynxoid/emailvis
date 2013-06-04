<?php
    include("credentials.php");

   /* Ensure that had no errors while uploading */
   function assertValidUpload($code)
    {
        if ($code == UPLOAD_ERR_OK) {
            return;
        }
 
        switch ($code) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $msg = 'Image is too large';
                break;
 
            case UPLOAD_ERR_PARTIAL:
                $msg = 'Image was only partially uploaded';
                break;
 
            case UPLOAD_ERR_NO_FILE:
                $msg = 'No image was uploaded';
                break;
 
            case UPLOAD_ERR_NO_TMP_DIR:
                $msg = 'Upload folder not found';
                break;
 
            case UPLOAD_ERR_CANT_WRITE:
                $msg = 'Unable to write uploaded file';
                break;
 
            case UPLOAD_ERR_EXTENSION:
                $msg = 'Upload failed due to extension';
                break;
 
            default:
                $msg = 'Unknown error';
        }
        echo $msg;
        throw new Exception($msg);
    }
 
    $errors = array();
 
    /* Validate that uploaded an image and not some other malicious file type */
    try {
        echo 'Attempting to download';
        if (!array_key_exists('image', $_FILES)) {
            throw new Exception('Image not found in uploaded data');
        }
 
        $image = $_FILES['image'];
 
        // ensure the file was successfully uploaded
        assertValidUpload($image['error']);

        echo 'Got past here';
 
        if (!is_uploaded_file($image['tmp_name'])) {
            throw new Exception('File is not an uploaded file');
        }
 
        $info = getImageSize($image['tmp_name']);

        echo 'Got past here too';
        echo '<BR>';
        var_dump($info);
        echo '<BR>';
        var_dump($image);
 
        if (!$info) {
            throw new Exception('File is not an image');
        }
    }
    catch (Exception $ex) {
        $errors[] = $ex->getMessage();
    }
 
    if (count($errors) == 0) {
        // no errors, so insert the image
 
        $caption = $image['name'];
        $type = $info['mime'];
        $size = $image['size'];
        $data = mysql_real_escape_string(file_get_contents($image['tmp_name']));
        $query = "insert into pic (caption, image_type, image_size, img) values ('$caption', '$type', $size, '$data')";
        //$query = "insert into pic (caption, image_type, image_size, img) VALUES ('test', 'test', 0, 'xxx')";
        $result = mysql_query($query, $handler);
        if (!$result)
            echo '<br>errors! ' . mysql_error();
        $id = (int) mysql_insert_id($handler);
        // finally, redirect the user to view the new image
        header('Location: view.php?id=' . $id);
        exit;
    }
?>

<html>
    <head>
        <title>Error</title>
    </head>
    <body>
        <div>
            <p>
                The following errors occurred:
            </p>
 
            <ul>
                <?php foreach ($errors as $error) { ?>
                    <li>
                        <?php echo htmlSpecialChars($error) ?>
                    </li>
                <?php } ?>
            </ul>
 
            <p>
                <a href="upload.php">Try again</a>
            </p>
        </div>
    </body>
</html>
