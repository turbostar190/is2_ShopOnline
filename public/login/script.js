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
  $.ajax({
    url: "http://localhost:3000/users/login",
    type: "post",
    dataType: "json",
    data: data,
    success: function (result) {
      console.log(result);
      createCookie("token", result.token, 1);
      window.location.replace("/dashboard");
    },
    error: function (response, status, error) {
      if (response.status === 401) {
        $("#login-error-msg").show();
      }
      alert(response.responseText);
    }
  });
}
