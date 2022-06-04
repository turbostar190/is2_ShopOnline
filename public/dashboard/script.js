function getIsSuper(user) {
    if (user.admin) {
        $("#add-product").show();
    }
}
checkToken(function (user) {
    setLoggedButtons(user);
    getIsSuper(user);
}, setNotLoggedButtons);

window.onload = function () {
    console.log("init");
    getProducts();
}

function getProducts(e) {
    console.log("init");
    $.ajax({
        url: "/api/v1/products/",
        type: "get",
        success: function (result) {
            console.log(result);
            let productsDom = createProductsDOM(result);
            $(".lista").html(productsDom);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

function createProductsDOM(products) {
    let productsDOM = "";
    let stato = checkToken()
    products.forEach(function (product) {

        productsDOM += `
        <div class="col mb-5">
        <div class="card h-100" id="${product._id}">
            <!-- Product image-->
            <img class="card-img-top" src="data:${product.img.contentType};base64,${product.img.data.toString('base64')}" alt="..." />
            <!-- Product details-->
            <div class="card-body p-4">
                <div class="text-center">
                    <!-- Product name-->
                    <h5 class="fw-bolder">${product.name}</h5>
                    <!-- Product price-->
                    ${product.cost} €
                    <!-- Product categories-->
                    <div class="row justify-content-center my-2">
                        <span class="badge bg-secondary col-4 m-1">${product.category}</span>
                    </div>
                    <div class="collapse" id="desc-collapse${product._id}">
                        <div class="card card-body">
                            ${product.description}
                        </div>
                    </div>
                </div>
            </div>
            <!-- Product actions-->
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                <div class="text-center">
                    <button class="btn btn-outline-dark mt-auto my-1" type="button" data-bs-toggle="collapse" data-bs-target="#desc-collapse${product._id}">
                        <i class="bi bi-info-circle"></i>
                        Leggi Descrizione
                    </button>
                    <button class="btn btn-outline-dark mt-auto my-1 add-carrello-btn" onclick="javascript:addElementToCart(\'${product._id}\');" style="display: ${stato.isLogged ? 'initial' : 'none'};">
                        <i class="bi bi-cart-plus"></i>
                        Aggiungi al carrello
                    </button>
                    ${stato.admin ? `<a href="/edit-product?id=${product._id}">
                        <button class="btn btn-outline-dark my-1" type="button" id="modifica-btn"">
                        <i class=" bi-pencil-square me-1"></i>
                        Modifica prodotto
                        </button>
                    </a>
                    <button class="btn btn-danger my-1" type="button" id="rimuovi-btn" onclick="javascript:deleteProduct('${product._id}');">
                        <i class="bi bi-trash"></i>
                        Rimuovi prodotto
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>
        `;
    });
    return productsDOM;
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

function deleteProduct(id) {
    if (confirm("Sei sicuro di voler eliminare il prodotto? Ciò lo cancellerà anche dai carrelli degli utenti!")) {
        $.ajax({
            url: "/api/v1/products/" + id,
            type: "delete",
            dataType: "text",
            success: function (result) {
                $("#" + id).remove();
            },
            error: function (request, status, error) {
                alert('Errore ' + error);
            }
        });
    }
}