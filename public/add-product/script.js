window.onload = function () {
    const loginForm = document.getElementById("login-formaggio");
    loginForm.addEventListener("submit", add_product);
  }
  
  //login function with api call
  function add_product(e) {
    e.preventDefault();
    console.log("init add")
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const cost = document.getElementById("cost").value;
    const img = document.getElementById("img").value;

    const data = {
      name: name,
      description: description,
      cost : cost,
    };
    console.log(data);
    $.ajax({
      url: "http://localhost:3000/products/",
      type: "post",
      dataType: "json",
      data: data,
      success: function (result) {
        console.log(result);
      },
      error: function (request, status, error) {
        alert(request.responseText);
      }
    });
  }