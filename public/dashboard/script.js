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
    getCategories()
    getProducts();
}

function getCategories() {
    $.ajax({
        url: "/api/v2/products/categories/",
        type: "get",
        success: function (result) {
            console.log(result);
            result.forEach(categoria => {
                $("#categoria").append(`<option value="${categoria}">${categoria}</option>`);
            });
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

function getProducts(e) {
    let dict = {};
    if ($("#cerca-prodotto").val().trim() != "") {
        dict['search'] = $("#cerca-prodotto").val().trim();
    }
    if ($("#categoria").val().trim() != "") {
        dict['category'] = $("#categoria").val().trim();
    }
    if ($("#sort").val().trim() != "") {
        dict['sort'] = $("#sort").val().trim();
    }

    $.ajax({
        url: "/api/v2/products/",
        type: "get",
        data: dict,
        success: function (result) {
            console.log(result);
            let createProducts = createProductsDOM(result)
            let productsDom = createProducts['products'];
            $(".lista").html(productsDom);
            let modals = createProducts['modals'];
            $(".lista-modals").html(modals);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

$("#cerca-prodotto, #categoria, #sort").on("change keyup", function() {
    getProducts();
});

function createProductsDOM(products) {
    let productsDOM = "";
    let modalsDOM = ""
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
                    <button class="btn btn-outline-dark mt-auto my-1 add-carrello-btn" onclick="javascript:showModal(\'${product._id}\');" style="display: ${stato.isLogged ? 'initial' : 'none'};">
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
        modalsDOM += `
        <div>
        <div class="modal fade" id="modal-${product._id}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" onclick="javascript:hideModal(\'${product._id}\');">&times;</button>
                        <h4 class="modal-title">${product.name}</h4>
                    </div>
                    <div class="modal-body">
                    <h6>Descrizione: ${product.description}</h6>
                    <h6>Costo: ${product.cost}</h6>
                    <h6> Quantità: <input id="quantity-${product._id}" name="quantity" type="number" placeholder="Quantità" value="1" required> </h6>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal" onclick="javascript:hideModal(\'${product._id}\');">Chiudi</button>
                        <button class="btn btn-outline-dark mt-auto my-1 add-carrello-btn" onclick="javascript:addElementToCart(\'${product._id}\');">
                            <i class="bi bi-cart-plus"></i>
                            Aggiungi al carrello
                        </button>
                    </div>
                </div>
            </div>
        </div>
            `
    });
    return {products : productsDOM, modals : modalsDOM};
}

function addElementToCart(productId) {
    let quantity = $("#quantity-" + productId).val();
    const user = checkToken();
    const userId = user._id;
    //data
    let data = {
        productId: productId,
        userId: userId,
        quantity: quantity,
    };
    console.log(data);
    $.ajax({
        url: "/api/v2/cart/",
        type: "post",
        data: data,
        success: function (result) {
            alert('Prodotto aggiunto al carrello');
        },
        error: function (request, status, error) {
            alert('Errore');
        }
    });
    hideModal(productId);
}

function showModal(productId){
    console.log("Show modal")
    $('#modal-'+productId).modal('show');
}

function hideModal(productId){
    console.log("Show modal")
    $('#modal-'+productId).modal('hide');
}

function deleteProduct(id) {
    if (confirm("Sei sicuro di voler eliminare il prodotto? Ciò lo cancellerà anche dai carrelli degli utenti!")) {
        $.ajax({
            url: "/api/v2/products/" + id,
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