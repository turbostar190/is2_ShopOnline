$.ajaxSetup({
    contentType: "application/x-www-form-urlencoded",
    headers: {
        "Authorization": "Bearer " + readCookie("token")
    },
    dataType: 'json',
    beforeSend: function (jqXHR, settings) {
        // settings.url = "http://localhost:3000" + settings.url;
        settings.url = "https://is2shoponline.herokuapp.com" + settings.url;
    }
});

function checkToken(callback, callbackErr) {
    let user = {
        isLogged: false,
        nome: "",
        admin: false,
        _id : "",
    }
    $.ajax({
        url: "/api/v2/users/checkToken",
        type: "get",
        async: false,
        dataType: "json",
        success: function (result) {
            console.log(result);
            user.isLogged = true;
            user.nome = result.message.nome;
            user.admin = result.message.admin;
            user._id = result.message._id;
            if (callback) callback(user);
        },
        error: function (err) {
            if (callbackErr) callbackErr();
        }
    });
    return user;
}

function setLoggedButtons(user) {
    $("#carrello-btn, #logout-btn, #saluti, #order-btn").show();
    $("#accedi-btn, #registrati-btn").hide();
    $("#nomeUtente").text(user.nome);
    $("#carrello-btn").click(function () {
        window.location.href = "/cart";
    });
    $("#order-btn").click(function () {
        window.location.href = "/order-history";
    });
    $("#logout-btn").click(function () {
        logout();
    });
}

function setNotLoggedButtons() {
    $("#accedi-btn").click(function () {
        window.location.href = "/login";
    });
    $("#registrati-btn").click(function () {
        window.location.href = "/signin";
    });
}

function readCookie(name) {
    let nameEQ = encodeURIComponent(name) + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function createCookie(name, value, days) {
    let expires;
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; SameSite=Lax; path=/";
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function logout(dir = "/") {
    if (confirm("Logout?")) {
        eraseCookie("token");
        window.location.replace(dir);
    }
}

/**
 * Restituisce l'eventuale parametro q presente nell'url della pagina
 * @link https://stackoverflow.com/a/35430091
 * @param {string} q chiave da cercare
 * @returns {string|null} valore associato alla chiave nell'url
 */
function getParameter(q) {
    // new URLSearchParams(window.location.search).get("mail")
    return (window.location.search.match(new RegExp('[?&]' + q + '=([^&]+)')) || [, null])[1];
}
