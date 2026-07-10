<template>
    <div class="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
        <div class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
            <div class="grid w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl lg:grid-cols-[1fr_0.9fr]">
                <section class="relative hidden min-h-[620px] overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
                    <div class="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_28%),radial-gradient(circle_at_80%_10%,white,transparent_24%)]" />
                    <div class="relative">
                        <div class="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold">
                            <span class="meridian-brand-mark bg-white text-primary">LD</span>
                            Lanyard Depok CMS
                        </div>
                    </div>
                    <div class="relative max-w-md">
                        <p class="mb-3 text-xs font-extrabold uppercase tracking-normal text-white/70">Dashboard Internal</p>
                        <h1 class="text-5xl font-extrabold leading-tight tracking-normal">
                            Kelola konten, produk, dan inquiry dari satu tempat.
                        </h1>
                        <p class="mt-5 text-base leading-8 text-white/80">
                            Style Meridian dipakai untuk menjaga dashboard tetap rapi, fokus, dan nyaman dipakai setiap hari.
                        </p>
                    </div>
                </section>

                <section class="flex min-h-[620px] items-center justify-center p-6 sm:p-10">
                    <div class="w-full max-w-md">
                        <div class="mb-8 lg:hidden">
                            <div class="inline-flex items-center gap-3 rounded-full border border-border bg-white px-4 py-2 text-sm font-extrabold">
                                <span class="meridian-brand-mark">LD</span>
                                Lanyard Depok CMS
                            </div>
                        </div>
                        <slot />
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>
