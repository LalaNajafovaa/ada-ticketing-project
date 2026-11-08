(() => {
  const STORAGE_KEY = 'auroraHall.cart';
  const ZOOM_FACTOR = 1.25;
  const MOVE_BY = 90;
  const MAX_SCALE = 3;
  const MIN_RATIO = 0.7;

  const $ = (id) => document.getElementById(id);
  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
  const money = (n) => n.toFixed(2) + ' AZN';

  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  const viewport = $('viewport');
  const mapEl = $('map');
  const zoomInBtn = document.querySelector('[data-action="zoom-in"]');
  const zoomOutBtn = document.querySelector('[data-action="zoom-out"]');
  const addBtn = $('btn-add');
  const removeSelectedBtn = $('btn-remove-selected');
  const clearBtn = $('btn-clear');
  const cartList = $('cart-list');

  const seats = new Map();
  const buttons = new Map();
  const sections = new Map(SECTIONS.map((s) => [s.id, s]));
  const soldSeats = new Set(UNAVAILABLE);

  const stateLabels = {
    available: 'available',
    inspected: 'available, being inspected',
    'in-cart': 'in your cart',
    unavailable: 'unavailable'
  };

  let cart = [];
  let current = null;
  let moved = false;
  const view = { x: 0, y: 0, scale: 1 };

  function createSeats() {
    SECTIONS.forEach((sec) => {
      sec.rows.forEach((row) => {
        for (let n = 1; n <= sec.seatsPerRow; n++) {
          const id = `${sec.id}-${row.label}${n}`;
          const tier = TIERS[row.tier];
          seats.set(id, {
            id,
            section: sec.name,
            row: row.label,
            number: n,
            tier: row.tier,
            tierName: tier.name,
            price: tier.price,
            sold: soldSeats.has(id)
          });
        }
      });
    });
  }

  function seatButton(seat) {
    const btn = make('button', 'seat');
    btn.type = 'button';
    btn.dataset.id = seat.id;
    btn.style.setProperty('--tier', TIERS[seat.tier].color);
    buttons.set(seat.id, btn);
    return btn;
  }

  function drawSection(sec) {
    const wrap = make('div', 'section');
    wrap.appendChild(make('h4', 'section-title', sec.name));

    sec.rows.forEach((row) => {
      const rowEl = make('div', 'row');
      rowEl.setAttribute('role', 'group');
      rowEl.setAttribute('aria-label', `${sec.name}, row ${row.label}`);

      const label = make('span', 'row-label', row.label);
      label.setAttribute('aria-hidden', 'true');
      rowEl.appendChild(label);

      for (let n = 1; n <= sec.seatsPerRow; n++) {
        rowEl.appendChild(seatButton(seats.get(`${sec.id}-${row.label}${n}`)));
      }
      wrap.appendChild(rowEl);
    });
    return wrap;
  }

  function drawVenue() {
    const fragment = document.createDocumentFragment();

    ZONES.forEach((zone) => {
      const zoneEl = make('div', `zone zone-${zone.id}`);
      zoneEl.appendChild(make('h3', 'zone-title', zone.name));

      const columns = make('div', 'zone-columns');
      zone.columns.forEach((colId) => {
        if (colId === 'AISLE') {
          const aisle = make('div', 'aisle');
          aisle.setAttribute('aria-hidden', 'true');
          columns.appendChild(aisle);
        } else {
          columns.appendChild(drawSection(sections.get(colId)));
        }
      });

      zoneEl.appendChild(columns);
      fragment.appendChild(zoneEl);
    });

    $('hall-main').appendChild(fragment);
  }

  function drawLegend() {
    const list = $('legend-tiers');
    Object.values(TIERS).forEach((tier) => {
      const item = make('li');
      const dot = make('span', 'tier-dot');
      dot.style.background = tier.color;
      item.append(dot, `${tier.name} - ${money(tier.price)}`);
      list.appendChild(item);
    });
  }

  function stateOf(id) {
    if (seats.get(id).sold) return 'unavailable';
    if (cart.includes(id)) return 'in-cart';
    if (id === current) return 'inspected';
    return 'available';
  }

  function paint(id) {
    if (!id || !seats.has(id)) return;
    const seat = seats.get(id);
    const btn = buttons.get(id);
    const state = stateOf(id);

    btn.className = `seat seat-${state}` + (id === current ? ' selected' : '');
    btn.textContent = state === 'in-cart' ? '✓' : state === 'unavailable' ? '×' : seat.number;

    btn.setAttribute('aria-disabled', String(state === 'unavailable'));
    btn.setAttribute('aria-pressed', String(id === current));
    btn.setAttribute(
      'aria-label',
      `${seat.section}, row ${seat.row}, seat ${seat.number}, ${seat.tierName}, ${money(seat.price)}, ${stateLabels[state]}`
    );
  }

  function paintAll() {
    seats.forEach((_, id) => paint(id));
  }

  function inspect(id) {
    const previous = current;
    current = id;
    paint(previous);
    paint(id);
    showDetails();
  }

  function deselect() {
    const previous = current;
    current = null;
    paint(previous);
    showDetails();
  }

  function showDetails(note) {
    const empty = $('details-empty');
    const body = $('details-body');

    if (!current) {
      empty.hidden = false;
      body.hidden = true;
      return;
    }

    const seat = seats.get(current);
    const inCart = cart.includes(current);
    const canAdd = !seat.sold && !inCart;

    empty.hidden = true;
    body.hidden = false;

    $('d-section').textContent = seat.section;
    $('d-row').textContent = seat.row;
    $('d-seat').textContent = seat.number;
    $('d-tier').textContent = seat.tierName;
    $('d-price').textContent = money(seat.price);
    $('d-status').textContent = seat.sold ? 'Unavailable' : inCart ? 'In your cart' : 'Available';

    let text = 'Not in your cart yet. Press ADD TO CART to add it.';
    let type = '';
    if (note) {
      text = note.text;
      type = note.type;
    } else if (seat.sold) {
      text = 'This seat is unavailable and cannot be added.';
      type = 'error';
    } else if (inCart) {
      text = 'This seat is already in your cart.';
    }

    const message = $('details-message');
    message.textContent = text;
    message.className = type ? `message ${type}` : 'message';

    addBtn.setAttribute('aria-disabled', String(!canAdd));
    addBtn.classList.toggle('disabled', !canAdd);
    removeSelectedBtn.hidden = !inCart;
  }

  function addToCart() {
    if (!current) return;
    const seat = seats.get(current);

    if (seat.sold) {
      showDetails({ text: 'This seat is unavailable and cannot be added.', type: 'error' });
      return;
    }
    if (cart.includes(seat.id)) {
      showDetails({ text: 'This seat is already in your cart.', type: 'error' });
      return;
    }

    cart.push(seat.id);
    saveCart();
    paint(seat.id);
    drawCart();
    showDetails({ text: 'Added to your cart.', type: 'ok' });
  }

  function removeFromCart(id) {
    const index = cart.indexOf(id);
    if (index === -1) return;
    cart.splice(index, 1);
    saveCart();
    paint(id);
    drawCart();
    if (id === current) showDetails({ text: 'Removed from your cart.', type: 'ok' });
  }

  function clearCart() {
    const removed = cart;
    cart = [];
    saveCart();
    removed.forEach(paint);
    drawCart();
    if (current) showDetails();
  }

  function drawCart() {
    cartList.textContent = '';
    let total = 0;

    cart.forEach((id) => {
      const seat = seats.get(id);
      total += seat.price;

      const item = make('li', 'cart-item');
      const info = make('div', 'cart-info');
      info.append(
        make('strong', '', seat.section),
        make('span', '', `Row ${seat.row} · Seat ${seat.number} · ${seat.tierName}`)
      );

      const remove = make('button', 'btn', 'Remove');
      remove.type = 'button';
      remove.dataset.remove = id;
      remove.setAttribute('aria-label', `Remove ${seat.section} row ${seat.row} seat ${seat.number}`);

      item.append(info, make('span', 'cart-price', money(seat.price)), remove);
      cartList.appendChild(item);
    });

    $('cart-empty').hidden = cart.length > 0;
    clearBtn.hidden = cart.length === 0;
    $('cart-count').textContent = `${cart.length} ${cart.length === 1 ? 'ticket' : 'tickets'}`;
    $('cart-total').textContent = money(total);
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn('Could not save cart', err);
    }
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (err) {
      return [];
    }
  }

  function fitScale() {
    const s = Math.min(
      (viewport.clientWidth - 16) / mapEl.offsetWidth,
      (viewport.clientHeight - 16) / mapEl.offsetHeight,
      1.2
    );
    return Math.max(s, 0.1);
  }

  const minScale = () => fitScale() * MIN_RATIO;

  function applyView() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const mw = mapEl.offsetWidth * view.scale;
    const mh = mapEl.offsetHeight * view.scale;

    view.x = clamp(view.x, Math.min(0, vw - mw), Math.max(0, vw - mw));
    view.y = clamp(view.y, Math.min(0, vh - mh), Math.max(0, vh - mh));
    mapEl.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;

    zoomInBtn.disabled = view.scale >= MAX_SCALE - 0.001;
    zoomOutBtn.disabled = view.scale <= minScale() + 0.001;
  }

  function zoomBy(factor, cx, cy) {
    const next = clamp(view.scale * factor, minScale(), MAX_SCALE);
    const ratio = next / view.scale;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.scale = next;
    moved = true;
    applyView();
  }

  function moveBy(dx, dy) {
    view.x += dx;
    view.y += dy;
    moved = true;
    applyView();
  }

  function resetView() {
    view.scale = fitScale();
    view.x = (viewport.clientWidth - mapEl.offsetWidth * view.scale) / 2;
    view.y = (viewport.clientHeight - mapEl.offsetHeight * view.scale) / 2;
    moved = false;
    applyView();
  }

  function runAction(action) {
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    if (action === 'zoom-in') zoomBy(ZOOM_FACTOR, cx, cy);
    else if (action === 'zoom-out') zoomBy(1 / ZOOM_FACTOR, cx, cy);
    else if (action === 'up') moveBy(0, MOVE_BY);
    else if (action === 'down') moveBy(0, -MOVE_BY);
    else if (action === 'left') moveBy(MOVE_BY, 0);
    else if (action === 'right') moveBy(-MOVE_BY, 0);
    else if (action === 'reset') resetView();
  }

  function onResize() {
    if (!moved) {
      resetView();
      return;
    }
    view.scale = clamp(view.scale, minScale(), MAX_SCALE);
    applyView();
  }

  function bindEvents() {
    mapEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.seat');
      if (btn) inspect(btn.dataset.id);
    });

    $('map-controls').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) runAction(btn.dataset.action);
    });

    addBtn.addEventListener('click', addToCart);
    removeSelectedBtn.addEventListener('click', () => removeFromCart(current));
    clearBtn.addEventListener('click', clearCart);

    cartList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (btn) removeFromCart(btn.dataset.remove);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current) deselect();
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(onResize).observe(viewport);
    } else {
      window.addEventListener('resize', onResize);
    }
  }

  function init() {
    createSeats();
    drawVenue();
    drawLegend();

    cart = loadCart();
    saveCart();
    paintAll();
    drawCart();
    showDetails();

    bindEvents();
    resetView();
  }

  init();
})();
