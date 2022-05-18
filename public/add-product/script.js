window.onload = function () {
    const loginForm = document.getElementById("login-formaggio");
    loginForm.addEventListener("submit", add_product);
  }
  
  //login function with api call
  function add_product(e) {
    e.preventDefault();
    console.log("init add");
    var form = $('#login-formaggio')[0]; 
    var formData = new FormData(form);
    console.log(formData);
    $.ajax({
      url: "http://127.0.0.1:3000/products/",
      type: "post",
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