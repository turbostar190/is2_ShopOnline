checkToken(setLoggedButtons);

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
            alert(request.responseText);
        }
    });
}

function createProductsDOM(products) {
    let productsDOM = "";
    let stato = checkToken()
    products.forEach(function (product) {

        productsDOM += `
        <div class="col mb-5">
        <div class="card h-100">
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
                </div>
            </div>
            <!-- Product actions-->
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent add-carrello-btn" style="display: ${stato.isLogged ? 'initial' : 'none'};">
                <div class="text-center">
                    <a class="btn btn-outline-dark mt-auto" href="#">Aggiungi al carrello</a>
                    <a href="/edit-product?id=${product._id}">
                        <button class="btn btn-outline-dark my-2" type="button" id="modifica-btn"">
                        <i class=" bi-pencil-square me-1"></i>
                        Modifica prodotto
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </div>
        `;
    });
    return productsDOM;
}