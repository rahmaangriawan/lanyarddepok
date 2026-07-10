<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { CheckCircle2, Edit3, Plus, Search, Trash2, XCircle } from '@lucide/vue';
import { ref, watch } from 'vue';

type Column = { key: string; label: string; type?: string; primary?: boolean };
type Config = {
    title: string;
    singular: string;
    description: string;
    columns: Column[];
    fields: Array<Record<string, unknown>>;
    key: string;
};
type PaginationLink = { url: string | null; label: string; active: boolean };
type PaginatedItems = {
    data: Record<string, unknown>[];
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
};

const props = defineProps<{
    resource: string;
    config: Config;
    items: PaginatedItems;
    filters: { q?: string; type?: string; published?: string };
}>();

const search = ref(props.filters.q || '');

watch(search, (value) => {
    router.get(
        route('cms.index', props.resource),
        { q: value },
        { preserveState: true, replace: true },
    );
});

const valueAt = (item: Record<string, unknown>, key: string) => {
    return key.split('.').reduce<unknown>((value, part) => {
        if (value && typeof value === 'object' && part in value) {
            return (value as Record<string, unknown>)[part];
        }
        return '';
    }, item);
};

const formatValue = (item: Record<string, unknown>, column: Column) => {
    const value = valueAt(item, column.key);

    if (column.type === 'date' && value) {
        return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(String(value)));
    }

    if (column.type === 'bytes' && typeof value === 'number') {
        return `${Math.round(value / 1024)} KB`;
    }

    return value ?? '';
};

const destroyItem = (item: Record<string, unknown>) => {
    if (!confirm(`Hapus ${props.config.singular} ini?`)) {
        return;
    }

    router.delete(route('cms.destroy', [props.resource, item.id]));
};

const toggleItem = (item: Record<string, unknown>) => {
    router.post(route('cms.toggle', [props.resource, item.id]), {}, { preserveScroll: true });
};

const canToggle = props.config.fields.some((field) => field.name === 'published' || field.name === 'approved');
const canEdit = props.resource !== 'media';
</script>

<template>
    <Head :title="config.title" />

    <AuthenticatedLayout>
        <template #eyebrow>
            <p class="text-xs font-extrabold uppercase tracking-normal text-primary">CMS Module</p>
        </template>
        <template #title>{{ config.title }}</template>

        <section class="meridian-card overflow-hidden">
            <div class="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
                <div class="max-w-2xl">
                    <p class="text-xs font-extrabold uppercase tracking-normal text-primary">{{ config.singular }}</p>
                    <h2 class="mt-1 text-2xl font-extrabold text-foreground">{{ config.title }}</h2>
                    <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ config.description }}</p>
                </div>

                <Link class="meridian-btn-primary" :href="route('cms.create', resource)">
                    <Plus :size="18" />
                    Tambah {{ config.singular }}
                </Link>
            </div>

            <div class="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
                <div class="relative w-full md:max-w-md">
                    <Search class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" :size="17" />
                    <input v-model="search" class="meridian-input pl-11" type="search" placeholder="Cari data..." />
                </div>
                <p class="text-sm font-semibold text-muted-foreground">
                    Menampilkan {{ items.from || 0 }}-{{ items.to || 0 }} dari {{ items.total || 0 }} data
                </p>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-[color:var(--dashboard-border)]">
                    <thead class="bg-background">
                        <tr>
                            <th
                                v-for="column in config.columns"
                                :key="column.key"
                                class="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-normal text-muted-foreground"
                            >
                                {{ column.label }}
                            </th>
                            <th class="px-5 py-4 text-right text-xs font-extrabold uppercase tracking-normal text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[color:var(--dashboard-border)] bg-white">
                        <tr v-for="item in items.data" :key="String(item.id)" class="hover:bg-background">
                            <td
                                v-for="column in config.columns"
                                :key="column.key"
                                class="max-w-[320px] px-5 py-4 text-sm"
                                :class="column.primary ? 'font-extrabold text-foreground' : 'font-semibold text-muted-foreground'"
                            >
                                <span v-if="column.type === 'boolean'" class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold" :class="valueAt(item, column.key) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                                    <component :is="valueAt(item, column.key) ? CheckCircle2 : XCircle" :size="14" />
                                    {{ valueAt(item, column.key) ? 'Aktif' : 'Nonaktif' }}
                                </span>
                                <span v-else class="line-clamp-2">{{ formatValue(item, column) }}</span>
                            </td>
                            <td class="px-5 py-4">
                                <div class="flex justify-end gap-2">
                                    <button v-if="canToggle" type="button" class="meridian-btn-secondary min-h-9 px-3 py-2 text-xs" @click="toggleItem(item)">
                                        Toggle
                                    </button>
                                    <Link v-if="canEdit" class="meridian-btn-secondary min-h-9 px-3 py-2 text-xs" :href="route('cms.edit', [resource, item.id])">
                                        <Edit3 :size="15" />
                                    </Link>
                                    <button type="button" class="meridian-btn-secondary min-h-9 px-3 py-2 text-xs" @click="destroyItem(item)">
                                        <Trash2 :size="15" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="!items.data.length" class="p-12 text-center">
                <p class="text-lg font-extrabold text-foreground">Belum ada data</p>
                <p class="mt-2 text-sm text-muted-foreground">Tambahkan {{ config.singular.toLowerCase() }} pertama untuk mulai mengisi modul ini.</p>
            </div>

            <div v-if="items.links?.length > 3" class="flex flex-wrap gap-2 border-t border-border p-5">
                <Link
                    v-for="link in items.links"
                    :key="link.label"
                    class="rounded-full border px-3 py-2 text-sm font-extrabold"
                    :class="link.active ? 'border-primary bg-primary text-white' : 'border-border bg-white text-foreground'"
                    :href="link.url || '#'"
                    v-html="link.label"
                />
            </div>
        </section>
    </AuthenticatedLayout>
</template>
