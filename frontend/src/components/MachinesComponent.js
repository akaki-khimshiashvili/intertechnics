import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LangContext } from "../LangContext";
import { assetUrl, getMachineFilters, listMachines } from "../lib/api";
import { formatPrice } from "../lib/machineDisplay";
import Reveal from "./Reveal";

/** Static locale fallback (used only if the live API is unreachable) normalized to the same card shape. */
function fallbackMachines(staticList) {
  return staticList.map((m, i) => ({
    id: `static-${i}`,
    slug: null,
    name: m.name,
    image: m.machine_image,
    priceLabel: null,
    category: null,
  }));
}

function MachineCard({ machine, index, onOpen }) {
  const card = (
    <>
      <div className="machine-card-media">
        <div className="machine-card-image" style={{ backgroundImage: `url(${machine.image})` }} />
      </div>
      <div className="machine-card-info">
        {machine.category && <p className="machine-card-tag">{machine.category}</p>}
        <h2 className="machine-card-name">{machine.name}</h2>
        {machine.priceLabel && <p className="machine-card-price">{machine.priceLabel}</p>}
      </div>
    </>
  );

  if (!machine.slug) {
    return (
      <Reveal as="div" index={index} className="machine-card">
        {card}
      </Reveal>
    );
  }

  return (
    <Reveal
      as="a"
      index={index}
      className="machine-card machine-card-link"
      href={`/machines/${machine.slug}`}
      onClick={(e) => {
        e.preventDefault();
        onOpen(machine.slug);
      }}
    >
      {card}
    </Reveal>
  );
}

function MachinesComponent({ machines: staticMachines }) {
  const navigate = useNavigate();
  const { t, lang } = useContext(LangContext);
  const mt = t.machines;

  // items: null while the very first fetch hasn't resolved yet (nothing to
  // show at all, not even stale data). error: the live API failed outright,
  // so we fall back to the static demo machine rather than an empty page.
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ brands: [], categories: [] });

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("");

  const isFirstFetch = useRef(true);

  useEffect(() => {
    getMachineFilters()
      .then((data) => setFilterOptions({ brands: data.brands || [], categories: data.categories || [] }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Only debounce for edits the user makes after the page is already
    // showing something — the very first load should fire immediately so
    // there's no artificial extra delay before anything appears.
    const delay = isFirstFetch.current ? 0 : 250;
    isFirstFetch.current = false;

    const handle = setTimeout(() => {
      listMachines({ q: search, brand, category, condition, sort })
        .then((res) => {
          if (cancelled) return;
          setItems(res.data);
          setError(false);
        })
        .catch(() => {
          if (cancelled) return;
          // Keep whatever was already on screen for a transient failure;
          // only an empty first load falls back to the static demo entry.
          setError(true);
        });
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, brand, category, condition, sort]);

  const cards = useMemo(() => {
    if (items !== null) {
      return items.map((m) => ({
        id: m.id,
        slug: m.slug,
        name: lang === "en" && m.name_en ? m.name_en : m.name,
        image: assetUrl(m.main_image),
        priceLabel: formatPrice(m, mt),
        category: [m.brand, m.category].filter(Boolean).join(" · ") || null,
      }));
    }
    if (error) {
      return staticMachines ? fallbackMachines(staticMachines) : [];
    }
    return null;
  }, [items, error, staticMachines, lang, mt]);

  const isLoading = cards === null;

  return (
    <div className="machines-body">
      <div className="machines-toolbar">
        <input
          type="search"
          className="machines-search"
          placeholder={mt.search_placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label={mt.filter_brand}>
          <option value="">{`${mt.filter_brand}: ${mt.filter_all}`}</option>
          {filterOptions.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={mt.filter_category}>
          <option value="">{`${mt.filter_category}: ${mt.filter_all}`}</option>
          {filterOptions.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} aria-label={mt.filter_condition}>
          <option value="">{`${mt.filter_condition}: ${mt.filter_all}`}</option>
          <option value="new">{mt.condition_new}</option>
          <option value="used">{mt.condition_used}</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={mt.sort_label}>
          <option value="">{mt.sort_newest}</option>
          <option value="price_asc">{mt.sort_price_asc}</option>
          <option value="price_desc">{mt.sort_price_desc}</option>
        </select>
      </div>

      {isLoading && <p className="machines-loading">{mt.loading}</p>}
      {!isLoading && cards.length === 0 && <p className="machines-empty">{mt.no_results}</p>}

      {!isLoading && (
        <div className="machines-container">
          {cards.map((machine, i) => (
            <MachineCard
              key={machine.id ?? i}
              machine={machine}
              index={i}
              onOpen={(slug) => navigate(`/machines/${slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MachinesComponent;
