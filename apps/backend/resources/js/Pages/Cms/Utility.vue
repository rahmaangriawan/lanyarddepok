<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { Settings } from '@lucide/vue';

defineProps<{
    title: string;
    eyebrow: string;
    description: string;
    cards: Array<{ label: string; value: string }>;
}>();
</script>

<template>
    <Head :title="title" />

    <AuthenticatedLayout>
        <template #eyebrow>
            <p class="text-xs font-extrabold uppercase tracking-normal text-primary">{{ eyebrow }}</p>
        </template>
        <template #title>{{ title }}</template>

        <section class="card">
            <div class="card__header">
                <div>
                    <span class="card__title">{{ title }}</span>
                    <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{{ description }}</p>
                </div>
                <Link class="meridian-btn-secondary" :href="route('cms.index', 'settings')">
                    <Settings :size="17" />
                    Buka Settings
                </Link>
            </div>
            <div class="card__body">
                <div class="grid gap-4 md:grid-cols-3">
                    <article v-for="card in cards" :key="card.label" class="rounded-2xl border border-border bg-background p-5">
                        <p class="text-xs font-extrabold uppercase tracking-normal text-primary">{{ card.label }}</p>
                        <p class="mt-3 break-all text-lg font-extrabold text-foreground">{{ card.value }}</p>
                    </article>
                </div>
            </div>
        </section>
    </AuthenticatedLayout>
</template>
