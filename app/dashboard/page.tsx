'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Box,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Menu,
  MousePointer2,
  Plus,
  Settings as SettingsIcon,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DashboardCustomizer } from '@/components/dashboard-customizer';

type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Product = {
  id: string;
  name: string;
  category: string | null;
  provider: string | null;
  price: number | null;
  currency: string | null;
  is_published: boolean;
  is_featured: boolean;
  position: number;
};

type Event = {
  event_type: 'store_view' | 'product_view' | 'product_click';
  product_id: string | null;
  created_at: string;
  device_type: string | null;
};

const nav = [
  ['Overview', Eye],
  ['Products', Box],
  ['Storefront', Store],
  ['Analytics', BarChart3],
  ['Settings', SettingsIcon],
] as const;

export default function Dashboard() {
  const [active, setActive] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        if (!cancelled) {
          setError(membershipError.message);
          setLoading(false);
        }
        return;
      }

      if (!membership?.organization_id) {
        window.location.href = '/onboarding';
        return;
      }

      const [organizationResult, productsResult] = await Promise.all([
        supabase
          .from('organizations')
          .select('id,name,slug,description')
          .eq('id', membership.organization_id)
          .single(),
        supabase
          .from('products')
          .select(
            'id,name,category_id,provider,price,currency,is_published,is_featured,position,categories(name)',
          )
          .eq('organization_id', membership.organization_id)
          .order('position', { ascending: true }),
      ]);

      if (cancelled) return;

      if (organizationResult.error || productsResult.error) {
        setError(
          organizationResult.error?.message ||
            productsResult.error?.message ||
            'Unable to load your workspace.',
        );
      }

      setWorkspace(organizationResult.data as Workspace | null);
      setProducts(
        ((productsResult.data || []) as any[]).map((product) => ({
          id: product.id,
          name: product.name,
          category: product.categories?.name || null,
          provider: product.provider,
          price: product.price,
          currency: product.currency,
          is_published: product.is_published,
          is_featured: product.is_featured,
          position: product.position,
        })),
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="hub-logo">
          <Sparkles size={18} />
        </div>
        <span>Loading your workspace…</span>
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="app-loading">
        <strong>{error}</strong>
      </div>
    );
  }

  const published = products.filter((product) => product.is_published).length;
  const storefrontPath = `/store/${workspace?.slug || ''}`;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="hub-logo">
            <Sparkles size={17} />
          </span>
          <span>Product Hub</span>
          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="org-switch">
          <span>{workspace?.name || 'Your workspace'}</span>
          <ChevronDown size={15} />
        </div>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={active === label ? 'active' : ''}
              onClick={() => {
                setActive(label);
                setMobileOpen(false);
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="plan-card">
          <div>
            <Sparkles size={17} />
            <strong>Free Plan</strong>
          </div>
          <span>Start building your storefront.</span>
          <button type="button">
            View plans <ExternalLink size={13} />
          </button>
        </div>

        <div className="help">
          <span>?</span> Need help? <span>→</span>
        </div>

        <div className="user-row">
          <span className="avatar">
            {workspace?.name?.slice(0, 2).toUpperCase() || 'PH'}
          </span>
          <div>
            <strong>{workspace?.name || 'Account'}</strong>
            <small>Owner</small>
          </div>
          <ChevronDown size={16} />
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="topbar-title">{active}</div>
          <div className="topbar-actions">
            <a href={storefrontPath} className="view-store">
              <Eye size={17} /> View storefront
            </a>
            <span className="avatar small">
              {workspace?.name?.slice(0, 2).toUpperCase() || 'PH'}
            </span>
          </div>
        </header>

        <section className="page-content">
          {active === 'Overview' && (
            <Overview
              workspace={workspace}
              products={products}
              published={published}
              storefrontPath={storefrontPath}
            />
          )}
          {active === 'Products' && <Products products={products} />}
          {active === 'Storefront' && workspace && (
            <DashboardCustomizer
              organizationId={workspace.id}
              storefrontPath={storefrontPath}
            />
          )}
          {active === 'Analytics' && workspace && (
            <Analytics products={products} organizationId={workspace.id} />
          )}
          {active === 'Settings' && workspace && (
            <SettingsView
              workspace={workspace}
              setWorkspace={setWorkspace}
              storefrontPath={storefrontPath}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function Overview({
  workspace,
  products,
  published,
  storefrontPath,
}: {
  workspace: Workspace | null;
  products: Product[];
  published: number;
  storefrontPath: string;
}) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ views: 0, clicks: 0 });

  useEffect(() => {
    if (!workspace) return;

    let cancelled = false;
    async function loadStats() {
      const supabase = createClient();
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data } = await supabase
        .from('analytics_events')
        .select('event_type')
        .eq('organization_id', workspace.id)
        .gte('created_at', since);

      if (cancelled) return;
      setStats({
        views: (data || []).filter((event) => event.event_type === 'store_view').length,
        clicks: (data || []).filter((event) => event.event_type === 'product_click').length,
      });
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  async function copyStorefront() {
    await navigator.clipboard?.writeText(window.location.origin + storefrontPath);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Good morning</h1>
          <p>
            Here&apos;s what&apos;s happening with {workspace?.name || 'your storefront'}.
          </p>
        </div>
      </div>

      <div className="store-url">
        <div>
          <Eye size={20} />
          <span>
            {typeof window !== 'undefined' ? window.location.origin : ''}
            {storefrontPath}
          </span>
        </div>
        <button onClick={copyStorefront} type="button">
          <Copy size={16} /> {copied ? 'Copied' : 'Copy'}
        </button>
        <a href={storefrontPath}>
          <ExternalLink size={16} /> View
        </a>
      </div>

      <div className="metric-grid">
        <Metric
          icon={<Eye />}
          label="Store views"
          value={String(stats.views)}
          delta="Last 30 days"
        />
        <Metric
          icon={<MousePointer2 />}
          label="Product clicks"
          value={String(stats.clicks)}
          delta="External purchase clicks"
        />
        <Metric
          icon={<Box />}
          label="Products"
          value={String(products.length)}
          delta={`${published} published`}
        />
      </div>

      <div className="panel top-products">
        <div className="panel-head">
          <h2>Products</h2>
          <span>{products.length} total</span>
        </div>

        {products.length === 0 ? (
          <div className="empty">
            Add your first product to start building your storefront.
          </div>
        ) : (
          <div className="table">
            <div className="tr th">
              <span>#</span>
              <span>Product</span>
              <span>Status</span>
              <span>Price</span>
            </div>
            {products.slice(0, 5).map((product, index) => (
              <div className="tr" key={product.id}>
                <span>{index + 1}</span>
                <div className="product-cell">
                  <div>
                    <a href={`/dashboard/products/${product.id}`}>
                      <strong>{product.name}</strong>
                    </a>
                    <small>{product.category || 'Product'}</small>
                  </div>
                </div>
                <span>
                  <b className={`status ${product.is_published ? 'published' : 'draft'}`}>
                    {product.is_published ? 'Published' : 'Draft'}
                  </b>
                </span>
                <span>
                  {product.price == null
                    ? '—'
                    : `${product.currency || 'AOA'} ${product.price}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
  delta,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
    </div>
  );
}

function Products({ products }: { products: Product[] }) {
  return (
    <>
      <div className="page-heading product-heading">
        <div>
          <h1>Products</h1>
          <p>Manage everything that appears in your storefront.</p>
        </div>
        <a className="primary" href="/dashboard/products/new">
          <Plus size={18} /> Add product
        </a>
      </div>

      <div className="panel product-list">
        <div className="list-header">
          <span>Product</span>
          <span>Category</span>
          <span>Provider</span>
          <span>Status</span>
          <span>Price</span>
          <span />
        </div>

        {products.map((product) => (
          <div className="product-row" key={product.id}>
            <div>
              <a href={`/dashboard/products/${product.id}`}>
                <strong>{product.name}</strong>
              </a>
            </div>
            <span>{product.category || '—'}</span>
            <span>{product.provider || '—'}</span>
            <span>
              <b className={`status ${product.is_published ? 'published' : 'draft'}`}>
                {product.is_published ? 'Published' : 'Draft'}
              </b>
            </span>
            <span>
              {product.price == null
                ? '—'
                : `${product.currency || 'AOA'} ${product.price}`}
            </span>
            <a className="row-action" href={`/dashboard/products/${product.id}`}>
              Edit
            </a>
          </div>
        ))}

        {!products.length && (
          <div className="empty">
            No products yet. <a href="/dashboard/products/new">Add your first product.</a>
          </div>
        )}
      </div>
    </>
  );
}

function Analytics({
  products,
  organizationId,
}: {
  products: Product[];
  organizationId: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setError('');
      const supabase = createClient();
      const since = new Date(Date.now() - range * 86400000).toISOString();
      const { data, error: queryError } = await supabase
        .from('analytics_events')
        .select('event_type,product_id,created_at,device_type')
        .eq('organization_id', organizationId)
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      if (cancelled) return;
      if (queryError) setError(queryError.message);
      setEvents((data as Event[]) || []);
      setLoading(false);
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [organizationId, range]);

  const views = events.filter((event) => event.event_type === 'store_view').length;
  const productViews = events.filter((event) => event.event_type === 'product_view').length;
  const clicks = events.filter((event) => event.event_type === 'product_click').length;
  const ctr = views ? (clicks / views) * 100 : 0;

  const top = useMemo(
    () =>
      products
        .map((product) => ({
          product,
          count: events.filter(
            (event) =>
              event.product_id === product.id && event.event_type === 'product_click',
          ).length,
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    [events, products],
  );

  const days = Array.from({ length: Math.min(range, 14) }, (_, index) => {
    const day = new Date(
      Date.now() - (Math.min(range, 14) - 1 - index) * 86400000,
    );
    return {
      label: day.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
      value: events.filter(
        (event) =>
          event.event_type === 'store_view' &&
          new Date(event.created_at).toDateString() === day.toDateString(),
      ).length,
    };
  });

  const max = Math.max(1, ...days.map((day) => day.value));

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p>Track performance as visitors interact with your storefront.</p>
        </div>
        <select value={range} onChange={(event) => setRange(Number(event.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="metric-grid four">
        <Metric icon={<Eye />} label="Store views" value={loading ? '…' : String(views)} delta={`${range}-day period`} />
        <Metric icon={<ShoppingBag />} label="Product views" value={loading ? '…' : String(productViews)} delta="Product detail visits" />
        <Metric icon={<MousePointer2 />} label="Product clicks" value={loading ? '…' : String(clicks)} delta="External purchase clicks" />
        <Metric icon={<BarChart3 />} label="CTR" value={loading ? '…' : `${ctr.toFixed(1)}%`} delta="Clicks ÷ store views" />
      </div>

      {error && (
        <div className="panel empty">
          <strong>{error}</strong>
        </div>
      )}

      <div className="panel analytics-chart">
        <div className="panel-head">
          <div>
            <h2>Store views</h2>
            <span>Daily traffic</span>
          </div>
          <strong>{views} total</strong>
        </div>

        {events.length === 0 ? (
          <div className="empty">
            <BarChart3 size={28} />
            <h2>No visits yet</h2>
            <p>Share your storefront to start collecting real analytics.</p>
          </div>
        ) : (
          <div className="mini-chart">
            {days.map((day) => (
              <div className="bar-col" key={day.label}>
                <span className="bar-value">{day.value}</span>
                <div
                  className="bar"
                  style={{ height: `${Math.max(6, (day.value / max) * 150)}px` }}
                />
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel top-products">
        <div className="panel-head">
          <h2>Top products</h2>
          <span>Clicks</span>
        </div>

        {top.length === 0 ? (
          <div className="empty">No product clicks in this period.</div>
        ) : (
          <div className="table">
            {top.map((item, index) => (
              <div className="tr" key={item.product.id}>
                <span>{index + 1}</span>
                <div className="product-cell">
                  <div>
                    <strong>{item.product.name}</strong>
                    <small>{item.product.provider || item.product.category || 'Product'}</small>
                  </div>
                </div>
                <span>
                  {item.count} click{item.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SettingsView({
  workspace,
  setWorkspace,
  storefrontPath,
}: {
  workspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
  storefrontPath: string;
}) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(workspace.name);
    setDescription(workspace.description || '');
  }, [workspace.id, workspace.name, workspace.description]);

  async function save() {
    if (name.trim().length < 2) {
      setError('Brand name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('organizations')
      .update({
        name: name.trim(),
        description: description.trim() || null,
      })
      .eq('id', workspace.id)
      .select('id,name,slug,description')
      .single();

    if (updateError) {
      setError(updateError.message);
    } else if (data) {
      setWorkspace(data as Workspace);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    }

    setSaving(false);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your brand and storefront preferences.</p>
        </div>
      </div>

      {error && (
        <div className="panel empty" style={{ color: '#9a2f2f' }}>
          {error}
        </div>
      )}

      <div className="settings-grid">
        <div className="panel setting-card">
          <h2>Brand profile</h2>
          <label>
            Brand name
            <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} />
          </label>
          <label>
            Username
            <input value={workspace.slug} readOnly />
          </label>
          <label>
            Bio
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          </label>
          <button className="primary" onClick={save} disabled={saving} type="button">
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        <div className="panel setting-card">
          <h2>Storefront link</h2>
          <p>Share this link everywhere you want people to discover your products.</p>
          <div className="copy-field">
            <span>
              {typeof window !== 'undefined' ? window.location.origin : ''}
              {storefrontPath}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
