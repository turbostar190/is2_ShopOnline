checkToken(setLoggedButtons, function () {
    window.location.replace("/dashboard")
});

window.onload = function () {
    getOrders();
};

function getOrders() {
    $.ajax({
        url: "/api/v2/orders/pending",
        type: "get",
        success: function (result) {
            console.log("pending", result);
            let pendingOrders = getPendingOrders(result);
            let pendingOrdersDom = createPendingDom(pendingOrders);
            $("#lista_pending").html(pendingOrdersDom);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
    $.ajax({
        url: "/api/v2/orders/completed",
        type: "get",
        success: function (result) {
            console.log("completed", result);
            let completedOrders = getCompletedOrders(result);
            let completedOrdersDom = createCompletedDom(completedOrders);
            $("#lista_completed").html(completedOrdersDom);
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

//get not approved orders
function getPendingOrders(orders) {
    let pendingOrders = [];
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].accepted == null) {
            pendingOrders.push(orders[i]);
        }
    }
    return pendingOrders;
}

//gets completed orders
function getCompletedOrders(orders) {
    let completedOrders = [];
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].accepted) {
            completedOrders.push(orders[i]);
        }
    }
    return completedOrders;
}

//Creates the DOM for the pending orders
function createPendingDom(pending_orders) {

    let pendingOrdersDom = "";
    let stato = checkToken();
    pending_orders.forEach(order => {

        pendingOrdersDom += `
        <div class="row my-3 d-flex justify-content-between align-items-center">
        <div class="col-sm-6">
            <button class="btn btn-primary mx-1" type="submit"
                data-bs-toggle="collapse" data-bs-target="#ordine-pending-${order._id}">
                <i class="bi-eye-fill"></i>
                Visualizza Dettaglio
            </button>
            <span class="align-middle mx-8">${timeStampToDate(order.createdAt)}</span>
            <span class="align-middle mx-4">${order.userName}</span>
            <div class="collapse mt-4" id="ordine-pending-${order._id}">
                <div class="mb-2">${generateAddressString(order.indirizzo)}</div>
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th scope="col">PRODOTTO</th>
                            <th scope="col">QUANTIT??</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateOrderTable(order.products)}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="col-sm-6 col-md-4">
        </div>
    </div>

    <hr class="my-2">
            `
        if (stato.admin) {
            pendingOrdersDom += `
                <span class="align-middle mx-4">Conferma ordine: </span>

                <button class="btn btn-danger mx-1" type="submit" onclick="notApproveOrder(\'${order._id}\')">
                    <i class="bi-x-circle"></i>
                </button>

                <button class="btn btn-success mx-1" type="submit" onclick="approveOrder(\'${order._id}\')">
                    <i class="bi-check-circle"></i>
                </button>
            </div>
        </div>

        <hr class="my-2">
        `;
        }
    });

    return pendingOrdersDom;
}

//Creates the DOM for the completed orders
function createCompletedDom(completed_orders) {
    let completedOrdersDom = "";

    completed_orders.forEach(order => {
        completedOrdersDom += `
        <div class="row my-3 d-flex justify-content-between align-items-center">
            <div class="col-sm-6">

    
                <button class="btn btn-primary mx-1" type="submit"
                    data-bs-toggle="collapse" data-bs-target="#ordine-complete-${order._id}">
                    <i class="bi-eye-fill"></i>
                    Visualizza Dettaglio
                </button>
    
                <span class="align-middle mx-8">${timeStampToDate(order.createdAt)}</span>
                <span class="align-middle mx-4">${order.userName}</span>
    
                <div class="collapse mt-4" id="ordine-complete-${order._id}">
                    <div class="mb-2">${generateAddressString(order.indirizzo)}</div>
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">PRODOTTO</th>
                                <th scope="col">QUANTIT??</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateOrderTable(order.products)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">
            </div>
        </div>
    
        <hr class="my-2">
        `;
    });

    return completedOrdersDom;
}

// Generate html table containing product name and quantity
function generateOrderTable(products) {
    let orderTable = "";
    products.forEach(product => {
        orderTable += `
            <tr>
                <td>${product.productName}</td>
                <td>${product.quantity}</td>
            </tr>
        `;
    });
    return orderTable;
}

// generates address string from address object
function generateAddressString(address) {

    if (address === undefined) {
        return `<span class="badge bg-warning text-dark">CONSEGNA IN NEGOZIO</span>`
    }

    return `<span class="badge bg-info text-dark">INDIRIZZO DI CONSEGNA:</span> ${address.via}, ${address.comune} ${address.cap}`;
}



//time stamp to date
function timeStampToDate(timestamp) {
    let date = new Date(timestamp);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return date.toLocaleString('it');
    // return `${year}-${month}-${day}`;
}

//approve order 
function approveOrder(orderId) {
    $.ajax({
        url: "/api/v2/orders/approve/" + orderId,
        type: "patch",
        success: function (result) {
            console.log(result);
            getOrders();
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}

function notApproveOrder(orderId) {
    $.ajax({
        url: "/api/v2/orders/not_approve/" + orderId,
        type: "patch",
        success: function (result) {
            console.log(result);
            getOrders();
        },
        error: function (request, status, error) {
            alert(error);
        }
    });
}