<script setup lang="ts">
import Checkbox from '@/Components/Checkbox.vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { LogIn } from '@lucide/vue';

defineProps<{
    canResetPassword?: boolean;
    status?: string;
}>();

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Log in" />

        <div class="mb-8">
            <p class="text-xs font-extrabold uppercase tracking-normal text-primary">Login Dashboard</p>
            <h1 class="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
                Masuk ke Kawruh CMS
            </h1>
            <p class="mt-3 text-sm leading-6 text-muted-foreground">
                Gunakan akun admin untuk mengelola website Lanyard Depok.
            </p>
        </div>

        <div v-if="status" class="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {{ status }}
        </div>

        <form class="space-y-5" @submit.prevent="submit">
            <div>
                <label for="email" class="mb-2 block text-sm font-extrabold text-foreground">Email</label>
                <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="meridian-input"
                    required
                    autofocus
                    autocomplete="username"
                    placeholder="admin@tes.com"
                />
                <InputError class="mt-2" :message="form.errors.email" />
            </div>

            <div>
                <label for="password" class="mb-2 block text-sm font-extrabold text-foreground">Password</label>
                <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="meridian-input"
                    required
                    autocomplete="current-password"
                    placeholder="admin12345"
                />
                <InputError class="mt-2" :message="form.errors.password" />
            </div>

            <label class="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Checkbox name="remember" v-model:checked="form.remember" />
                Ingat saya
            </label>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    v-if="canResetPassword"
                    :href="route('password.request')"
                    class="text-sm font-bold text-primary hover:underline"
                >
                    Lupa password?
                </Link>

                <button class="meridian-btn-primary w-full sm:w-auto" :class="{ 'opacity-60': form.processing }" :disabled="form.processing">
                    <LogIn :size="18" />
                    Masuk Dashboard
                </button>
            </div>
        </form>
    </GuestLayout>
</template>
