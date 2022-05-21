checkToken(setLoggedButtons);

window.onload = function () {
    getOrders();
};

function getOrders(){
    $.ajax({
        url: "/api/v1/orders/",
        type: "get",
        success: function (result) {
            console.log(result);
            let pendingOrders = getPendingOrders(result);
            let completedOrders = getCompletedOrders(result);
            let pendingOrdersDom = createPendingDom(pendingOrders);
            let completedOrdersDom = createCompletedDom(completedOrders);
            $("#lista_pending").html(pendingOrdersDom);
            $("#lista_completed").html(completedOrdersDom);

        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
    });
}

//get not approved orders
function getPendingOrders(orders){
    let pendingOrders = [];
    for (let i = 0; i < orders.length; i++) {
        if (!orders[i].approved) {
            pendingOrders.push(orders[i]);
        }
    }
    return pendingOrders;
}

//gets completed orders
function getCompletedOrders(orders){
    let completedOrders = [];
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].approved) {
            completedOrders.push(orders[i]);
        }
    }
    return completedOrders;
}

//Creates the DOM for the pending orders
function createPendingDom(pending_orders){
    
    let pendingOrdersDom = "";

    pending_orders.forEach(order => {
        
        pendingOrdersDom += `
        <div class="row my-3 d-flex justify-content-between align-items-center">
            <div class="col-sm-6">

                <button class="btn btn-primary mx-1" type="submit"
                    data-bs-toggle="collapse" data-bs-target="#ordine-pending-${order._id}">
                    <i class="bi-eye-fill"></i>
                    Visualizza Dettaglio
                </button>

                <span class="align-middle mx-4">${timeStampToDate(order.timestamp)}</span>
                <span class="align-middle mx-4">${order.userName}</span>

                <div class="collapse mt-4" id="ordine-pending-${order._id}">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">PRODOTTO</th>
                                <th scope="col">QUANTITÀ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateOrderTable(order.products)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">

                <span class="align-middle mx-4">Conferma ordine: </span>

                <button class="btn btn-danger mx-1" type="submit">
                    <i class="bi-x-circle"></i>
                </button>

                <button class="btn btn-success mx-1" type="submit">
                    <i class="bi-check-circle"></i>
                </button>
            </div>
        </div>

        <hr class="my-2">
        `;
    });
    
    return pendingOrdersDom;
}

//Creates the DOM for the completed orders
function createCompletedDom(completed_orders){
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
    
                <span class="align-middle mx-4">YYYY-MM-DD</span>
                <span class="align-middle mx-4">NOME UTENTE</span>
    
                <div class="collapse mt-4" id="ordine-complete-${order._id}">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th scope="col">PRODOTTO</th>
                                <th scope="col">QUANTITÀ</th>
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

//time stamp to date
function timeStampToDate(timestamp) {
    let date = new Date(timestamp);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
}