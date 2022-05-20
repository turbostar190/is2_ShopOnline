
window.onload = function () {
    console.log("init");
    checkAuth();
    getProducts();
}


function checkAuth() {
    let dom = "";
    //TODO: check if user is logged in
    let isLogged = false;
    if (isLogged) {
        dom += `
    <button class="btn btn-outline-dark mx-1" type="submit" id = "cart">
    <a href="/cart/">
    <i class="bi-cart-fill me-1"></i>
        Carrello
        <span class="badge bg-accent text-white ms-1 rounded-pill">0</span></a>
    </button>
    <button class="btn btn-outline-dark mx-1" type="submit" id="logout">
    <a href="/dashboard">
        <i class="bi-box-arrow-in-left me-1"></i>
        Logout
        </a>
    </button>
        `;
        $(".funzioni").html(dom);
        document.getElementById("logout").addEventListener("click", logout);
    } else {
        dom += `
    <button class="btn btn-outline-dark mx-1" type="submit" id = "login">
    <a href="/login/">
    <i class="bi-door-open me-1"></i>
        Accedi
        </a>
    </button>
    <button class="btn btn-outline-dark mx-1" type="submit" id = "signin">
    <a href="/sign-in/">
        <i class="bi-box-arrow-in-right me-1"></i>
        Registrati
        </a>
    </button>
        `;
        $(".funzioni").html(dom);
    }
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
    var productsDOM = "";
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
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                <div class="text-center">
                    <a class="btn btn-outline-dark mt-auto" href="#">Aggiungi al carrello</a>
                </div>
            </div>
        </div>
    </div>
        `;
    });
    return productsDOM;
}