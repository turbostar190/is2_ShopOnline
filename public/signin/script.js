checkToken(function() {
  window.location.replace("/dashboard")
});

window.onload = function () {
  const loginForm = document.getElementById("login-formaggio");
  loginForm.addEventListener("submit", signin);
}

$("#via, #comune, #cap").keyup(function() {
  $("#via, #comune, #cap").attr("required", $("#via").val().length != 0 || $("#comune").val().length != 0 || $("#cap").val().length != 0);
});

//login function with api call
function signin(e) {
  e.preventDefault();

  const email = $("#email").val();
  const password = $("#password").val();
  const nome = $("#nome").val();

  const data = {
    email: email,
    password: password,
    nome: nome,
    indirizzo: null
  };
  if ($("#via").val() !== '') {
    data['indirizzo'] = {
      via: $("#via").val(),
      comune: $("#comune").val(),
      cap: $("#cap").val()
    }
  }
  console.log(data);
  $.ajax({
    url: "/api/v2/users/signin",
    type: "post",
    dataType: "json",
    data: data,
    success: function (result) {
      console.log(result);
      alert("Utente registrato");
      window.location.href="/login";
    },
    error: function (request, status, error) {
      alert(error);
    }
  });
}
