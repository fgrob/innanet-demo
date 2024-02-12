function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

var clientes;
$.ajax({
  url: "/tablesdata",
  type: "POST",
  datatype: "json",
  async: false,
  data: { datos: "clientes" },
  headers: { "X-CSRFToken": getCookie("csrftoken") },
  success: function (data) {
    clientes = data;
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

// funcion para retornar el display de los status
function formatoStatus(valor) {
  if (valor == 0) {
    return "Pendiente";
  }
  if (valor == 1) {
    return "En revisión";
  }
  if (valor == 2) {
    return "No confirmado";
  }
  if (valor == 3) {
    return "Confirmado";
  }
  if (valor == 4) {
    return "En fabricación";
  }
  if (valor == 5) {
    return "Terminado";
  }
  if (valor == 6) {
    return "Anulado";
  }
}

$(document).ready(function () {
  var buttonCommon = {
    exportOptions: {
      columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      format: {
        body: function (data, row, column, node) {
          // Strip $ (y el punto) from salary column to make it numeric
          if (column == 6 || column == 7 || column == 8 || column == 9 || column == 10 || column == 11) {
            var momentDate = moment(data, 'DD/MM/YYYY')
            if (momentDate.isValid()) {
              return moment(momentDate).format('YYYY-MM-DD');
            } else {
              return data;
            }
          }
          if (column == 13 || column == 15 || column == 16) {
            return data.replace(/[$.]/g, "")
          }
          if (column == 14) {
            return (data / 100)
          }
          return data;
        },
      },
    },
  };
  // Datatables
  $.fn.dataTable.moment("DD/MM/YYYY"); /*esto arregla el orden de las fechas */
  $("#tabla-cartola").DataTable({
    language: {
      decimal: "",
      emptyTable: "No hay información",
      info: "Pedidos : _TOTAL_ ",
      infoEmpty: "Mostrando 0 pedidos",
      infoFiltered: "(de un total de _MAX_ )",
      infoPostFix: "",
      thousands: ",",
      lengthMenu: "Mostrar _MENU_ Trabajos",
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
    order: [[0, "desc"]],
    ajax: {
      url: "/tablesdata",
      type: "POST",
      data: { hoja: "excelddbb", datos: "base" },
      dataSrc: "",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data: "id" },
      { data: "cliente_id" },
      { data: "producto" },
      { data: "medidas" },
      { data: "color" },
      { data: "cantidad" },
      { data: "fecha_creacion" },
      { data: "fecha_pdf" },
      { data: "fecha_confirmacion" },
      { data: "fecha_ingreso_fabrica" },
      { data: "fecha_termino" },
      { data: "fecha_cierre" },
      { data: "status" },
      { data: "presupuesto__total_costos" },
      { data: "presupuesto__porcentaje_utilidad" },
      { data: "presupuesto__subtotal" },
      { data: "presupuesto__rentabilidad" },
      { data: "reserva_tienda"}
    ],
    columnDefs: [
      // columnas invisibles:
      {
        "targets": [3, 4, 7, 8, 9, 11, 13, 14, 17],
        "visible": false,
        "searchable": false
      },
      {
        targets: [1],
        render: function (data, type, row) {
          return clientes[data];
        },
      },
      {
        targets: [6, 7, 8, 9, 10, 11],
        render: function (data, type, row) {
          if (data) {
            return moment(data).format("DD/MM/YYYY");
          } else {
            return "";
          }
        },
      },
      {
        targets: [12],
        render: function (data, type, row) {
          return formatoStatus(data)
        }
      },
      {
        targets: [13, 15, 16],
        render: function (data, type, row) {
          return formatoPesos(data)
        }
      },
    ],
    dom: "Bfrtip",
    buttons: [
      $.extend(true, {}, buttonCommon, {
        extend: "excelHtml5",
        title:''
      }),
    ],
  });
});

