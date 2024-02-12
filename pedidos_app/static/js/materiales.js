function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

var categorias;
$.ajax({
  url: "/tablesdata",
  type: "POST",
  datatype: "json",
  async: false,
  data: { hoja: "materiales", datos: "categorias" },
  headers: { "X-CSRFToken": getCookie("csrftoken") },
  success: function (data) {
    categorias = data;
  },
});

function formatoPesos(valor) {
  const formatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

  valor_formateado = formatter.format(valor);
  return valor_formateado;
}

$(document).ready(function () {
  /* Datatables: */
  $("#tabla-materiales").DataTable({
    language: {
      decimal: "",
      emptyTable: "No hay información",
      info: "Materiales : _TOTAL_ ",
      infoEmpty: "Mostrando 0 Materiales",
      infoFiltered: "(de un total de _MAX_ )",
      infoPostFix: "",
      thousands: ",",
      lengthMenu: "Mostrar _MENU_ Materiales",
      loadingRecords: "Cargando...",
      processing: "Procesando...",
      search: "Buscar:",
      zeroRecords: "Sin resultados encontrados",
      paginate: {
        first: "Primero",
        last: "Ultimo",
        next: "Siguiente",
        previous: "Anterior",
      },
    },
    paging: true,
    pageLength: 50,
    fixedHeader: true,
    ajax: {
      url: "/tablesdata",
      type: "POST",
      dataSrc: "",
      data: { hoja: "materiales", datos: "base" },
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data: "id" },
      { data: "categoria_id" }, //pk categ oculto
      { data: "categoria_id" },
      { data: "material" },
      { data: "costo_neto" },
      { data: "unidad_medida" },
      { data: "id" }, //opciones (editar)
    ],
    order: [[2, "asc"]],
    columnDefs: [
      {
        targets: [0],
        createdCell: function (td, data) {
          $(td).attr("id", "id_" + data);
        },
      },
      {
        targets: [1],
        visible: true,
        searchable: false,
        createdCell: function (td, data,row) {
          $(td).attr("id", "categoria_mat_" + row.id);
          $(td).attr("style", "display:none;");  // si uso visible false, no renderiza los datos. Necesito los datos para el modal
        },
      },
      {
        targets: [2],
        render: function (data, type, row) {
          return categorias[data];
        },
      },
      {
        targets: [3],
        createdCell: function (td, data, row) {
          $(td).attr("id", "material_" + row.id);
        },
      },
      {
        targets: [4],
        createdCell: function (td, data, row) {
          $(td).attr("id", "costo_" + row.id);
        },
        render: function (data, type, row) {
          return formatoPesos(data);
        },
      },
      {
        targets: [5],
        createdCell: function (td, data, row) {
          $(td).attr("id", "unidad_" + row.id);
        },
      },
      {
        targets: [6],
        orderable: false,
        render: function (data, type, row) {
          html = '<i href="#edicionModal" title="Editar material" data-bs-toggle="modal" data-bs-target="#edicionModal" class="editar btn fa-solid fa-pen-to-square" data-id=' + data + '></i>'
          return html;
        },
      },
     
    ],
  });

  $(document).on("click", ".editar", function () {
    var material_id = $(this).data("id");
    document.getElementById("pkModal").value = document.getElementById(
      "id_" + material_id
    ).innerHTML;
    document.getElementById("categoriaModal").value = document.getElementById(
      "categoria_mat_" + material_id
    ).innerHTML;
    document.getElementById("materialModal").value = document.getElementById(
      "material_" + material_id
    ).innerHTML;
    document.getElementById("costoModal").value = document.getElementById("costo_" + material_id).innerHTML.replace("$","").replace(".","");
    document.getElementById("unidadModal").value = document.getElementById(
      "unidad_" + material_id
    ).innerHTML;
  });
});
