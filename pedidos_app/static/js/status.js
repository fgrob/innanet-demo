$(document).ready(function () {
  $("#status").change(function () {

    if ($('#status').val() == '0'){
        // pendiente
        document.getElementById("warnings").innerHTML =
        "<ul>" +
        "<li class='ffst-italic text-success'>&#9642; Se cambiará el status a 'pendiente'</li>" +
        "<li class='fw-bold ffst-italic text-danger'>&#9642; ADVERTENCIA: Se eliminará el presupuesto del pedido. Esto incluye trabajos (aunque se encuentren pagados), materiales, costos, fechas, etc</li>" +
        "<li class='ffst-italic text-success'>&#9642; Los datos de ingreso se mantendrán</li>" +
                "</ul>"
        
    } else if ($('#status').val() == '1') {
        // en revisión
        document.getElementById("warnings").innerHTML =
        "<ul>" +
        "<li class='ffst-italic text-success'>&#9642; Se cambiará el status a 'en revisión'</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de término</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de cierre</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de ingreso a Fábrica</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Los trabajos cambiarán su status a 'pendiente' EXCEPTO los que se encuentren pagados</li>" +
        "<li class='ffst-italic text-success'>&#9642; La asignación de maestros se mantendrá (puedes re-ajustarla al momento de enviar a producción)</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de confirmación</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de envío de presupuesto PDF</li>" +
        "</ul>"

    } else if ($('#status').val() == '2') {
        // no confirmado
        document.getElementById("warnings").innerHTML =
        "<ul>" +
        "<li class='ffst-italic text-success'>&#9642; Se cambiará el status a 'no confirmado'</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de término</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de cierre</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de ingreso a Fábrica</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Los trabajos cambiarán su status a 'pendiente' EXCEPTO los que se encuentren pagados</li>" +
        "<li class='ffst-italic text-success'>&#9642; La asignación de maestros se mantendrá (puedes re-ajustarla al momento de enviar a producción)</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de confirmación</li>" +
        "</ul>"

    } else if ($('#status').val() == '3') {
        // confirmado
        document.getElementById("warnings").innerHTML =
        "<ul>" +
        "<li class='ffst-italic text-success'>&#9642; Se cambiará el status a 'confirmado'</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de término</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de cierre</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de ingreso a Fábrica</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Los trabajos cambiarán su status a 'pendiente' EXCEPTO los que se encuentren pagados</li>" +
        "<li class='ffst-italic text-success'>&#9642; La asignación de maestros se mantendrá (puedes re-ajustarla al momento de enviar a producción)</li>" +
        "</ul>"

    } else if ($('#status').val() == '4') {
        // en fabricación
        document.getElementById("warnings").innerHTML =
        "<ul>" +
        "<li class='ffst-italic text-success'>&#9642; Se cambiará el status a 'en fabricación'</li>" +
        "<li class='ffst-italic text-danger'>&#9642; Se eliminará la fecha de cierre</li>" +
        
        "</ul>"

    } else if ($('#status').val() == '5') {
        // terminado
        document.getElementById("warnings").innerHTML =
        "<ul>" +  
        "<li class='fw-bold fst-italic text-danger'>&#9642; Solo se puede cambiar a Terminado desde la hoja Producción</li>" +
        "</ul>"

    } else if ($('#status').val() == '6') {
        // anulado
        document.getElementById("warnings").innerHTML =
        "<ul>" +
        "<li class='ffst-italic text-success'>&#9642; Se cambiará el status a 'anulado'</li>" +
        "<li class='fw-bold fst-italic text-success'>&#9642; No se eliminará información</li>" +
        "</ul>"

    }

    
  });
});
