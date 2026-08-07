(async function () {
    try {
        const response = await fetch("https://modara.site.je/wp-json/wc/store/v1/products");
        const products = await response.json();

        window.MODARA_PRODUCTS = products.map(product => ({
            id: product.id.toString(),
            brand: product.brands?.[0]?.name || "MODARA",
            name: product.name,
            price: Number(product.prices.price) / 100,
            compareAt: product.prices.regular_price
                ? Number(product.prices.regular_price) / 100
                : null,
            img: product.images[0]?.src || "",
            gallery: product.images.map(i => i.src),
            description: product.short_description || product.description,
            rating: Number(product.average_rating || 0),
            reviews: Number(product.review_count || 0),
            badge: ""
        }));

        document.dispatchEvent(new Event("woocommerceReady"));

    } catch (err) {
        console.error("WooCommerce Error:", err);
    }
})();