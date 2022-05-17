window.onload = function () {
  const loginForm = document.getElementById("login-formaggio");
  loginForm.addEventListener("submit", login);
}

//login function with api call
function login(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const data = {
    email: email,
    password: password
  };
  console.log(data);
  $.ajax({
    url: "http://127.0.0.1:3000/users/login",
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
