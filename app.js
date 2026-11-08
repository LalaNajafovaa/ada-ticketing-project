(() => {
  const $ = (id) => document.getElementById(id);

  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  const seats = new Map();
  const buttons = new Map();
  const sections = new Map(SECTIONS.map((s) => [s.id, s]));
  const soldSeats = new Set(UNAVAILABLE);

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
    btn.textContent = seat.number;
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

  function init() {
    createSeats();
    drawVenue();
  }

  init();
})();
