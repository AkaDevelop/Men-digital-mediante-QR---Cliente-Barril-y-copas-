const SPREADSHEET_ID = '1QqQIDgAzFndkGpdDqKBKdMn8UZBILQYXwFWM0zEeZzs';

const SHEET_CATEGORIES = "CATEGORIAS";
const SHEET_PRODUCTS = "PRODUCTOS";


function getSpreadsheet() {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet() {
    const response = getMenu();
    console.log(response);
    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

function getMenu() {
    try {
        const categories = getCategories();
        const productsResult = getProducts(categories);

        const response = {
            success: true,
            data: {
                categories: categories,
                products: productsResult.products
            },
            errors: productsResult.errors
        };

        Logger.log(response);

        return response;

    } catch (error) {
        const response = {
            success: false,
            data: {
                categories: [],
                products: []
            },
            errors: [
                {
                    message: error.message
                }
            ]
        };

        Logger.log(response);

        return response;
    }
}

function getCategories() {
    const spreadsheet = getSpreadsheet();

    const sheet = spreadsheet.getSheetByName(
        SHEET_CATEGORIES
    );

    if (!sheet) {
        throw new Error(
            `No se encontró la hoja "${SHEET_CATEGORIES}".`
        );
    }

    const values = sheet.getDataRange().getValues();

    const categories = [];

    for (let i = 1; i < values.length; i++) {
        const row = values[i];

        const id = row[0];
        const name = String(row[1]).trim();

        if (!id || !name) {
            continue;
        }

        categories.push({
            id: Number(id),
            name: name
        });
    }

    return categories;
}

function buildCategoryMap(categories) {
    const categoryMap = {};

    for (const category of categories) {
        const key = category.name
            .trim()
            .toLowerCase();

        categoryMap[key] = category.id;
    }

    return categoryMap;
}


function getProducts(categories) {
    const spreadsheet = getSpreadsheet();

    const sheet = spreadsheet.getSheetByName(
        SHEET_PRODUCTS
    );

    if (!sheet) {
        throw new Error(
            `No se encontró la hoja "${SHEET_PRODUCTS}".`
        );
    }

    const values = sheet.getDataRange().getValues();

    const categoryMap = buildCategoryMap(categories);

    const products = [];
    const errors = [];

    for (let i = 1; i < values.length; i++) {
        const row = values[i];

        const rowNumber = i + 1;

        const id = String(row[0]).trim();
        const categoryName = String(row[1]).trim();
        const name = String(row[2]).trim();
        const size = String(row[3]).trim();
        const description = String(row[4]).trim();
        const price = row[5];
        const image = String(row[6]).trim();

        // 1. ID
        if (!id) {
            errors.push({
                row: rowNumber,
                field: 'ID',
                message: 'El producto no tiene un ID.'
            });

            continue;
        }

        // 2. CATEGORÍA
        if (!categoryName) {
            errors.push({
                row: rowNumber,
                field: 'CATEGORÍA',
                message: 'La categoría es obligatoria.'
            });

            continue;
        }

        const categoryKey = categoryName
            .trim()
            .toLowerCase();

        const categoryId = categoryMap[categoryKey];

        if (categoryId === undefined) {
            errors.push({
                row: rowNumber,
                field: 'CATEGORÍA',
                message: `La categoría "${categoryName}" no existe.`
            });

            continue;
        }

        // 3. PRODUCTO
        if (!name) {
            errors.push({
                row: rowNumber,
                field: 'PRODUCTO',
                message: 'El nombre del producto es obligatorio.'
            });

            continue;
        }

        // 4. PRECIO
        if (
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            errors.push({
                row: rowNumber,
                field: 'PRECIO',
                message: 'El precio debe ser un número mayor que 0.'
            });

            continue;
        }

        // 5. Producto válido
        const product = {
            id: id,
            categoryId: categoryId,
            name: name,
            size: size,
            description: description,
            price: price,
            image: image
        };
        
        products.push(product);
    }
    
    return {
        products: products,
        errors: errors
    };
}

function onEdit(e) {
    const range = e.range;
    const sheet = range.getSheet();
    if (sheet.getName() !== SHEET_PRODUCTS) {
      return;
    }
    const row = range.getRow();

    const values = sheet
          .getRange(row,1,1,7)
          .getValues();
    
    Logger.log(values);

    const productRow = values[0];

    const id = String(productRow[0]).trim();
    const category = String(productRow[1]).trim();
    const name = String(productRow[2]).trim();
    const price = productRow[5];

    if (id) {
        return;
    }

    if (!category || !name) {
        return;
    }

    if (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        return;
    }

    Logger.log("La fila está lista para generar un ID.");

    const productId = generateProductId();

    sheet.getRange(row, 1).setValue(productId);

    Logger.log(`ID generado: ${productId}`);
}

function generateProductId() {
    const properties = PropertiesService.getScriptProperties();

    const counter = properties.getProperty(
        "PRODUCT_COUNTER"
    );

    let currentCounter;

    if (counter) {
        currentCounter = Number(counter);
    } else {
        currentCounter = 0;
    }

    currentCounter++;

    properties.setProperty(
        "PRODUCT_COUNTER",
        String(currentCounter)
    );

    const productId =
        `P${String(currentCounter).padStart(3, "0")}`;

    return productId;
}

function testGenerateProductId() {
    const productId = generateProductId();

    Logger.log(`ID generado: ${productId}`);
}