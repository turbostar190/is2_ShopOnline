checkToken();

window.onload = function () {
  const loginForm = document.getElementById("login-formaggio");
  loginForm.addEventListener("submit", signin);
}

//login function with api call
function signin(e) {
  e.preventDefault();
  console.log("init signin")
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;

  //TODO
  const data = {
    email: email,
    password: password,
    name : name
  };
  console.log(data);
  $.ajax({
    url: "http://127.0.0.1:3000/users/signin",
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