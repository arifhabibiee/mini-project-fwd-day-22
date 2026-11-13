import {
  validateProduct,
  selectInitialVariant,
  quantityBound,
  validQuantity,
  addCartLine,
  formatMoney,
} from "./product-model.js";
import { renderGallery } from "./product-gallery.js";
import { renderCart } from "./product-cart.js";
import { renderProductEditorial } from "./product-editorial.js";

let activeRenderEvents;
export function renderProduct(
  input,
  { openCart, params = new URLSearchParams() } = {},
) {
  const product = validateProduct(input);
  const initial = selectInitialVariant(product, params);
  if (activeRenderEvents) {
    activeRenderEvents.abort();
  }
  activeRenderEvents = new AbortController();
  const signal = activeRenderEvents.signal;
  const state = {
    selectedVariantId: initial.variant.id,
    imageIndex: 0,
    quantity: 1,
    protection: false,
    cart: [],
  };
  const cartFeedback = document.querySelector("#cartFeedback");
  const decreaseButton = document.querySelector("#decreaseQty");
  const increaseButton = document.querySelector("#increaseQty");
  const addToCartButton = document.querySelector("#addToCart");
  const selectedColorLabel = document.querySelector("#selectedColorLabel");
  const swatchesContainer = document.querySelector("#swatches");
  const availabilityLabel = document.querySelector("#availability");
  const stockNote = document.querySelector("#stockNote");
  const previousImageButton = document.querySelector("#prevImage");
  const nextImageButton = document.querySelector("#nextImage");
  const protectionToggle = document.querySelector("#protectionToggle");
  const productContent = document.querySelector("#productContent");

  // Mengambil elemen DOM untuk quantity, validasi, dan subtotal
  const quantityValue = document.querySelector("#quantityValue");
  const quantityError = document.querySelector("#quantityError");
  const selectionSummary = document.querySelector("#selectionSummary");
  const selectionSubtotal = document.querySelector("#selectionSubtotal");

  function selectedVariant() {
    return product.variants.find(
      (variant) => variant.id === state.selectedVariantId,
    );
  }

  document.querySelector("#breadcrumbProduct").textContent = product.name;
  document.querySelector("#productEyebrow").textContent =
    product.content.eyebrow;
  document.querySelector("#productTitle").textContent = product.name;
  document.querySelector("#productSubtitle").textContent = product.subtitle;
  document.querySelector("#productPrice").textContent = formatMoney(
    product.priceMinor,
    product.currency,
  );
  document.querySelector("#productDescription").textContent =
    product.description;
  document.querySelector("#protectionTitle").textContent =
    product.content.protection.title;
  document.querySelector("#protectionNote").textContent =
    product.content.protection.note;
  document.title = `${product.name} | Product Details`;

  function showFeedback(message) {
    cartFeedback.textContent = message;
  }

  function showGallery() {
    renderGallery(selectedVariant(), state.imageIndex, (index) => {
      state.imageIndex = index;
      showGallery();
    });
  }

  // Validasi bersama untuk tombol +/- dan input yang diketik pengguna
  function canUseQuantity(quantity) {
    const limit = quantityBound(product, selectedVariant());
    return (
      validQuantity(quantity, limit) &&
      Number.isSafeInteger(quantity * product.priceMinor)
    );
  }

  // Sinkronkan angka, pesan error, tombol, dan subtotal dari state.
  function updateQuantity() {
    quantityValue.value = String(state.quantity);
    quantityValue.setAttribute("aria-invalid", "false");
    quantityError.textContent = "";
    quantityError.hidden = true;

    decreaseButton.disabled = state.quantity <= 1;
    increaseButton.disabled = !canUseQuantity(state.quantity + 1);
    addToCartButton.disabled =
      !selectedVariant().purchasable || !canUseQuantity(state.quantity);

    // Perbarui warna, jumlah, dan subtotal
    const color = selectedVariant().label;
    const unit = state.quantity === 1 ? "item" : "items";
    selectionSummary.textContent = `${color} · ${state.quantity} ${unit}`;
    const subtotal = state.quantity * product.priceMinor;
    selectionSubtotal.textContent = formatMoney(subtotal, product.currency);
  }

  function updateVariant() {
    const variant = selectedVariant();
    const limit = quantityBound(product, variant);
    selectedColorLabel.textContent = `(${variant.label})`;
    for (const button of swatchesContainer.children) {
      const selected = Number(button.dataset.variantId) === variant.id;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-checked", String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    const availabilityLabels = {
      available: "Available",
      unavailable: "Unavailable",
      unknown: "Availability unknown",
    };
    availabilityLabel.textContent = availabilityLabels[variant.availability];

    // Menampilkan informasi stok produk
    if (variant.stockQuantity === null) {
      stockNote.textContent = "Stock quantity is not known.";
    } else {
      stockNote.textContent = `Known stock: ${variant.stockQuantity}.`;
    }

    addToCartButton.textContent = variant.purchasable
      ? "ADD TO CART"
      : "UNAVAILABLE";
    showGallery();
    updateQuantity();
  }

  function selectVariant(id) {
    state.selectedVariantId = id;
    state.imageIndex = 0;
    const limit = quantityBound(product, selectedVariant());
    if (limit !== null && limit > 0 && state.quantity > limit) {
      state.quantity = limit;
      showFeedback("Quantity adjusted to the known limit.");
    } else {
      showFeedback("");
    }
    updateVariant();
  }

  const swatches = product.variants.map((variant, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.dataset.variantId = String(variant.id);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-label", variant.label);
    const colorCircle = document.createElement("span");
    colorCircle.className = `swatch-circle swatch-${variant.colorCode}`;
    colorCircle.setAttribute("aria-hidden", "true");
    const colorName = document.createElement("span");
    colorName.textContent = variant.label;
    button.append(colorCircle, colorName);
    button.addEventListener("click", () => {
      selectVariant(variant.id);
    });
    button.addEventListener("keydown", (event) => {
      const keys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (!keys.includes(event.key)) {
        return;
      }
      event.preventDefault();

      let nextIndex;
      if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = swatches.length - 1;
      } else {
        const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
        const direction = backwards ? -1 : 1;
        nextIndex = (index + direction + swatches.length) % swatches.length;
      }

      selectVariant(product.variants[nextIndex].id);
      swatches[nextIndex].focus();
    });
    return button;
  });
  swatchesContainer.replaceChildren(...swatches);

  previousImageButton.addEventListener(
    "click",
    () => {
      state.imageIndex =
        (state.imageIndex - 1 + selectedVariant().images.length) %
        selectedVariant().images.length;
      showGallery();
    },
    { signal },
  );
  nextImageButton.addEventListener(
    "click",
    () => {
      state.imageIndex =
        (state.imageIndex + 1) % selectedVariant().images.length;
      showGallery();
    },
    { signal },
  );
  decreaseButton.addEventListener(
    "click",
    () => {
      state.quantity = Math.max(1, state.quantity - 1);
      updateQuantity();
    },
    { signal },
  );
  increaseButton.addEventListener(
    "click",
    () => {
      if (canUseQuantity(state.quantity + 1)) {
        state.quantity += 1;
      }
      updateQuantity();
    },
    { signal },
  );

  // Membaca dan memeriksa jumlah yang diketik pengguna.
  function handleQuantityInput() {
    const jumlah = Number(quantityValue.value);
    let pesanError = "";

    // Tentukan pesan sesuai kesalahan input.
    if (quantityValue.value === "") {
      pesanError = "Enter a quantity.";
    } else if (!Number.isSafeInteger(jumlah) || jumlah < 1) {
      pesanError = "Enter a whole number greater than zero.";
    } else if (!canUseQuantity(jumlah)) {
      const batas = quantityBound(product, selectedVariant());

      if (batas !== null && jumlah > batas) {
        pesanError = `Maximum quantity is ${batas}.`;
      } else {
        pesanError = "Enter a valid quantity.";
      }
    }

    // Jika tidak valid: tampilkan pesan, nonaktifkan keranjang, lalu berhenti.
    if (pesanError !== "") {
      quantityValue.setAttribute("aria-invalid", "true");
      quantityError.textContent = pesanError;
      quantityError.hidden = false;
      selectionSubtotal.textContent = "—";
      addToCartButton.disabled = true;
      return;
    }

    // Jika valid: simpan jumlah ke state dan perbarui tampilan.
    state.quantity = jumlah;
    updateQuantity();
  }

  // Event 'input' berjalan saat pengguna mengubah angka secara langsung.
  quantityValue.addEventListener("input", handleQuantityInput, { signal });

  protectionToggle.addEventListener(
    "change",
    (event) => {
      state.protection = event.target.checked;
    },
    { signal },
  );
  addToCartButton.addEventListener(
    "click",
    () => {
      try {
        state.cart = addCartLine(
          state.cart,
          product,
          selectedVariant(),
          state.quantity,
          state.protection,
        );
        renderCart(product, state.cart);
        showFeedback(
          `${selectedVariant().label} ${product.name} × ${state.quantity} added to cart.`,
        );
        if (typeof openCart === "function") {
          openCart();
        }
      } catch (error) {
        showFeedback(error.message);
      }
    },
    { signal },
  );

  productContent
    .querySelectorAll(
      ".feature-strip, .benefits-grid, .story-section, .specs-section, .box-section, .support-section",
    )
    .forEach((section) => section.remove());
  renderProductEditorial(product);
  updateVariant();
  renderCart(product, state.cart);
  if (initial.warning) {
    showFeedback(initial.warning);
  }
}
