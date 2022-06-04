function continueIfSuper(user) {
  if (user == undefined || user.admin == false) {
    window.location.replace("/dashboard");
  }
}
checkToken(continueIfSuper, continueIfSuper);

window.onload = function () {
  const loginForm = document.getElementById("login-formaggio");
  loginForm.addEventListener("submit", edit_product);

  const id = getParameter("id");

  $.ajax({
    url: "/api/v2/products/" + id,
    type: "get",
    success: function (result) {

      // console.log(result);

      $("#name").val(result.name);
      $("#description").val(result.description);
      $("#category").val(result.category);
      $("#cost").val(result.cost);
    }
  });
}

if (getParameter('id') == null) {
  window.location.replace("/dashboard");
}

function edit_product(e) {
  e.preventDefault();

  var form = $('#login-formaggio')[0];
  var formData = new FormData(form);
  const id = getParameter("id");
  console.log(formData);

  $.ajax({
    url: "/api/v2/products/" + id,
    type: "put",
    enctype: 'multipart/form-data',
    data: formData,
    contentType: false,
    processData: false,
    cache: false,
    success: function (result) {
      console.log(result);
      alert("Prodotto aggiornato");
      window.location.replace("/dashboard");
    },
    error: function (request, status, error) {
      alert(error);
    }
  });
}