// UI controls shared by the hardcoded and API-driven product pages.
// Keeping DOM references in named variables makes it easier to follow events.
export function initializeSiteUI() {
  const overlay = document.querySelector('#overlay');
  const menuButton = document.querySelector('#menuButton');
  const cartButton = document.querySelector('#cartButton');
  const searchButton = document.querySelector('#searchButton');
  const countryButton = document.querySelector('#countryButton');
  const navDrawer = document.querySelector('#navDrawer');
  const cartDrawer = document.querySelector('#cartDrawer');
  const searchModal = document.querySelector('#searchModal');
  const countryModal = document.querySelector('#countryModal');
  const clearSearchButton = document.querySelector('#clearSearch');
  const searchInput = document.querySelector('#searchInput');
  const newsletterForm = document.querySelector('#newsletterForm');
  const emailInput = document.querySelector('#emailInput');
  const newsletterMessage = document.querySelector('#newsletterMessage');

  const surfaces = Array.from(document.querySelectorAll('.drawer, .modal'));
  const backgroundElements = [];

  // These elements are disabled for keyboard focus while a dialog is open.
  for (const element of document.body.children) {
    if (!surfaces.includes(element) && element !== overlay && element.tagName !== 'SCRIPT') {
      backgroundElements.push(element);
    }
  }

  let activeSurface = null;
  let previousFocus = null;

  function getFocusableElements(surface) {
    const selector = 'button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex="0"]';
    const elements = surface.querySelectorAll(selector);
    return Array.from(elements).filter(element => !element.hidden && element.getClientRects().length > 0);
  }

  for (const surface of surfaces) {
    surface.inert = true;
    if (surface.classList.contains('drawer')) {
      surface.hidden = true;
      surface.setAttribute('role', 'dialog');
      surface.setAttribute('aria-modal', 'true');
    }
  }

  // Connect each dialog or drawer to the button that opens it.
  const surfaceTriggers = [
    { surface: navDrawer, button: menuButton },
    { surface: cartDrawer, button: cartButton },
    { surface: searchModal, button: searchButton },
    { surface: countryModal, button: countryButton }
  ];

  for (const item of surfaceTriggers) {
    item.button.setAttribute('aria-expanded', 'false');
  }

  function close(restoreFocus = true) {
    if (!activeSurface) {
      return;
    }

    activeSurface.inert = true;
    activeSurface.hidden = true;
    activeSurface.classList.remove('open');
    activeSurface.setAttribute('aria-hidden', 'true');
    activeSurface = null;

    overlay.hidden = true;
    document.body.classList.remove('no-scroll');

    for (const element of backgroundElements) {
      element.inert = false;
    }
    for (const item of surfaceTriggers) {
      item.button.setAttribute('aria-expanded', 'false');
    }

    if (restoreFocus && previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    }
  }

  function open(surface) {
    const trigger = document.activeElement;
    close(false);
    previousFocus = trigger;
    activeSurface = surface;

    for (const element of backgroundElements) {
      element.inert = true;
    }

    surface.hidden = false;
    surface.inert = false;
    surface.setAttribute('aria-hidden', 'false');
    surface.classList.add('open');
    document.body.classList.add('no-scroll');
    overlay.hidden = false;

    for (const item of surfaceTriggers) {
      if (item.surface === surface) {
        item.button.setAttribute('aria-expanded', 'true');
      }
    }

    const focusableElements = getFocusableElements(surface);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  menuButton.addEventListener('click', () => open(navDrawer));
  cartButton.addEventListener('click', () => open(cartDrawer));
  searchButton.addEventListener('click', () => open(searchModal));
  countryButton.addEventListener('click', () => open(countryModal));

  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => close());
  });

  overlay.addEventListener('click', () => close());

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        close();
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (!activeSurface) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }

    if (event.key === 'Tab') {
      const controls = getFocusableElements(activeSurface);
      const first = controls[0];
      const last = controls[controls.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        if (last) {
          last.focus();
        }
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        if (first) {
          first.focus();
        }
      }
    }
  });

  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
  });

  document.querySelectorAll('.country-option').forEach(option => {
    option.setAttribute('aria-pressed', String(option.classList.contains('active')));

    option.addEventListener('click', () => {
      document.querySelectorAll('.country-option').forEach(other => {
        const selected = other === option;
        other.classList.toggle('active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      countryButton.textContent = option.dataset.code;
      close();
    });
  });

  newsletterForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!emailInput.checkValidity()) {
      newsletterMessage.textContent = 'Please enter a valid email address.';
      emailInput.focus();
      return;
    }

    newsletterMessage.textContent = 'Email validated locally. Newsletter signup is not connected.';
    emailInput.value = '';
  });

  function openCart() {
    open(cartDrawer);
  }

  return { openCart, close };
}
