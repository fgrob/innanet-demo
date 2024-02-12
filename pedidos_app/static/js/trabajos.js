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

var maestros;
$.ajax({
  url: "/tablesdata",
  type: "POST",
  datatype: "json",
  async: false,
  data: { hoja: "trabajos", datos:"maestros" },
  headers: { "X-CSRFToken": getCookie("csrftoken") },
  success: function (data) {
    maestros = data;
  },
});

function formatoFecha(fecha) {
  if (fecha) {
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
  var buttonCommon = {
    exportOptions: {
      columns: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16], 
      format: {
        body: function (data, row, column, node) {
          if (column == 2 || column == 12 || column == 14) {
            var momentDate = moment(data, 'DD/MM/YYYY')
            if (momentDate.isValid()) {
              return moment(momentDate).format('YYYY-MM-DD');
            } else {
              return data;
            }
          }
          if (column == 11) {
            return data.replace(/[$.]/g, "")
          }
          return data;
        },
      },
    },
  };
  // Datatables
  $.fn.dataTable.moment("DD/MM/YYYY"); /*esto arregla el orden de las fechas */
  $("#tabla-trabajos").DataTable({
    language: {
      decimal: "",
      emptyTable: "No hay información",
      info: "Trabajos : _TOTAL_ ",
      infoEmpty: "Mostrando 0 trabajos",
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
    order: [[1, "desc"]],
    ajax: {
      url: "/tablesdata",
      type: "POST",
      data: {hoja:"trabajos", datos: "base" },
      dataSrc: "",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data: "status_trabajo" }, //checkbox 
      { data: "id" }, // id trabajo
      { data: "maestro_asociado_id" },
      { data: "fecha_asignacion" }, 
      { data: "status_trabajo" }, 
      { data: "presupuesto_asociado__pedido__cliente_id" }, //cliente
      { data: "presupuesto_asociado_id" }, //pedido ID
      { data: "presupuesto_asociado__pedido__producto" }, //producto
      { data: "presupuesto_asociado__pedido__producto" }, //producto (excel)
      { data: "presupuesto_asociado__pedido__cantidad" }, //cantidad
      { data: "costo_trabajo" }, 
      { data: "dias_trabajo" }, 
      { data: "total_simp" }, //total unit simp
      { data: "total_pago" }, //total general simp
      { data: "fecha_termino_trabajo" },
      { data: "status_pago" },
      { data: "fecha_pago" },
    ],
    columnDefs: [
      // columnas que no se pueden ordenar: 
      {orderable: false, tarjets: 0},
      // columnas invisibles:
      {
        "targets": [8,10,11,12,14,16],
        "visible": false,
        "searchable": false
      },
      {
        targets:[0],
        render: function(data,type,row){
          if (data == 1){
            html = '<input type="checkbox" name="check" value="' + row.id + '">'
          }else{
            html = ""
          }
          return html
        }
      },
      {
        targets:[2],
        render: function(data,type,row){
          if (data != null){
            d = maestros[data]
          }else{
            d = ""
          }
          return d
        }
      },      
      {
        targets: [3,14,16],
        render: function (data, type, row) {
          if (data) {
            return moment(data).format("DD/MM/YYYY");
          } else {
            return "";
          }
        },
      },
      {
        targets:[4],
        createdCell: function (td, data) {
          if (data == 0) {
            $(td).attr("class", "bg-danger bg-gradient text-white");
          }else{
            $(td).attr("class", "bg-success bg-gradient text-white");
          } 
        },
        render: function(data,type,row){
          if (data == 0){
            return "Pendiente"
          }else{
            return "Terminado"
          }
        }
      },
      {
        targets: [5],
        render: function (data, type, row) {
          return clientes[data]
        },
      },
      {
        targets:[7],
        render: function(data,type,row){
          html = '<a class="remuModal" href="#modal_trabajo" data-bs-toggle="modal" data-bs-target="#modal_trabajo" data-id=' + row.id + '>' + data + '</a><br>' + row.presupuesto_asociado__pedido__medidas + '<br>' + row.presupuesto_asociado__pedido__color
          return html
        }
      },
      {
        targets:[8],
        render: function(data,type,row){
          html = data + ' - ' + row.presupuesto_asociado__pedido__medidas + ' - ' + row.presupuesto_asociado__pedido__color
          return html
        }
      },
      {
        targets:[9],
        render: function(data,type,row){
          return row.presupuesto_asociado__pedido__cantidad
        }
      },
      {
        targets:[13],
        render: function(data,type,row){
          return formatoPesos(data) 
        }
      },
      {
        targets:[15],
        createdCell: function (td, data) {
          if (data == 0) {
            $(td).attr("class", "bg-danger bg-gradient text-white");
          }else{
            $(td).attr("class", "bg-success bg-gradient text-white");
          } 
        },
        render: function(data,type,row){
          if (data == 0){
            return "Pendiente"
          }else{
            return "Pagado"
          }
        }
      },


    ],
    dom: "Bfrtip",
    // buttons: ["excel"],
    buttons: [
      $.extend(true, {}, buttonCommon, {
        extend: "excelHtml5",
        title:''
      }),
    ],
    initComplete: function () {
      // este callback corre cuando la tabla ya cargó todos los datos ajax y etc. Lo siguiente son los filtros: 
      this.api()
        .columns([2, 4, 15])
        .every(function () {
          var column = this;
          var index = column.index()
          var select = $(
            '<select class="selector_tabla form-select col m-1"><option value="">Todas las opciones</option></select>'
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
              if (index == 2){
                if (d != null){
                  d = maestros[d]
                }
              }
              if (index == 4){
                if (d == 0){
                  d = "Pendiente"
                }else{
                  d = "Terminado"
                }
              }
              if (index == 15){
                if (d == 0){
                  d = "Pendiente"
                }else{
                  d = "Pagado"
                }
              }
              select.append('<option value="' + d + '">' + d + "</option>");
            });
        });
    },
  });

  $(document).on("click", ".remuModal", function () {
    // Modal info trabajo
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

        $("#fechaasignacion_modal_trabajo").text("-").text(formatoFecha(context.trabajo.fecha_asignacion)
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

        $("#costodiario_modal_trabajo").text(
          formatoPesos(context.trabajo.costo_trabajo)
        );
        $("#imposiciones_modal_trabajo").text(
          formatoPesos(context.trabajo.imposiciones)
        );
        $("#dias_modal_trabajo").text(context.trabajo.dias_trabajo);
        $("#totalsimp_modal_trabajo").text(
          formatoPesos(context.trabajo_rel.total_simp)
        );
        $("#total_modal_trabajo").text(
          formatoPesos(context.trabajo_rel.total_trabajo)
        );

        $("#cantidad_modal_trabajo").text(context.pedido.cantidad);
        $("#totalsimpgeneral_modal_trabajo").text(
          formatoPesos(context.trabajo_rel.total_simp_general)
        );
        $("#totalgeneral_modal_trabajo").text(
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
});

function toggle(source) {
  checkboxes = document.getElementsByName("check");
  for (var i = 0, n = checkboxes.length; i < n; i++) {
    checkboxes[i].checked = source.checked;
  }
}

function pagar() {
  document.getElementById("accion").value = "pagar";
}
function nopagar() {
  document.getElementById("accion").value = "nopagar";
}
