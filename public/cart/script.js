checkToken(setLoggedButtons, function () {
    window.location.replace("/dashboard")
});

window.onload = function () {
    const loginForm = document.getElementById("spedizione-formaggio");
    loginForm.addEventListener("submit", formSubmit);
    document.getElementById("ordina").addEventListener("click", formSubmit);
    getIndirizzo();
    getCart();
    getCartTotalQuantity();
}

/**
 * Richiede l'indirizzo dell'utente e lo autocompila
 */
function getIndirizzo() {
    $.ajax({
        url: "/api/v1/users/me",
        method: "get",
        success: function (result) {
            if (result.indirizzo) {
                if (result.indirizzo.via) $("#spedizione-via").val(result.indirizzo.via);
                if (result.indirizzo.comune) $("#spedizione-comune").val(result.indirizzo.comune);
                if (result.indirizzo.cap) $("#spedizione-cap").val(result.indirizzo.cap);
            }
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

/**
 * Richiede il carrello dell'utente e lo visualizza a schermo
 */
function getCart() {
    $.ajax({
        url: "/api/v1/cart/",
        method: "get",
        success: function (result) {
            console.log("RESULT", result);
            let cartDom = createCartDOM(result);
            $(".cartProdotti").html(cartDom);
            let price = calculatePrice();
            $(".prezzo").text("€ " + price);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

/**
 * Ottiene la quantità totale dei prodotti nel carrello e la visualizza a schermo
 */
function getCartTotalQuantity() {
    $.ajax({
        url: "/api/v1/cart/quantity",
        method: "get",
        success: function (result) {
            console.log("tot", result);
            if (result.quantityTot) $("#totNum").text(result.quantityTot);
        },
        error: function (request, status, error) {
            console.log(request, status, error);
            alert(error);
        }
    });
}

/**
 * Aggiunge un articolo al carrello
 * @param {string} productId id prodotto
 */
 function addElementToCart(productId) {
    let data = {
        productId: productId,
        quantity: 1,
    };
    console.log(data);
    $.ajax({
        url: "/api/v1/cart/",
        type: "post",
        data: data,
        success: function (result) {
            alert('Prodotto aggiunto al carrello');
        },
        error: function (request, status, error) {
            alert('Errore');
        }
    });
}

/**
 * Modifica la quantità di un prodotto nel carrello
 * @param {string} cartId id del carrello
 * @param {string} productId id del prodotto da modificare
 * @param {number} quantity nuova quantità
 * @param {object} $selector selettore del prodotto per modificarne valore a schermo
 */
function updateCartItem(cartId, productId, quantity, $selector) {
    let data = {
        productId: productId,
        quantity: quantity,
    };
    console.log(data);
    $.ajax({
        url: "/api/v1/cart/" + cartId,
        method: "patch",
        data: data,
        success: function (result) {
            console.log("updateCart", result);
            $selector.val(quantity);

            getCartTotalQuantity();
            let price = calculatePrice();
            $(".prezzo").text("€ " + price);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

/**
 * Elimina un prodotto dal carrello
 * @param {string} cartId id carrello
 * @param {object} $selector selettore del prodotto per modificarne valore a schermo
 */
function deleteCartItem(cartId, $selector) {
    $.ajax({
        url: "/api/v1/cart/" + cartId,
        method: "delete",
        success: function (result) {
            console.log("deleteCart", result);
            $selector.parent().parent().remove();
            
            getCartTotalQuantity();
            let price = calculatePrice();
            $(".prezzo").text("€ " + price);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

/**
 * Gestione dell'invio del form di ordine
 * @param {*} e evento submit del form
 */
function formSubmit(e) {
    e.preventDefault();

    let data = {};
    if ($("input[name=consegna]:checked").attr('id') === "consegna-casa") {
        data['indirizzo'] = {
            via: $("#spedizione-via").val(),
            comune: $("#spedizione-comune").val(),
            cap: $("#spedizione-cap").val()
          }
    }

    console.log("ordina", data);
    $.ajax({
        url: "/api/v1/orders/",
        type: "post",
        data: data,
        success: function (result) {
            alert("Ordine effettuato con successo!");
            window.location.href = "/order-history";
        },
        error: function (response, status, error) {
            alert(error);
        }
    });
}

/**
 * Listener per abilitare o meno la modifica dei campi indirizzo in base al tipo di spedizione
 */
$("input[name=consegna]").change(function () {
    $("#spedizione-via, #spedizione-comune, #spedizione-cap")
        .attr("disabled", !$("#consegna-casa").is(":checked"))
        .attr("required", $("#consegna-casa").is(":checked"));
});

/**
 * Listener per la modifica della quantità di un prodotto nel carrello
 */
$(document).on("click", ".num", function () {
    let $this = $(this);
    let cartId = $this.parent().data("cart");
    let productId = $this.parent().data("prod");
    let $input = $this.siblings("input");
    let quantity = parseInt($input.val());

    if ($this.hasClass("decrement")) {
        if (quantity > 1) {
            updateCartItem(cartId, productId, quantity - 1, $input);
        }
    } else if ($this.hasClass("increment")) {
        updateCartItem(cartId, productId, quantity + 1, $input);
    } else if ($this.hasClass("delete")) {
        deleteCartItem(cartId, $this);
    }

});

/**
 * Costruisce gli articoli del carrello
 * @param {object} cart oggetto carrello ritornato da API
 * @returns {string} stringa da inserire nel DOM
 */
function createCartDOM(cart) {
    let cartDom = "";
    cart.forEach(function (element) {
        cartDom += `
        <div class="row my-3 d-flex justify-content-between align-items-center item">
            <hr class="my-2">
            <div class="col-sm-6">
                <h6 class="text-muted">${element.productId.name}</h6>
                <h6 class="text-black mb-0">Prezzo unitario: € <span class="costo">${element.productId.cost}</span></h6>
            </div>
            <div class="col-sm-6 col-md-4 d-flex" data-prod="${element.productId._id}" data-cart="${element._id}">
                <button class="btn btn-secondary mx-1 decrement num" type="button">
                    <i class="bi-dash-circle"></i>
                </button>

                <input id="form1" min="1" name="quantity" value="${element.quantity}" type="number"
                    class="form-control form-control-sm" readonly />

                <button class="btn btn-success mx-1 increment num" type="button">
                    <i class="bi-plus-circle"></i>
                </button>
                <button class="btn btn-danger mx-1 delete num" type="button">
                    <i class="bi-trash"></i>
                </button>
            </div>
        </div>
        `;
    });
    cartDom += `<hr class="my-2">`;

    return cartDom;
}

/**
 * Calcola il prezzo totale del carrello
 * @returns {number} prezzo totale del carrello
 */
function calculatePrice() {
    let price = 0;
    $(".item").each(function () {
        price += parseInt($(this).find("input[name=quantity]").val()) * parseInt($(this).find(".costo").text());
    });
    return price;
}
