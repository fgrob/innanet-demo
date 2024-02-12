function color_checkbox() {
  var check = document.getElementById("checkbox");
  var text = document.getElementById("color");
  if (check.checked == true) {
    text.value = "color pendiente";
  } else {
    text.value = "";
  }
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
// Modal lista de pedidos
$(document).on("click", ".listapedidos", function () {
  var cliente_id = $(this).data("id");
  $.ajax({
    url: "/clientes/" + cliente_id + "/listapedidos",
    type: "get",
    datatype: "json",
    success: function (context) {
      $("#pedidosModalLabel")
        .text("")
        .text("Pedidos de " + context.cliente);
      var row;
      for (var pedido of context.pedidos) {
        row =
          row +
          "<tr><td>" +
          pedido.id +
          "</td><td>" +
          '<a href="/pedido/' +
          pedido.id +
          '">' +
          pedido.producto +
          "</a>" +
          "<br>" +
          pedido.medidas +
          "<br>" +
          pedido.color +
          "</td><td>" +
          pedido.cantidad +
          "</td><td>" +
          formatoFecha(pedido.fecha_creacion) +
          "</td><td>" +
          formatoFecha(pedido.fecha_termino) +
          "</td><td>" +
          get_status(pedido.status) +
          "</td></tr>";
      }
      if (row == null) {
        row = "<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
      }
      $("#pedidosModal tbody").html(row);
    },
  });
});
