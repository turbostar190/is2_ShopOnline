window.onload = function () {
    const loginForm = document.getElementById("login-formaggio");
    loginForm.addEventListener("submit", add_product);
  }
  
  //login function with api call
  function add_product(e) {
    e.preventDefault();

    var form = $('#login-formaggio')[0]; 
    var formData = new FormData(form);
    console.log(formData);

    $.ajax({
      url: "/products/",
      type: "post",
      enctype: 'multipart/form-data',
      data: formData,
      contentType: false,
      processData: false,
      cache : false,
      success: function (result) {
        console.log("Prodotto aggiunto");
        alert("Prodotto aggiunto");
      },
      error: function (request, status, error) {
        alert(request.responseText);
      }
    });
  }
