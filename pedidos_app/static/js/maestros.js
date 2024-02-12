$(document).ready(function () {

  $(document).on("click", ".editar", function () {
    var tipo_trabajo_id = $(this).data("id");
    document.getElementById("editarModalLabel").innerText = document.getElementById(
      "tipo_" + tipo_trabajo_id
    ).innerHTML;
    document.getElementById("pkModal").value = document.getElementById(
      "id_" + tipo_trabajo_id
    ).innerHTML;
    document.getElementById("totalModal").value = document.getElementById("total_" + tipo_trabajo_id).innerHTML.replace("$","").replace(".","");
  });
});
