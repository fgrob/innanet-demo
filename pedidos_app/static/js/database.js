// Lo primero que hacemos es pedir la lista de clientes, para posteriormente fabricar los datos de la tabla.
// esta manera me resulto más agil que usar Serializadores.
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

function formatoFecha(fecha) {
  if (fecha) {
    var date = new Date(fecha);
    return date.toLocaleDateString("en-GB");
  } else {
    return "";
  }
}

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
  $.fn.dataTable.moment("DD/MM/YYYY"); /*esto arregla el orden de las fechas */
  $("#tabla-database").DataTable({
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
    ajax: {
      url: "/tablesdata",
      type: "POST",
      data: { hoja: "database", datos: "base" },
      dataSrc: "",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data: "id" },
      { data: "cliente_id" },
      { data: "producto" },
      { data: "cantidad" },
      { data: "fecha_creacion" },
      { data: "fecha_termino" },
      { data: "status" },
    ],
    columnDefs: [
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
          return (
            '<a href="#dashModal" data-bs-toggle="modal" data-bs-target="#dashModal">' +
            data +
            " " +
            row.medidas +
            " " +
            row.color +
            "</a>"
          );
        },
      },
      {
        targets: [4, 5],
        render: function (data, type, row) {
          if (data) {
            return moment(data).format("DD/MM/YYYY");
          } else {
            return "";
          }
        },
      },
      {
        targets: [6],
        createdCell: function (td, data) {
          if (data == 0) {
            $(td).attr("class", "bg-danger bg-gradient text-white");
          } else if (data == 1) {
            $(td).attr("class", "bg-warning bg-gradient");
          } else if (data == 2) {
            $(td).attr("class", "bg-light bg-gradient");
          } else if (data == 3) {
            $(td).attr("class", "bg-info bg-gradient");
          } else if (data == 4) {
            $(td).attr("class", "bg-primary bg-gradient text-white");
          } else if (data == 5) {
            $(td).attr("class", "bg-success bg-gradient text-white");
          } else if (data == 6) {
            $(td).attr("class", "bg-dark bg-gradient text-white");
          }
        },
        render: function (data, type, row) {
          return formatoStatus(data);
        },
      },
    ],
    paging: true,
    pageLength: 50,
    fixedHeader: true,
    order: [[0, "desc"]],
    initComplete: function () {
      this.api()
        .columns([6])
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
              } else if (d == 3) {
                d = "Confirmado";
              } else if (d == 4) {
                d = "En fabricación";
              } else if (d == 5) {
                d = "Terminado";
              } else {
                d = "Anulado"; 
              }
              select.append('<option value="' + d + '">' + d + "</option>");
            });
        });
    },
  });

  /* funcion para pasar el parametro ID al Modal, y traer la data desde la BBDD */
  $(document).on("click", "td > a", function () {
    fila = $(this).closest("tr");
    pedido_id = $(fila).find("td").eq(0).text();
    $.ajax({
      url: "/database/" + pedido_id + "/info",
      type: "get",
      datatype: "json",
      success: function (context) {
        var status = $(fila).find("td").eq(6).text();
        $("#dashModalLabel").text("").text(
          "Pedido ID " + context.pedido.id + " - " + status
        );
        html_cliente = context.cliente.nombre + " " + context.cliente.apellido
        if (context.reserva_tienda == "1"){
          html_cliente = html_cliente + ' (Tienda)'
        }
        $("#clienteModal").text("").html(html_cliente);
        $("#emailModal").text("").text(context.cliente.email);
        $("#productoModal").text("").text(context.pedido.producto);
        $("#medidasModal").text("").text(context.pedido.medidas);
        $("#maderaModal").text("").text(context.pedido.madera);
        $("#colorModal").text("").text(context.pedido.color);
        $("#cantidadModal").text("").text(context.pedido.cantidad);
        $("#detallesfabModal").text("").text(context.pedido.detalles_fabricacion);
        $("#detallespinModal").text("").text(context.pedido.detalles_pintura);
        $("#fechaingresoModal").text("").text(
          formatoFecha(context.pedido.fecha_creacion)
        );
        $("#fechaconfirmacionModal").text("").text(
          formatoFecha(context.pedido.fecha_confirmacion)
        );
        $("#fechaingresofabricaModal").text("").text(
          formatoFecha(context.pedido.fecha_ingreso_fabrica)
        );
        $("#fechaterminoModal").text("").text(
          formatoFecha(context.pedido.fecha_termino)
        );
        $("#editardatosModal").attr(
          "href",
          "/pedido/" + pedido_id + "/editardatos"
        );

        $("#presupuestoModal").attr(
          "href",
          "/pedido/" + pedido_id + "/presupuesto"
        );

        $("#trabajosModal tbody").html(
          "<tr><td>Sin Información</td><td></td><td></td></tr>"
        );
        var row;
        for (var trabajo of context.trabajos) {
          row =
            row +
            "<tr><td>" +
            trabajo.tipo_trabajo +
            "</td><td>" +
            trabajo.maestro_asociado;
          if (trabajo.maestro_asociado == "Sin asignación"){
            row = row + "</td><td></td></tr>"
          }else{
            row = row + "</td><td><a href='/ordentrabajo/" +
            trabajo.id +
            "'>" +
            "Ver OT" +
            "</a></td></tr>";
          }        
        }
        $("#trabajosModal tbody").html(row);
        $("#totalcostosModal").text("").text(formatoPesos(context.totales.total_costos));
        $("#utilidadModal").text("").text(
          parseFloat(context.totales.porcentaje_utilidad)
            .toFixed(2)
            .replace(".", ",") + "%"
        );
        $("#subtotalModal").text("").text(formatoPesos(context.totales.subtotal));
        $("#totalModal").text("").text(formatoPesos(context.totales.total));
        $("#rentabilidadModal").text("").text(
          formatoPesos(context.totales.rentabilidad)
        );
        $("#editarstatusModal").attr(
          "href",
          "/pedido/" + pedido_id + "/status/0"
        );
        $("#infoModal").attr("href", "/pedido/" + pedido_id);
        $("#baseModal").attr("href", "/pedido/" + pedido_id + "/ref");
      },
    });
  });

  $(document).on("click", "#pdfModal", function () {
    //funcion para ir al pdf y ejecutar petición ajax en caso de error
      var table = $("#tabla-database").DataTable();
      var cell_status = table.cell(fila,6).data()
      $("#dashModal").modal("hide");
      if (cell_status < 2 || cell_status == 6){
        $.ajax({
          url: "pedido/" + pedido_id + "/pdf",
          success: function (data) {
            toastr[data[0]['extra_tags']](data[0]['message'])       
          },
        });
      }else{
        window.location.href = '/pedido/' + pedido_id + "/pdf"
      }
      fila = null; 
  });

  $(document).on("click", "#reasignarModal", function () {
    //funcion para asignar y ejecutar petición ajax en caso de error
      var table = $("#tabla-database").DataTable();
      var cell_status = table.cell(fila,6).data()
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
});
