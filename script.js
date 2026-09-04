/* ==========================================
   SRI KADIYAM PLANTS - INTERACTIVE SCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');

  if (mobileMenuBtn && mainNav && mobileNavOverlay) {
    function toggleMobileMenu() {
      mainNav.classList.toggle('open');
      mobileNavOverlay.classList.toggle('active');
      document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileNavOverlay.addEventListener('click', toggleMobileMenu);

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });
  }

  // 2. Cart Manager & Shopping Bag Interaction
  const CART_STORAGE_KEY = 'sri_kadiyam_cart';

  const CartManager = {
    getCart() {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    saveCart(cart) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (e) {}
      this.updateUI();
    },

    addItem(product) {
      const cart = this.getCart();
      const existing = cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity += (product.quantity || 1);
      } else {
        cart.push({
          id: product.id,
          name: product.name || 'Sri Kadiyam Plant',
          category: product.category || 'Nursery Plant',
          img: product.img,
          price: product.price || 299,
          quantity: product.quantity || 1
        });
      }

      this.saveCart(cart);
      this.showToast(`Added "${product.name || 'Plant'}" to cart!`);
    },

    updateQuantity(id, change) {
      let cart = this.getCart();
      const item = cart.find(i => i.id === id);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
          cart = cart.filter(i => i.id !== id);
        }
      }
      this.saveCart(cart);
    },

    removeItem(id) {
      let cart = this.getCart();
      cart = cart.filter(i => i.id !== id);
      this.saveCart(cart);
    },

    getTotalCount() {
      const cart = this.getCart();
      return cart.reduce((sum, i) => sum + i.quantity, 0);
    },

    getTotalPrice() {
      const cart = this.getCart();
      return cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    },

    showToast(msg) {
      const toast = document.getElementById('cartToast');
      const toastMsg = document.getElementById('cartToastMsg');
      if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
      }
    },

    updateUI() {
      const totalCount = this.getTotalCount();
      const totalPrice = this.getTotalPrice();

      // Navbar badge counts across pages
      const bagBadgeCounts = document.querySelectorAll('#bagBadgeCount');
      bagBadgeCounts.forEach(el => el.textContent = totalCount);

      // Cart drawer header item count
      const cartDrawerItemCount = document.getElementById('cartDrawerItemCount');
      if (cartDrawerItemCount) {
        cartDrawerItemCount.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;
        cartDrawerItemCount.style.display = totalCount > 0 ? 'inline-block' : 'none';
      }

      // Subtotal & Total in drawer footer (No actual product pricing displayed)
      const cartSubtotal = document.getElementById('cartSubtotal');
      const cartTotal = document.getElementById('cartTotal');
      if (cartSubtotal) cartSubtotal.textContent = `₹0`;
      if (cartTotal) cartTotal.textContent = `₹0`;

      const cartDrawerFooter = document.getElementById('cartDrawerFooter');
      const cartDrawerBody = document.getElementById('cartDrawerBody');

      if (cartDrawerBody) {
        const cart = this.getCart();
        if (cart.length === 0) {
          if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
          cartDrawerBody.innerHTML = `
            <div class="cart-empty-state">
              <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h4 class="cart-empty-title">Your cart is empty</h4>
              <p>Explore our plant catalog and add your favorite plants to order!</p>
              <a href="catalog.html" class="btn-browse-plants" id="cartBrowseBtn">Browse Plants</a>
            </div>
          `;
          const cartBrowseBtn = document.getElementById('cartBrowseBtn');
          if (cartBrowseBtn) {
            cartBrowseBtn.addEventListener('click', () => {
              closeCartDrawer();
            });
          }
        } else {
          if (cartDrawerFooter) cartDrawerFooter.style.display = 'flex';
          cartDrawerBody.innerHTML = cart.map(item => `
            <div class="cart-item-row" data-id="${item.id}">
              <div class="cart-item-img-box">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
              </div>
              <div class="cart-item-details">
                <strong class="cart-item-name">${item.name}</strong>
                <div class="cart-qty-controls">
                  <button class="cart-qty-btn btn-qty-minus" data-id="${item.id}">-</button>
                  <span class="cart-qty-val">${item.quantity}</span>
                  <button class="cart-qty-btn btn-qty-plus" data-id="${item.id}">+</button>
                </div>
              </div>
              <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="Remove item">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `).join('');

          // Attach listeners to qty +/- and remove buttons inside drawer
          cartDrawerBody.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
              this.updateQuantity(btn.getAttribute('data-id'), -1);
            });
          });

          cartDrawerBody.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
              this.updateQuantity(btn.getAttribute('data-id'), 1);
            });
          });

          cartDrawerBody.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              this.removeItem(btn.getAttribute('data-id'));
            });
          });
        }
      }
    }
  };

  // Initial cart UI update on page load
  CartManager.updateUI();

  // Cart Drawer open/close listeners
  const shoppingBagBtn = document.getElementById('shoppingBagBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const btnCheckoutWhatsapp = document.getElementById('btnCheckoutWhatsapp');

  function openCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.add('open');
      cartDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.remove('open');
      cartDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (shoppingBagBtn) {
    shoppingBagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  // Cart Drawer WhatsApp Complete Order Checkout Listener
  if (btnCheckoutWhatsapp) {
    btnCheckoutWhatsapp.addEventListener('click', () => {
      const cart = CartManager.getCart();
      if (cart.length === 0) {
        CartManager.showToast('Your cart is empty!');
        return;
      }

      let msgLines = ['Hello Sri Kadiyam Plants! I would like to order the following items from my cart:\n'];
      cart.forEach((item, idx) => {
        msgLines.push(`${idx + 1}. ${item.name} - Qty: ${item.quantity}`);
      });
      msgLines.push('\nPlease confirm availability and doorstep delivery details.');

      const encodedMsg = encodeURIComponent(msgLines.join('\n'));
      window.open(`https://wa.me/919052277700?text=${encodedMsg}`, '_blank');
    });
  }

  // 3. Search Bar Interaction
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // 4. Shop Now CTA Smooth Interaction
  const shopNowBtn = document.getElementById('shopNowBtn');
  if (shopNowBtn && !shopNowBtn.getAttribute('href').includes('catalog.html')) {
    shopNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const categoriesSection = document.getElementById('categories');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 5. Trending Nursery Collection Carousel Scroll
  const trendingCarouselTrack = document.getElementById('trendingCarouselTrack');
  const trendingPrevBtn = document.getElementById('trendingPrevBtn');
  const trendingNextBtn = document.getElementById('trendingNextBtn');

  if (trendingCarouselTrack && trendingPrevBtn && trendingNextBtn) {
    const scrollAmount = 300;
    trendingPrevBtn.addEventListener('click', () => {
      trendingCarouselTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    trendingNextBtn.addEventListener('click', () => {
      trendingCarouselTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // 6. Trusted Testimonials Carousel Navigation
  const testimonialCarouselTrack = document.getElementById('testimonialCarouselTrack');
  const testimonialPrevBtn = document.getElementById('testimonialPrevBtn');
  const testimonialNextBtn = document.getElementById('testimonialNextBtn');

  if (testimonialCarouselTrack && testimonialPrevBtn && testimonialNextBtn) {
    const scrollAmountTestimonial = 360;
    testimonialPrevBtn.addEventListener('click', () => {
      testimonialCarouselTrack.scrollBy({ left: -scrollAmountTestimonial, behavior: 'smooth' });
    });
    testimonialNextBtn.addEventListener('click', () => {
      testimonialCarouselTrack.scrollBy({ left: scrollAmountTestimonial, behavior: 'smooth' });
    });

    let autoScrollInterval = setInterval(() => {
      if (testimonialCarouselTrack.scrollLeft + testimonialCarouselTrack.clientWidth >= testimonialCarouselTrack.scrollWidth - 10) {
        testimonialCarouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        testimonialCarouselTrack.scrollBy({ left: 360, behavior: 'smooth' });
      }
    }, 5500);

    testimonialCarouselTrack.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
    testimonialCarouselTrack.addEventListener('mouseleave', () => {
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        if (testimonialCarouselTrack.scrollLeft + testimonialCarouselTrack.clientWidth >= testimonialCarouselTrack.scrollWidth - 10) {
          testimonialCarouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          testimonialCarouselTrack.scrollBy({ left: 360, behavior: 'smooth' });
        }
      }, 5500);
    });
  }

  // 7. Catalog Page Category Filtering & Two-Button Product Cards Logic
  const categoryPillsGrid = document.getElementById('categoryPillsGrid');
  const catalogProductsGrid = document.getElementById('catalogProductsGrid');
  const currentCategoryHeading = document.getElementById('currentCategoryHeading');
  const currentCategorySubtitle = document.getElementById('currentCategorySubtitle');

  if (catalogProductsGrid && categoryPillsGrid) {

    // Helper generator for range of numbered image files
    function generateRangeItems(start, end, categoryLabel, priceBase) {
      const items = [];
      for (let i = start; i <= end; i++) {
        const itemPrice = priceBase + ((i * 17) % 300);
        items.push({
          id: `plant-${i}`,
          name: `${categoryLabel} #${i}`,
          category: categoryLabel,
          img: `${i}.png`,
          fallbackImg: `image copy ${i}.png`,
          price: itemPrice
        });
      }
      return items;
    }

    // 1. Indoor Plants: Exact 71 Mappings (95.png to 165.png)
    const indoorItems = Array.from({ length: 71 }, (_, idx) => {
      const i = 95 + idx;
      return {
        id: `indoor-${i}`,
        name: 'Indoor Plant',
        hideName: true,
        overlayTag: 'Indoor Plants',
        category: 'Indoor Plant',
        img: `${i}.png`,
        fallbackImg: `image copy ${i}.png`,
        price: 249 + ((i * 17) % 300)
      };
    });

    // 2. Palms: Exact 20 Mappings (29.png to 48.png)
    const palmsItems = [
      { id: 'palm-29', name: 'Foxtail Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '29.png', fallbackImg: 'image copy 29.png', price: 399 },
      { id: 'palm-30', name: 'Red Latan Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '30.png', fallbackImg: 'image copy 30.png', price: 399 },
      { id: 'palm-31', name: 'Cardboard Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '31.png', fallbackImg: 'image copy 31.png', price: 399 },
      { id: 'palm-32', name: 'Royal Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '32.png', fallbackImg: 'image copy 32.png', price: 399 },
      { id: 'palm-33', name: 'Areca Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '33.png', fallbackImg: 'image copy 33.png', price: 399 },
      { id: 'palm-34', name: 'Bottle Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '34.png', fallbackImg: 'image copy 34.png', price: 399 },
      { id: 'palm-35', name: 'Champion / Chinese Fan Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '35.png', fallbackImg: 'image copy 35.png', price: 399 },
      { id: 'palm-36', name: 'Wild Date Palm (Silver)', overlayTag: 'Palm', category: 'Palm Variety', img: '36.png', fallbackImg: 'image copy 36.png', price: 399 },
      { id: 'palm-37', name: 'Travellers Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '37.png', fallbackImg: 'image copy 37.png', price: 399 },
      { id: 'palm-38', name: 'Fishtail Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '38.png', fallbackImg: 'image copy 38.png', price: 399 },
      { id: 'palm-39', name: 'Washingtonia Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '39.png', fallbackImg: 'image copy 39.png', price: 399 },
      { id: 'palm-40', name: 'Sylvester Dwarf Date', overlayTag: 'Palm', category: 'Palm Variety', img: '40.png', fallbackImg: 'image copy 40.png', price: 399 },
      { id: 'palm-41', name: 'Bismarck Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '41.png', fallbackImg: 'image copy 41.png', price: 399 },
      { id: 'palm-42', name: 'Spindle Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '42.png', fallbackImg: 'image copy 42.png', price: 399 },
      { id: 'palm-43', name: 'Sago Palm (Cycas)', overlayTag: 'Palm', category: 'Palm Variety', img: '43.png', fallbackImg: 'image copy 43.png', price: 399 },
      { id: 'palm-44', name: 'Coconut Palm (Landscape)', overlayTag: 'Palm', category: 'Palm Variety', img: '44.png', fallbackImg: 'image copy 44.png', price: 399 },
      { id: 'palm-45', name: 'Veitchia Merrillii (Christmas Palm)', overlayTag: 'Palm', category: 'Palm Variety', img: '45.png', fallbackImg: 'image copy 45.png', price: 399 },
      { id: 'palm-46', name: 'Veitchia Golden Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '46.png', fallbackImg: 'image copy 46.png', price: 399 },
      { id: 'palm-47', name: 'Rhapis Excelsa (Lady Palm)', overlayTag: 'Palm', category: 'Palm Variety', img: '47.png', fallbackImg: 'image copy 47.png', price: 479 },
      { id: 'palm-48', name: 'Palmyra Palm', overlayTag: 'Palm', category: 'Palm Variety', img: '48.png', fallbackImg: 'image copy 48.png', price: 489 }
    ];

    // 3. Flowering Plants: Exact 32 Mappings (49.png to 80.png)
    const floweringItems = [
      { id: 'flower-49', name: 'Ylang Ylang', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '49.png', fallbackImg: 'image copy 49.png', price: 199 },
      { id: 'flower-50', name: 'Euphorbia Milii', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '50.png', fallbackImg: 'image copy 50.png', price: 199 },
      { id: 'flower-51', name: 'Euphorbia Punicea (Jamaican Poinsettia)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '51.png', fallbackImg: 'image copy 51.png', price: 199 },
      { id: 'flower-52', name: 'Coleus (Assorted Colours)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '52.png', fallbackImg: 'image copy 52.png', price: 199 },
      { id: 'flower-53', name: 'Bougainvillea (All Colours)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '53.png', fallbackImg: 'image copy 53.png', price: 199 },
      { id: 'flower-54', name: 'Hibiscus (Assorted)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '54.png', fallbackImg: 'image copy 54.png', price: 199 },
      { id: 'flower-55', name: 'Texas Sage (Purple Sage)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '55.png', fallbackImg: 'image copy 55.png', price: 199 },
      { id: 'flower-56', name: 'Orange Jasmine (Kamini)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '56.png', fallbackImg: 'image copy 56.png', price: 199 },
      { id: 'flower-57', name: 'Blue Daze (Dwarf Morning Glory)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '57.png', fallbackImg: 'image copy 57.png', price: 199 },
      { id: 'flower-58', name: 'Portulaca (Moss Rose)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '58.png', fallbackImg: 'image copy 58.png', price: 199 },
      { id: 'flower-59', name: 'Ruellia Simplex (Mexican Petunia)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '59.png', fallbackImg: 'image copy 59.png', price: 199 },
      { id: 'flower-60', name: 'Plumeria (Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '60.png', fallbackImg: 'image copy 60.png', price: 199 },
      { id: 'flower-61', name: 'Plumeria Alba (White Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '61.png', fallbackImg: 'image copy 61.png', price: 199 },
      { id: 'flower-62', name: 'Plumeria Singaporensis (Singapore Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '62.png', fallbackImg: 'image copy 62.png', price: 199 },
      { id: 'flower-63', name: 'Plumeria Gold (Golden Frangipani)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '63.png', fallbackImg: 'image copy 63.png', price: 199 },
      { id: 'flower-64', name: 'Ixora Mini (Dwarf)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '64.png', fallbackImg: 'image copy 64.png', price: 199 },
      { id: 'flower-65', name: 'Thai Ixora', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '65.png', fallbackImg: 'image copy 65.png', price: 199 },
      { id: 'flower-66', name: 'Crape Jasmine (Nandivardanam)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '66.png', fallbackImg: 'image copy 66.png', price: 199 },
      { id: 'flower-67', name: 'Raat Ki Rani', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '67.png', fallbackImg: 'image copy 67.png', price: 199 },
      { id: 'flower-68', name: 'Marigold Hybrid', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '68.png', fallbackImg: 'image copy 68.png', price: 199 },
      { id: 'flower-69', name: 'Rose Desi Gulab', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '69.png', fallbackImg: 'image copy 69.png', price: 199 },
      { id: 'flower-70', name: 'Button Rose Mini', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '70.png', fallbackImg: 'image copy 70.png', price: 199 },
      { id: 'flower-71', name: 'Camellia', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '71.png', fallbackImg: 'image copy 71.png', price: 199 },
      { id: 'flower-72', name: 'Hydrangea', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '72.png', fallbackImg: 'image copy 72.png', price: 199 },
      { id: 'flower-73', name: 'Russelia', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '73.png', fallbackImg: 'image copy 73.png', price: 199 },
      { id: 'flower-74', name: 'Pentas Mixed Colours', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '74.png', fallbackImg: 'image copy 74.png', price: 199 },
      { id: 'flower-75', name: 'Kanakambaram', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '75.png', fallbackImg: 'image copy 75.png', price: 199 },
      { id: 'flower-76', name: 'Champa (Sampangi)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '76.png', fallbackImg: 'image copy 76.png', price: 199 },
      { id: 'flower-77', name: 'Tecoma Yellow Bells', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '77.png', fallbackImg: 'image copy 77.png', price: 199 },
      { id: 'flower-78', name: 'Parijatham (Night Jasmine)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '78.png', fallbackImg: 'image copy 78.png', price: 199 },
      { id: 'flower-79', name: 'Water Heliconia', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '79.png', fallbackImg: 'image copy 79.png', price: 199 },
      { id: 'flower-80', name: 'Peacock Flower (Caesalpinia pulcherrima)', overlayTag: 'Flowering Plant', category: 'Flowering Plant', img: '80.png', fallbackImg: 'image copy 80.png', price: 199 }
    ];

    // 4. Ornamental Plants: Exact 14 Mappings (81.png to 94.png)
    const ornamentalItems = [
      { id: 'ornamental-81', name: 'Calathea Lutea (Cuban Cigar)', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '81.png', fallbackImg: 'image copy 81.png', price: 279 },
      { id: 'ornamental-82', name: 'Bird of Paradise (Orange)', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '82.png', fallbackImg: 'image copy 82.png', price: 279 },
      { id: 'ornamental-83', name: 'Ornamental Banana (Red)', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '83.png', fallbackImg: 'image copy 83.png', price: 279 },
      { id: 'ornamental-84', name: 'Hibiscus Tiliaceus Rubra', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '84.png', fallbackImg: 'image copy 84.png', price: 279 },
      { id: 'ornamental-85', name: 'Ficus Starlight', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '85.png', fallbackImg: 'image copy 85.png', price: 279 },
      { id: 'ornamental-86', name: 'Ficus Black', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '86.png', fallbackImg: 'image copy 86.png', price: 279 },
      { id: 'ornamental-87', name: 'Ficus Panda', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '87.png', fallbackImg: 'image copy 87.png', price: 279 },
      { id: 'ornamental-88', name: 'Croton Assorted', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '88.png', fallbackImg: 'image copy 88.png', price: 279 },
      { id: 'ornamental-89', name: 'Song of India', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '89.png', fallbackImg: 'image copy 89.png', price: 279 },
      { id: 'ornamental-90', name: 'Thuja Golden', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '90.png', fallbackImg: 'image copy 90.png', price: 279 },
      { id: 'ornamental-91', name: 'Golden Cypress', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '91.png', fallbackImg: 'image copy 91.png', price: 279 },
      { id: 'ornamental-92', name: 'Terminalia Mantaly Variegated', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '92.png', fallbackImg: 'image copy 92.png', price: 279 },
      { id: 'ornamental-93', name: 'Terminalia Mantaly Green', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '93.png', fallbackImg: 'image copy 93.png', price: 279 },
      { id: 'ornamental-94', name: 'Spanish Cherry Variegated', overlayTag: 'Ornamental Plant', category: 'Ornamental Plant', img: '94.png', fallbackImg: 'image copy 94.png', price: 279 }
    ];

    // 5. Ficus / Bonsai Plants: Exact 10 Mappings (166.png to 175.png)
    const bonsaiItems = [
      { id: 'ficus-166', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '166.png', fallbackImg: 'image copy 166.png', price: 699 },
      { id: 'ficus-167', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '167.png', fallbackImg: 'image copy 167.png', price: 699 },
      { id: 'ficus-168', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '168.png', fallbackImg: 'image copy 168.png', price: 699 },
      { id: 'ficus-169', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '169.png', fallbackImg: 'image copy 169.png', price: 699 },
      { id: 'ficus-170', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '170.png', fallbackImg: 'image copy 170.png', price: 699 },
      { id: 'ficus-171', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '171.png', fallbackImg: 'image copy 171.png', price: 699 },
      { id: 'ficus-172', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '172.png', fallbackImg: 'image copy 172.png', price: 699 },
      { id: 'ficus-173', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '173.png', fallbackImg: 'image copy 173.png', price: 699 },
      { id: 'ficus-174', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '174.png', fallbackImg: 'image copy 174.png', price: 699 },
      { id: 'ficus-175', name: 'Ficus Plant', hideName: true, overlayTag: 'Ficus Plants', category: 'Ficus Plants', img: '175.png', fallbackImg: 'image copy 175.png', price: 699 }
    ];

    // 6. Fruit Plants: Exact 13 Mappings (178.png to 190.png)
    const fruitItems = [
      { id: 'fruit-178', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '178.png', fallbackImg: 'image copy 178.png', price: 349 },
      { id: 'fruit-179', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '179.png', fallbackImg: 'image copy 179.png', price: 349 },
      { id: 'fruit-180', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '180.png', fallbackImg: 'image copy 180.png', price: 349 },
      { id: 'fruit-181', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '181.png', fallbackImg: 'image copy 181.png', price: 349 },
      { id: 'fruit-182', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '182.png', fallbackImg: 'image copy 182.png', price: 349 },
      { id: 'fruit-183', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '183.png', fallbackImg: 'image copy 183.png', price: 349 },
      { id: 'fruit-184', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '184.png', fallbackImg: 'image copy 184.png', price: 349 },
      { id: 'fruit-185', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '185.png', fallbackImg: 'image copy 185.png', price: 349 },
      { id: 'fruit-186', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '186.png', fallbackImg: 'image copy 186.png', price: 349 },
      { id: 'fruit-187', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '187.png', fallbackImg: 'image copy 187.png', price: 349 },
      { id: 'fruit-188', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '188.png', fallbackImg: 'image copy 188.png', price: 349 },
      { id: 'fruit-189', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '189.png', fallbackImg: 'image copy 189.png', price: 349 },
      { id: 'fruit-190', name: 'Fruit Plant', hideName: true, overlayTag: 'Fruit Plants', category: 'Fruit Plant', img: '190.png', fallbackImg: 'image copy 190.png', price: 349 }
    ];

    // 7. Avenue Plants: Exact 29 Mappings as requested
    const avenueItems = [
      { id: 'avenue-1', name: 'Melia dubia', subName: 'Telugu: Malabar Vepa', category: 'Avenue Tree', img: 'image.png', fallbackImg: 'image.png', price: 349 },
      { id: 'avenue-2', name: 'Pongamia pinnata', subName: 'Telugu: Kanuga', category: 'Avenue Tree', img: 'image copy.png', fallbackImg: 'image copy.png', price: 349 },
      { id: 'avenue-3', name: 'Casuarina equisetifolia', subName: 'Telugu: Sarugudu', category: 'Avenue Tree', img: '2.png', fallbackImg: 'image copy 2.png', price: 349 },
      { id: 'avenue-4', name: 'Terminalia arjuna', subName: 'Telugu: Tella Maddi', category: 'Avenue Tree', img: '3.png', fallbackImg: 'image copy 3.png', price: 349 },
      { id: 'avenue-5', name: 'Prosopis cineraria', subName: 'Telugu: Jammi Chettu', category: 'Avenue Tree', img: '4.png', fallbackImg: 'image copy 4.png', price: 349 },
      { id: 'avenue-6', name: 'Samanea saman', subName: 'Telugu: Nidra Ganneru', category: 'Avenue Tree', img: '5.png', fallbackImg: 'image copy 5.png', price: 349 },
      { id: 'avenue-7', name: 'Delonix regia', subName: 'Telugu: Turai', category: 'Avenue Tree', img: '6.png', fallbackImg: 'image copy 6.png', price: 349 },
      { id: 'avenue-8', name: 'Butea monosperma', subName: 'Telugu: Modugu', category: 'Avenue Tree', img: '7.png', fallbackImg: 'image copy 7.png', price: 349 },
      { id: 'avenue-9', name: 'Neem', subName: 'Azadirachta indica · Telugu: Vepa', category: 'Avenue Tree', img: '8.png', fallbackImg: 'image copy 8.png', price: 349 },
      { id: 'avenue-10', name: 'Copper Pod', subName: 'Peltophorum pterocarpum · Telugu: Konda Chinta', category: 'Avenue Tree', img: '9.png', fallbackImg: 'image copy 9.png', price: 349 },
      { id: 'avenue-11', name: 'Indian Almond (Badam)', subName: 'Terminalia catappa · Telugu: Badam', category: 'Avenue Tree', img: '10.png', fallbackImg: 'image copy 10.png', price: 349 },
      { id: 'avenue-12', name: 'Mahogany', subName: 'Swietenia mahagoni', category: 'Avenue Tree', img: '11.png', fallbackImg: 'image copy 11.png', price: 349 },
      { id: 'avenue-13', name: 'Silver Oak', subName: 'Grevillea robusta', category: 'Avenue Tree', img: '12.png', fallbackImg: 'image copy 12.png', price: 349 },
      { id: 'avenue-14', name: 'Cassia Fistula (Golden Shower)', subName: 'Cassia fistula · Telugu: Rela', category: 'Avenue Tree', img: '13.png', fallbackImg: 'image copy 13.png', price: 349 },
      { id: 'avenue-15', name: 'Tabebuia Rosea', subName: 'Tabebuia rosea', category: 'Avenue Tree', img: '14.png', fallbackImg: 'image copy 14.png', price: 349 },
      { id: 'avenue-16', name: 'Tabebuia Argentea', subName: 'Tabebuia argentea', category: 'Avenue Tree', img: '15.png', fallbackImg: 'image copy 15.png', price: 349 },
      { id: 'avenue-17', name: 'Bignonia Megapotamica', subName: 'Bignonia megapotamica', category: 'Avenue Tree', img: '16.png', fallbackImg: 'image copy 16.png', price: 349 },
      { id: 'avenue-18', name: 'Jacaranda', subName: 'Jacaranda mimosifolia', category: 'Avenue Tree', img: '17.png', fallbackImg: 'image copy 17.png', price: 349 },
      { id: 'avenue-19', name: 'Spathodea (African Tulip)', subName: 'Spathodea campanulata', category: 'Avenue Tree', img: '18.png', fallbackImg: 'image copy 18.png', price: 349 },
      { id: 'avenue-20', name: 'Millingtonia (Tree Jasmine)', subName: 'Millingtonia hortensis', category: 'Avenue Tree', img: '19.png', fallbackImg: 'image copy 19.png', price: 349 },
      { id: 'avenue-21', name: 'Banyan Tree', subName: 'Ficus benghalensis', category: 'Avenue Tree', img: '20.png', fallbackImg: 'image copy 20.png', price: 349 },
      { id: 'avenue-22', name: 'Peepal Tree', subName: 'Ficus religiosa', category: 'Avenue Tree', img: '21.png', fallbackImg: 'image copy 21.png', price: 349 },
      { id: 'avenue-23', name: 'Ashoka Tree (Sita Ashok)', subName: 'Saraca asoca', category: 'Avenue Tree', img: '22.png', fallbackImg: 'image copy 22.png', price: 349 },
      { id: 'avenue-24', name: 'Mast Tree (False Ashoka)', subName: 'Polyalthia longifolia', category: 'Avenue Tree', img: '23.png', fallbackImg: 'image copy 23.png', price: 349 },
      { id: 'avenue-25', name: 'Teak', subName: 'Tectona grandis', category: 'Avenue Tree', img: '24.png', fallbackImg: 'image copy 24.png', price: 349 },
      { id: 'avenue-26', name: 'Red Sanders (Red Sandal)', subName: 'Pterocarpus santalinus', category: 'Avenue Tree', img: '25.png', fallbackImg: 'image copy 25.png', price: 349 },
      { id: 'avenue-27', name: 'Sandalwood', subName: 'Santalum album', category: 'Avenue Tree', img: '26.png', fallbackImg: 'image copy 26.png', price: 349 },
      { id: 'avenue-28', name: 'Amaltas Neelamohar (Pride of India)', subName: 'Lagerstroemia speciosa', category: 'Avenue Tree', img: '27.png', fallbackImg: 'image copy 27.png', price: 349 },
      { id: 'avenue-29', name: 'Kadamba', subName: 'Neolamarckia cadamba', category: 'Avenue Tree', img: '28.png', fallbackImg: 'image copy 28.png', price: 349 }
    ];

    // 8. All Plants: Complete combined collection of all categories
    const allItems = [
      ...indoorItems,
      ...palmsItems,
      ...floweringItems,
      ...ornamentalItems,
      ...bonsaiItems,
      ...fruitItems,
      ...avenueItems
    ];

    const catalogData = {
      'all': {
        title: 'All Plants',
        subtitle: 'Complete collection of indoor, avenue, palms, flowering, ornamental, bonsai & fruit plants',
        items: allItems
      },
      'indoor': {
        title: 'Indoor Plants',
        subtitle: 'Lush air-purifying, decorative and shade-loving indoor flora',
        items: indoorItems
      },
      'avenue': {
        title: 'Avenue Plants',
        subtitle: 'Stately avenue shade trees and landscape garden trees',
        items: avenueItems
      },
      'palms': {
        title: 'Palm Varieties',
        subtitle: 'Majestic tropical palm varieties for indoor and outdoor landscapes',
        items: palmsItems
      },
      'flowering': {
        title: 'Flowering Plants',
        subtitle: 'Vibrant perennial blooms and colorful garden flowering species',
        items: floweringItems
      },
      'ornamental': {
        title: 'Ornamental Plants',
        subtitle: 'Exotic decorative foliage and premium landscape accent plants',
        items: ornamentalItems
      },
      'bonsai': {
        title: 'Bonsai Plants',
        subtitle: 'Artisanal sculpted bonsai trees with aged roots and elegant foliage',
        items: bonsaiItems
      },
      'fruit': {
        title: 'Fruit Plants',
        subtitle: 'High-yield grafted fruit trees straight from Kadiyam nurseries',
        items: fruitItems
      }
    };

    function renderCatalogGrid(categoryKey) {
      const data = catalogData[categoryKey] || catalogData['all'];
      
      if (currentCategoryHeading) currentCategoryHeading.textContent = data.title;
      if (currentCategorySubtitle) currentCategorySubtitle.textContent = data.subtitle;

      // Helper function to build clean product card HTML
      function createCardHTML(item) {
        const waMsg = `Hello, I am interested in:\nPlant: ${item.name}\nQuantity: 1\n\nPlease share availability and delivery details.`;
        const encodedWaMsg = encodeURIComponent(waMsg);

        let tagText = item.overlayTag;
        if (!tagText) {
          if (item.category === 'Avenue Tree') tagText = 'Avenue Tree';
          else if (item.category === 'Palm Variety') tagText = 'Palm';
        }

        const imageOverlayHTML = tagText ? `<span class="avenue-overlay-tag">${tagText}</span>` : '';
        const categoryHTML = tagText ? '' : `<span class="catalog-card-category">${item.category}</span>`;

        const showPill = item.subName || item.usePill || item.category === 'Avenue Tree' || item.category === 'Palm Variety' || item.overlayTag;

        const titleDisplay = item.hideName ? '' : (showPill ? `
          <div class="plant-name-pill">
            <h3 class="catalog-card-title">${item.name}</h3>
          </div>
          ${item.subName ? `<p class="plant-sub-name">${item.subName}</p>` : ''}
        ` : `
          <h3 class="catalog-card-title">${item.name}</h3>
        `);

        return `
          <div class="catalog-card" data-id="${item.id}">
            <div class="catalog-img-box">
              <img src="${item.img}" 
                   alt="${item.name}" 
                   class="catalog-card-img" 
                   loading="lazy" 
                   decoding="async"
                   width="300"
                   height="225"
                   onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='${item.fallbackImg || item.img}';}" />
              ${imageOverlayHTML}
            </div>
            <div class="catalog-card-body">
              <div class="catalog-card-header">
                ${categoryHTML}
                ${titleDisplay}
              </div>

              <div class="catalog-badge-tag">
                <span class="catalog-badge-dot"></span>
                <span>In Stock • Wholesale</span>
              </div>

              <!-- Two Professional Action Buttons -->
              <div class="card-actions-row">
                <button class="btn-card-add-cart" 
                        data-id="${item.id}" 
                        data-name="${item.name}" 
                        data-img="${item.img}" 
                        data-price="${item.price}">
                  🛒 Add to Cart
                </button>
                <a href="https://wa.me/919052277700?text=${encodedWaMsg}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-card-wa-order">
                  💬 WhatsApp Order
                </a>
              </div>
            </div>
          </div>
        `;
      }

      function attachCartListeners(targetContainer) {
        targetContainer.querySelectorAll('.btn-card-add-cart').forEach(btn => {
          if (btn.dataset.bound) return;
          btn.dataset.bound = 'true';
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const product = {
              id: btn.getAttribute('data-id'),
              name: btn.getAttribute('data-name'),
              img: btn.getAttribute('data-img'),
              price: parseInt(btn.getAttribute('data-price'), 10),
              quantity: 1
            };
            CartManager.addItem(product);
          });
        });
      }

      // Fast initial paint: render first 24 items instantly
      const BATCH_SIZE = 24;
      const initialItems = data.items.slice(0, BATCH_SIZE);
      const remainingItems = data.items.slice(BATCH_SIZE);

      catalogProductsGrid.innerHTML = initialItems.map(createCardHTML).join('');
      attachCartListeners(catalogProductsGrid);

      // Asynchronously append remaining items without blocking thread
      if (remainingItems.length > 0) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = remainingItems.map(createCardHTML).join('');
            while (tempDiv.firstChild) {
              catalogProductsGrid.appendChild(tempDiv.firstChild);
            }
            attachCartListeners(catalogProductsGrid);
          }, 30);
        });
      }
    }

    // URL Query Parameter check for category or search filter
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';
    const searchQueryParam = urlParams.get('search');

    const pillButtons = categoryPillsGrid.querySelectorAll('.category-pill-btn');
    let matchedPill = false;

    if (!searchQueryParam) {
      pillButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === initialCategory) {
          pillButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          matchedPill = true;
        }
      });
    }

    // Initial render
    renderCatalogGrid(matchedPill ? initialCategory : 'all');

    // Helper search filter function
    function applySearchFilter(query) {
      const q = query.toLowerCase().trim();
      const cards = catalogProductsGrid.querySelectorAll('.catalog-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const titleEl = card.querySelector('.catalog-card-title');
        const catEl = card.querySelector('.catalog-card-category');
        const overlayEl = card.querySelector('.avenue-overlay-tag');
        const imgEl = card.querySelector('.catalog-card-img');
        const addBtn = card.querySelector('.btn-card-add-cart');

        const cardTitle = titleEl ? titleEl.textContent.toLowerCase() : '';
        const cardCategory = catEl ? catEl.textContent.toLowerCase() : '';
        const cardOverlay = overlayEl ? overlayEl.textContent.toLowerCase() : '';
        const imgAlt = imgEl ? (imgEl.getAttribute('alt') || '').toLowerCase() : '';
        const btnName = addBtn ? (addBtn.getAttribute('data-name') || '').toLowerCase() : '';

        if (q === '' || cardTitle.includes(q) || cardCategory.includes(q) || cardOverlay.includes(q) || imgAlt.includes(q) || btnName.includes(q)) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      return visibleCount;
    }

    // Search bar filter logic on catalog page
    const catalogSearchInput = document.getElementById('catalogSearchInput');
    
    if (searchQueryParam) {
      if (catalogSearchInput) catalogSearchInput.value = searchQueryParam;
      if (currentCategoryHeading) currentCategoryHeading.textContent = `Search Results: "${searchQueryParam}"`;
      if (currentCategorySubtitle) currentCategorySubtitle.textContent = `Showing nursery plants matching "${searchQueryParam}"`;

      // Apply initial filter after DOM paint
      setTimeout(() => {
        applySearchFilter(searchQueryParam);
      }, 50);
    }

    if (catalogSearchInput) {
      catalogSearchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        applySearchFilter(query);
      });
    }

    // Click handler for category pills
    pillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pillButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const catKey = btn.getAttribute('data-category');
        if (catalogSearchInput) catalogSearchInput.value = '';
        renderCatalogGrid(catKey);
      });
    });
  }

  // ==========================================
  // CONTACT US SECTION INTERACTION & FORM LOGIC
  // ==========================================
  const contactForm = document.getElementById('contactWhatsappForm');
  const contactFormAlert = document.getElementById('contactFormAlert');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const phoneInput = document.getElementById('contactPhone');
      const reqInput = document.getElementById('contactRequirement');
      const msgInput = document.getElementById('contactMessage');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const requirement = reqInput ? reqInput.value.trim() : '';
      const message = msgInput ? msgInput.value.trim() : '';

      // Reset error styles & alert
      if (nameInput) nameInput.classList.remove('input-error');
      if (phoneInput) phoneInput.classList.remove('input-error');

      if (contactFormAlert) {
        contactFormAlert.style.display = 'none';
        contactFormAlert.className = 'contact-form-alert';
        contactFormAlert.textContent = '';
      }

      // Validation check: Name and Phone Number are required
      let isValid = true;
      let errorMsg = '';

      if (!name && !phone) {
        isValid = false;
        errorMsg = '⚠️ Please enter your Name and Phone Number to submit.';
        if (nameInput) nameInput.classList.add('input-error');
        if (phoneInput) phoneInput.classList.add('input-error');
      } else if (!name) {
        isValid = false;
        errorMsg = '⚠️ Please enter your Name.';
        if (nameInput) nameInput.classList.add('input-error');
      } else if (!phone) {
        isValid = false;
        errorMsg = '⚠️ Please enter your Phone Number.';
        if (phoneInput) phoneInput.classList.add('input-error');
      }

      if (!isValid) {
        if (contactFormAlert) {
          contactFormAlert.textContent = errorMsg;
          contactFormAlert.classList.add('error');
          contactFormAlert.style.display = 'block';
        }
        return;
      }

      // Valid: Build formatted WhatsApp message
      const waMessageText = `Hello Sri Kadiyam Plants,\n\nName: ${name}\nPhone: ${phone}\nPlant / Requirement: ${requirement || 'Not specified'}\nMessage: ${message || 'Not specified'}\n\nI would like to know more about your plants.`;

      const targetWaNumber = '919052277700';
      const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waMessageText)}`;

      // Show success feedback briefly before opening WhatsApp
      if (contactFormAlert) {
        contactFormAlert.textContent = '🌿 Opening WhatsApp with your enquiry...';
        contactFormAlert.classList.add('success');
        contactFormAlert.style.display = 'block';
      }

      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 300);
    });
  }

  // Smooth Entrance Animation & Scroll Handler for Contact Us section
  const contactSection = document.getElementById('contact-us');
  if (contactSection) {
    contactSection.classList.add('animate-in');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            contactSection.classList.add('animate-in');
            observer.unobserve(contactSection);
          }
        });
      }, { threshold: 0.05 });
      observer.observe(contactSection);
    }
  }

  // Handle Contact Us links click to close mobile menu & scroll smoothly
  const contactNavLinks = document.querySelectorAll('a[href*="#contact-us"]');
  contactNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const mobileNav = document.getElementById('mainNav');
      const mobileOverlay = document.getElementById('mobileNavOverlay');
      if (mobileNav && mobileNav.classList.contains('mobile-active')) {
        mobileNav.classList.remove('mobile-active');
      }
      if (mobileOverlay && mobileOverlay.classList.contains('active')) {
        mobileOverlay.classList.remove('active');
      }
      const targetSection = document.getElementById('contact-us');
      if (targetSection && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html'))) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Handle Indoor Plants / Trending Collection links click to close mobile menu & scroll smoothly
  const trendingNavLinks = document.querySelectorAll('a[href*="#trending-collection"]');
  trendingNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const mobileNav = document.getElementById('mainNav');
      const mobileOverlay = document.getElementById('mobileNavOverlay');
      if (mobileNav && mobileNav.classList.contains('mobile-active')) {
        mobileNav.classList.remove('mobile-active');
      }
      if (mobileOverlay && mobileOverlay.classList.contains('active')) {
        mobileOverlay.classList.remove('active');
      }
      const targetSection = document.getElementById('trending-collection');
      if (targetSection && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html'))) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Smooth Scroll Animation for Landscaping Page Cards & Sections
  const landscapingAnimElements = document.querySelectorAll('.service-card, .why-choose-card, .experience-split-grid, .project-grid-card');
  if (landscapingAnimElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    landscapingAnimElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease-out ${index % 4 * 0.1}s, transform 0.6s ease-out ${index % 4 * 0.1}s`;
      observer.observe(el);
    });
  }
});


