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
  //ejemplo: 01/01/2022, 22:47:53
  if (fecha) {
    var date = new Date(fecha);
    return date.toLocaleString("en-GB");
  } else {
    return "";
  }
}

function formatoFecha_2(fecha) {
  //ejemplo: 01/01/2022
  if (fecha != '(sin datos)') {
    var date = new Date(fecha);
    return date.toLocaleDateString("en-GB");
  } else {
    return fecha;
  }
}

function formatoaccion(valor){
  if (valor == 0){
    return 'Ingreso'
  }else if(valor == 1){
    return 'Edición'
  }else{
    return 'Eliminación'
  }
}
function formatoStatus(valor) {
  if (valor == 0) {
    return "Pendiente";
  }else if (valor == 1) {
    return "En revisión";
  }else if (valor == 2) {
    return "No confirmado";
  }else if (valor == 3) {
    return "Confirmado";
  }else if (valor == 4) {
    return "En fabricación";
  }else if (valor == 5) {
    return "Terminado";
  }else if (valor == 6) {
    return "Anulado";
  }
}
function formatoStatusTrabajo(valor){
  if (valor == 0){
    return "Pendiente"
  }else{
    return "Terminado"
  }
}
function formatoStatusPago(valor){
  if (valor == 0){
    return "Pendiente"
  }else{
    return "Pagado"
  }
}
function formatoCuentaBancaria(valor){
  if (valor == 0){
    return "Cuenta Tienda"
  }else{
    return "Cuenta Fábrica"
  }
}

function formatotipo(valor){
  if (valor == 0){
    return 'no se'
  }else if(valor == 1){
    return 'Categoría'
  }else if(valor == 2){
    return 'Cliente'
  //el 4 serían las imposiciones, pero por el momento no es editable de manera permamenete asi que no es necesario agregarlo acá
  }else if(valor == 3){
    return 'Costo Mano de Obra'
  }else if(valor == 5){
    return 'Lista de Materiales'
  }else if(valor == 6){
    return 'Maestro'
  }else if(valor == 7){
    return 'Presupuesto'
  }else if(valor == 8){
    return 'Trabajo'
  }else if(valor == 9){
    return 'Pedido'
  }else if(valor == 10){
    return 'Material'
  }
}

  $(document).ready(function () {
    /* Datatables: */
    $.fn.dataTable.moment("DD/MM/YYYY"); /*esto arregla el orden de las fechas */
    $("#tabla-historial").DataTable({
      language: {
        decimal: "",
        emptyTable: "No hay información",
        info: "Registros : _TOTAL_ ",
        infoEmpty: "Mostrando 0 Registros",
        infoFiltered: "(de un total de _MAX_ )",
        infoPostFix: "",
        thousands: ",",
        lengthMenu: "Mostrar _MENU_ Registros",
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
      pageLength: 100,
      ajax: {
        url: "/tablesdata",
        type: "POST",
        data: { hoja: "historial", datos: "base" },
        dataSrc: "",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      },
      columns: [
        { data: "timestamp" },
        { data: "timestamp" },
        { data: "actor_id" },
        { data: "action" },
        { data: "content_type_id" },
        { data: "object_repr" },
        { data: "changes" },
      ],
      order: [[1, "desc"]],
      columnDefs: [
      { orderData: [1], targets: [0] },
      {
        targets: [1],
        visible: false,
        searchable: false,
      },
        {
          targets: [0],
          render: function(data,type,row){
            data = formatoFecha(data)
            return data
          }
        },
        {
          targets: [1],
          render: function (data, type, row) {
            if (data) {
              return moment(data).format("DD/MM/YYYY");
            } else {
              return "";
            }
          },
        },
        {
          targets: [2],
          render: function(data,type,row){
            return data
          }
        },
        {
          targets: [3],
          createdCell: function (td, data, row) {
            if (row.action == 0){
              $(td).attr("class", "bg-success text-white");
            }else if (row.action == 1){
              $(td).attr("class", "bg-warning");
            }else{
              $(td).attr("class", "bg-danger text-white");
            }
          },
          render: function(data,type,row){
            data = formatoaccion(data)
            return data
          }
        },
        {
          targets: [4],
          render: function(data,type,row){
            data = formatotipo(data)
            return data
          }
        },
        {
            targets: [6],
            render: function(data,type,row) {
                data = JSON.parse(data)
                var output = ""
                if (row.action == 1){
                  //si la acción es edición
                  for([key, val] of Object.entries(data)){
                    if (val[0] == "" || val[0] == "None"){
                      val[0] = "(sin datos)"
                    }
                    if (val[1] == "" || val[1] == "None"){
                      val[1] = "(sin datos)"
                    }
                    if (key.startsWith("fecha")){
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + formatoFecha_2(val[0]) + '</span>' + ' a <span class="text-success fw-bold">' + formatoFecha_2(val[1]) + '</span><br>'
                    }else if (key == "status"){
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + formatoStatus(val[0]) + '</span>' + ' a <span class="text-success fw-bold">' + formatoStatus(val[1]) + '</span><br>'
                    }else if (key == "status_trabajo"){
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + formatoStatusTrabajo(val[0]) + '</span>' + ' a <span class="text-success fw-bold">' + formatoStatusTrabajo(val[1]) + '</span><br>'
                    }else if (key == "status_pago"){
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + formatoStatusPago(val[0]) + '</span>' + ' a <span class="text-success fw-bold">' + formatoStatusPago(val[1]) + '</span><br>'
                    }else if (key == "cuenta"){
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + formatoCuentaBancaria(val[0]) + '</span>' + ' a <span class="text-success fw-bold">' + formatoCuentaBancaria(val[1]) + '</span><br>'
                    }else if (key == "porcentaje_utilidad" || key == "porcentaje_gastos_generales"){
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + parseFloat(val[0]).toFixed(2) + '</span>' + ' a <span class="text-success fw-bold">' + parseFloat(val[1]).toFixed(2) + '</span><br>'
                    }else{
                      output += '<span class="text-primary fw-bold">' + key + '</span>' + ' de ' + '<span class="text-danger fw-bold">' + val[0] + '</span>' + ' a <span class="text-success fw-bold">' + val[1] + '</span><br>'
                    }
                  }
                }
                return output;
            }
        }
      ]
    });
  });