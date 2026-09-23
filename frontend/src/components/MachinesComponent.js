import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { LangContext } from "../LangContext";
import { assetUrl, getMachineFilters, listMachines } from "../lib/api";
import { formatPrice } from "../lib/machineDisplay";
import Select from "./Select";

// First load (and each "load more") fetches this many — 12 fills 2, 3 and
// 4-column rows evenly.
const PAGE_SIZE = 12;

/** Static locale fallback (used only if the live API is unreachable) normalized to the same card shape. */
function fallbackMachines(staticList) {
  return staticList.map((m, i) => ({
    id: `static-${i}`,
    slug: null,
    name: m.name,
    image: m.machine_image,
    priceLabel: null,
    category: null,
    condition: null,
    year: null,
  }));
}

function MachineCard({ machine, index, onOpen, conditionLabels }) {
  const card = (
    <>
      <div className="machine-card-media">
        {machine.image && (
          <img
            className="machine-card-image"
            src={machine.image}
            alt={machine.name}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
          />
        )}
        {machine.condition && (
          <span className={`machine-card-badge machine-card-badge--${machine.condition}`}>
            {conditionLabels[machine.condition]}
          </span>
        )}
      </div>
      <div className="machine-card-info">
        {(machine.category || machine.year) && (
          <p className="machine-card-tag" title={machine.category || undefined}>
            {[machine.category, machine.year].filter(Boolean).join(" · ")}
          </p>
        )}
        <h2 className="machine-card-name" title={machine.name}>
          {machine.name}
        </h2>
        {(machine.priceLabel || machine.slug) && (
          <div className="machine-card-footer">
            {machine.priceLabel && <p className="machine-card-price">{machine.priceLabel}</p>}
            {machine.slug && (
              <span className="machine-card-arrow" aria-hidden="true">
                <ArrowUpRight width={18} height={18} />
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Not scroll-gated like <Reveal>: every loaded card is visible right away
  // (a gated card half below the fold stayed blank, so the grid looked like
  // it only had one row). Just a short staggered fade-in on mount.
  const enterStyle = { animationDelay: `${Math.min(index, 8) * 40}ms` };

  if (!machine.slug) {
    return (
      <div className="machine-card machine-card-enter" style={enterStyle}>
        {card}
      </div>
    );
  }

  return (
    <a
      className="machine-card machine-card-link machine-card-enter"
      style={enterStyle}
      href={machine.href}
      onClick={(e) => {
        e.preventDefault();
        onOpen(machine.href);
      }}
    >
      {card}
    </a>
  );
}

function MachinesComponent({ machines: staticMachines }) {
  const navigate = useNavigate();
  const { t, lang, localize } = useContext(LangContext);
  const mt = t.machines;

  // items: null while the very first fetch hasn't resolved yet (nothing to
  // show at all, not even stale data). error: the live API failed outright,
  // so we fall back to the static demo machine rather than an empty page.
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ brands: [], categories: [] });

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("");

  const isFirstFetch = useRef(true);
  // Bumped on every filter change so a slow "load more" for the previous
  // filters can't append its page onto the new results.
  const requestId = useRef(0);

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
      const id = ++requestId.current;
      setLoadingMore(false);
      listMachines({ q: search, brand, category, condition, sort, limit: PAGE_SIZE, offset: 0 })
        .then((res) => {
          if (cancelled || id !== requestId.current) return;
          setItems(res.data);
          setTotal(res.total ?? res.data.length);
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
        href: localize(`/machines/${m.slug}`),
        name: lang === "en" && m.name_en ? m.name_en : m.name,
        image: assetUrl(m.main_image),
        priceLabel: formatPrice(m, mt),
        category: [m.brand, m.category].filter(Boolean).join(" · ") || null,
        condition: m.condition_status === "new" || m.condition_status === "used" ? m.condition_status : null,
        year: m.year || null,
      }));
    }
    if (error) {
      return staticMachines ? fallbackMachines(staticMachines) : [];
    }
    return null;
  }, [items, error, staticMachines, lang, mt, localize]);

  const isLoading = cards === null;
  const hasMore = items !== null && items.length < total;

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const id = requestId.current;
    setLoadingMore(true);
    listMachines({ q: search, brand, category, condition, sort, limit: PAGE_SIZE, offset: items.length })
      .then((res) => {
        if (id !== requestId.current) return;
        setItems((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...res.data.filter((m) => !seen.has(m.id))];
        });
        setTotal(res.total ?? total);
      })
      .catch(() => {})
      .finally(() => {
        if (id === requestId.current) setLoadingMore(false);
      });
  };
  const hasActiveFilters = Boolean(search || brand || category || condition || sort);
  const conditionLabels = { new: mt.condition_new, used: mt.condition_used };

  const resetFilters = () => {
    setSearch("");
    setBrand("");
    setCategory("");
    setCondition("");
    setSort("");
  };

  const resetButton = (
    <button type="button" className="machines-reset" onClick={resetFilters} disabled={!hasActiveFilters}>
      <RotateCcw width={16} height={16} aria-hidden="true" />
      <span>{mt.reset_filters}</span>
    </button>
  );

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
        <Select
          value={brand}
          onChange={setBrand}
          ariaLabel={mt.filter_brand}
          options={[
            { value: "", label: `${mt.filter_brand}: ${mt.filter_all}` },
            ...filterOptions.brands.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          value={category}
          onChange={setCategory}
          ariaLabel={mt.filter_category}
          options={[
            { value: "", label: `${mt.filter_category}: ${mt.filter_all}` },
            ...filterOptions.categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Select
          value={condition}
          onChange={setCondition}
          ariaLabel={mt.filter_condition}
          options={[
            { value: "", label: `${mt.filter_condition}: ${mt.filter_all}` },
            { value: "new", label: mt.condition_new },
            { value: "used", label: mt.condition_used },
          ]}
        />
        <Select
          value={sort}
          onChange={setSort}
          ariaLabel={mt.sort_label}
          options={[
            { value: "", label: mt.sort_newest },
            { value: "price_asc", label: mt.sort_price_asc },
            { value: "price_desc", label: mt.sort_price_desc },
          ]}
        />
        {resetButton}
      </div>

      {isLoading && <p className="machines-loading">{mt.loading}</p>}
      {!isLoading && cards.length === 0 && (
        <div className="machines-empty">
          <p>{mt.no_results}</p>
          {hasActiveFilters && resetButton}
        </div>
      )}

      {!isLoading && (
        <div className="machines-container">
          {cards.map((machine, i) => (
            <MachineCard
              key={machine.id ?? i}
              machine={machine}
              index={i % PAGE_SIZE}
              conditionLabels={conditionLabels}
              onOpen={(href) => navigate(href)}
            />
          ))}
        </div>
      )}

      {!isLoading && items !== null && items.length > 0 && (
        <div className="machines-more">
          <p className="machines-count" aria-live="polite">
            {mt.showing_count.replace("{shown}", items.length).replace("{total}", total)}
          </p>
          {hasMore && (
            <button type="button" className="machines-load-more" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? mt.loading : mt.load_more}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MachinesComponent;
