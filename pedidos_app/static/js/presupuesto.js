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

var edicion_de_trabajo = 0
var edicion_de_material = 0
//variables para identificar si ya hay un trabajo o material en el cuadro de edición, y evitar que sea sustituido al presionar edicion nuevamente

function formatoPesos(valor) {
  const formatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });

  valor_formateado = formatter.format(valor);
  return valor_formateado;
}

// funcion para guardar las notas internas:
$("#notas_presupuesto").change(function () {
  pedido = document.getElementById("pedido_id").value;
  var form = new FormData(document.getElementById("agregar_notas_presupuesto"));
  $.ajax({
    url: "/pedido/" + pedido + "/notaspresup",
    type: "post",
    data: form,
    processData: false,
    contentType: false,
    headers: { "X-CSRFToken": getCookie("csrftoken") },
  });
});

// funcion para actualizar los costos en toda la hoja
function actualizar(data) {

  if (data.cantidad > 1){
    document.getElementById("encabezado_total_final").style.display = "block";
    document.getElementById("costos_directos_final").style.display = "block";
    document.getElementById("gastos_generales_final").style.display = "block";
    document.getElementById("otros_gastos_final").style.display = "block";
    document.getElementById("total_costos_final").style.display = "block";
    document.getElementById("utilidad_final").style.display = "block";
    document.getElementById("subtotal_final").style.display = "block";
    document.getElementById("iva_final").style.display = "block";
    document.getElementById("total_final").style.display = "block";
    document.getElementById("rentabilidad_final").style.display = "block";
  }else {
    document.getElementById("encabezado_total_final").style.display = "none";
    document.getElementById("costos_directos_final").style.display = "none";
    document.getElementById("gastos_generales_final").style.display = "none";
    document.getElementById("otros_gastos_final").style.display = "none";
    document.getElementById("total_costos_final").style.display = "none";
    document.getElementById("utilidad_final").style.display = "none";
    document.getElementById("subtotal_final").style.display = "none";
    document.getElementById("iva_final").style.display = "none";
    document.getElementById("total_final").style.display = "none";
    document.getElementById("rentabilidad_final").style.display = "none";
  }

  document.getElementById("costos_directos").innerHTML = formatoPesos(
    data.costos_directos_unit
  );
  document.getElementById("costos_directos_final_unit").innerHTML = formatoPesos(
    data.costos_directos_unit
  );
  document.getElementById("costos_directos_final").innerHTML = formatoPesos(
    data.costos_directos_total
  );
  document.getElementById("gastos_generales_final_unit").innerHTML = formatoPesos(
    data.gastos_generales_unit
  );
  document.getElementById("gastos_generales_final").innerHTML = formatoPesos(
    data.gastos_generales_total
  );
  document.getElementById("otros_gastos_final_unit").innerHTML = formatoPesos(
    data.otros_gastos_unit
  );
  document.getElementById("otros_gastos_final").innerHTML = formatoPesos(
    data.otros_gastos_total
  );
  document.getElementById("total_costos_final_unit").innerHTML = formatoPesos(
    data.total_costos_unit
  );
  document.getElementById("total_costos_final").innerHTML = formatoPesos(
    data.total_costos
  );
  document.getElementById("utilidad_final_unit").innerHTML =
    parseFloat(data.porcentaje_utilidad).toFixed(2).replace(".", ",") + "%";
    document.getElementById("utilidad_final").innerHTML =
    parseFloat(data.porcentaje_utilidad).toFixed(2).replace(".", ",") + "%";
  document.getElementById("subtotal_final_unit").innerHTML = formatoPesos(
    data.subtotal_unit
  );
  document.getElementById("subtotal_final").innerHTML = formatoPesos(
    data.subtotal
  );
  document.getElementById("iva_final_unit").innerHTML = formatoPesos(data.iva_unit);
  document.getElementById("iva_final").innerHTML = formatoPesos(data.iva);
  document.getElementById("total_final_unit").innerHTML = formatoPesos(data.total_unit);
  document.getElementById("total_final").innerHTML = formatoPesos(data.total);
  document.getElementById("rentabilidad_final_unit").innerHTML = formatoPesos(
    data.rentabilidad_unit
  );
  document.getElementById("rentabilidad_final").innerHTML = formatoPesos(
    data.rentabilidad
  );
}

// funcion para retornar los valores string de los tipos de trabajo, en caso de llamada
function tipotrabajo(valor) {
  if (valor == 1) {
    return "Mueblista";
  }
  if (valor == 2) {
    return "Soldador";
  }
  if (valor == 3) {
    return "Tallador";
  }
  if (valor == 4) {
    return "Pintor";
  }
}

// funcion para traer el costo de la mano de obra
$(document).on("change", "#tipo_trabajo", function () {
  oficio_id = document.getElementById("tipo_trabajo").value;
  $.ajax({
    url: "/oficio/" + oficio_id,
    type: "get",
    datatype: "json",
    success: function (data) {
      document.getElementById("costo_diario").value = data.total_diario;
    },
    error: function (data) {
      document.getElementById("costo_diario").value = "";
    },
  });
});

// Total s/IMP y Total c/IMP en añadir trabajo:
$("#costo_diario, #dias, #imposiciones").change(function () {
  var imposiciones = Number(document.getElementById("imposiciones").value);
  var costo = Number(document.getElementById("costo_diario").value);
  var dias = document.getElementById("dias").value.replace(",", ".");
  total_simp = costo * dias;
  total_trabajo = dias * (costo + imposiciones);

  document.getElementById("calcular_simp").innerHTML = formatoPesos(total_simp);
  document.getElementById("calcular_trabajo").innerHTML =
    formatoPesos(total_trabajo);
});

// validaciones de añadir trabajo:
function ValidarTrabajo() {
  error = 0;
  if (document.getElementById("tipo_trabajo").value == 0) {
    toastr.error("Seleccione tipo de trabajo");
    error = 1;
    return error;
  }
  if (document.getElementById("dias").value === "") {
    toastr.error("La casilla días no puede estar vacía");
    error = 1;
    return error;
  }
  if (document.getElementById("dias").value <= 0) {
    toastr.error("La casilla días no puede ser menor o igual a cero");
    error = 1;
    return error;
  }
  if (document.getElementById("costo_diario").value === "") {
    toastr.error("La casilla Costo diario no puede estar vacía");
    error = 1;
    return error;
  }
  if (document.getElementById("costo_diario").value <= 0) {
    toastr.error("La casilla Costo diario no puede ser menor o igual a cero");
    error = 1;
    return error;
  }
  if (
    !Number.isInteger(Number(document.getElementById("costo_diario").value))
  ) {
    error = 1;
    toastr.error("La casilla costo diario tiene que ser un número entero");
    return error;
  }
  if (
    !Number.isInteger(Number(document.getElementById("imposiciones").value))
  ) {
    error = 1;
    toastr.error("La casilla imposiciones tiene que ser un número entero");
    return error;
  }
  return error;
}

// Guardar trabajo:
function GuardarTrabajo() {
  ValidarTrabajo();
  if (error > 0) {
    return;
  }
  document.getElementById("dias").value = document
    .getElementById("dias")
    .value.replace(",", ".");
  pedido = document.getElementById("pedido_id").value;
  var form = new FormData(document.getElementById("agregar_trabajo"));
  if (document.getElementById("accion_trabajo").innerHTML == "crear" ){
    var accion = "/pedido/" + pedido + "/creartrabajo"
  }else{
    var trabajo = document.getElementById("accion_trabajo").value
    var accion = "/trabajo/" + trabajo + "/guardaredicion"
    edicion_de_trabajo = 0
  }
  $.ajax({
    url: accion,
    type: "post",
    data: form,
    processData: false,
    contentType: false,

    success: function (context) {
      document.getElementById("tipo_trabajo").value = 0;
      document.getElementById("costo_diario").value = "";
      document.getElementById("dias").value = "";
      document.getElementById("notas_trabajo").value = "";
      document.getElementById("calcular_simp").innerHTML = "$0";
      document.getElementById("calcular_trabajo").innerHTML = "$0";

      var row = document.createElement("tr");
      row.setAttribute("id", "trabajos_" + context.trabajo.id);
      row.innerHTML =
        "<td>" +
        tipotrabajo(context.trabajo.tipo_trabajo) +
        "</td>" +
        "<td>" +
        formatoPesos(context.trabajo.costo_trabajo) +
        "</td>" +
        "<td>" +
        context.trabajo.dias_trabajo.replace(".", ",") +
        "</td>" +
        "<td>" +
        formatoPesos(context.trabajo.imposiciones) +
        "</td>" +
        "<td>" +
        formatoPesos(context.subtotales.total_simp) +
        "</td>" +
        "<td>" +
        formatoPesos(context.subtotales.total_trabajo) +
        "</td>" +
        '<td style ="word-break:break-all; max-width: 420px;">' +
        context.trabajo.notas_trabajo +
        "</td>" +
        "<td>" +
        '<button class="btn btn-warning btn-sm" name="editar_trabajo" data-id=' +
        context.trabajo.id +
        '>Editar</button> <button class="btn btn-danger btn-sm" name="eliminar_trabajo" data-id=' +
        context.trabajo.id +
        ">Borrar</button>" +
        "</td>";
      tablebody = $("#lista_trabajos tbody");
      tablebody.append(row);

      rowtotales = $("#totales_trabajo");
      rowtotales.remove();
      var row = document.createElement("tr");
      row.setAttribute("id", "totales_trabajo");
      row.innerHTML =
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_trabajos_simp) +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_trabajos) +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>";
      tablebody.append(row);

      document.getElementById("accion_trabajo").innerHTML = "crear"
      document.getElementById("accion_trabajo").value = "0"
      document.getElementById("advertencia_trabajo").innerHTML = ""

      actualizar(context.totales);
      if (context.excepcion == 1){
        window.location.replace("/asignacion/" + pedido);
      }
    },
  });
}

// JQUERY boton eliminar trabajo. En lugar de onclick, usa document.on porque sino no considera los elmentos agregados luego de cargar la pagina
$(document).on("click", "[name='eliminar_trabajo']", function () {
  var data_id = $(this).data("id");
  $.ajax({
    url: "/trabajo/" + data_id + "/eliminar",
    type: "get",
    datatype: "json",
    success: function (context) {
      if (context.trabajo.status_pago == '1') {
        toastr.error("El trabajo no se puede eliminar porque ya está pagado.");
        return;
      }
      row = $("#trabajos_" + `${data_id}`);
      row.remove();

      rowtotales = $("#totales_trabajo");
      rowtotales.remove();

      tablebody = $("#lista_trabajos tbody");
      var row = document.createElement("tr");
      row.setAttribute("id", "totales_trabajo");
      row.innerHTML =
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_trabajos_simp) +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_trabajos) +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>";
      tablebody.append(row);

      actualizar(context.totales);
    },
  });
});

// Editar trabajo. Borra el objeto y luego pone los datos en la parte de ingreso
$(document).on("click", "[name='editar_trabajo']", function () {
  if (edicion_de_trabajo == 1){
    toastr.error("Ya hay un trabajo en la sección de edición. Guarda primero ese trabajo.");
    return;
  }else{
    edicion_de_trabajo = 1
  }
  var data_id = $(this).data("id");
  $.ajax({
    url: "/trabajo/" + data_id + "/editar",
    type: "get",
    datatype: "json",
    success: function (context) {
      if (context.trabajo.status_pago == '1') {
        toastr.error("El trabajo no se puede editar porque ya está pagado.");
        edicion_de_trabajo = 0
        return;
      }
      
      row = $("#trabajos_" + `${data_id}`);
      row.remove();

      rowtotales = $("#totales_trabajo");
      rowtotales.remove();

      tablebody = $("#lista_trabajos tbody");
      var row = document.createElement("tr");
      row.setAttribute("id", "totales_trabajo");
      row.innerHTML =
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_trabajos_simp) +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_trabajos) +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>";
      tablebody.append(row);

      var costo = Number(context.trabajo.costo_trabajo);
      var dias = Number(context.trabajo.dias_trabajo);
      var imposiciones = Number(context.trabajo.imposiciones);
      total_simp = costo * dias;
      total_trabajo = dias * (costo + imposiciones);

      document.getElementById("tipo_trabajo").value =
        context.trabajo.tipo_trabajo;
      document.getElementById("costo_diario").value = costo;
      document.getElementById("dias").value = dias;
      document.getElementById("imposiciones").value = imposiciones;

      document.getElementById("calcular_simp").innerHTML =
        formatoPesos(total_simp);
      document.getElementById("calcular_trabajo").innerHTML =
        formatoPesos(total_trabajo);

      document.getElementById("notas_trabajo").value =
        context.trabajo.notas_trabajo;

      document.getElementById("accion_trabajo").innerHTML = "editar"
      document.getElementById("accion_trabajo").value = context.trabajo.id

      var advertencia_string = ""
      if (context.trabajo.costo_trabajo < context.costo_base || context.trabajo.imposiciones < context.imposiciones_base){
        if (context.trabajo.costo_trabajo < context.costo_base){
          advertencia_string = "* El valor actual de " + tipotrabajo(context.trabajo.tipo_trabajo) + " es de " + formatoPesos(context.costo_base) + ". <br>"
        }
        if (context.trabajo.imposiciones < context.imposiciones_base){
          advertencia_string = advertencia_string + "* El valor actual de las imposiciones es de "  + formatoPesos(context.imposiciones_base)
        }
        document.getElementById("advertencia_trabajo").innerHTML = advertencia_string
      } 
    },
  });
});

// funcion para desplegable de materiales
$(document).on("change", "#categoria_materiales", function () {
  categoria_id = document.getElementById("categoria_materiales").value;
  $.ajax({
    url: "/catmateriales/" + categoria_id,
    type: "get",
    datatype: "json",
    success: function (data) {
      document.getElementById("costo_mat").value = 0;
      document.getElementById("cantidad").value = 0;
      $("#unidad_medida").html(" - ");
      document.getElementById("total_material").innerHTML = "$0";
      var html_contenido = '<option value="0">Seleccionar</option>';
      for (var material of data) {
        html_contenido +=
          "<option value=" +
          material.id +
          " > " +
          material.material +
          " </option>";
      }
      $("#materiales").html(html_contenido);
    },
    error: function (data) {
      $("#materiales").html("<option>Seleccionar</option>");
      document.getElementById("costo_mat").value = 0;
      document.getElementById("cantidad").value = 0;
      $("#unidad_medida").html(" - ");
      document.getElementById("total_material").innerHTML = "$0";
    },
  });
});

//funcion para traer el costo del material luego del select
$(document).on("change", "#materiales", function () {
  material_id = document.getElementById("materiales").value;
  $.ajax({
    url: "/material/" + material_id,
    type: "get",
    datatype: "json",
    success: function (data) {
      document.getElementById("costo_mat").value = Number(data.costo_neto);
      $("#unidad_medida").html(data.unidad_medida);
      document.getElementById("cantidad").value = 0;
      document.getElementById("total_material").innerHTML = "$0";
    },
    error: function (data) {
      document.getElementById("costo_mat").value = 0;
      document.getElementById("cantidad").value = 0;
      $("#unidad_medida").html(" - ");
      document.getElementById("total_material").innerHTML = "$0";
    },
  });
});

// Calculadora en la seccion añadir material:
$("#cantidad, #costo_mat").change(function () {
  var costo = Number(document.getElementById("costo_mat").value);
  var cantidad = Number(document.getElementById("cantidad").value);
  total = costo * cantidad;
  document.getElementById("total_material").innerHTML = formatoPesos(total);
});
// validar datos material:
function ValidarMaterial() {
  error = 0;
  if (document.getElementById("categoria_materiales").value == 0) {
    toastr.error("Seleccione la categoría del material");
    error = 1;
    return error;
  }
  if (document.getElementById("materiales").value == 0) {
    toastr.error("Seleccione el material");
    error = 1;
    return error;
  }
  if (document.getElementById("cantidad").value === "") {
    toastr.error("La casilla cantidad no puede estar vacía");
    error = 1;
    return error;
  }
  if (document.getElementById("cantidad").value <= 0) {
    toastr.error("La casilla cantidad no puede ser menor o igual a cero");
    error = 1;
    return error;
  }
  if (document.getElementById("costo_mat").value === "") {
    toastr.error("La casilla Costo material no puede estar vacía");
    error = 1;
    return error;
  }
  if (document.getElementById("costo_mat").value <= 0) {
    toastr.error("La casilla Costo material no puede ser menor o igual a cero");
    error = 1;
    return error;
  }
  if (!Number.isInteger(Number(document.getElementById("costo_mat").value))) {
    error = 1;
    toastr.error("La casilla costo material tiene que ser un número entero");
    return error;
  }
  return error;
}

// Guardar el material creado
function GuardarMaterial() {
  // validar:
  ValidarMaterial();
  if (error > 0) {
    return;
  }

  document.getElementById("cantidad").value = document
    .getElementById("cantidad")
    .value.replace(",", ".");
  pedido = document.getElementById("pedido_id").value;
  material = document.getElementById("accion_material").value;
  var form = new FormData(document.getElementById("agregar_material"));
  if (document.getElementById("accion_material").innerHTML == "crear"){
    var accion = "/pedido/" + pedido + "/agregarmaterial"
  }else{
    var accion = "/material/" + material + "/guardaredicion"
    edicion_de_material = 0
  }

  $.ajax({
    url: accion,
    type: "post",
    data: form,
    processData: false,
    contentType: false,

    success: function (context) {
      document.getElementById("categoria_materiales").value = "Seleccionar";
      $("#materiales").html("<option></option>");
      document.getElementById("costo_mat").value = "";
      document.getElementById("cantidad").value = "";
      document.getElementById("unidad_medida").innerHTML = " - ";
      document.getElementById("total_material").innerHTML = "$0";

      var row = document.createElement("tr");
      row.setAttribute("id", "material_" + context.material.id);
      row.innerHTML =
        "<td>" +
        context.material_categoria.categoria +
        "</td>" +
        "<td>" +
        context.material_asignado.material +
        "</td>" +
        "<td>" +
        formatoPesos(context.material.costo_material) +
        "</td>" +
        "<td>" +
        context.material.cantidad.replace(".", ",") +
        "</td>" +
        "<td>" +
        context.material_asignado.unidad_medida +
        "</td>" +
        "<td>" +
        formatoPesos(context.material_total) +
        "</td>" +
        "<td>" +
        '<button class="btn btn-warning btn-sm" name="editar_material" data-id=' +
        context.material.id +
        '>Editar</button> <button class="btn btn-danger btn-sm" name="eliminar_material" data-id=' +
        context.material.id +
        ">Borrar</button>" +
        "</td>";
      tablebody = $("#lista_materiales tbody");
      tablebody.append(row);
      rowtotales = $("#totales_material");
      rowtotales.remove();
      var row = document.createElement("tr");
      row.setAttribute("id", "totales_material");
      row.innerHTML =
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_materiales) +
        "</td>" +
        "<td>" +
        "</td>";
      tablebody.append(row);

      document.getElementById("accion_material").innerHTML = "crear"
      document.getElementById("accion_material").value = "0"
      document.getElementById("advertencia_material").innerHTML = ""

      actualizar(context.totales);
    },
  });
}

// Eliminar el material de la lista
$(document).on("click", "[name='eliminar_material']", function () {
  var data_id = $(this).data("id");
  $.ajax({
    url: "/material/" + data_id + "/eliminar",
    type: "get",
    datatype: "json",
    success: function (data) {
      row = $("#material_" + `${data_id}`);
      row.remove();

      rowtotales = $("#totales_material");
      rowtotales.remove();

      tablebody = $("#lista_materiales tbody");
      var row = document.createElement("tr");
      row.setAttribute("id", "totales_material");
      row.innerHTML =
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(data.total_materiales) +
        "</td>" +
        "<td>" +
        "</td>";
      tablebody.append(row);

      actualizar(data);
    },
  });
});

// para editar materiales. Borra el objeto y luego pone los datos en la parte de ingreso
$(document).on("click", "[name='editar_material']", function () {
  if (edicion_de_material == 1){
    toastr.error("Ya hay un material en la sección de edición. Guarda primero ese material.");
    return;
  }else{
    edicion_de_material = 1
  }
  var data_id = $(this).data("id");
  $.ajax({
    url: "/material/" + data_id + "/editar",
    type: "get",
    datatype: "json",
    success: function (context) {
      row = $("#material_" + `${data_id}`);
      row.remove();

      rowtotales = $("#totales_material");
      rowtotales.remove();

      tablebody = $("#lista_materiales tbody");
      var row = document.createElement("tr");
      row.setAttribute("id", "totales_material");
      row.innerHTML =
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        "<td>" +
        "</td>" +
        '<td class="fw-bold">' +
        formatoPesos(context.totales.total_materiales) +
        "</td>" +
        "<td>" +
        "</td>";
      tablebody.append(row);

      document.getElementById("categoria_materiales").value = context.material_categoria.id;
      document.getElementById("costo_mat").value = Number(context.material.costo_material);
      document.getElementById("cantidad").value = Number(context.material.cantidad);
      document.getElementById("unidad_medida").innerHTML = context.material_asignado.unidad_medida;
      document.getElementById("total_material").innerHTML = formatoPesos(context.material_total);

      var html_contenido = "<option>Seleccionar</option>";
      for (var listamaterial of context.lista_materiales) {
        html_contenido +=
          "<option value=" +
          listamaterial.id +
          " > " +
          listamaterial.material +
          " </option>";
      }
      $("#materiales").html(html_contenido);
      document.getElementById("materiales").value = context.material_asignado.id;
      document.getElementById("accion_material").innerHTML = "editar"
      document.getElementById("accion_material").value = context.material.id
      if (context.material.costo_material < context.material_asignado.costo_neto){
        document.getElementById("advertencia_material").innerHTML = "* El costo actual de " + context.material_categoria.categoria + " - " + context.material_asignado.material  + " es de " + formatoPesos(context.material_asignado.costo_neto)
      }

    },
  });
});

// Funciones para calcular la utilidad buscada
$("#ModalMargen").on('shown.bs.modal', function(){
  //esto es para focalizarse en el input
  $(this).find('#valor_buscado').focus();
});

$(document).on("click", "#boton_utilidad", botonutilidad)
  //reacción al pinchar el boton agregar

$("#valor_buscado").keyup(function(event) {
  //lo mismo que lo anterior pero con la tecla enter
  if (event.keyCode === 13) {
      botonutilidad();
  }
});

function botonutilidad(){
  //funcion que calcula lo ingresado
pedido = document.getElementById("pedido_id").value;

$.ajax({
  url: "/pedido/" + pedido + "/buscarmargen",
  type: "get",
  datatype: "json",
  success: function (data) {
    costos_directos = Number(data.costos_directos_unit);
    gastos_generales = Number(
      (document.getElementById("porcentaje_gastos_generales").value / 100) *
        costos_directos
    );
    otros_gastos = Number(document.getElementById("otros_gastos").value);
    total_costos = costos_directos + gastos_generales + otros_gastos;
    valor = Number(document.getElementById("valor_buscado").value);
    
    if (document.getElementById("selector_utilidad").value == 1) {
      margen = ((valor - total_costos) / valor) * 100;
      document.getElementById("porcentaje_utilidad").value = margen;
    } else {
      margen = ((valor / 1.19 - total_costos) / (valor / 1.19)) * 100;
      document.getElementById("porcentaje_utilidad").value = margen;
    }

    if (margen < 0) {
      toastr.error("El valor seleccionado da un margen negativo");
      return;
    }
    $("#ModalMargen").modal("hide");
    total_preliminar();
  },
})
}

// funcion para guardar costos y utilidad
function GuardarGastos() {
  pedido = document.getElementById("pedido_id").value;
  var form = new FormData(document.getElementById("agregar_costos"));
  $.ajax({
    url: "/pedido/" + pedido + "/agregarcostos",
    type: "post",
    data: form,
    processData: false,
    contentType: false,

    success: function (context) {
      document.getElementById("porcentaje_gastos_generales").value = 0;
      document.getElementById("otros_gastos").value = 0;
      document.getElementById("porcentaje_utilidad").value = 0;
      document.getElementById("preliminar_total").innerHTML =
        "Subtotal: -    |    Total: -";
      document.getElementById("resultado_gastos_generales").innerHTML =
        "<pre>        </pre>";

      actualizar(context);
    },
  });
}

//para calcular en la seccion añadir costos:
function calcular_gastos_generales() {
  var costos_directos = Number(
    document
      .getElementById("costos_directos")
      .innerText.replaceAll(".", "")
      .replace("$", "")
  );
  var porcentaje_gastos =
    document.getElementById("porcentaje_gastos_generales").value / 100;
  var gastos_generales = costos_directos * porcentaje_gastos;

  return gastos_generales;
}
// gastos generales:
$("#porcentaje_gastos_generales").change(function () {
  //validar:
  if (document.getElementById("porcentaje_gastos_generales").value < 0) {
    toastr.error("el porcentaje no puede ser negativo");
    document.getElementById("porcentaje_gastos_generales").value = 0;
  }
  if (document.getElementById("porcentaje_gastos_generales").value == "") {
    document.getElementById("porcentaje_gastos_generales").value = 0;
  }

  //procesar:
  gastos_generales = calcular_gastos_generales();
  document.getElementById("resultado_gastos_generales").innerHTML =
    formatoPesos(Math.round(gastos_generales));
});

// subtotal - total - rentabilidad:
function total_preliminar() {
  gastos_generales = calcular_gastos_generales();
  var costos_directos = Number(
    document
      .getElementById("costos_directos")
      .innerText.replaceAll(".", "")
      .replace("$", "")
  );
  var otros_gastos = Number(document.getElementById("otros_gastos").value);
  var porcentaje_utilidad =
    document.getElementById("porcentaje_utilidad").value / 100;

  var subtotal =
    (costos_directos + gastos_generales + otros_gastos) /
    (1 - porcentaje_utilidad);
  var total = subtotal * 1.19;
  var rentabilidad = subtotal * porcentaje_utilidad;

  document.getElementById("preliminar_total").innerHTML =
    "Subtotal: " +
    formatoPesos(subtotal) +
    "   |    Total: " +
    formatoPesos(total) +
    "   |    Rentabilidad: " +
    formatoPesos(rentabilidad);
}

// $("#porcentaje_utilidad, #porcentaje_gastos_generales, #otros_gastos").change(total_preliminar)
$("#porcentaje_utilidad, #porcentaje_gastos_generales, #otros_gastos").change(
  function () {
    //validaciones:
    if (
      !Number.isInteger(Number(document.getElementById("otros_gastos").value))
    ) {
      toastr.error("Otros gastos debe ser un número entero");
      document.getElementById("otros_gastos").value = 0;
    } else if (document.getElementById("porcentaje_utilidad").value == "") {
      document.getElementById("porcentaje_utilidad").value = 0;
    } else if (document.getElementById("porcentaje_utilidad").value < 0) {
      toastr.error("el porcentaje de utilidad no puede ser negativo");
      document.getElementById("porcentaje_utilidad").value = 0;
    } else if (document.getElementById("otros_gastos").value == "") {
      document.getElementById("otros_gastos").value = 0;
    }
    //calculo de total preliminar al detectar un evento de cambio:
    total_preliminar();
  }
);

// para editar la sección costos
function EditarGastos() {
  pedido_id = document.getElementById("pedido_id").value;
  $.ajax({
    url: "/pedido/" + pedido_id + "/editarcostos",
    type: "get",
    datatype: "json",
    success: function (data) {
      document.getElementById("porcentaje_gastos_generales").value =
        data.porcentaje_gastos_generales;
      document.getElementById("otros_gastos").value = data.otros_gastos_unit;
      document.getElementById("porcentaje_utilidad").value =
        data.porcentaje_utilidad;
      gastos_generales = calcular_gastos_generales();
      document.getElementById("resultado_gastos_generales").innerHTML =
        formatoPesos(Math.round(gastos_generales));
      total_preliminar();
    },
  });
}

// funcion para guardar la cantidad a fabricar:
$("#cantidad_conjunto").change(function () {
  //validar:
  if (document.getElementById("cantidad_conjunto").value <= 0) {
    toastr.error("la cantidad no puede ser menor o igual a cero");
    document.getElementById("cantidad_conjunto").value = 1;
  }
  if (
    !Number.isInteger(
      Number(document.getElementById("cantidad_conjunto").value)
    )
  ) {
    toastr.error("la cantidad debe ser un número entero");
    document.getElementById("cantidad_conjunto").value = 1;
  }

  //procesar:
  pedido = document.getElementById("pedido_id").value;
  var form = new FormData();
  form.append(
    "cantidad_conjunto",
    document.getElementById("cantidad_conjunto").value
  );

  $.ajax({
    url: "/pedido/" + pedido + "/cantidad",
    type: "post",
    data: form,
    processData: false,
    contentType: false,
    headers: { "X-CSRFToken": getCookie("csrftoken") },

    success: function (context) {
      actualizar(context);
    },
  });
});
