const btnSaveOrDelete = document.getElementById("btnSaveOrDelete"),
    add = document.getElementById("add"),
    sku = document.getElementById("sku"),
    name_product = document.getElementById("name"),
    description = document.getElementById("description"),
    category = document.getElementById("category"),
    price = document.getElementById("price"),
    creation_date = document.getElementById("creation_date"),
    message = document.getElementById("message"),
    spinner = document.getElementById("spinner"),
    group_SKU = document.getElementById("group_SKU"),
    group_Date = document.getElementById("group_Date"),
    elements_Product = document.getElementById("elementsProduct"),
    titleModal = document.getElementById("titleModal"),
    toast = new bootstrap.Toast(document.getElementById("toast")),
    productsTable = document.querySelector("#data-table tbody"),
apiKey = '';


window.addEventListener("load", loadProducts);
btnSaveOrDelete.addEventListener("click", handlerSaveOrDeleteButton);
add.addEventListener("click", handlerAddProduct);

async function loadProducts() {
    try {
        await getProducts();
        handlerEditButton();
        handlerDetailButton();
        spinner.classList.add("d-none");
    } catch (error) {
        console.error("Error al ejecutar la función:", error);
    }
}

async function handlerSaveOrDeleteButton() {
    let action = btnSaveOrDelete.dataset.action;

    if (action === "add") {
        await addProduct();
    } else if (action === "edit") {
        await editProduct(btnSaveOrDelete.dataset.sku);
    } else if (action === "delete") {
        await deleteProduct(btnSaveOrDelete.dataset.sku);
    } else {
        alert("Operacion no encontrada")
    }
}

function handlerAddProduct() {
    enableInputs();
    titleModal.textContent = "Agregar producto"
    btnSaveOrDelete.setAttribute("data-action", "add");
    btnSaveOrDelete.classList.replace("btn-danger", "btn-primary");
    btnSaveOrDelete.textContent = "Guardar producto";
    group_SKU.classList.add("d-none");
    group_Date.classList.add("d-none");
    elements_Product.reset();
}

function handlerEditButton() {
    const editButtons = document.querySelectorAll(".edit-button");

    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            enableInputs();
            let product = JSON.parse(button.dataset.product)
            titleModal.textContent = "Editar producto"
            fill_inputs(product);
            btnSaveOrDelete.setAttribute("data-action", "edit");
            btnSaveOrDelete.setAttribute("data-sku", product.SKU.N);
            btnSaveOrDelete.classList.replace("btn-danger", "btn-primary");
            btnSaveOrDelete.textContent = "Guardar cambios";
            group_SKU.classList.remove("d-none");
            group_Date.classList.remove("d-none");
        });
    });
}

function handlerDetailButton() {
    const detailButtons = document.querySelectorAll(".detail-button");

    detailButtons.forEach((button) => {
        button.addEventListener("click", () => {
            let product = JSON.parse(button.dataset.product)
            titleModal.textContent = "Detalle producto";
            fill_inputs(product);
            btnSaveOrDelete.setAttribute("data-action", "delete");
            btnSaveOrDelete.setAttribute("data-sku", product.SKU.N);
            btnSaveOrDelete.classList.replace("btn-primary", "btn-danger");
            btnSaveOrDelete.textContent = "Eliminar registro";
            group_SKU.classList.remove("d-none");
            group_Date.classList.remove("d-none");
            disableInputs();
        });
    });
}

function enableInputs() {
    name_product.removeAttribute("disabled");
    description.removeAttribute("disabled");
    category.removeAttribute("disabled");
    price.removeAttribute("disabled");
}

function disableInputs() {
    name_product.setAttribute("disabled", true);
    description.setAttribute("disabled", true);
    category.setAttribute("disabled", true);
    price.setAttribute("disabled", true);
}

function fill_inputs(product) {
    sku.value = product.SKU.N;
    name_product.value = product.Name.S;
    description.value = product.Description.S;
    category.value = product.Category.S;
    price.value = product.Price.N;
    creation_date.value = product.Creation_Date.S;
}

async function getProducts() {
    let url = "https://kw2lce7lnb.execute-api.us-east-1.amazonaws.com/Prod/get_products";

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            'x-api-key': apiKey
        },
    }).then((response) => response.json());

    renderProducts(response);
}

function renderProducts(response) {
    productsTable.innerHTML = "";

    response.Products.forEach((product) => {
        let row = document.createElement("tr");
        row.innerHTML = `<td>${product.SKU.N}</td>
                <td>${product.Name.S}</td>
                <td>${product.Category.S}</td>
                <td>$${product.Price.N}</td>
                <td>
                <a type="button" class="btn btn-primary m-2 edit-button" data-bs-toggle="modal" 
                data-bs-target="#modalInfo" data-product='${JSON.stringify(product)}'> Editar </a>

                <a type="button" class="btn btn-secondary detail-button" data-bs-toggle="modal" 
                data-bs-target="#modalInfo" data-product='${JSON.stringify(product)}'> Detalle </a>
                </td>`;
        productsTable.appendChild(row);
    });
}


async function addProduct() {
    url = "https://kw2lce7lnb.execute-api.us-east-1.amazonaws.com/Prod/add_product";

    let data_request = {
        name: name_product.value,
        description: description.value,
        category: category.value,
        price: price.value,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data_request),
            headers: { "Content-type": "application/json; charset=UTF-8",'x-api-key': apiKey },
        }).then((response) => response.json());

        await validateResponse(response)

    } catch (error) {
        alert("Error al enviar la solicitud");
    }
}



async function editProduct(editSKU) {

    spinner.classList.remove("d-none");

    url = "https://kw2lce7lnb.execute-api.us-east-1.amazonaws.com/Prod/edit_product?sku=" + encodeURIComponent(editSKU);

    let data_request = {
        name: name_product.value,
        description: description.value,
        category: category.value,
        price: price.value,
        creation_date: creation_date.value,
    };

    try {
        const response = await fetch(url, {
            method: "PUT",
            body: JSON.stringify(data_request),
            headers: { "Content-type": "application/json; charset=UTF-8" ,'x-api-key': apiKey},
        }).then((response) => response.json());

        await validateResponse(response)

    } catch (error) {
        alert("Error al enviar la solicitud");
    }
}


async function deleteProduct(deleteSKU) {

    spinner.classList.remove("d-none");

    url = "https://kw2lce7lnb.execute-api.us-east-1.amazonaws.com/Prod/delete_product?sku=" + encodeURIComponent(deleteSKU);

    data_request = { creation_date: creation_date.value }

    try {
        const response = await fetch(url, {
            method: "DELETE",
            body: JSON.stringify(data_request),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'x-api-key': apiKey
            },
        }).then((response) => response.json());

        await validateResponse(response)

    } catch (error) {
        alert("Error al enviar la solicitud");
    }
}



async function validateResponse(response) {

    spinner.classList.add("d-none");
    message.textContent = response.message;

    if (response.statusCode == 200) {
        toast._element.classList.remove("bg-danger");
        toast._element.classList.add("bg-success");
        await loadProducts();
    } else {
        toast._element.classList.remove("bg-success");
        toast._element.classList.add("bg-danger");
    }

    toast.show();
}