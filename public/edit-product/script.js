window.onload = function () {
    const loginForm = document.getElementById("login-formaggio");
    loginForm.addEventListener("submit", edit_product);
  }
  
if (getParameter('id') == null) {
  window.location.replace("/admin/dashboard");
}

  //login function with api call
  function edit_product(e) {
    e.preventDefault();

    var form = $('#login-formaggio')[0]; 
    var formData = new FormData(form);
    const id = getParameter("id");
    console.log(formData);

    $.ajax({
      url: "http://localhost:3000/products/"+id,
      type: "put",
      enctype: 'multipart/form-data',
      data: formData,
      contentType: false,
      processData: false,
      cache : false,
      success: function (result) {
        console.log(result);
        alert("Prodotto aggiornato");
      },
      error: function (request, status, error) {
        alert(request.responseText);
      }
    });
  }