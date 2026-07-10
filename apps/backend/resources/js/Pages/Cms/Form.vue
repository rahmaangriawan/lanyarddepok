<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import InputError from '@/Components/InputError.vue';
import RichEditor from '@/Components/RichEditor.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ArrowLeft, Save, UploadCloud } from '@lucide/vue';

type FieldOption = { value: string | number; label: string };
type Field = {
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'richtext' | 'boolean' | 'number' | 'select' | 'file';
    required?: boolean;
    options?: FieldOption[];
    optionsKey?: string;
};
type Config = {
    title: string;
    singular: string;
    description: string;
    fields: Field[];
};

const props = defineProps<{
    resource: string;
    config: Config;
    item: Record<string, unknown> | null;
    options: Record<string, FieldOption[]>;
}>();

type DynamicForm = Record<string, any>;

const defaults = props.config.fields.reduce<DynamicForm>((values, field) => {
    if (field.type === 'boolean') {
        values[field.name] = Boolean(props.item?.[field.name]);
    } else if (field.type === 'file') {
        values[field.name] = null;
    } else {
        values[field.name] = props.item?.[field.name] ?? '';
    }
    return values;
}, {});

const form = useForm<DynamicForm>(defaults);
const editing = Boolean(props.item);

const fieldOptions = (field: Field) => {
    if (field.optionsKey) {
        return props.options[field.optionsKey] || [];
    }

    return field.options || [];
};

const submit = () => {
    if (editing) {
        form.patch(route('cms.update', [props.resource, props.item?.id]));
        return;
    }

    form.post(route('cms.store', props.resource), { forceFormData: props.resource === 'media' });
};

const setFile = (field: Field, event: Event) => {
    form[field.name] = (event.target as HTMLInputElement).files?.[0] || null;
};
</script>

<template>
    <Head :title="`${editing ? 'Edit' : 'Tambah'} ${config.singular}`" />

    <AuthenticatedLayout>
        <template #eyebrow>
            <p class="text-xs font-extrabold uppercase tracking-normal text-primary">{{ config.title }}</p>
        </template>
        <template #title>{{ editing ? 'Edit' : 'Tambah' }} {{ config.singular }}</template>

        <form class="grid gap-6 xl:grid-cols-[1fr_360px]" @submit.prevent="submit">
            <section class="meridian-card p-5 sm:p-6">
                <div class="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="text-2xl font-extrabold text-foreground">{{ editing ? 'Edit data' : 'Data baru' }}</h2>
                        <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ config.description }}</p>
                    </div>
                    <Link class="meridian-btn-secondary" :href="route('cms.index', resource)">
                        <ArrowLeft :size="17" />
                        Kembali
                    </Link>
                </div>

                <div class="grid gap-5">
                    <div v-for="field in config.fields" :key="field.name">
                        <label :for="field.name" class="mb-2 block text-sm font-extrabold text-foreground">
                            {{ field.label }}
                            <span v-if="field.required" class="text-primary">*</span>
                        </label>

                        <input
                            v-if="['text', 'email', 'number'].includes(field.type)"
                            :id="field.name"
                            v-model="form[field.name]"
                            :type="field.type"
                            class="meridian-input"
                        />

                        <textarea
                            v-else-if="field.type === 'textarea'"
                            :id="field.name"
                            v-model="form[field.name]"
                            class="meridian-input min-h-28"
                        />

                        <RichEditor
                            v-else-if="field.type === 'richtext'"
                            v-model="form[field.name]"
                        />

                        <select
                            v-else-if="field.type === 'select'"
                            :id="field.name"
                            v-model="form[field.name]"
                            class="meridian-input"
                        >
                            <option value="">Pilih {{ field.label }}</option>
                            <option v-for="option in fieldOptions(field)" :key="String(option.value)" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>

                        <label
                            v-else-if="field.type === 'boolean'"
                            class="inline-flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-extrabold text-foreground"
                        >
                            <input v-model="form[field.name]" type="checkbox" class="rounded border-border text-primary focus:ring-primary" />
                            {{ field.label }}
                        </label>

                        <label
                            v-else-if="field.type === 'file'"
                            :for="field.name"
                            class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-8 text-center"
                        >
                            <UploadCloud class="text-primary" :size="32" />
                            <span class="mt-3 text-sm font-extrabold text-foreground">Pilih file untuk upload</span>
                            <span class="mt-1 text-xs text-muted-foreground">Maksimal 5MB</span>
                            <input :id="field.name" type="file" class="sr-only" @input="setFile(field, $event)" />
                        </label>

                        <InputError class="mt-2" :message="form.errors[field.name]" />
                    </div>
                </div>
            </section>

            <aside class="space-y-5">
                <section class="meridian-card p-5">
                    <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Publish</p>
                    <h2 class="mt-2 text-xl font-extrabold text-foreground">Simpan Perubahan</h2>
                    <p class="mt-2 text-sm leading-6 text-muted-foreground">
                        Data akan langsung tersimpan ke database existing `lanyarddepok`.
                    </p>
                    <button class="meridian-btn-primary mt-5 w-full" type="submit" :disabled="form.processing" :class="{ 'opacity-60': form.processing }">
                        <Save :size="18" />
                        {{ form.processing ? 'Menyimpan...' : 'Simpan' }}
                    </button>
                </section>

                <section v-if="item" class="meridian-card p-5">
                    <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Record</p>
                    <dl class="mt-3 space-y-3 text-sm">
                        <div class="flex justify-between gap-4">
                            <dt class="font-bold text-muted-foreground">ID</dt>
                            <dd class="font-extrabold text-foreground">{{ item.id }}</dd>
                        </div>
                        <div v-if="item.createdAt" class="flex justify-between gap-4">
                            <dt class="font-bold text-muted-foreground">Dibuat</dt>
                            <dd class="text-right font-extrabold text-foreground">{{ new Date(String(item.createdAt)).toLocaleDateString('id-ID') }}</dd>
                        </div>
                    </dl>
                </section>
            </aside>
        </form>
    </AuthenticatedLayout>
</template>
