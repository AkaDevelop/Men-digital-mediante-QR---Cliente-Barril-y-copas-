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

    allButton.textContent = "All";

    allButton.className =
        "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors " +
        (selectedCategoryId === null
            ? "bg-amber-800 text-white shadow-sm"
            : "border border-stone-300 bg-white text-stone-700 hover:border-amber-500 hover:text-amber-700");

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
            "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors " +
            (isSelected
                ? "bg-amber-800 text-white shadow-sm"
                : "border border-stone-300 bg-white text-stone-700 hover:border-amber-500 hover:text-amber-700");

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
            "For this category products, no avalible items.";
        return;
    }

    products.forEach(function (product) {
        const card = document.createElement("article");

        card.className =
            "group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";

        card.classList.add(
            "cursor-pointer",
            "transition-shadow",
            "hover:shadow-md"
        );

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");

        card.setAttribute(
            "aria-label",
            `Ver detalles de ${product.name}`
        );

        card.addEventListener("click", function () {
            openProductModal(product);
        });

        card.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProductModal(product);
            }
        });

        // Contenedor de la imagen
        const imageContainer = document.createElement("div");

        imageContainer.className =
            "relative flex h-52 items-center justify-center overflow-hidden bg-stone-100";

        // Imagen del producto
        const image = document.createElement("img");

        image.alt = product.name;

        image.className =
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";

        image.hidden = true;

        const placeholder = document.createElement("div");

        placeholder.textContent = "Image no avalible";

        placeholder.className =
            "p-4 text-center text-sm text-stone-500";

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
            "text-lg font-semibold text-stone-900";

        details.appendChild(name);

        if (product.size) {
            const size = document.createElement("p");

            size.textContent = product.size;

            size.className = "text-sm text-stone-500";

            details.appendChild(size);
        }

        if (product.description) {
            const description = document.createElement("p");

            description.textContent = product.description;

            description.className =
                "text-sm text-stone-600";

            details.appendChild(description);
        }

        const price = document.createElement("p");

        price.textContent = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(product.price);

        price.className =
            "text-lg font-bold text-stone-900";

        details.appendChild(price);

        // Construye la tarjeta y la inserta en el DOM
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


function openProductModal(product) {
    const modal = document.getElementById("product-modal");

    const image = document.getElementById(
        "modal-product-image"
    );

    const placeholder = document.getElementById(
        "modal-image-placeholder"
    );

    const name = document.getElementById(
        "modal-product-name"
    );

    const size = document.getElementById(
        "modal-product-size"
    );

    const description = document.getElementById(
        "modal-product-description"
    );

    const price = document.getElementById(
        "modal-product-price"
    );

    // Nombre
    name.textContent = product.name;

    // Tamaño: solo mostrarlo si tiene contenido
    size.textContent = product.size || "";
    size.classList.toggle("hidden", !product.size);

    // Descripción: también es opcional
    description.textContent = product.description || "";
    description.classList.toggle(
        "hidden",
        !product.description
    );

    // Precio en pesos colombianos
    price.textContent = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(product.price);

    // Restablecer la imagen antes de cargar la nueva
    image.hidden = true;
    placeholder.hidden = false;
    image.removeAttribute("src");
    image.alt = product.name;

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

    // Mostrar el modal
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.body.style.overflow = "hidden";

    document.getElementById("close-product-modal").focus();
}

function closeProductModal() {
    const modal = document.getElementById("product-modal");

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    document.body.style.overflow = "";
}

const productModal = document.getElementById("product-modal");

const closeModalButton = document.getElementById(
    "close-product-modal"
);

// Cerrar con el botón
closeModalButton.addEventListener("click", function () {
    closeProductModal();
});

// Cerrar al pulsar el fondo oscuro
productModal.addEventListener("click", function (event) {
    if (event.target === productModal) {
        closeProductModal();
    }
});

// Cerrar con Escape
document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !productModal.classList.contains("hidden")
    ) {
        closeProductModal();
    }
});



loadMenu();