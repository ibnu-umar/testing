// ==========================================
// TOKO IBNU (IBNUMART) LOGIC
// Basic State Management & DOM Interactions
// ==========================================

// 1. Data Produk Kurasi Ibnu
const products = [
    {
        id: 1,
        name: "Headphone Wireless Premium",
        price: 2499000,
        category: "electronics",
        rating: 4.8,
        image: "assets/headphones.jpg",
        description: "Headphone nirkabel dengan Active Noise Cancelling (ANC), audio resolusi tinggi, dan baterai tahan 40 jam untuk kualitas suara premium."
    },
    {
        id: 2,
        name: "Smart Watch Pro",
        price: 3199000,
        category: "electronics",
        rating: 4.9,
        image: "assets/watch.jpg",
        description: "Smartwatch premium dengan layar sentuh AMOLED, pelacak kebugaran 24/7, GPS internal, dan tali kulit asli yang elegan."
    },
    {
        id: 3,
        name: "Mechanical Keyboard Retro",
        price: 1850000,
        category: "accessories",
        rating: 4.7,
        image: "assets/keyboard.jpg",
        description: "Keyboard mekanis kustom dengan desain retro klasik, frame aluminium presisi, pencahayaan RGB hangat, dan switch linear yang empuk."
    },
    {
        id: 4,
        name: "Minimalist Leather Wallet",
        price: 650000,
        category: "fashion",
        rating: 4.6,
        image: "assets/wallet.jpg",
        description: "Dompet kulit sapi asli buatan tangan dengan slot kartu ringkas dan desain ultra ramping yang pas di saku Anda."
    }
];

// 2. State Aplikasi
let cart = JSON.parse(localStorage.getItem('ibnumart_cart')) || [];
let activeCategory = "all";
let searchQuery = "";

// Format Rupiah Helper
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

// 3. DOM Elements
const productsGrid = document.getElementById('products-grid-container');
const categoryButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const cartBadge = document.getElementById('cart-badge-count');

// Cart Drawer elements
const cartDrawer = document.getElementById('cart-drawer-element');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawerOverlay = document.getElementById('cart-drawer-overlay-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotalDisplay = document.getElementById('cart-subtotal-display');
const cartTotalDisplay = document.getElementById('cart-total-display');
const cartFooterElement = document.getElementById('cart-drawer-footer-element');
const startShoppingBtn = document.getElementById('start-shopping-btn');

// Checkout modal elements
const checkoutModal = document.getElementById('checkout-modal-element');
const checkoutTriggerBtn = document.getElementById('checkout-trigger-btn');
const closeCheckoutBtn = document.getElementById('close-checkout-modal-btn');
const checkoutOverlay = document.getElementById('checkout-modal-overlay-btn');
const checkoutForm = document.getElementById('checkout-form');
const checkoutOrderItems = document.getElementById('checkout-order-items');
const checkoutTotalPrice = document.getElementById('checkout-total-price');

const checkoutFormStep = document.getElementById('checkout-form-step');
const checkoutSuccessStep = document.getElementById('checkout-success-step');
const successCustomerName = document.getElementById('success-customer-name');
const successTotalPrice = document.getElementById('success-total-price');
const successOrderId = document.getElementById('success-order-id');
const backToShopBtn = document.getElementById('back-to-shop-btn');

// Theme toggle element
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// 4. Render Products Grid
function renderProducts() {
    productsGrid.innerHTML = '';
    
    // Filter produk berdasarkan kategori dan pencarian
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="products-skeleton">
                <p>Tidak ada produk yang cocok dengan pencarian Anda.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
                <span class="product-tag">${product.category}</span>
            </div>
            <div class="product-info">
                <div class="product-rating">
                    <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <span class="rating-value">${product.rating}</span>
                </div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-card-footer">
                    <span class="product-price">${formatRupiah(product.price)}</span>
                    <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Tambah ${product.name} ke keranjang">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });

    // Add event listeners to the newly rendered add-to-cart buttons
    const addButtons = productsGrid.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            addToCart(id);
        });
    });
}

// 5. Cart Actions
function saveCart() {
    localStorage.setItem('ibnumart_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
    
    // Add pop animation to badge
    cartBadge.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
    }, 200);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    openCart();
}

function updateCartQuantity(productId, action) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    
    saveCart();
}

function removeCartItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function renderCart() {
    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p>Keranjang belanja Anda masih kosong.</p>
                <button class="btn btn-primary btn-sm close-cart-link" id="start-shopping-btn-inner">Belanja Sekarang</button>
            </div>
        `;
        cartFooterElement.style.display = 'none';
        
        const startShoppingInner = document.getElementById('start-shopping-btn-inner');
        if (startShoppingInner) {
            startShoppingInner.addEventListener('click', closeCart);
        }
        return;
    }

    // If cart has items
    cartFooterElement.style.display = 'block';
    cartItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <span class="cart-item-price">${formatRupiah(item.price)}</span>
                <div class="cart-item-qty">
                    <button class="qty-btn dec-qty" data-id="${item.id}">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item-btn" data-id="${item.id}" aria-label="Hapus ${item.name}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartSubtotalDisplay.textContent = formatRupiah(subtotal);
    cartTotalDisplay.textContent = formatRupiah(subtotal); // Gratis Ongkir

    // Add event listeners inside cart
    const decBtns = cartItemsContainer.querySelectorAll('.dec-qty');
    const incBtns = cartItemsContainer.querySelectorAll('.inc-qty');
    const removeBtns = cartItemsContainer.querySelectorAll('.remove-item-btn');

    decBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateCartQuantity(parseInt(btn.getAttribute('data-id')), 'decrease');
        });
    });

    incBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateCartQuantity(parseInt(btn.getAttribute('data-id')), 'increase');
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            removeCartItem(parseInt(btn.getAttribute('data-id')));
        });
    });
}

// Open/Close Cart Drawer
function openCart() {
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock scroll
}

function closeCart() {
    cartDrawer.classList.remove('open');
    document.body.style.overflow = ''; // Unlock scroll
}

// 6. Checkout Flow
function openCheckoutModal() {
    closeCart();
    
    // Render Order Summary
    checkoutOrderItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemSummary = document.createElement('div');
        itemSummary.className = 'checkout-summary-item';
        itemSummary.innerHTML = `
            <span>${item.name} <strong>x${item.quantity}</strong></span>
            <span>${formatRupiah(item.price * item.quantity)}</span>
        `;
        checkoutOrderItems.appendChild(itemSummary);
    });
    
    checkoutTotalPrice.textContent = formatRupiah(total);
    
    // Reset steps
    checkoutFormStep.classList.remove('hidden');
    checkoutSuccessStep.classList.add('hidden');
    
    checkoutModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('open');
    document.body.style.overflow = '';
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const payment = document.getElementById('checkout-payment').value;
    
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate Random Order ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `IM-${randomNum}`;
    
    // Show Success State
    successCustomerName.textContent = name;
    successTotalPrice.textContent = formatRupiah(cartTotal);
    successOrderId.textContent = orderId;
    
    checkoutFormStep.classList.add('hidden');
    checkoutSuccessStep.classList.remove('hidden');
    
    // Clear Cart
    cart = [];
    saveCart();
}

// 7. Dark/Light Theme Handler
function initTheme() {
    const savedTheme = localStorage.getItem('ibnumart_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ibnumart_theme', newTheme);
}

// 8. Setup Event Listeners
function setupEventListeners() {
    // Search input event
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
    });

    // Category button filters
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            categoryButtons.forEach(b => b.classList.remove('active'));
            // Add active to current
            btn.classList.add('active');
            
            activeCategory = btn.getAttribute('data-category');
            renderProducts();
        });
    });

    // Drawer toggles
    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartDrawerOverlay.addEventListener('click', closeCart);
    
    const startShoppingOuter = document.getElementById('start-shopping-btn');
    if (startShoppingOuter) {
        startShoppingOuter.addEventListener('click', closeCart);
    }

    // Modal toggles
    checkoutTriggerBtn.addEventListener('click', openCheckoutModal);
    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    checkoutOverlay.addEventListener('click', closeCheckoutModal);
    backToShopBtn.addEventListener('click', closeCheckoutModal);

    // Checkout form submit
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Theme toggle click
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// 9. Initializing App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProducts();
    updateCartCount();
    renderCart();
    setupEventListeners();
});
