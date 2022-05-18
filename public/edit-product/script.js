window.onload = function () {
    const loginForm = document.getElementById("login-formaggio");
    loginForm.addEventListener("submit", edit_product);
  }
  
  //login function with api call
  function edit_product(e) {
    e.preventDefault();
    console.log("init edit")
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
      },
      error: function (request, status, error) {
        alert(request.responseText);
      }
    });
  }