checkToken(setLoggedButtons, setNotLoggedButtons);

window.onload = function () {
    console.log("init");
    getCart();
}

function getCart(e) {
    console.log("init");
    const user = checkToken();
    const userId = user._id;
    //data
    let data = {
        userId: userId,
    };
    console.log(data);
    $.ajax({
        url: "/api/v1/cart/",
        method: "get",
        success: function (result) {
            console.log("RESULT",result);
            let cartDom = createCartDOM(result);
            $(".cartProdotti").html(cartDom);
            let price = calculatePrice(result);
            $(".prezzo").html("€ " + price);
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

function createCartDOM(cart) {
    let cartDom = "";
    let stato = checkToken()
    cart.forEach(function (element) {
        cartDom += `
        <hr class="my-2">

        <div class="row my-3 d-flex justify-content-between align-items-center">
            <div class="col-sm-6">
                <h6 class="text-muted">${element.productId.name}</h6>
                <h6 class="text-black mb-0">Prezzo unitario: € ${element.productId.cost}</h6>
            </div>
            <div class="col-sm-6 col-md-4 d-flex">
                <button class="btn btn-danger mx-1" type="submit">
                    <i class="bi-dash-circle"></i>
                </button>

                <input id="form1" min="0" name="quantity" value="${element.quantity}" type="number"
                    class="form-control form-control-sm" />

                <button class="btn btn-success mx-1" type="submit">
                    <i class="bi-plus-circle"></i>
                </button>
            </div>
        </div>
        `;
    });
    cartDom += `<hr class="my-2">`;

    return cartDom;
}

function calculatePrice(cart){
    let price = 0;
    cart.forEach(function (element) {
        price += element.productId.cost * element.quantity;
    });
    return price;
}

function addElementToCart(productId) {
    const user = checkToken();
    const userId = user._id;
    //data
    let data = {
        productId: productId,
        userId: userId,
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