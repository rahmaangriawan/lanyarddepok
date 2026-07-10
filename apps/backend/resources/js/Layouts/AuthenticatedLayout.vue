<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import {
    BarChart3,
    BookOpen,
    BriefcaseBusiness,
    ChevronDown,
    FileText,
    FolderTree,
    Image,
    Inbox,
    LayoutDashboard,
    LogOut,
    Mail,
    MapPin,
    Menu,
    MessageSquare,
    NotebookPen,
    Package,
    Search,
    Settings,
    ShoppingBag,
    Tag,
    User,
    X,
} from '@lucide/vue';

type NavItem = {
    label: string;
    href: string;
    resource?: string;
    active?: string;
    icon: any;
};

const page = usePage();
const sidebarOpen = ref(false);
const userMenuOpen = ref(false);
const productOpen = ref(true);
const blogOpen = ref(true);
const themeColor = ref('#6f4f43');

const user = computed(() => page.props.auth?.user);
const flash = computed(() => page.props.flash as { success?: string; error?: string } | undefined);
const currentUrl = computed(() => page.url || '');

const mainItems: NavItem[] = [
    { label: 'Ringkasan', href: route('dashboard'), active: 'dashboard', icon: LayoutDashboard },
    { label: 'Analitik', href: '/kawruh/analytics', icon: BarChart3 },
    { label: 'Portofolio', href: route('cms.index', 'portfolio'), resource: 'portfolio', icon: BriefcaseBusiness },
    { label: 'Formulir', href: route('cms.index', 'inquiries'), resource: 'inquiries', icon: Mail },
];

const productItems: NavItem[] = [
    { label: 'All Produk', href: route('cms.index', 'products'), resource: 'products', icon: ShoppingBag },
    { label: 'Kategori Produk', href: `${route('cms.index', 'categories')}?type=PRODUCT`, resource: 'categories', icon: Tag },
    { label: 'Orders', href: route('cms.index', 'orders'), resource: 'orders', icon: Package },
];

const blogItems: NavItem[] = [
    { label: 'Pos', href: route('cms.index', 'posts'), resource: 'posts', icon: FileText },
    { label: 'Kategori Blog', href: `${route('cms.index', 'categories')}?type=BLOG`, resource: 'categories', icon: Tag },
    { label: 'Halaman', href: route('cms.index', 'pages'), resource: 'pages', icon: BookOpen },
    { label: 'Generator Kota', href: route('cms.index', 'city-pages'), resource: 'city-pages', icon: MapPin },
    { label: 'Komentar', href: route('cms.index', 'comments'), resource: 'comments', icon: MessageSquare },
];

const footerItems: NavItem[] = [
    { label: 'Media Library', href: route('cms.index', 'media'), resource: 'media', icon: Image },
    { label: 'CMS Settings', href: route('cms.index', 'settings'), resource: 'settings', icon: Settings },
    { label: 'Profil Saya', href: route('profile.edit'), active: 'profile.*', icon: User },
];

const isActive = (item: NavItem) => {
    if (item.resource === 'categories' && item.href.includes('?type=')) {
        return currentUrl.value === new URL(item.href, window.location.origin).pathname + new URL(item.href, window.location.origin).search;
    }

    if (item.resource) {
        return route().current('cms.*') && route().params.resource === item.resource;
    }

    if (item.active) {
        return route().current(item.active);
    }

    return false;
};

const isProductActive = computed(() => productItems.some(isActive));
const isBlogActive = computed(() => blogItems.some(isActive));

const applyThemeColor = (color: string) => {
    themeColor.value = color;
    document.documentElement.style.setProperty('--dashboard-primary', color);
    document.documentElement.style.setProperty('--dashboard-primary-strong', color);
    localStorage.setItem('lanyarddepok-dashboard-primary', color);
};

const applyThemeColorFromEvent = (event: Event) => {
    applyThemeColor((event.target as HTMLInputElement).value);
};

onMounted(() => {
    const saved = localStorage.getItem('lanyarddepok-dashboard-primary');
    if (saved) {
        applyThemeColor(saved);
    }
});

const logout = () => router.post(route('logout'));
</script>

<template>
    <div
        class="app-shell"
        :class="{ 'is-sidebar-visible': sidebarOpen }"
        data-stisla-app-shell
        data-stisla-app-shell-auto-collapse="true"
    >
        <aside class="sidebar sidebar--lg sidebar--app" data-stisla-sidebar>
            <header class="sidebar__header">
                <Link class="sidebar__brand" :href="route('dashboard')" @click="sidebarOpen = false">
                    <span class="meridian-brand-mark">LD</span>
                    <span>Lanyard Depok</span>
                </Link>
                <button class="btn btn-icon btn-ghost lg:hidden" type="button" @click="sidebarOpen = false" aria-label="Tutup sidebar">
                    <X :size="18" />
                </button>
            </header>

            <div class="sidebar__search">
                <div class="input-group input-group--search">
                    <span class="input-group__text"><Search :size="16" /></span>
                    <input type="search" class="input" placeholder="Search content..." aria-label="Search dashboard" />
                </div>
            </div>

            <div class="sidebar__content">
                <nav class="sidebar__menu">
                    <div class="sidebar__group">
                        <span class="sidebar__group-title">Utama</span>
                        <ul class="sidebar__list">
                            <li v-for="item in mainItems" :key="item.label" class="sidebar__item">
                                <Link class="sidebar__button" :class="{ 'is-active': isActive(item) }" :href="item.href" @click="sidebarOpen = false">
                                    <component :is="item.icon" :size="18" />
                                    <span>{{ item.label }}</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div class="sidebar__group">
                        <span class="sidebar__group-title">Commerce</span>
                        <ul class="sidebar__list">
                            <li class="sidebar__item" :data-state="productOpen ? 'open' : 'closed'">
                                <button class="sidebar__button w-full" :class="{ 'is-active': isProductActive }" type="button" @click="productOpen = !productOpen">
                                    <ShoppingBag :size="18" />
                                    <span>Produk</span>
                                </button>
                                <button class="sidebar__item-action" type="button" @click="productOpen = !productOpen" aria-label="Toggle produk">
                                    <span class="sidebar__caret" :class="{ 'rotate-180': productOpen }"></span>
                                </button>
                                <div v-show="productOpen" class="sidebar__submenu">
                                    <ul class="sidebar__list">
                                        <li v-for="item in productItems" :key="item.label" class="sidebar__item">
                                            <Link class="sidebar__button" :class="{ 'is-active': isActive(item) }" :href="item.href" @click="sidebarOpen = false">
                                                <component :is="item.icon" :size="16" />
                                                <span>{{ item.label }}</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="sidebar__group">
                        <span class="sidebar__group-title">Content</span>
                        <ul class="sidebar__list">
                            <li class="sidebar__item" :data-state="blogOpen ? 'open' : 'closed'">
                                <button class="sidebar__button w-full" :class="{ 'is-active': isBlogActive }" type="button" @click="blogOpen = !blogOpen">
                                    <NotebookPen :size="18" />
                                    <span>Blog</span>
                                </button>
                                <button class="sidebar__item-action" type="button" @click="blogOpen = !blogOpen" aria-label="Toggle blog">
                                    <span class="sidebar__caret" :class="{ 'rotate-180': blogOpen }"></span>
                                </button>
                                <div v-show="blogOpen" class="sidebar__submenu">
                                    <ul class="sidebar__list">
                                        <li v-for="item in blogItems" :key="item.label" class="sidebar__item">
                                            <Link class="sidebar__button" :class="{ 'is-active': isActive(item) }" :href="item.href" @click="sidebarOpen = false">
                                                <component :is="item.icon" :size="16" />
                                                <span>{{ item.label }}</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            <footer class="sidebar__footer">
                <ul class="sidebar__list">
                    <li v-for="item in footerItems" :key="item.label" class="sidebar__item">
                        <Link class="sidebar__button" :class="{ 'is-active': isActive(item) }" :href="item.href" @click="sidebarOpen = false">
                            <component :is="item.icon" :size="18" />
                            <span>{{ item.label }}</span>
                        </Link>
                    </li>
                </ul>
            </footer>
        </aside>

        <main class="app-shell__main">
            <header class="navbar">
                <button
                    type="button"
                    class="btn btn-icon btn-ghost"
                    data-stisla-app-shell-toggle="auto"
                    aria-label="Toggle sidebar"
                    @click="sidebarOpen = !sidebarOpen"
                >
                    <Menu :size="20" />
                </button>

                <div class="navbar__content">
                    <div class="min-w-0">
                        <slot name="eyebrow" />
                        <h1 class="truncate text-lg font-extrabold text-foreground sm:text-xl">
                            <slot name="title">Dashboard</slot>
                        </h1>
                    </div>
                </div>

                <div class="navbar__actions">
                    <label class="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-extrabold text-foreground" title="Warna tema dashboard">
                        <span>Theme</span>
                        <input
                            v-model="themeColor"
                            type="color"
                            class="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                            @input="applyThemeColorFromEvent"
                        />
                    </label>

                    <div class="relative">
                        <button
                            type="button"
                            class="btn btn-light"
                            @click="userMenuOpen = !userMenuOpen"
                        >
                            <span class="avatar avatar--sm avatar--circle">{{ user?.name?.slice(0, 2).toUpperCase() || 'AD' }}</span>
                            <span class="hidden sm:inline font-medium">{{ user?.name }}</span>
                            <ChevronDown :size="16" />
                        </button>

                        <div v-if="userMenuOpen" class="menu absolute right-0 top-full z-50 mt-2 w-60" data-state="open">
                            <div class="menu__group">
                                <h3 class="menu__group-label">{{ user?.name }}</h3>
                                <p class="px-3 pb-2 text-xs text-muted-foreground">{{ user?.email }}</p>
                                <Link class="menu__item" :href="route('profile.edit')">
                                    <User :size="16" />
                                    Profile
                                </Link>
                                <button class="menu__item w-full" type="button" @click="logout">
                                    <LogOut :size="16" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div class="page">
                <div v-if="flash?.success" class="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    {{ flash.success }}
                </div>
                <div v-if="flash?.error" class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                    {{ flash.error }}
                </div>
                <slot />
            </div>
        </main>
    </div>
</template>
