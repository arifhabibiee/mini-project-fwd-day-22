import { staticProduct } from "./product-data.js";
import { initializeSiteUI } from "./site-ui.js";
import { renderProduct } from "./product-ui.js";

const site = initializeSiteUI();
renderProduct(staticProduct, {
  openCart: site.openCart,
  params: new URLSearchParams(location.search),
});
document.querySelector("#loadPanel").hidden = true;
document.querySelector("#productContent").hidden = false;
document.querySelector("#main").setAttribute("aria-busy", "false");
