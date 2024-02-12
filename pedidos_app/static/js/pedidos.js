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

var pedido_id; // variable que será recurrente en el Modal. La declaro de manera global para reutilizarla sobretodo en los botones anular y confirmar
var fila; //variable que guarda el objeto fila al pinchar el modal. La uso para identificar la fila en los botones Anular y Confirmar

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

function formatoFecha(fecha) {
  if (fecha == null) {
    return "";
  }
  var date = new Date(fecha);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }

  var fecha_formateada = day + "-" + month + "-" + year;
  return fecha_formateada;
}

function formatoFecha2(fecha) {
  if (fecha) {
    const date = new Date(fecha);
    const hoy = Date.now();

    var day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    const month = date.toLocaleDateString("default", { month: "long" });
    var fechaformateada = day + " de " + month;
    tiempo_transcurrido = Math.round((hoy - date) / (1000 * 60 * 60 * 24));
    fechaformateada =
      fechaformateada +
      '<hr class="m-0 pb-1 text-dark">' +
      '<span class="fs-7 fw-light">(hace ' +
      tiempo_transcurrido +
      " días)</span>";
    return fechaformateada;
  } else {
    return "";
  }
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
}

$(document).ready(function () {
  /* Datatables: */
  $.fn.dataTable.moment("DD/MM/YYYY"); /*esto arregla el orden de las fechas */
  $("#tabla-pedidos").DataTable({
    language: {
      decimal: "",
      emptyTable: "No hay información",
      info: "Pedidos : _TOTAL_ ",
      infoEmpty: "Mostrando 0 Pedidos",
      infoFiltered: "(de un total de _MAX_ )",
      infoPostFix: "",
      thousands: ",",
      lengthMenu: "Mostrar _MENU_ Pedidos",
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
    paging: false,
    fixedHeader: true,
    paging: true,
    pageLength: 50,
    order: [[0, "desc"]],
    ajax: {
      url: "/tablesdata",
      type: "POST",
      data: { hoja: "pedidos", datos: "base" },
      dataSrc: "",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data: "id" },
      { data: "cliente_id" },
      { data: "producto" },
      { data: "cantidad" },
      { data: "fecha_creacion" },
      { data: "fecha_creacion" }, // columna auxiliar para el filtro de ordenar
      { data: "fecha_pdf" },
      { data: "fecha_pdf" }, // columna auxiliar para el filtro de ordenar
      { data: "fecha_confirmacion" },
      { data: "fecha_confirmacion" }, // columna auxiliar para el filtro de ordenar
      { data: "status" },
      { data: "id" }, // PDF
    ],
    columnDefs: [
      { orderData: [5], targets: [4] },
      { orderData: [7], targets: [6] },
      { orderData: [9], targets: [8] },
      {
        targets: [5, 7, 9],
        visible: false,
        searchable: false,
      },
      {
        targets: [1],
        render: function (data, type, row) {
          html = clientes[data]
          if (row.reserva_tienda == "1"){
            html = html + '<br><span class="bg-warning fw-bold">Tienda</span>'
          }
          return html;
        },
      },
      {
        targets: [2],
        render: function (data, type, row) {
          var html =
            '<a class="col_producto" href="#dashModal" data-bs-toggle="modal" data-bs-target="#dashModal" data-id=' +
            row.id +
            ">" +
            data +
            "</a><br>" +
            row.medidas +
            "<br><span ";
          if (row.color == "color pendiente") {
            html = html + 'class="bg-danger text-white"';
          }
          html = html + ">" + row.color + "</span>";
          return html;
        },
      },
      {
        targets: [4, 6, 8],
        createdCell: function (td, data) {
          $(td).attr("class", "text-nowrap");
        },
        render: function (data, type, row) {
          if (data) {
            return formatoFecha2(data);
          } else {
            return "";
          }
        },
      },
      {
        targets: [5, 7, 9],
        render: function (data, type, row) {
          if (data) {
            return moment(data).format("DD/MM/YYYY");
          } else {
            return "";
          }
        },
      },
      {
        targets: [10],
        createdCell: function (td, data, row) {
          $(td).attr("id", "status_" + row.id);
          if (data == 0) {
            $(td).attr("class", "text-nowrap bg-danger bg-gradient text-white");
          } else if (data == 1) {
            $(td).attr("class", "text-nowrap bg-warning bg-gradient");
          } else if (data == 2) {
            $(td).attr(
              "class",
              "text-nowrap bg-secondary bg-gradient text-white"
            );
          } else if (data == 3) {
            $(td).attr(
              "class",
              "text-nowrap bg-success bg-gradient text-white"
            );
          }
        },
        render: function (data, type, row) {
          return formatoStatus(data);
        },
      },
      {
        targets: [11],
        createdCell: function (td, data, row) {
          // $(td).attr("class", "text-nowrap bg-danger bg-gradient text-white");
          if (row.status == 2 || row.status == 3) {
            if (row.fecha_pdf == null) {
              $(td).attr("class", "bg-info bg-gradient");
            }
          }
        },
        render: function (data, type, row) {
          if (row.status == 2 || row.status == 3) {
            html =
              '<a  href="/pedido/' +
              data +
              '/pdf"><i class="btn fa-solid fa-file-pdf"></i></a>';
          } else {
            html = "";
          }
          return html;
        },
      },
    ],
    initComplete: function () {
      this.api()
        .columns([10])
        .every(function () {
          var column = this;
          var select = $(
            '<select class="selector_tabla form-select col m-1"><option value="">Todos los pedidos</option></select>'
          )
            .appendTo(".selectors")
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());

              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column
            .data()
            .unique()
            .sort()
            .each(function (d, j) {
              if (d == 0) {
                d = "Pendiente";
              } else if (d == 1) {
                d = "En revisión";
              } else if (d == 2) {
                d = "No confirmado";
              } else {
                d = "Confirmado"; 
              }
              select.append('<option value="' + d + '">' + d + "</option>");
            });
        });
    },
  });

  /* funcion para pasar el parametro ID al Modal, y traer la información desde la BBDD */
  $(document).on("click", ".col_producto", function () {
    pedido_id = $(this).data("id");
    fila = $(this).closest("tr"); //se le asigna el objeto fila por si más adelante pinchan anular o confirmar
    $.ajax({
      url: "/pedido/" + pedido_id,
      type: "get",
      datatype: "json",
      success: function (context) {
        var status = document.getElementById("status_" + pedido_id).innerText;
        $("#dashModalLabel")
          .text("")
          .text("Pedido ID " + context.pedido.id + " - " + status);
        $("#clienteModal")
          .text("")
          .text(context.cliente.nombre + " " + context.cliente.apellido);
        $("#emailModal").text("").text(context.cliente.email);
        $("#celularModal").text("").text(context.cliente.celular);
        $("#productoModal").text("").text(context.pedido.producto);
        $("#medidasModal").text("").text(context.pedido.medidas);
        $("#maderaModal").text("").text(context.pedido.madera);
        $("#colorModal").text("").text(context.pedido.color);
        $("#cantidadModal").text("").text(context.pedido.cantidad);
        $("#detallesfabModal")
          .text("")
          .text(context.pedido.detalles_fabricacion);
        $("#detallespinModal").text("").text(context.pedido.detalles_pintura);
        $("#fechaingresoModal")
          .text("")
          .text(formatoFecha(context.pedido.fecha_creacion));
        $("#fechaconfirmacionModal")
          .text("")
          .text(formatoFecha(context.pedido.fecha_confirmacion));
        $("#presupuestoModal").attr(
          "href",
          "/pedido/" + context.pedido.id + "/presupuesto"
        );
        $("#infoModal").attr("href", "/pedido/" + context.pedido.id);
      },
    });
  });

  $(document).on("click", "#confirmacionModal", function () {
    //funcion para confirmar y ejecutar petición ajax para cambiar el status del pedido en la BBDD
      var table = $("#tabla-pedidos").DataTable();
      var cell = table.cell(fila,10)
      $("#dashModal").modal("hide");
      $.ajax({
        url: "confirmar/" + pedido_id,
        success: function (data) {
          if (data[0]['extra_tags'] == 'success'){
            cell.data('3')
            $(cell.node()).removeClass().addClass('bg-success bg-gradiant text-white');
            toastr[data[0]['extra_tags']](data[0]['message'])
          }else{
            toastr[data[0]['extra_tags']](data[0]['message'])
          }          
        },
      });
      fila = null; 
  });

  $(document).on("click", "#asignacionModal", function () {
    //funcion para asignar y ejecutar petición ajax en caso de error
      var table = $("#tabla-pedidos").DataTable();
      var cell_status = table.cell(fila,10).data()
      var cell_cliente = table.cell(fila,1).data()
      $("#dashModal").modal("hide");
      if (cell_status < 3){
        $.ajax({
          url: "asignacion/" + pedido_id,
          success: function (data) {
            toastr[data[0]['extra_tags']](data[0]['message'])       
          },
        });
      }else{
        window.location.href = '/asignacion/' + pedido_id
      }
      fila = null; 
  });


  $(document).on("click", "#anularModal", function () {
    //esta función elimina la fila al pinchar Anular y ejecuta petición ajax para cambiar el status del pedido en la BBDD
    // pedido_id = $("#anularModal").data("id")
    let confirmAction = confirm("¿Anular pedido " + pedido_id + "?");
    if (confirmAction) {
      var table = $("#tabla-pedidos").DataTable();
      table.row(fila).remove().draw();
      $("#dashModal").modal("hide");
      $.ajax({
        url: "pedido/" + pedido_id + "/anular",
        success: function () {
          toastr.warning("Pedido ID " + pedido_id + " anulado");
        },
      });
      fila = null;
    }
  });
});
