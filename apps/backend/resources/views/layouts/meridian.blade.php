@php
    $user = auth()->user();
    $resource = request()->route('resource');
    $categoryType = request('type');
    $menuGroups = [
        'Utama' => [
            ['label' => 'Ringkasan', 'href' => route('dashboard'), 'icon' => 'dashboard', 'active' => request()->routeIs('dashboard')],
            ['label' => 'Analitik', 'href' => route('cms.analytics'), 'icon' => 'chart', 'active' => request()->routeIs('cms.analytics')],
            ['label' => 'Portofolio', 'href' => route('cms.index', 'portfolio'), 'icon' => 'file', 'active' => $resource === 'portfolio'],
            ['label' => 'Formulir', 'href' => route('cms.index', 'inquiries'), 'icon' => 'file', 'active' => $resource === 'inquiries'],
        ],
        'Blog' => [
            ['label' => 'Pos', 'href' => route('cms.index', 'posts'), 'icon' => 'file', 'active' => $resource === 'posts'],
            ['label' => 'Kategori Blog', 'href' => route('cms.index', 'categories') . '?type=BLOG', 'icon' => 'file', 'active' => $resource === 'categories' && $categoryType !== 'PRODUCT'],
            ['label' => 'Halaman', 'href' => route('cms.index', 'pages'), 'icon' => 'file', 'active' => $resource === 'pages'],
            ['label' => 'Generator Kota', 'href' => route('cms.index', 'city-pages'), 'icon' => 'chart', 'active' => $resource === 'city-pages'],
            ['label' => 'Komentar', 'href' => route('cms.index', 'comments'), 'icon' => 'file', 'active' => $resource === 'comments'],
        ],
        'Produk' => [
            ['label' => 'All Produk', 'href' => route('cms.index', 'products'), 'icon' => 'product', 'active' => $resource === 'products'],
            ['label' => 'Kategori Produk', 'href' => route('cms.index', 'categories') . '?type=PRODUCT', 'icon' => 'file', 'active' => $resource === 'categories' && $categoryType === 'PRODUCT'],
            ['label' => 'Orders', 'href' => route('cms.index', 'orders'), 'icon' => 'product', 'active' => $resource === 'orders'],
        ],
        'Sistem' => [
            ['label' => 'Media Library', 'href' => route('cms.index', 'media'), 'icon' => 'media', 'active' => $resource === 'media'],
            ['label' => 'CMS Settings', 'href' => route('cms.index', 'settings'), 'icon' => 'settings', 'active' => $resource === 'settings'],
            ['label' => 'Profil Saya', 'href' => route('cms.profile'), 'icon' => 'file', 'active' => request()->routeIs('cms.profile')],
        ],
    ];
@endphp

<!doctype html>
<html lang="id" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@yield('title', 'Dashboard') · Lanyard Depok</title>
    <link rel="icon" type="image/webp" href="/uploads/lanyarddepok-favicon.webp" />
    <link rel="shortcut icon" href="/uploads/lanyarddepok-favicon.webp" />
    <script>
      (function () {
        var color = localStorage.getItem("lanyarddepok-dashboard-primary");
        if (color) document.documentElement.style.setProperty("--meridian-accent", color);
      })();
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="/vendor/meridian/assets/css/style.css" />
    <style>
      :root {
        --meridian-accent: var(--color-primary);
      }
      .badge--primary,
      .button--primary,
      .bg-primary {
        background-color: var(--meridian-accent) !important;
      }
      .sidebar--app .sidebar__content {
        scrollbar-width: none;
        scrollbar-color: transparent transparent;
      }
      .sidebar--app .sidebar__content::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
      .sidebar--app:hover .sidebar__content,
      .sidebar--app:focus-within .sidebar__content {
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--color-foreground) 22%, transparent) transparent;
      }
      .sidebar--app:hover .sidebar__content::-webkit-scrollbar,
      .sidebar--app:focus-within .sidebar__content::-webkit-scrollbar {
        width: 6px;
      }
      .sidebar--app:hover .sidebar__content::-webkit-scrollbar-thumb,
      .sidebar--app:focus-within .sidebar__content::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: color-mix(in srgb, var(--color-foreground) 22%, transparent);
      }
      .text-primary,
      .sidebar__button.is-active,
      .sidebar__button[aria-current="page"] {
        color: var(--meridian-accent) !important;
      }
      .sidebar__button.is-active,
      .sidebar__button[aria-current="page"] {
        background: color-mix(in srgb, var(--meridian-accent) 12%, transparent);
        box-shadow: none !important;
      }
      .sidebar__button:hover {
        color: var(--meridian-accent) !important;
        background: color-mix(in srgb, var(--meridian-accent) 7%, transparent);
        box-shadow: none !important;
      }
      .theme-color-input {
        width: 2rem;
        height: 2rem;
        border: 0;
        padding: 0;
        background: transparent;
        cursor: pointer;
      }
      .page__header {
        margin-bottom: 1.5rem;
      }
      .page__body {
        display: grid;
        gap: 1.5rem;
      }
      .card__header {
        gap: 1rem;
        padding-top: 1.25rem !important;
        padding-bottom: 1.25rem !important;
      }
      .cms-table-header {
        align-items: flex-end !important;
        row-gap: 1rem;
      }
      .cms-table-header .card__title {
        display: block;
        margin-bottom: .25rem;
      }
      .profile-menu {
        position: relative;
      }
      .profile-menu__panel {
        position: absolute;
        top: calc(100% + .5rem);
        right: 0;
        z-index: 9999;
        min-width: 13rem;
        display: none;
        padding: .5rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: #fff;
        box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, .12);
      }
      .profile-menu.is-open .profile-menu__panel {
        display: block;
      }
      .profile-menu__meta {
        padding: .625rem .75rem .75rem;
        border-bottom: 1px solid var(--color-border);
        margin-bottom: .5rem;
      }
      .profile-menu__item {
        width: 100%;
        justify-content: flex-start;
      }
      .editor-surface {
        min-height: 22rem;
        outline: none;
      }
      .editor-surface img {
        max-width: 100%;
        border-radius: 1rem;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .min-h-32 { min-height: 8rem; }
      .min-h-80 { min-height: 20rem; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
      .text-danger { color: #dc2626; }
      .alert {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: .875rem 1rem;
        font-weight: 600;
      }
      .alert--success {
        border-color: color-mix(in srgb, #16a34a 28%, transparent);
        background: color-mix(in srgb, #16a34a 10%, transparent);
        color: #166534;
      }
      .alert--danger {
        border-color: color-mix(in srgb, #dc2626 28%, transparent);
        background: color-mix(in srgb, #dc2626 10%, transparent);
        color: #991b1b;
      }
      .hidden { display: none !important; }
      .auth-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background: var(--color-background);
      }
      .dashboard-brand-logo {
        display: block;
        width: 8.75rem;
        height: auto;
        object-fit: contain;
      }
      .dashboard-brand-logo--icon {
        display: none;
        width: 2rem;
        height: 2rem;
      }
      .app-shell.is-sidebar-collapsed .dashboard-brand-logo--full,
      .sidebar[data-collapsed] .dashboard-brand-logo--full {
        display: none;
      }
      .app-shell.is-sidebar-collapsed .dashboard-brand-logo--icon,
      .sidebar[data-collapsed] .dashboard-brand-logo--icon {
        display: block;
      }
    </style>
    @stack('head')
  </head>
  <body>
    <div class="app-shell" data-stisla-app-shell data-stisla-app-shell-auto-collapse="true">
      <aside class="sidebar sidebar--lg sidebar--app" data-stisla-sidebar>
        <header class="sidebar__header">
          <a class="sidebar__brand" href="{{ route('dashboard') }}">
            <img class="dashboard-brand-logo dashboard-brand-logo--full" src="/uploads/lanyarddepok-logo-header.webp" alt="Lanyard Depok" />
            <img class="dashboard-brand-logo dashboard-brand-logo--icon" src="/uploads/lanyarddepok-favicon.webp" alt="Lanyard Depok" />
          </a>
        </header>

        <div class="sidebar__search">
          <div class="input-group input-group--search">
            <span class="input-group__text">@include('cms.partials.icon', ['name' => 'search'])</span>
            <input type="search" class="input" placeholder="Search content..." aria-label="Search" />
          </div>
        </div>

        <div class="sidebar__content">
          <nav class="sidebar__menu">
            @foreach($menuGroups as $group => $items)
              <div class="sidebar__group">
                <span class="sidebar__group-title">{{ $group }}</span>
                <ul class="sidebar__list">
                  @foreach($items as $item)
                    <li class="sidebar__item">
                      <a class="sidebar__button {{ $item['active'] ? 'is-active' : '' }}" href="{{ $item['href'] }}" @if($item['active']) aria-current="page" @endif>
                        @include('cms.partials.icon', ['name' => $item['icon']])
                        <span>{{ $item['label'] }}</span>
                      </a>
                    </li>
                  @endforeach
                </ul>
              </div>
            @endforeach
          </nav>
        </div>
      </aside>

      <main class="app-shell__main">
        <header class="navbar">
          <button type="button" class="button button--icon button--ghost" data-stisla-app-shell-toggle="auto" aria-label="Toggle sidebar">
            @include('cms.partials.icon', ['name' => 'menu'])
          </button>

          <div class="input-group input-group--search hidden lg:flex">
            <span class="input-group__text">@include('cms.partials.icon', ['name' => 'search'])</span>
            <input type="search" class="input" placeholder="Search content..." aria-label="Search content" />
          </div>

          <div class="ms-auto flex items-center gap-2">
            <div class="profile-menu" data-profile-menu>
              <button type="button" class="button button--light" data-profile-menu-toggle aria-expanded="false">
                <span class="avatar avatar--sm avatar--circle" data-stisla-avatar>
                  <span class="avatar__fallback">{{ strtoupper(substr($user?->name ?? 'AD', 0, 2)) }}</span>
                </span>
                <span class="hidden sm:inline font-medium">{{ $user?->name }}</span>
              </button>
              <div class="profile-menu__panel">
                <div class="profile-menu__meta">
                  <div class="font-bold">{{ $user?->name ?? 'Admin' }}</div>
                  <div class="text-xs text-muted-foreground">{{ $user?->email }}</div>
                </div>
                <a class="button button--ghost profile-menu__item" href="{{ route('cms.profile') }}">Profil Saya</a>
                <form method="post" action="{{ route('logout') }}">
                  @csrf
                  <button class="button button--ghost profile-menu__item text-danger" type="submit">Logout</button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <div class="page content">
          <div class="content__container">
            @if(session('success'))
              <div class="alert alert--success mb-4">{{ session('success') }}</div>
            @endif
            @if(session('error'))
              <div class="alert alert--danger mb-4">{{ session('error') }}</div>
            @endif
            @if($errors->any())
              <div class="alert alert--danger mb-4">
                <strong>Validasi gagal.</strong>
                <ul class="mt-2">
                  @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                  @endforeach
                </ul>
              </div>
            @endif

            @yield('content')
          </div>
        </div>
      </main>
    </div>

    <script src="/vendor/meridian/assets/js/app-shell.js"></script>
    <script src="/vendor/meridian/assets/js/table-select.js"></script>
    <script>
      (function () {
        var menu = document.querySelector('[data-profile-menu]');
        var toggle = document.querySelector('[data-profile-menu-toggle]');
        if (!menu || !toggle) return;

        toggle.addEventListener('click', function () {
          var isOpen = menu.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', function (event) {
          if (menu.contains(event.target)) return;
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      })();
    </script>
    @stack('scripts')
  </body>
</html>
