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
      }

      // Subtotal & Total in drawer footer
      const cartSubtotal = document.getElementById('cartSubtotal');
      const cartTotal = document.getElementById('cartTotal');
      if (cartSubtotal) cartSubtotal.textContent = `₹${totalPrice}`;
      if (cartTotal) cartTotal.textContent = `₹${totalPrice}`;

      // Render cart drawer body items
      const cartDrawerBody = document.getElementById('cartDrawerBody');
      if (cartDrawerBody) {
        const cart = this.getCart();
        if (cart.length === 0) {
          cartDrawerBody.innerHTML = `
            <div class="cart-empty-state">
              <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h4 class="cart-empty-title">Your cart is empty</h4>
              <p>Explore our plant catalog and add your favorite plants to order!</p>
            </div>
          `;
        } else {
          cartDrawerBody.innerHTML = cart.map(item => `
            <div class="cart-item-row" data-id="${item.id}">
              <div class="cart-item-img-box">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
              </div>
              <div class="cart-item-details">
                <strong class="cart-item-name">${item.name}</strong>
                <span class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</span>
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

    // 1. Indoor Plants: 95 to 145, image.png, image copy.png
    const indoorItems = [
      { id: 'plant-img1', name: 'Indoor Decorative Ficus', category: 'Indoor Plant', img: 'image.png', fallbackImg: 'image.png', price: 299 },
      { id: 'plant-img2', name: 'Royal Indoor Greenery', category: 'Indoor Plant', img: 'image copy.png', fallbackImg: 'image copy.png', price: 349 },
      ...generateRangeItems(95, 145, 'Indoor Plant', 249)
    ];

    // 2. Palms: 2 to 28
    const palmsItems = generateRangeItems(2, 28, 'Palm Variety', 399);

    // 3. Flowering Plants: 29 to 48
    const floweringItems = generateRangeItems(29, 48, 'Flowering Plant', 199);

    // 4. Ornamental Plants: 49 to 80
    const ornamentalItems = generateRangeItems(49, 80, 'Ornamental Plant', 279);

    // 5. Bonsai Plants: 81 to 94
    const bonsaiItems = generateRangeItems(81, 94, 'Bonsai Plant', 699);

    // 6. Fruit Plants: 166 to 175 and 179 to 190
    const fruitItems = [
      ...generateRangeItems(166, 175, 'Fruit Plant', 349),
      ...generateRangeItems(179, 190, 'Fruit Plant', 349)
    ];

    // 7. Avenue Plants: 2 to 28
    const avenueItems = generateRangeItems(2, 28, 'Avenue Tree', 349);

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
            </div>
            <div class="catalog-card-body">
              <div class="catalog-card-header">
                <span class="catalog-card-category">${item.category}</span>
                <h3 class="catalog-card-title">${item.name}</h3>
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

    // URL Query Parameter check for category filter (e.g., catalog.html?category=indoor)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';

    const pillButtons = categoryPillsGrid.querySelectorAll('.category-pill-btn');
    let matchedPill = false;

    pillButtons.forEach(btn => {
      if (btn.getAttribute('data-category') === initialCategory) {
        pillButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        matchedPill = true;
      }
    });

    // Initial render
    renderCatalogGrid(matchedPill ? initialCategory : 'all');

    // Click handler for category pills
    pillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pillButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const catKey = btn.getAttribute('data-category');
        renderCatalogGrid(catKey);
      });
    });

    // Search bar filter logic on catalog page
    const catalogSearchInput = document.getElementById('catalogSearchInput');
    if (catalogSearchInput) {
      catalogSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = catalogProductsGrid.querySelectorAll('.catalog-card');
        cards.forEach(card => {
          const cardTitle = card.querySelector('.catalog-card-title').textContent.toLowerCase();
          const cardCategory = card.querySelector('.catalog-card-category').textContent.toLowerCase();
          if (cardTitle.includes(query) || cardCategory.includes(query) || query === '') {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }
  }
});
