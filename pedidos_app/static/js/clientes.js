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
  } else {
    return "";
  }
}
function get_status(valor) {
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
  /* Datatables: */
  $("#tabla-pedidos").DataTable({
    language: {
      decimal: "",
      emptyTable: "No hay información",
      info: "Clientes : _TOTAL_ ",
      infoEmpty: "Mostrando 0 Clientes",
      infoFiltered: "(de un total de _MAX_ )",
      infoPostFix: "",
      thousands: ",",
      lengthMenu: "Mostrar _MENU_ Clientes",
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
    order: [[0, "desc"]],
    fixedHeader: true,
    ajax: {
      url: "/tablesdata",
      type: "POST",
      data: {hoja:"clientes", datos: "base" },
      dataSrc: "",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    },
    columns: [
      { data : "id"},
      { data : "nombre"},
      { data : "apellido"},
      { data : "email"},
      { data : "celular"},
      { data : "id"}, // opciones
    ],
    columnDefs: [
      { orderable: false, targets: [4,5] },
      {
        targets:[0],
        createdCell: function (td, data) {
          $(td).attr("id", "id_" + data);
        }
      },
      {
        targets:[1],
        createdCell: function (td, data, row) {
          $(td).attr("id", "nombre_" + row.id);
        }
      },
      {
        targets:[2],
        createdCell: function (td, data, row) {
          $(td).attr("id", "apellido_" + row.id);
        }
      },
      {
        targets:[3],
        createdCell: function (td, data, row) {
          $(td).attr("id", "email_" + row.id);
        }
      },
      {
        targets:[4],
        createdCell: function (td, data, row) {
          $(td).attr("id", "celular_" + row.id);
        }
      },
      {
        targets:[5],
        render: function(data,type,row){
          html = '<a href="/clientes/' + data + '/nuevopedido"><i title="Ingresar pedido" class="editar btn fa-solid fa-circle-plus"></i></a> <i href="#clientesModal" title="Editar datos del cliente" data-bs-toggle="modal" data-bs-target="#clientesModal" class="editar btn fa-solid fa-pen-to-square" data-id=' + data + '></i> <i href="#pedidosModal" title="Ver pedidos del cliente" data-bs-toggle="modal" data-bs-target="#pedidosModal" class="listapedidos btn fa-solid fa-list-check" data-id=' + data + '></i> <a href="/clientes/' + data + '/pdf/lista"><i title="Ver presupuestos PDF" class="btn fa-solid fa-file-pdf"></i></a>'
          return html
        }
      },
    ],
  });

  $(document).on("click", ".editar", function () {
    var cliente_id = $(this).data("id");
    document.getElementById("pkModal").value = document.getElementById(
      "id_" + cliente_id
    ).innerHTML;
    document.getElementById("nombreModal").value = document.getElementById(
      "nombre_" + cliente_id
    ).innerHTML;
    document.getElementById("apellidoModal").value = document.getElementById(
      "apellido_" + cliente_id
    ).innerHTML;
    document.getElementById("emailModal").value = document.getElementById(
      "email_" + cliente_id
    ).innerHTML;
    document.getElementById("celularModal").value = document.getElementById(
      "celular_" + cliente_id
    ).innerHTML;
  });

  $(document).on("click", ".listapedidos", function () {
    var cliente_id = $(this).data("id");
    $.ajax({
      url: "/clientes/" + cliente_id + "/listapedidos",
      type: "get",
      datatype: "json",
      success: function (context) {
        $("#pedidosModalLabel").text("").text("Pedidos de " + context.cliente);
        var row;
        for (var pedido of context.pedidos) {
          row =
            row +
            "<tr><td>" +
            pedido.id +
            "</td><td>" + '<a href="/pedido/' + pedido.id + '">' + pedido.producto + '</a>' + '<br>' + pedido.medidas + '<br>' + pedido.color + "</td><td>" +
            pedido.cantidad +
            "</td><td>" +
            formatoFecha(pedido.fecha_creacion) +
            "</td><td>" +
            formatoFecha(pedido.fecha_termino) +
            "</td><td>" +
            get_status(pedido.status) +
            "</td></tr>";
        }
        if (row == null){
          row = "<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
        }
        $("#pedidosModal tbody").html(row);
      },
    });
  });
});
