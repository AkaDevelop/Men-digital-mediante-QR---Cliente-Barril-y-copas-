const API_URL = "https://script.google.com/macros/s/AKfycbz0cZ5m6Wrvg6MHMrA9AAVL4ULzkXx02xVypn2K-aUXjwmNTd6ptmyCjaKalEN_VlfP/exec";

let allProducts = [];
let selectedCategoryId = null;
let currentCategories = [];

async function loadMenu() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error("La API no pudo cargar el menú.");
        }



        allProducts = result.data.products;
        currentCategories = result.data.categories;

        renderCategories(currentCategories);
        renderProducts(allProducts);

        console.log("Menú cargado correctamente:", result);

    } catch (error) {
        console.error("Error al cargar el menú:", error);
    }
}


function renderCategories(categories) {
    const container = document.getElementById(
        "categories-container"
    );

    container.innerHTML = "";

    // Botón para mostrar todos los productos
    const allButton = document.createElement("button");

    allButton.textContent = "Todos";

    allButton.className =
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
        (selectedCategoryId === null
            ? "bg-gray-900 text-white"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100");

    allButton.addEventListener("click", function () {
        selectCategory(null);
    });

    container.appendChild(allButton);

    // Botones de las categorías
    categories.forEach(function (category) {
        const button = document.createElement("button");

        button.textContent = category.name;
        button.dataset.categoryId = category.id;

        const isSelected =
            selectedCategoryId === Number(category.id);

        button.className =
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
            (isSelected
                ? "bg-gray-900 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100");

        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );

        button.addEventListener("click", function () {
            selectCategory(Number(button.dataset.categoryId));
        });

        container.appendChild(button);
    });
}


function renderProducts(products) {
    const container = document.getElementById(
        "products-container"
    );

    container.innerHTML = "";

    if (products.length === 0) {
        container.textContent =
            "No hay productos disponibles en este momento.";

        return;
    }

    products.forEach(function (product) {
        const card = document.createElement("article");

        card.className =
            "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm";

        // Contenedor de la imagen
        const imageContainer = document.createElement("div");

        imageContainer.className =
            "relative flex h-48 items-center justify-center bg-gray-100";

        // Imagen del producto
        const image = document.createElement("img");

        image.alt = product.name;

        image.className =
            "h-full w-full object-cover";

        image.hidden = true;

        // Placeholder para imágenes ausentes o rotas
        const placeholder = document.createElement("div");

        placeholder.textContent = "Imagen no disponible";

        placeholder.className =
            "p-4 text-center text-sm text-gray-500";

        imageContainer.append(image, placeholder);

        if (product.image) {
            image.onload = function () {
                image.hidden = false;
                placeholder.hidden = true;
            };

            image.onerror = function () {
                image.hidden = true;
                placeholder.hidden = false;
            };

            image.src = product.image;
        }

        // Información del producto
        const details = document.createElement("div");

        details.className = "space-y-2 p-4";

        const name = document.createElement("h3");

        name.textContent = product.name;

        name.className =
            "text-lg font-semibold text-gray-900";

        details.appendChild(name);

        if (product.size) {
            const size = document.createElement("p");

            size.textContent = product.size;

            size.className = "text-sm text-gray-500";

            details.appendChild(size);
        }

        if (product.description) {
            const description = document.createElement("p");

            description.textContent = product.description;

            description.className =
                "text-sm text-gray-600";

            details.appendChild(description);
        }

        const price = document.createElement("p");

        price.textContent = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(product.price);

        price.className =
            "text-lg font-bold text-gray-900";

        details.appendChild(price);

        // Construir la tarjeta e insertarla en el DOM
        card.append(imageContainer, details);

        container.appendChild(card);
    });
}

function selectCategory(categoryId) {
    selectedCategoryId = categoryId;

    if (selectedCategoryId === null) {
        renderProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(
            function (product) {
                return product.categoryId === selectedCategoryId;
            }
        );

        renderProducts(filteredProducts);
    }

    renderCategories(currentCategories);
}


loadMenu();