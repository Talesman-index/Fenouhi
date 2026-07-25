/* ==========================================================================
   CARGOLINK AFRICA — APPLICATION LOGIC
   Plateforme d'achat et d'expédition Chine → Afrique (Lucide Icons Powered)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderLucideIcons();
  initUrlParams();
  calculateAdminQuoteTotal();
});

// Fallback initialization for dynamic loads
window.addEventListener('load', () => {
  renderLucideIcons();
});

function renderLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Toast Notification
 */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="info" style="color: var(--orange-primary, #165491);"></i> <span id="toast-text"></span>`;
    document.body.appendChild(toast);
  }

  const toastText = document.getElementById('toast-text');
  if (toastText) toastText.textContent = message;

  toast.classList.add('show');
  renderLucideIcons();

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * Main Header Search
 */
function executeMainHeaderSearch() {
  const input = document.getElementById('mainHeaderSearchInput');
  const cat = document.getElementById('headerCategorySelect')?.value || 'all';

  if (!input || !input.value.trim()) {
    showToast('Veuillez saisir un mot-clé ou un nom de produit.');
    return;
  }

  const query = input.value.trim();
  if (query.toUpperCase().startsWith('CMD-') || query.toUpperCase().startsWith('DEV-')) {
    window.location.href = `dashboard.html?track=${encodeURIComponent(query)}`;
  } else {
    window.location.href = `catalog.html?search=${encodeURIComponent(query)}&cat=${cat}`;
  }
}

/**
 * CargoLink AI Search Pill
 */
function submitAISearch() {
  const input = document.getElementById('aiSearchInput');
  if (!input || !input.value.trim()) {
    showToast('Veuillez coller un lien 1688/Taobao ou décrire votre produit.');
    return;
  }

  const query = input.value.trim();
  showToast(`⚡ CargoLink AI analyse votre besoin : "${query}"...`);
  setTimeout(() => {
    window.location.href = `quote-request.html?product=${encodeURIComponent(query)}`;
  }, 1200);
}

/**
 * Quick Quote Button from Cards
 */
function quickQuote(productName) {
  window.location.href = `quote-request.html?product=${encodeURIComponent(productName)}`;
}

/**
 * Toggle Favorite Heart Button
 */
function toggleFavorite(btn) {
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    btn.style.background = '#F1F5F9';
    btn.style.color = '#94A3B8';
    showToast('Retiré des favoris.');
  } else {
    btn.classList.add('active');
    btn.style.background = '#FFE4E6';
    btn.style.color = '#E11D48';
    showToast('❤️ Ajouté à vos favoris !');
  }
  renderLucideIcons();
}

/**
 * Read URL Parameters
 */
function initUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const productName = urlParams.get('product');

  const quoteProductNameInput = document.getElementById('quoteProductName');
  if (productName && quoteProductNameInput) {
    quoteProductNameInput.value = decodeURIComponent(productName);
    showToast(`Produit pré-sélectionné : ${decodeURIComponent(productName)}`);
  }
}

/**
 * Dashboard Tabs
 */
function switchDashboardTab(tabName) {
  const quotesTab = document.getElementById('tabContentQuotes');
  const ordersTab = document.getElementById('tabContentOrders');
  const btnQuotes = document.getElementById('tabBtnQuotes');
  const btnOrders = document.getElementById('tabBtnOrders');

  if (tabName === 'quotes') {
    if (quotesTab) quotesTab.style.display = 'block';
    if (ordersTab) ordersTab.style.display = 'none';

    if (btnQuotes) { btnQuotes.className = 'btn btn-primary'; }
    if (btnOrders) { btnOrders.className = 'btn btn-outline'; }
  } else {
    if (quotesTab) quotesTab.style.display = 'none';
    if (ordersTab) ordersTab.style.display = 'block';

    if (btnQuotes) { btnQuotes.className = 'btn btn-outline'; }
    if (btnOrders) { btnOrders.className = 'btn btn-primary'; }
  }
  renderLucideIcons();
}

/**
 * Payment Modal Logic
 */
let currentPaymentAmount = 205000;
let currentSelectedOperator = 'MTN';

function openPaymentModal(quoteRef, amount) {
  const modal = document.getElementById('paymentModal');
  const quoteRefText = document.getElementById('modalQuoteRef');
  const amountText = document.getElementById('modalAmountText');

  if (quoteRefText) quoteRefText.textContent = quoteRef;
  if (amountText) amountText.textContent = formatFCFA(amount);

  currentPaymentAmount = amount;
  if (modal) modal.style.display = 'flex';
  renderLucideIcons();
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.style.display = 'none';
}

function selectOperator(btn, opName) {
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => {
    b.style.borderColor = 'var(--border-light)';
    b.style.background = 'transparent';
  });

  btn.style.borderColor = 'var(--orange-primary)';
  btn.style.background = 'var(--orange-light)';
  currentSelectedOperator = opName;
  showToast(`Opérateur sélectionné : ${opName}`);
}

function confirmMobileMoneyPay() {
  const phone = document.getElementById('payPhoneNumber')?.value || '+229 97 00 11 22';
  closePaymentModal();

  showToast(`🎉 Paiement de ${formatFCFA(currentPaymentAmount)} via ${currentSelectedOperator} (${phone}) validé !`);

  setTimeout(() => {
    switchDashboardTab('orders');
    showToast('Votre commande CMD-2026-45892 est maintenant CONFIRMÉE et en cours de préparation en Chine ! 📦');
  }, 1200);
}

/**
 * Admin Quote Calculator
 */
function calculateAdminQuoteTotal() {
  const pCost = parseFloat(document.getElementById('calcProdCost')?.value || '0');
  const cFreight = parseFloat(document.getElementById('calcChinaFreight')?.value || '0');
  const iFreight = parseFloat(document.getElementById('calcIntlFreight')?.value || '0');
  const cust = parseFloat(document.getElementById('calcCustoms')?.value || '0');
  const fee = parseFloat(document.getElementById('calcServiceFee')?.value || '0');

  const total = pCost + cFreight + iFreight + cust + fee;
  const display = document.getElementById('calcTotalSumDisplay');

  if (display) display.textContent = formatFCFA(total);
}

function sendAdminQuoteToClient() {
  const totalDisplay = document.getElementById('calcTotalSumDisplay')?.textContent || '205 000 FCFA';
  showToast(`✅ Devis officiel de ${totalDisplay} transmis au client avec notification WhatsApp !`);
}

function updateAdminLogisticsStatus() {
  const selector = document.getElementById('adminStatusSelector');
  const selectedText = selector?.options[selector.selectedIndex]?.text || '';

  const statusBadge = document.getElementById('adminCurrentStatusBadge');
  if (statusBadge) statusBadge.textContent = selectedText;

  showToast(`🚚 Statut logistique mis à jour : "${selectedText}". Notification envoyée au client !`);
}

function formatFCFA(val) {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

/**
 * Mobile Drawer Menu Handlers
 */
function openMobileDrawer() {
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderLucideIcons();
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function toggleMobileDrawer() {
  const drawer = document.getElementById('mobileNavDrawer');
  if (drawer && drawer.classList.contains('active')) {
    closeMobileDrawer();
  } else {
    openMobileDrawer();
  }
}
