const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

//login function with api call
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const data = {
    email: email,
    password: password
  };
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        window.location.href = "/";
      } else {
        loginErrorMsg.innerHTML = res.msg;
      }
    });
}