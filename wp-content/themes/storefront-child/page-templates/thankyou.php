<?php
/*
Template Name: Thank You Page
*/
?>

<?php get_header(); ?>


<div class="body-thank-you-page">

	<!--BEGIN THANK YOU SECTION-->
	<section class="section-thank-you-container thank-you-success" style="display:flex; justify-content: space-between; width:80%;">
        <div class="row" style="display:inline-block;">
            <h2 class="text-uppercase">Gracias por tu compra!</h2>
            <p>Recibiras tus entradas por e-mail</p>
        </div>
        <div class="col alert-container alert-success" style="display:inline-block; width:20vh;">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                <circle class="path circle" fill="none" stroke="#8BC34A" stroke-width="9" stroke-miterlimit="10" cx="65.1" cy="65.1" r="61.1"/>
                <polyline class="path check" fill="none" stroke="#8BC34A" stroke-width="9" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
            </svg>
        </div>
    </section>
    <div class="button-container" id="button-container">
        <button id="" class="btn btn-primary" onclick="location.href='<?php echo site_url();?>'" role="button">Ir al inicio</button>
    </div>

</div>

	
<?php get_footer(); ?>

<script type="text/javascript">

function deleteAllCookies() {
    // Leemos todas las cookies
    var cookies = document.cookie.split(";");
    let arrAux = [];

    // Recorremos todas las cookies
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        if(cookie.includes('tickets_244') || cookie.includes('tickets_245')){
            arrAux.push(cookie);
        }
    }
    tumbaCookie(arrAux);
}

function tumbaCookie(arr){
    for (let i = 0; i < arr.length; i++) {
        let cookie = arr[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        console.log(name)
        document.cookie =  name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
}

window.onload = function(){
    deleteAllCookies();
}

</script>
