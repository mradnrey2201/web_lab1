<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    print_r(parse_url($_SERVER['REQUEST_URI'], PHP_URL_SCHEME));
    $path =  parse_url($_SERVER['REQUEST_URI'])['path'];
    if($path == '/api/hit'){
        $script_start = microtime(true);
        if (isset($_GET['r']) && isset($_GET['x']) && isset($_GET['y'])) {
            header('Content-Type: text/html');
            http_response_code(201);

            $xValue = floatval($_GET['x']);
            $yValue = strval($_GET['y']);
            $pieces = explode(".", $yValue);
            //echo $pieces[0];
            //echo $pieces[1];
            //if($pieces[1]>0){
              //  echo "sssssssssssss";
            //}
            
            $rValue = floatval($_GET['r']);
            $hit = hit($xValue,$yValue,$rValue);
            if($xValue>3 || $xValue<-3){
                echo "Значение X больше допустимого";
                
            }elseif(doubleval($yValue)>4 ||doubleval($yValue<-4) || ($pieces[0]==-4 && $pieces[1]>0)|| ($pieces[0]==4 && $pieces[1]>0) ){
                //echo $yValue;
                echo "Значение У больше допустимого";
            }
            elseif($rValue>5 || $rValue<1){
                echo "Значение r больше допустимого";
            }else{
                $yValue=doubleval($yValue);
                 $hitted = $hit ? 'hitted' : 'miss'; 
                 $currentTime = gmDate("H:i:s",time() + 3600*(3+date("I")));
                $execution_time = ceil((microtime(true) - $script_start) * 100000000) /100;
                echo "
                <tr style='text-align: center;'>
                    <td>$xValue</td>
                    <td>$yValue</td>
                    <td>$rValue</td>
                    <td>$hitted</td>
                    <td>$currentTime</td>
                    <td>$execution_time ms</td>
                </tr>";
                exit(201);
            }
           
           
        }else{
            http_response_code(400);
            echo 'Bad request';
            exit(400);
        }
    }
}

function hit($x, $y, $r){
    if ($x <= 0 && 
        $y <= 0 && 
        $x <= $r/2 && 
        $y <= $r) {
        return true;
    }
    elseif ($x > 0 && $y > 0) {
        return false;
    }
    elseif ($x <= 0 && $y >= 0) {
        if ($y <= ($r + $x)) {
            return true;
        }
        return false;
    }
    elseif($x >= 0 && $y <= 0) {
        if (($x**2 + $y**2) <= $r**2){
            return true;
        }
        return false;
    }
}
