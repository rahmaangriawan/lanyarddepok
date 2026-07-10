<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { Bold, Code2, Heading2, Image, Italic, Link as LinkIcon, List, ListOrdered, Pilcrow } from '@lucide/vue';

const model = defineModel<string>({ default: '' });
const editor = ref<HTMLElement | null>(null);
const sourceMode = ref(false);

const syncFromDom = () => {
    if (!editor.value || sourceMode.value) {
        return;
    }

    model.value = editor.value.innerHTML;
};

const command = (name: string, value?: string) => {
    document.execCommand(name, false, value);
    syncFromDom();
};

const block = (tag: string) => command('formatBlock', tag);

const addLink = () => {
    const url = window.prompt('Masukkan URL link');
    if (url) {
        command('createLink', url);
    }
};

const addImage = () => {
    const url = window.prompt('Masukkan URL gambar dari Media Library');
    if (url) {
        command('insertImage', url);
    }
};

watch(
    () => model.value,
    async (value) => {
        if (!editor.value || sourceMode.value || editor.value.innerHTML === value) {
            return;
        }
        await nextTick();
        if (editor.value) {
            editor.value.innerHTML = value || '';
        }
    },
);

onMounted(() => {
    if (editor.value) {
        editor.value.innerHTML = model.value || '';
    }
});
</script>

<template>
    <div class="overflow-hidden rounded-2xl border border-border bg-white">
        <div class="flex flex-wrap items-center gap-2 border-b border-border bg-background p-2">
            <button type="button" class="meridian-editor-btn" title="Paragraph" @click="block('p')">
                <Pilcrow :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Heading" @click="block('h2')">
                <Heading2 :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Bold" @click="command('bold')">
                <Bold :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Italic" @click="command('italic')">
                <Italic :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Bullet list" @click="command('insertUnorderedList')">
                <List :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Numbered list" @click="command('insertOrderedList')">
                <ListOrdered :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Link" @click="addLink">
                <LinkIcon :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn" title="Image" @click="addImage">
                <Image :size="16" />
            </button>
            <button type="button" class="meridian-editor-btn ml-auto" title="HTML" @click="sourceMode = !sourceMode">
                <Code2 :size="16" />
                HTML
            </button>
        </div>

        <textarea
            v-if="sourceMode"
            v-model="model"
            class="min-h-80 w-full border-0 bg-white p-4 font-mono text-sm text-foreground outline-none"
        />
        <div
            v-else
            ref="editor"
            class="prose prose-sm max-w-none min-h-80 bg-white p-4 text-foreground outline-none"
            contenteditable="true"
            @input="syncFromDom"
            @blur="syncFromDom"
        />
    </div>
</template>
