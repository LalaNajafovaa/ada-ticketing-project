(() => {
  const $ = (id) => document.getElementById(id);
  const money = (n) => n.toFixed(2) + ' AZN';

  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  const mapEl = $('map');
  const addBtn = $('btn-add');
  const removeSelectedBtn = $('btn-remove-selected');

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

  function bindEvents() {
    mapEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.seat');
      if (btn) inspect(btn.dataset.id);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current) deselect();
    });
  }

  function init() {
    createSeats();
    drawVenue();
    drawLegend();

    paintAll();
    showDetails();

    bindEvents();
  }

  init();
})();
