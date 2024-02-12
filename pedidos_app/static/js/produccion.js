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

var trabajos;
$.ajax({
  url: "/tablesdata",
  type: "POST",
  datatype: "json",
  async: false,
  data: { hoja: "produccion", datos: "trabajos" },
  headers: { "X-CSRFToken": getCookie("csrftoken") },
  success: function (data) {
    trabajos = data;
  },
});

function formatoTrabajos(valor) {
  var html = "";
  var terminados = 0;
  // trabajos[datos][nombre][status] *
  for (var i = 0; i < trabajos[valor].length; i++) {
    if (trabajos[valor][i][3] == "0") {
      // trabajo[pedido_id][Nrdetrabajodelpedido][datorequerido]
      // datos = 0: trabajo id, 1: tipotrabajo, 2: maestro, 3: statustrabajo, 4: fechaasignacion
      html =
        html +
        '<a href="#modal_trabajo" id="status_trabajo_' +
        trabajos[valor][i][0] +
        '" class="statustrabajo btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#modal_trabajo" data-id=' +
        trabajos[valor][i][0] +
        '>Pendiente&nbsp</a><i title="Marcar como terminado" id="icon_trabajo_' +
        trabajos[valor][i][0] +
        '" class="icontrabajo btn fa-solid fa-close" data-id="' +
        trabajos[valor][i][0] +
        '"></i>';
    } else {
      terminados++;
      html =
        html +
        '<a href="#modal_trabajo" id="status_trabajo_' +
        trabajos[valor][i][0] +
        '" class="statustrabajo btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modal_trabajo" data-id=' +
        trabajos[valor][i][0] +
        '>Terminado</a><i title="Marcar como pendiente" id="icon_trabajo_' +
        trabajos[valor][i][0] +
        '" class="icontrabajo btn fa-solid fa-check" data-id="' +
        trabajos[valor][i][0] +
        '"></i>';
    }
    html =
      html +
      '<span class="fst-italic">' +
      trabajos[valor][i][1] +
      "</span> : " +
      trabajos[valor][i][2];
    if (trabajos[valor][i][4] == null){
      html = html + '&nbsp<span class="fw-bold bg-warning">OT</span>'
      }
    html = html + '<hr class="m-0 pb-1 text-dark">';
  }
  if (terminados == trabajos[valor].length) {
    html =
      html +
      '<a id="termino_' +
      valor +
      '" class="boton_cerrar_pedido btn input-block-level btn-dark btn-sm" style="width:100%">Cerrar Pedido - Marcar como terminado</a>';
  } else {
    html =
      html +
      '<a id="termino_' +
      valor +
      '"></a>';
  }

  return html;
}

function formatoFecha(fecha) {
  if (fecha) {
    var date = new Date(fecha);
    return date.toLocaleDateString("en-GB");
  } else {
    return "";
  }
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
  $("#tabla-produccion").DataTable({
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
    paging: true,
    pageLength: 50,
    fixedHeader: true,
    ajax: {
      url: "/tablesdata",
      type: "POST",
      dataSrc: "",
      data: { hoja: "produccion", datos: "base" },
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data: "id" },
      { data: "cliente_id" },
      { data: "producto" },
      { data: "cantidad" },
      { data: "fecha_confirmacion" },
      { data: "fecha_confirmacion" },
      { data: "fecha_ingreso_fabrica" },
      { data: "fecha_ingreso_fabrica" },
      { data: "id" }, // trabajos* La ID (del pedido) es para identificarlos
    ],
    columnDefs: [
      { orderable: false, targets: 8 },
      {
        targets: [1],
        render: function (data, type, row) {
          html = clientes[data]
          if (row.reserva_tienda == "1"){
            html = html + '<br><span class="bg-warning fw-bold">Tienda</span>';
          }
          return html;
        },
      },
      {
        targets: [2],
        render: function (data, type, row) {
          var html =
            '<a class="infoproducto" href="#dashModal" data-bs-toggle="modal" data-bs-target="#dashModal" data-id=' +
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
      { orderData: [5], targets: [4] },
      { orderData: [7], targets: [6] },
      {
        targets: [5, 7],
        visible: false,
        searchable: false,
      },
      {
        targets: [4, 6],
        render: function (data, type, row) {
          if (data) {
            return formatoFecha2(data);
          } else {
            return "";
          }
        },
      },
      {
        targets: [5, 7],
        render: function (data, type, row) {
          if (data) {
            return moment(data).format("DD/MM/YYYY");
          } else {
            return "";
          }
        },
      },
      {
        targets: [8],
        createdCell: function (td, data) {
          $(td).attr("class", "text-start text-nowrap");
        },
        render: function (data, type, row) {
          return formatoTrabajos(data);
        },
      },
    ],
    order: [[7, "desc"]],
    initComplete: function () {
      this.api()
        .columns([8])
        .every(function () {
          var column = this;
          var select = $(
            '<select class="selector_tabla form-select col m-1"><option value="">Todos los pedidos</option><option value="1">Pedidos terminados</option></select>'
          )
            .appendTo(".selectors")
            .on("change", function () {
              var val = $.fn.dataTable.util.escapeRegex($(this).val());
              if (val == 1){
                column.search("Cerrar Pedido", true, false).draw();
              }else{
                column.search(val ? "^" + val + "$" : "", true, false).draw();
              }
            });
        });
    },
  });
});

// Cambiar status trabajo (terminado / pendiente):
$(document).on("click", ".icontrabajo", function () {
  let confirmAction = confirm("¿Actualizar el status del trabajo?");
  if (confirmAction) {
    var trabajo_id = $(this).data("id");
    $.ajax({
      url: "trabajo/" + trabajo_id + "/actualizarstatus",
      type: "get",
      datatype: "json",
      success: function (data) {
        if (data.trabajo == "Pendiente") {
          document.getElementById("status_trabajo_" + trabajo_id).innerHTML =
            data.trabajo + "&nbsp";
          document.getElementById("status_trabajo_" + trabajo_id).className =
            "statustrabajo btn btn-danger btn-sm";
          document.getElementById("icon_trabajo_" + trabajo_id).className =
            "icontrabajo btn fa-solid fa-close";
        } else {
          document.getElementById("status_trabajo_" + trabajo_id).innerHTML =
            data.trabajo;
          document.getElementById("status_trabajo_" + trabajo_id).className =
            "statustrabajo btn btn-success btn-sm";
          document.getElementById("icon_trabajo_" + trabajo_id).className =
            "icontrabajo btn fa-solid fa-check";
        }
        if (data.termino == 1) {
          //marcador de termino. Si todos los trabajos de un presupuesto están terminados, el valor será 1. De lo contrario, 0.
          //si se cumple la condicion, rellenará el link vacío <a> 'acá' </a>
          document.getElementById("termino_" + data.pedido_id).innerHTML =
            "Cerrar Pedido - Marcar como terminado";
          document.getElementById("termino_" + data.pedido_id).className =
            "boton_cerrar_pedido btn input-block-level btn-dark btn-sm";
          document
            .getElementById("termino_" + data.pedido_id)
            .setAttribute("style", "width:100%");
        } else {
          document.getElementById("termino_" + data.pedido_id).innerHTML = "";
          document.getElementById("termino_" + data.pedido_id).className = "";
          document
            .getElementById("termino_" + data.pedido_id)
            .setAttribute("style", "width:100%");
        }
      },
    });
  }
});

$(document).on("click", ".boton_cerrar_pedido", function (){
  //esta función elimina la fila al pinchar cerrar pedido y ejecuta petición ajax para cambiar el status del pedido en la BBDD
  let confirmAction = confirm("¿Marcar como terminado? Recuerda usar esta opción cuando el pedido esté pagado al 100%");
  if (confirmAction) {
    var table = $('#tabla-produccion').DataTable();
    var pedido_id = this.id.replace("termino_","")   
    table.row($(this).closest("tr")).remove().draw()
    $.ajax({
      url: "produccion/" + pedido_id + "/cerrarpedido",
      success: function (){
        toastr.success("Pedido ID " + pedido_id + " completado");
      }
    })
  }
})

$(document).on("click", ".statustrabajo", function () {
  var trabajo_id = $(this).data("id");
  $.ajax({
    url: "/produccion/" + trabajo_id + "/info",
    type: "get",
    datatype: "json",
    success: function (context) {
      $("#tituloModal").html(
        "Trabajo #" +
          context.trabajo.id +
          " - " +
          context.trabajo_rel.maestro_asociado +
          " - " +
          context.trabajo_rel.tipo_trabajo +
          '<p class="fw-light mb-0">' +
          context.pedido.producto +
          "</p>" +
          '<p class="fw-light mb-0" style="font-size:15px">' +
          "Pedido ID " +
          context.pedido.id +
          "</p>"
      );

      if (context.trabajo.status_trabajo == 0) {
        $("#status_modal_trabajo").text("").text("Trabajo pendiente");
        $("#status_modal_trabajo")
          .removeClass()
          .addClass("bg-danger text-white text-center");
      } else {
        $("#status_modal_trabajo").text("").text("Trabajo completado");
        $("#status_modal_trabajo")
          .removeClass()
          .addClass("bg-success text-white text-center");
      }

      $("#fechaasignacion_modal_trabajo").text("").text(
        formatoFecha(context.trabajo.fecha_asignacion)
      );
      $("#fechatermino_modal_trabajo")
        .text("-")
        .text(formatoFecha(context.trabajo.fecha_termino_trabajo));

      $("#detallesfabricacion_modal_trabajo")
        .text("-")
        .text(context.pedido.detalles_fabricacion);
      $("#detallespintura_modal_trabajo")
        .text("-")
        .text(context.pedido.detalles_pintura);
      $("#notastrabajo_modal_trabajo")
        .text("-")
        .text(context.trabajo.notas_trabajo);

      if (context.trabajo.status_pago == 0) {
        $("#statuspago_modal_trabajo").text("-").text("Pendiente");
        $("#statuspago_modal_trabajo")
          .removeClass()
          .addClass("bg-danger text-white");
      } else {
        $("#statuspago_modal_trabajo").text("-").text("Pagado");
        $("#statuspago_modal_trabajo")
          .removeClass()
          .addClass("bg-success text-white");
      }
      $("#fechapago_modal_trabajo")
        .text("-")
        .text(formatoFecha(context.trabajo.fecha_pago));

      $("#costodiario_modal_trabajo").text("").text(
        formatoPesos(context.trabajo.costo_trabajo)
      );
      $("#imposiciones_modal_trabajo").text("").text(
        formatoPesos(context.trabajo.imposiciones)
      );
      $("#dias_modal_trabajo").text("").text(context.trabajo.dias_trabajo);
      $("#totalsimp_modal_trabajo").text("").text(
        formatoPesos(context.trabajo_rel.total_simp)
      );
      $("#total_modal_trabajo").text("").text(
        formatoPesos(context.trabajo_rel.total_trabajo)
      );

      $("#cantidad_modal_trabajo").text("").text(context.pedido.cantidad);
      $("#totalsimpgeneral_modal_trabajo").text("").text(
        formatoPesos(context.trabajo_rel.total_simp_general)
      );
      $("#totalgeneral_modal_trabajo").text("").text(
        formatoPesos(context.trabajo_rel.total_trabajo_general)
      );
      $("#ot_modal_trabajo").attr(
        "href",
        "/ordentrabajo/" + context.trabajo.id
      );
      $("#info_modal_trabajo").attr("href", "/pedido/" + context.pedido.id);
    },
  });
});

$(document).on("click", ".infoproducto", function () {
  var pedido_id = $(this).data("id");
  $.ajax({
    url: "/pedido/" + pedido_id,
    type: "get",
    datatype: "json",
    success: function (context) {
      $("#dashModalLabel").text("").text("Pedido ID " + context.pedido.id);
      $("#clienteModal").text("").text(
        context.cliente.nombre + " " + context.cliente.apellido
      );
      $("#emailModal").text("").text(context.cliente.email);
      $("#celularModal").text("").text(context.cliente.celular);
      $("#productoModal").text("").text(context.pedido.producto);
      $("#medidasModal").text("").text(context.pedido.medidas);
      $("#maderaModal").text("").text(context.pedido.madera);
      $("#colorModal").text("").text(context.pedido.color);
      $("#cantidadModal").text("").text(context.pedido.cantidad);
      $("#detallesfabModal").text("").text(context.pedido.detalles_fabricacion);
      $("#detallespinModal").text("").text(context.pedido.detalles_pintura);
      $("#fechaingresoModal").text("").text(formatoFecha(context.pedido.fecha_creacion));
      $("#fechaconfirmacionModal").text("").text(formatoFecha(context.pedido.fecha_confirmacion));
      $("#fechaingresofabricaModal").text("").text(formatoFecha(context.pedido.fecha_ingreso_fabrica));
      $("#fechaterminoModal").text("").text(formatoFecha(context.pedido.fecha_termino));
      $("#infoModal").attr("href", "/pedido/" + context.pedido.id);
    },
  });
});
