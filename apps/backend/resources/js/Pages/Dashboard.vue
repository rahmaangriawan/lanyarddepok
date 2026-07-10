<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ArrowUpRight, BookOpen, Inbox, Plus } from '@lucide/vue';

type Stat = { label: string; value: number; caption: string };
type RecentPost = { id: number; title: string; slug: string; published: boolean; createdAt?: string };
type RecentInquiry = { id: number; name: string; email?: string; phone?: string; createdAt?: string };

defineProps<{
    stats: Stat[];
    recentPosts: RecentPost[];
    recentInquiries: RecentInquiry[];
    moduleCounts: Record<string, number>;
}>();
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #eyebrow>
            <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Kawruh CMS</p>
        </template>
        <template #title>Dashboard</template>

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article v-for="stat in stats" :key="stat.label" class="meridian-card p-5">
                <p class="text-sm font-extrabold text-muted-foreground">{{ stat.label }}</p>
                <p class="mt-3 text-4xl font-extrabold text-foreground">{{ stat.value }}</p>
                <p class="mt-2 text-sm text-muted-foreground">{{ stat.caption }}</p>
            </article>
        </div>

        <div class="mt-6 grid gap-6 xl:grid-cols-[1fr_0.78fr]">
            <section class="meridian-card overflow-hidden">
                <div class="flex items-center justify-between border-b border-border p-5">
                    <div>
                        <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Konten terbaru</p>
                        <h2 class="mt-1 text-xl font-extrabold text-foreground">Blog Posts</h2>
                    </div>
                    <Link class="meridian-btn-secondary" :href="route('cms.create', 'posts')">
                        <Plus :size="17" />
                        Artikel
                    </Link>
                </div>

                <div class="divide-y divide-[color:var(--dashboard-border)]">
                    <Link
                        v-for="post in recentPosts"
                        :key="post.id"
                        class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-background"
                        :href="route('cms.edit', ['posts', post.id])"
                    >
                        <div class="min-w-0">
                            <p class="truncate text-sm font-extrabold text-foreground">{{ post.title }}</p>
                            <p class="truncate text-xs text-muted-foreground">/{{ post.slug }}</p>
                        </div>
                        <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="post.published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                            {{ post.published ? 'Published' : 'Draft' }}
                        </span>
                    </Link>
                    <div v-if="!recentPosts.length" class="p-8 text-center text-sm font-semibold text-muted-foreground">
                        Belum ada artikel.
                    </div>
                </div>
            </section>

            <section class="meridian-card overflow-hidden">
                <div class="flex items-center justify-between border-b border-border p-5">
                    <div>
                        <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Customer</p>
                        <h2 class="mt-1 text-xl font-extrabold text-foreground">Inquiry Terbaru</h2>
                    </div>
                    <Link class="meridian-btn-secondary" :href="route('cms.index', 'inquiries')">
                        Lihat
                        <ArrowUpRight :size="17" />
                    </Link>
                </div>
                <div class="divide-y divide-[color:var(--dashboard-border)]">
                    <Link
                        v-for="inquiry in recentInquiries"
                        :key="inquiry.id"
                        class="flex items-center gap-4 px-5 py-4 hover:bg-background"
                        :href="route('cms.edit', ['inquiries', inquiry.id])"
                    >
                        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Inbox :size="18" />
                        </span>
                        <div class="min-w-0">
                            <p class="truncate text-sm font-extrabold text-foreground">{{ inquiry.name }}</p>
                            <p class="truncate text-xs text-muted-foreground">{{ inquiry.email || inquiry.phone || 'Tanpa kontak' }}</p>
                        </div>
                    </Link>
                    <div v-if="!recentInquiries.length" class="p-8 text-center text-sm font-semibold text-muted-foreground">
                        Belum ada inquiry.
                    </div>
                </div>
            </section>
        </div>

        <section class="meridian-card mt-6 p-5">
            <div class="mb-4 flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen :size="18" />
                </span>
                <div>
                    <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Modul CMS</p>
                    <h2 class="text-xl font-extrabold text-foreground">Shortcut Operasional</h2>
                </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                    v-for="(count, key) in moduleCounts"
                    :key="key"
                    class="rounded-2xl border border-border bg-white p-4 hover:border-primary"
                    :href="route('cms.index', String(key).replace('cityPages', 'city-pages'))"
                >
                    <p class="text-sm font-extrabold capitalize text-foreground">{{ String(key).replace(/([A-Z])/g, ' $1') }}</p>
                    <p class="mt-2 text-2xl font-extrabold text-primary">{{ count }}</p>
                </Link>
            </div>
        </section>
    </AuthenticatedLayout>
</template>
