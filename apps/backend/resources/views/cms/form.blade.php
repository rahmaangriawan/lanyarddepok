@extends('layouts.meridian')

@section('title', ($item ? 'Edit ' : 'Tambah ') . $config['singular'])

@php
    $isEdit = (bool) $item;
    $formAction = $isEdit ? route('cms.update', [$resource, $item->id]) : route('cms.store', $resource);
    $sidebarNames = ['published', 'approved', 'createdAt', 'categoryId', 'featuredImage', 'imageUrl', 'logoUrl', 'metaTitle', 'metaDescription'];
    $seoNames = ['metaTitle', 'metaDescription'];
    $generalNames = ['published', 'approved', 'createdAt', 'categoryId', 'featuredImage', 'imageUrl', 'logoUrl'];

    $fieldValue = function (array $field) use ($item, $defaults) {
        $name = $field['name'];
        $default = $defaults[$name] ?? '';
        if (old($name) !== null) {
            return old($name);
        }

        return $item ? data_get($item, $name, $default) : $default;
    };

    $formatValue = function ($value, string $type): string {
        if ($type === 'datetime' && $value) {
            return \Illuminate\Support\Carbon::parse($value)->format('Y-m-d\TH:i');
        }

        return (string) $value;
    };

    $mainFields = collect($config['fields'])->reject(fn ($field) => in_array($field['name'], $sidebarNames, true))->values();
    $generalFields = collect($config['fields'])->filter(fn ($field) => in_array($field['name'], $generalNames, true))->values();
    $seoFields = collect($config['fields'])->filter(fn ($field) => in_array($field['name'], $seoNames, true))->values();
    $titleField = collect($config['fields'])->first(fn ($field) => in_array($field['name'], ['title', 'name'], true));
    $contentField = collect($config['fields'])->firstWhere('type', 'richtext');
    $featuredField = collect($config['fields'])->first(fn ($field) => in_array($field['name'], ['featuredImage', 'imageUrl'], true));
@endphp

@push('head')
  <link rel="stylesheet" href="/vendor/quill/quill.snow.css" />
  <style>
    .editor-tabs {
      display: flex;
      gap: .5rem;
      padding: .75rem;
      border-bottom: 1px solid var(--color-border);
    }
    .editor-tab {
      flex: 1;
      justify-content: center;
    }
    .editor-tab.is-active {
      color: var(--color-foreground);
      border-color: color-mix(in srgb, #2563eb 32%, var(--color-border));
      background: color-mix(in srgb, #2563eb 8%, transparent);
    }
    .editor-panel {
      display: none;
    }
    .editor-panel.is-active {
      display: block;
    }
    [data-editor-form] .form-label {
      display: flex;
      align-items: center;
      gap: .25rem;
      margin-bottom: .5rem;
    }
    [data-editor-form] .form-label + .input,
    [data-editor-form] .form-label + select,
    [data-editor-form] .form-label + textarea,
    [data-editor-form] .form-label + .featured-picker,
    [data-editor-form] .form-label + .quill-editor {
      margin-top: 0;
    }
    .featured-picker {
      display: grid;
      gap: .75rem;
    }
    .featured-preview {
      position: relative;
      aspect-ratio: 16 / 10;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      display: grid;
      place-items: center;
      overflow: hidden;
      background: var(--color-background);
      color: var(--color-muted-foreground);
      cursor: pointer;
      transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
    }
    .featured-preview:hover {
      border-color: color-mix(in srgb, #2563eb 45%, var(--color-border));
      background: color-mix(in srgb, #2563eb 5%, var(--color-background));
      box-shadow: inset 0 0 0 1px color-mix(in srgb, #2563eb 18%, transparent);
    }
    .featured-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .featured-preview__hint {
      display: grid;
      gap: .35rem;
      place-items: center;
      text-align: center;
      font-size: .875rem;
      font-weight: 600;
    }
    .featured-preview__hint small {
      display: block;
      color: var(--color-muted-foreground);
      font-weight: 500;
    }
    .featured-preview__actions {
      position: absolute;
      right: .625rem;
      top: .625rem;
      z-index: 2;
      display: flex;
      gap: .375rem;
    }
    .featured-preview__icon {
      width: 2rem;
      height: 2rem;
      display: grid;
      place-items: center;
      border: 1px solid rgba(15, 23, 42, .1);
      border-radius: 999px;
      background: rgba(255, 255, 255, .92);
      color: var(--color-foreground);
      box-shadow: 0 .5rem 1.2rem rgba(15, 23, 42, .12);
    }
    .featured-preview__icon:hover {
      background: #fff;
      color: #dc2626;
    }
    .featured-url-input {
      display: none !important;
    }
    .content-title-field {
      grid-column: 1 / -1;
    }
    .content-title-input {
      width: 100%;
      min-height: 3.25rem;
      font-size: 1.35rem;
      line-height: 1.35;
      font-weight: 700;
      letter-spacing: 0;
    }
    .button--draft {
      border-color: color-mix(in srgb, #64748b 26%, var(--color-border)) !important;
      background: color-mix(in srgb, #64748b 10%, #fff) !important;
      color: #334155 !important;
    }
    .media-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(15, 23, 42, .45);
    }
    .media-modal.is-open {
      display: flex;
    }
    .media-modal__panel {
      width: min(62rem, 100%);
      max-height: 86vh;
      overflow: auto;
      border-radius: var(--radius-xl);
      background: #fff;
      box-shadow: 0 1.5rem 4rem rgba(15, 23, 42, .22);
    }
    .media-picker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
      gap: .75rem;
    }
    .media-picker-item {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-card);
      text-align: left;
      cursor: pointer;
    }
    .media-picker-item img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      display: block;
      background: var(--color-background);
    }
    .media-upload-dropzone {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 7.5rem;
      margin-bottom: 1rem;
      border: 1.5px dashed color-mix(in srgb, var(--color-primary) 46%, var(--color-border));
      border-radius: var(--radius-xl);
      padding: 1.25rem;
      background: color-mix(in srgb, var(--color-primary) 5%, #fff);
      color: var(--color-foreground);
      text-align: center;
      cursor: pointer;
      transition: border-color .18s ease, background .18s ease, transform .18s ease;
    }
    .media-upload-dropzone:hover,
    .media-upload-dropzone.is-dragging {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 9%, #fff);
      transform: translateY(-1px);
    }
    .media-upload-dropzone.is-uploading {
      cursor: progress;
      opacity: .72;
    }
    .media-upload-dropzone__input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    .media-upload-dropzone__title {
      display: block;
      font-weight: 700;
    }
    .media-upload-dropzone__hint {
      display: block;
      margin-top: .25rem;
      color: var(--color-muted-foreground);
      font-size: .875rem;
    }
    .media-picker-status {
      display: none;
      margin-bottom: .75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: .85rem 1rem;
      color: var(--color-muted-foreground);
      background: var(--color-background);
      font-size: .9rem;
    }
    .media-picker-status.is-visible {
      display: block;
    }
    .media-library-gate {
      display: grid;
      place-items: center;
      margin-top: 1rem;
      margin-bottom: 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      background: var(--color-background);
    }
    .media-library-panel[hidden],
    .media-library-gate[hidden] {
      display: none !important;
    }
    .media-picker-pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }
    .media-picker-pagination__label {
      color: var(--color-muted-foreground);
      font-size: .875rem;
      font-weight: 700;
    }
    .seo-preview {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      background: #fff;
    }
    .seo-preview__title {
      color: #1a0dab;
      font-size: 1.05rem;
      line-height: 1.35;
    }
    .seo-preview__url {
      color: #006621;
      font-size: .8rem;
      margin-top: .25rem;
    }
    .seo-score {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .875rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }
    .seo-score__circle {
      width: 3rem;
      aspect-ratio: 1;
      height: auto;
      flex: 0 0 3rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      line-height: 1;
      background: color-mix(in srgb, #64748b 12%, transparent);
      color: #475569;
      font-weight: 800;
    }
    .seo-score__circle[data-score-level="good"] {
      background: color-mix(in srgb, #16a34a 12%, transparent);
      color: #15803d;
    }
    .seo-score__circle[data-score-level="warning"] {
      background: color-mix(in srgb, #f59e0b 16%, transparent);
      color: #b45309;
    }
    .seo-score__circle[data-score-level="bad"] {
      background: color-mix(in srgb, #dc2626 12%, transparent);
      color: #b91c1c;
    }
    .editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem;
      align-items: center;
      border: 1px solid var(--color-border);
      border-bottom: 0;
      border-top-left-radius: var(--radius-lg);
      border-top-right-radius: var(--radius-lg);
      padding: .65rem .75rem;
      background: #fff;
    }
    .editor-toolbar .ql-formats {
      display: inline-flex;
      align-items: center;
      gap: .3rem;
      margin-right: .45rem;
    }
    .editor-toolbar.ql-toolbar button,
    .editor-toolbar select,
    .editor-toolbar .ql-picker-label {
      min-height: 2rem;
      border: 1px solid transparent;
      border-radius: .55rem;
      background: transparent;
      color: var(--color-foreground);
    }
    .editor-toolbar.ql-toolbar button {
      width: 2rem;
      height: 2rem;
      padding: .35rem;
      display: inline-grid;
      place-items: center;
      line-height: 1;
      float: none;
    }
    .editor-toolbar__label {
      display: inline-grid;
      place-items: center;
      width: 1rem;
      height: 1rem;
      font-size: .85rem;
      line-height: 1;
      font-weight: 700;
    }
    .editor-toolbar.ql-toolbar button svg {
      width: 1rem;
      height: 1rem;
      display: block;
      flex: 0 0 auto;
      overflow: visible;
      float: none;
    }
    .editor-toolbar.ql-toolbar button .ql-stroke {
      stroke: currentColor;
    }
    .editor-toolbar.ql-toolbar button .ql-fill,
    .editor-toolbar.ql-toolbar button .ql-stroke.ql-fill {
      fill: currentColor;
    }
    .editor-toolbar.ql-toolbar button.button svg path {
      fill: currentColor;
    }
    .editor-toolbar select {
      height: 2rem;
      font-size: .85rem;
    }
    .editor-toolbar .ql-picker {
      height: 2rem;
      color: var(--color-foreground);
      font-size: .85rem;
      font-weight: 500;
    }
    .editor-toolbar .ql-picker.ql-header {
      width: 7rem;
    }
    .editor-toolbar .ql-picker-label {
      display: inline-flex;
      align-items: center;
      padding: 0 1.65rem 0 .75rem;
      line-height: 2rem;
    }
    .editor-toolbar .ql-picker-label::before {
      line-height: 2rem;
    }
    .editor-toolbar .ql-picker-label svg {
      right: .45rem;
      width: 1rem;
    }
    .editor-toolbar .ql-picker-options {
      border-color: var(--color-border);
      border-radius: .65rem;
      box-shadow: 0 .75rem 1.75rem rgba(15, 23, 42, .14);
      overflow: hidden;
    }
    .editor-toolbar.ql-toolbar button:hover,
    .editor-toolbar.ql-toolbar button:focus-visible,
    .editor-toolbar.ql-toolbar button.ql-active,
    .editor-toolbar .ql-picker-label:hover,
    .editor-toolbar .ql-picker.ql-expanded .ql-picker-label {
      border-color: var(--color-border);
      background: var(--color-background);
      outline: none;
    }
    .quill-editor {
      height: clamp(34rem, calc(100vh - 22rem), 48rem);
      min-height: 28rem;
    }
    .ql-toolbar.ql-snow,
    .ql-container.ql-snow {
      border-color: var(--color-border);
    }
    .ql-toolbar.ql-snow {
      border-top-left-radius: var(--radius-lg);
      border-top-right-radius: var(--radius-lg);
    }
    .ql-container.ql-snow {
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      font-family: inherit;
      font-size: 1rem;
    }
    .ql-editor {
      line-height: 1.72;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    .ql-editor p {
      margin-bottom: 1rem;
    }
    .ql-editor h2,
    .ql-editor h3 {
      margin: 1.35rem 0 .7rem;
      line-height: 1.25;
      font-weight: 700;
    }
    .ql-editor ul,
    .ql-editor ol {
      margin: .875rem 0 1.125rem;
      padding-left: 1.4rem;
    }
    .ql-editor li {
      margin: .25rem 0;
      padding-left: .2rem;
    }
    .ql-editor table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 1.25rem;
      font-size: .95rem;
    }
    .ql-editor th,
    .ql-editor td {
      border: 1px solid var(--color-border);
      padding: .625rem .75rem;
      vertical-align: top;
    }
    .ql-editor th {
      background: var(--color-background);
      font-weight: 700;
    }
    .editor-panel textarea.input {
      padding: 1rem 1.05rem;
      line-height: 1.65;
    }
    .editor-popover {
      position: fixed;
      z-index: 10001;
      display: none;
      max-width: 24rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: .5rem;
      background: #fff;
      box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, .16);
    }
    .editor-popover.is-open {
      display: block;
    }
    .editor-modal {
      position: fixed;
      inset: 0;
      z-index: 10002;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(15, 23, 42, .45);
    }
    .editor-modal.is-open {
      display: flex;
    }
    .editor-modal__panel {
      width: min(38rem, 100%);
      max-height: 86vh;
      overflow: auto;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      background: #fff;
      box-shadow: 0 1.5rem 4rem rgba(15, 23, 42, .22);
    }
    .raw-html-input {
      min-height: 28rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: .9rem;
    }
    .table-grid {
      display: grid;
      grid-template-columns: repeat(6, 1.45rem);
      gap: .25rem;
      padding: .5rem;
    }
    .table-grid__cell {
      width: 1.45rem;
      height: 1.45rem;
      border: 1px solid var(--color-border);
      border-radius: .25rem;
      background: var(--color-card);
      cursor: pointer;
    }
    .table-grid__cell.is-active {
      border-color: #2563eb;
      background: color-mix(in srgb, #2563eb 14%, #fff);
    }
    .table-context-menu {
      position: fixed;
      z-index: 10003;
      display: none;
      min-width: 13.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: .45rem;
      background: #fff;
      box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, .16);
    }
    .table-context-menu.is-open {
      display: grid;
      gap: .2rem;
    }
    .table-context-menu button {
      width: 100%;
      border: 0;
      border-radius: .55rem;
      padding: .55rem .7rem;
      background: transparent;
      color: var(--color-foreground);
      font: inherit;
      font-size: .875rem;
      text-align: left;
      cursor: pointer;
    }
    .table-context-menu button:hover,
    .table-context-menu button:focus-visible {
      background: var(--color-background);
      outline: none;
    }
    .table-context-menu__divider {
      height: 1px;
      margin: .25rem .2rem;
      background: var(--color-border);
    }
    .link-option-grid {
      display: grid;
      gap: .625rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @media (max-width: 768px) {
      .quill-editor {
        height: 34rem;
      }
      .link-option-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">{{ $isEdit ? 'Edit' : 'Tambah' }} {{ $config['singular'] }}</h1>
      <p class="page__description">{{ $config['description'] }}</p>
    </div>
    <div class="page__actions">
      <a class="button button--outline button--neutral" href="{{ route('cms.index', $resource) }}">Kembali</a>
    </div>
  </header>

  <div class="page__body">
    <form class="grid grid-cols-12 gap-4" method="post" action="{{ $formAction }}" enctype="multipart/form-data" data-editor-form>
      @csrf
      @if($isEdit)
        @method('PATCH')
      @endif

      <section class="page__section col-span-12 xl:col-span-8">
  <div class="card">
    <div class="card__body">
            <div class="grid grid-cols-12 gap-4">
              @foreach($mainFields as $field)
                @php
                    $name = $field['name'];
                    $type = $field['type'];
                    $value = $formatValue($fieldValue($field), $type);
                    $fieldOptions = $field['options'] ?? ($options[$field['optionsKey'] ?? ''] ?? []);
                    $wide = in_array($type, ['textarea', 'richtext', 'file'], true);
                    $isTitleField = $type === 'text' && in_array($name, ['title', 'name'], true);
                @endphp
                <div class="{{ $wide || $isTitleField ? 'col-span-12' : 'col-span-12 md:col-span-6' }} {{ $isTitleField ? 'content-title-field' : '' }}">
                  <label class="form-label" for="{{ $name }}">
                    {{ $field['label'] }}
                    @if(!empty($field['required'])) <span class="text-primary">*</span> @endif
                  </label>

                  @if(in_array($type, ['text', 'email', 'number', 'datetime'], true))
                    @if($name === 'slug' && $item)
                      <div class="flex items-center gap-2">
                        <input id="{{ $name }}" class="input min-w-0 flex-1 {{ $isTitleField ? 'content-title-input' : '' }}" type="{{ $type === 'datetime' ? 'datetime-local' : $type }}" name="{{ $name }}" value="{{ $value }}" data-field="{{ $name }}" />
                        <a
                          href="{{ $item->published ? '/blog/' . ($value ?: $item->slug) : '/blog/' . ($value ?: $item->slug) . '/?preview=' . $item->id }}"
                          target="_blank"
                          class="button button--outline button--neutral button--sm inline-flex shrink-0 items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          Preview
                        </a>
                      </div>
                    @else
                      <input id="{{ $name }}" class="input {{ $isTitleField ? 'content-title-input' : '' }}" type="{{ $type === 'datetime' ? 'datetime-local' : $type }}" name="{{ $name }}" value="{{ $value }}" data-field="{{ $name }}" />
                    @endif
                  @elseif($type === 'textarea')
                    <textarea id="{{ $name }}" class="input min-h-32" name="{{ $name }}" data-field="{{ $name }}">{{ $value }}</textarea>
                  @elseif($type === 'richtext')
                    <textarea name="{{ $name }}" class="hidden" data-quill-input data-field="{{ $name }}">{{ $value }}</textarea>
                    <div class="editor-toolbar" data-quill-toolbar>
                      <span class="ql-formats">
                        <select class="ql-header" aria-label="Format teks">
                          <option selected value="">Normal</option>
                          <option value="2">H2</option>
                          <option value="3">H3</option>
                        </select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-bold" type="button" aria-label="Bold"><span class="editor-toolbar__label">B</span></button>
                        <button class="ql-italic" type="button" aria-label="Italic"><span class="editor-toolbar__label"><em>I</em></span></button>
                        <button class="ql-underline" type="button" aria-label="Underline"><span class="editor-toolbar__label"><u>U</u></span></button>
                        <button class="ql-blockquote" type="button" aria-label="Quote">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h7v-7H5.07A2.1 2.1 0 0 1 7.17 9zm10 0A5.17 5.17 0 0 0 12 11.17V18h7v-7h-3.93a2.1 2.1 0 0 1 2.1-2z"/></svg>
                        </button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-list" type="button" value="ordered" aria-label="Numbered list">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 7h14v2H7zm0 4h14v2H7zm0 4h14v2H7zM3 7h1V6H2V5h3v4H3zm-1 5.5q0-.625.438-1.062T3.5 11H5v1H3.5v.5H5V15H2v-1h2v-.5H3.5q-.625 0-1.062-.438T2 12.5M2 17h2v-.5H2v-1h3V19H2z"/></svg>
                        </button>
                        <button class="ql-list" type="button" value="bullet" aria-label="Bullet list">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 7h14v2H7zm0 4h14v2H7zm0 4h14v2H7zM3.5 9A1.5 1.5 0 1 1 5 7.5A1.5 1.5 0 0 1 3.5 9m0 4A1.5 1.5 0 1 1 5 11.5A1.5 1.5 0 0 1 3.5 13m0 4A1.5 1.5 0 1 1 5 15.5A1.5 1.5 0 0 1 3.5 17"/></svg>
                        </button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-link" type="button" aria-label="Tambah link">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0m-2.12 3.54a4 4 0 0 1 0-5.66l2.12-2.12a1 1 0 0 1 1.4 1.42L9.9 12.7a2 2 0 1 0 2.83 2.83l2.12-2.12a1 1 0 1 1 1.41 1.41l-2.12 2.12a4 4 0 0 1-5.66 0m5.66-5.66a1 1 0 0 1 0-1.41l2.12-2.12a2 2 0 1 0-2.83-2.83l-2.12 2.12A1 1 0 0 1 9.9 5.63l2.12-2.12a4 4 0 0 1 5.66 5.66l-2.12 2.12a1 1 0 0 1-1.42 0"/></svg>
                        </button>
                        <button class="ql-image" type="button" aria-label="Tambah gambar">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zm2-2h10l-3.15-4.2l-2.35 3.05l-1.65-2.2zm1.5-7.5q.625 0 1.063-.437T10 8t-.437-1.062T8.5 6.5t-1.062.438T7 8t.438 1.063T8.5 9.5"/></svg>
                        </button>
                        <button class="button button--ghost button--sm" type="button" data-table-trigger title="Tambah tabel" aria-label="Tambah tabel">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 4h5V6H4zm7 0h9V6h-9zM4 13h5v-3H4zm7 0h9v-3h-9zm-7 5h5v-3H4zm7 0h9v-3h-9z"/></svg>
                        </button>
                        <button class="button button--ghost button--sm" type="button" data-raw-html-trigger title="Lihat raw HTML" aria-label="Lihat raw HTML">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m8.7 16.6l-4.6-4.6l4.6-4.6L7.3 6L1.3 12l6 6zm6.6 0l4.6-4.6l-4.6-4.6L16.7 6l6 6l-6 6zM10.9 20l-1.9-.6L13.1 4l1.9.6z"/></svg>
                        </button>
                      </span>
                    </div>
                    <div class="quill-editor" data-quill-editor>{!! $value !!}</div>
                  @elseif($type === 'select')
                    <select id="{{ $name }}" class="input" name="{{ $name }}" data-field="{{ $name }}">
                      <option value="">Pilih {{ $field['label'] }}</option>
                      @foreach($fieldOptions as $option)
                        <option value="{{ $option['value'] }}" @selected((string) $value === (string) $option['value'])>{{ $option['label'] }}</option>
                      @endforeach
                    </select>
                  @elseif($type === 'boolean')
                    <input type="hidden" name="{{ $name }}" value="0" />
                    <label class="flex items-center gap-2">
                      <input class="checkbox" type="checkbox" name="{{ $name }}" value="1" @checked((bool) $value) data-field="{{ $name }}" />
                      <span>{{ $field['label'] }}</span>
                    </label>
                  @elseif($type === 'file')
                    <input id="{{ $name }}" class="input" type="file" name="{{ $name }}" />
                  @endif

                  @error($name)
                    <p class="mt-2 text-sm text-danger">{{ $message }}</p>
                  @enderror

                </div>
              @endforeach
            </div>
          </div>
        </div>
      </section>

      <aside class="page__section col-span-12 xl:col-span-4">
        <div class="card">
          <div class="editor-tabs">
            <button class="button button--outline button--neutral editor-tab is-active" type="button" data-editor-tab="general">General</button>
            <button class="button button--outline button--neutral editor-tab" type="button" data-editor-tab="seo">SEO</button>
          </div>

          <div class="card__body editor-panel is-active" data-editor-panel="general">
            <div class="grid gap-4">
              @foreach($generalFields as $field)
                @php
                    $name = $field['name'];
                    $type = $field['type'];
                    $value = $formatValue($fieldValue($field), $type);
                    $fieldOptions = $field['options'] ?? ($options[$field['optionsKey'] ?? ''] ?? []);
                @endphp
                <div>
                  <label class="form-label" for="{{ $name }}">{{ $field['label'] }}</label>
                  @if($type === 'boolean')
                    <input type="hidden" name="{{ $name }}" value="0" />
                    <label class="flex items-center gap-2">
                      <input class="checkbox" type="checkbox" name="{{ $name }}" value="1" @checked((bool) $value) data-field="{{ $name }}" @if($name === 'published') data-publish-toggle @endif />
                      <span @if($name === 'published') data-publish-status-label @endif>{{ (bool) $value ? 'Published' : 'Draft' }}</span>
                    </label>
                  @elseif($type === 'datetime')
                    <input id="{{ $name }}" class="input" type="datetime-local" name="{{ $name }}" value="{{ $value }}" data-field="{{ $name }}" />
                  @elseif($type === 'select')
                    <select id="{{ $name }}" class="input" name="{{ $name }}" data-field="{{ $name }}">
                      <option value="">Pilih {{ $field['label'] }}</option>
                      @foreach($fieldOptions as $option)
                        <option value="{{ $option['value'] }}" @selected((string) $value === (string) $option['value'])>{{ $option['label'] }}</option>
                      @endforeach
                    </select>
                  @else
                    <div class="featured-picker" data-featured-picker>
                      <button class="featured-preview" type="button" data-featured-preview data-open-media aria-label="Pilih gambar dari Media Library">
                        @if($value)
                          <span class="featured-preview__actions">
                            <span class="featured-preview__icon" role="button" tabindex="0" data-clear-media aria-label="Hapus gambar">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20.5c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5V7H5zM8 9h2v10H8zm6 0h2v10h-2zM17.5 4l-1-2h-9l-1 2H3v2h18V4z"/></svg>
                            </span>
                          </span>
                          <img src="{{ $value }}" alt="" />
                        @else
                          <span class="featured-preview__hint">
                            Belum ada gambar
                            <small>Klik untuk pilih dari Media Library</small>
                          </span>
                        @endif
                      </button>
                      <input id="{{ $name }}" class="input featured-url-input" type="text" name="{{ $name }}" value="{{ $value }}" data-field="{{ $name }}" data-media-target />
                    </div>
                  @endif
                </div>
              @endforeach

              <button class="button button--primary w-full" type="submit" data-submit-status>Simpan</button>
            </div>
          </div>

          <div class="card__body editor-panel" data-editor-panel="seo">
            <div class="grid gap-4">
              @foreach($seoFields as $field)
                @php
                    $name = $field['name'];
                    $value = $formatValue($fieldValue($field), $field['type']);
                @endphp
                <div>
                  <label class="form-label" for="{{ $name }}">{{ $field['label'] }}</label>
                  @if($field['type'] === 'textarea')
                    <textarea id="{{ $name }}" class="input min-h-32" name="{{ $name }}" data-field="{{ $name }}">{{ $value }}</textarea>
                  @else
                    <input id="{{ $name }}" class="input" type="text" name="{{ $name }}" value="{{ $value }}" data-field="{{ $name }}" />
                  @endif
                </div>
              @endforeach

              <div class="seo-preview">
                <div class="seo-preview__title" data-seo-preview-title>Meta title preview</div>
                <div class="seo-preview__url">https://lanyarddepok.com/<span data-seo-preview-slug>slug</span></div>
                <p class="mt-2 text-sm text-muted-foreground" data-seo-preview-description>Meta description preview.</p>
              </div>

              <div class="seo-score">
                <div class="seo-score__circle" data-seo-score-circle><span data-seo-score>0</span></div>
                <div>
                  <div class="font-bold">Skor SEO</div>
                  <p class="text-sm text-muted-foreground" data-seo-score-note>Lengkapi judul, kategori, gambar, link, dan meta.</p>
                </div>
              </div>

              <ul class="grid gap-2 text-sm" data-seo-rules></ul>
              <button class="button button--primary w-full" type="submit" data-submit-status>Simpan</button>
            </div>
          </div>
        </div>
      </aside>
    </form>
  </div>

  <div class="media-modal" data-media-modal>
    <div class="media-modal__panel">
      <div class="card mb-0">
        <div class="card__header">
          <div>
            <span class="card__title">Pilih Gambar</span>
            <p class="mt-1 text-sm text-muted-foreground">Pilih dari Media Library, upload gambar baru, lalu gunakan untuk artikel atau featured image.</p>
          </div>
          <button class="button button--outline button--neutral ms-auto" type="button" data-close-media>Tutup</button>
        </div>
        <div class="card__body">
          <label class="media-upload-dropzone" data-media-dropzone>
            <input class="media-upload-dropzone__input" type="file" accept="image/*" data-media-upload />
            <span>
              <span class="media-upload-dropzone__title" data-media-dropzone-title>Klik atau drop gambar di sini</span>
              <span class="media-upload-dropzone__hint">Gambar akan langsung diupload dan dipilih untuk konten.</span>
            </span>
          </label>
          <div class="media-library-gate" data-media-library-gate>
            <button class="button button--outline button--neutral" type="button" data-open-media-library>Buka Media Library</button>
          </div>
          <div class="media-library-panel" data-media-library-panel hidden>
            <div class="media-picker-status" data-media-status>Memuat gambar...</div>
            <div class="media-picker-grid" data-media-grid></div>
            <div class="media-picker-pagination" data-media-pagination>
              <button class="button button--outline button--neutral" type="button" data-media-prev>Sebelumnya</button>
              <span class="media-picker-pagination__label" data-media-page-label>Halaman 1 dari 1</span>
              <button class="button button--outline button--neutral" type="button" data-media-next>Berikutnya</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="editor-modal" data-link-modal>
    <div class="editor-modal__panel">
      <div class="card mb-0">
        <div class="card__header">
          <div>
            <span class="card__title" data-link-modal-title>Tambah Link</span>
            <p class="mt-1 text-sm text-muted-foreground">Jika opsi rel tidak dipilih, link akan tetap dofollow.</p>
          </div>
          <button class="button button--outline button--neutral ms-auto" type="button" data-close-link>Tutup</button>
        </div>
        <div class="card__body grid gap-4">
          <div>
            <label class="form-label" for="editorLinkUrl">URL</label>
            <input id="editorLinkUrl" class="input" type="url" placeholder="https://lanyarddepok.com/produk" data-link-url />
          </div>
          <div class="link-option-grid">
            <label class="flex items-center gap-2">
              <input class="checkbox" type="checkbox" data-link-new-tab />
              <span>Open new tab</span>
            </label>
            <label class="flex items-center gap-2">
              <input class="checkbox" type="checkbox" data-link-nofollow />
              <span>nofollow</span>
            </label>
            <label class="flex items-center gap-2">
              <input class="checkbox" type="checkbox" data-link-sponsored />
              <span>sponsored</span>
            </label>
            <label class="flex items-center gap-2">
              <input class="checkbox" type="checkbox" data-link-ugc />
              <span>ugc</span>
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button class="button button--outline button--neutral" type="button" data-remove-link>Hapus Link</button>
            <button class="button button--primary" type="button" data-apply-link>Terapkan Link</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="editor-modal" data-raw-html-modal>
    <div class="editor-modal__panel">
      <div class="card mb-0">
        <div class="card__header">
          <div>
            <span class="card__title">Raw HTML</span>
            <p class="mt-1 text-sm text-muted-foreground">Paste HTML di sini lalu terapkan ke rich editor.</p>
          </div>
          <button class="button button--outline button--neutral ms-auto" type="button" data-close-raw-html>Tutup</button>
        </div>
        <div class="card__body grid gap-4">
          <textarea class="input raw-html-input" data-raw-html-input></textarea>
          <div class="flex justify-end gap-2">
            <button class="button button--outline button--neutral" type="button" data-close-raw-html>Batal</button>
            <button class="button button--primary" type="button" data-apply-raw-html>Terapkan HTML</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="editor-popover" data-table-popover>
    <div class="px-2 pb-1 text-xs font-bold text-muted-foreground" data-table-size>1 x 1</div>
    <div class="table-grid" data-table-grid>
      @for($row = 1; $row <= 6; $row++)
        @for($col = 1; $col <= 6; $col++)
          <button class="table-grid__cell" type="button" data-table-cell data-row="{{ $row }}" data-col="{{ $col }}" aria-label="{{ $row }} by {{ $col }}"></button>
        @endfor
      @endfor
    </div>
  </div>

  <div class="editor-popover" data-link-popover>
    <div class="flex items-center gap-2">
      <a class="button button--ghost button--sm" href="#" target="_blank" rel="noopener" data-link-preview>Buka</a>
      <button class="button button--outline button--neutral button--sm" type="button" data-edit-hover-link>Edit Link</button>
    </div>
  </div>

  <div class="table-context-menu" data-table-context-menu>
    <button type="button" data-table-action="insert-row-above">Tambah row di atas</button>
    <button type="button" data-table-action="insert-row-below">Tambah row di bawah</button>
    <button type="button" data-table-action="delete-row">Hapus row</button>
    <div class="table-context-menu__divider"></div>
    <button type="button" data-table-action="insert-col-left">Tambah kolom kiri</button>
    <button type="button" data-table-action="insert-col-right">Tambah kolom kanan</button>
    <button type="button" data-table-action="delete-col">Hapus kolom</button>
    <div class="table-context-menu__divider"></div>
    <button type="button" data-table-action="delete-cell">Kosongkan cell</button>
    <button type="button" data-table-action="delete-table">Hapus tabel</button>
  </div>
@endsection

@push('scripts')
  <script src="/vendor/quill/quill.js"></script>
  <script>
    (function () {
      var form = document.querySelector('[data-editor-form]');
      var titleInput = document.querySelector('[data-field="title"], [data-field="name"]');
      var slugInput = document.querySelector('[data-field="slug"]');
      var metaTitleInput = document.querySelector('[data-field="metaTitle"]');
      var metaDescriptionInput = document.querySelector('[data-field="metaDescription"]');
      var categoryInput = document.querySelector('[data-field="categoryId"]');
      var publishToggle = document.querySelector('[data-publish-toggle]');
      var modal = document.querySelector('[data-media-modal]');
      var linkModal = document.querySelector('[data-link-modal]');
      var rawModal = document.querySelector('[data-raw-html-modal]');
      var tablePopover = document.querySelector('[data-table-popover]');
      var tableContextMenu = document.querySelector('[data-table-context-menu]');
      var linkPopover = document.querySelector('[data-link-popover]');
      var activePicker = null;
      var activeQuill = null;
      var savedRange = null;
      var activeLink = null;
      var activeTableCell = null;
      var csrf = document.querySelector('input[name="_token"]')?.value || '';
      var quillInstance = null;
      var mediaPickerEndpoint = @json(route('cms.media-picker'));
      var mediaPickerState = {
        currentPage: 1,
        lastPage: 1,
        loading: false,
        loaded: false,
        perPage: 24
      };

      function slugify(value) {
        return (value || '')
          .toString()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      function escapeHtml(value) {
        var el = document.createElement('div');
        el.textContent = value || '';
        return el.innerHTML;
      }

      function closeEditorPopovers() {
        tablePopover?.classList.remove('is-open');
        tableContextMenu?.classList.remove('is-open');
        linkPopover?.classList.remove('is-open');
      }

      function updatePublishSubmit() {
        if (!publishToggle) return;
        var isPublished = publishToggle.checked;
        document.querySelector('[data-publish-status-label]').textContent = isPublished ? 'Published' : 'Draft';
        document.querySelectorAll('[data-submit-status]').forEach(function (button) {
          button.textContent = isPublished ? 'Publish' : 'Simpan Draf';
          button.classList.toggle('button--primary', isPublished);
          button.classList.toggle('button--draft', !isPublished);
        });
      }

      function syncQuillInputs() {
        document.querySelectorAll('[data-quill-input]').forEach(function (input) {
          var editor = input.parentElement?.querySelector('[data-quill-editor]');
          if (editor && editor.__quill) input.value = editor.__quill.root.innerHTML;
        });
      }

      function setMediaStatus(message, visible) {
        var status = document.querySelector('[data-media-status]');
        if (!status) return;
        status.textContent = message || '';
        status.classList.toggle('is-visible', !!visible);
      }

      function updateMediaPagination() {
        var label = document.querySelector('[data-media-page-label]');
        var prev = document.querySelector('[data-media-prev]');
        var next = document.querySelector('[data-media-next]');
        if (label) label.textContent = 'Halaman ' + mediaPickerState.currentPage + ' dari ' + mediaPickerState.lastPage;
        if (prev) prev.disabled = mediaPickerState.loading || mediaPickerState.currentPage <= 1;
        if (next) next.disabled = mediaPickerState.loading || mediaPickerState.currentPage >= mediaPickerState.lastPage;
      }

      function createMediaButton(media) {
        var item = document.createElement('button');
        var image = document.createElement('img');
        var label = document.createElement('span');
        item.className = 'media-picker-item';
        item.type = 'button';
        item.setAttribute('data-media-url', media.url || '');
        image.src = media.url || '';
        image.alt = '';
        image.loading = 'lazy';
        label.className = 'block p-2 text-xs font-bold line-clamp-2';
        label.textContent = media.filename || media.url || 'Gambar';
        item.append(image, label);
        bindMediaButton(item);
        return item;
      }

      function renderMediaItems(items) {
        var grid = document.querySelector('[data-media-grid]');
        if (!grid) return;
        grid.innerHTML = '';
        if (!items.length) {
          setMediaStatus('Belum ada gambar di Media Library.', true);
          return;
        }
        setMediaStatus('', false);
        items.forEach(function (media) {
          grid.append(createMediaButton(media));
        });
      }

      function loadMediaPage(page) {
        if (mediaPickerState.loading) return;
        mediaPickerState.loading = true;
        updateMediaPagination();
        setMediaStatus('Memuat gambar...', true);

        var params = new URLSearchParams({
          page: String(page || 1),
          per_page: String(mediaPickerState.perPage)
        });

        fetch(mediaPickerEndpoint + '?' + params.toString(), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }).then(function (response) {
          if (!response.ok) throw new Error('Media picker request failed.');
          return response.json();
        }).then(function (payload) {
          var pagination = payload.pagination || {};
          mediaPickerState.currentPage = Number(pagination.current_page || page || 1);
          mediaPickerState.lastPage = Math.max(1, Number(pagination.last_page || 1));
          mediaPickerState.loaded = true;
          renderMediaItems(Array.isArray(payload.media) ? payload.media : []);
        }).catch(function () {
          renderMediaItems([]);
          setMediaStatus('Gagal memuat gambar. Coba buka ulang modal atau refresh halaman.', true);
        }).finally(function () {
          mediaPickerState.loading = false;
          updateMediaPagination();
        });
      }

      function openMediaLibrary() {
        var panel = document.querySelector('[data-media-library-panel]');
        var gate = document.querySelector('[data-media-library-gate]');
        if (panel) panel.hidden = false;
        if (gate) gate.hidden = true;
        if (!mediaPickerState.loaded) loadMediaPage(1);
      }

      function openMediaModal() {
        modal?.classList.add('is-open');
      }

      function openMediaForEditor(quill) {
        activePicker = null;
        activeQuill = quill;
        savedRange = quill.getSelection(true);
        openMediaModal();
      }

      function applyLinkAttributes(anchor, options) {
        if (!anchor) return;
        var rel = [];
        if (options.newTab) {
          anchor.setAttribute('target', '_blank');
          rel.push('noopener');
        } else {
          anchor.removeAttribute('target');
        }
        if (options.nofollow) rel.push('nofollow');
        if (options.sponsored) rel.push('sponsored');
        if (options.ugc) rel.push('ugc');

        if (rel.length) {
          anchor.setAttribute('rel', Array.from(new Set(rel)).join(' '));
        } else {
          anchor.removeAttribute('rel');
        }
      }

      function openLinkModal(quill, anchor) {
        activeQuill = quill;
        savedRange = quill.getSelection(true);
        activeLink = anchor || null;

        var urlInput = document.querySelector('[data-link-url]');
        var newTab = document.querySelector('[data-link-new-tab]');
        var nofollow = document.querySelector('[data-link-nofollow]');
        var sponsored = document.querySelector('[data-link-sponsored]');
        var ugc = document.querySelector('[data-link-ugc]');
        var title = document.querySelector('[data-link-modal-title]');

        var rel = (anchor?.getAttribute('rel') || '').split(/\s+/);
        if (urlInput) urlInput.value = anchor?.getAttribute('href') || '';
        if (newTab) newTab.checked = anchor?.getAttribute('target') === '_blank';
        if (nofollow) nofollow.checked = rel.includes('nofollow');
        if (sponsored) sponsored.checked = rel.includes('sponsored');
        if (ugc) ugc.checked = rel.includes('ugc');
        if (title) title.textContent = anchor ? 'Edit Link' : 'Tambah Link';

        closeEditorPopovers();
        linkModal?.classList.add('is-open');
        setTimeout(function () { urlInput?.focus(); }, 30);
      }

      function createTableHtml(rows, cols) {
        var header = '<tr>' + Array.from({ length: cols }, function (_, index) {
          return '<td><strong>Header ' + (index + 1) + '</strong></td>';
        }).join('') + '</tr>';
        var body = Array.from({ length: Math.max(rows - 1, 0) }, function () {
          return '<tr>' + Array.from({ length: cols }, function () {
            return '<td>Isi tabel</td>';
          }).join('') + '</tr>';
        }).join('');
        return '<table><tbody>' + header + body + '</tbody></table><p><br></p>';
      }

      function syncTableEdit() {
        syncQuillInputs();
        updateSeo();
      }

      function tableCellIndex(cell) {
        return Array.from(cell.parentElement?.children || []).indexOf(cell);
      }

      function tableColumnCount(table) {
        return Math.max(1, ...Array.from(table.rows).map(function (row) {
          return row.cells.length;
        }));
      }

      function createTableCell(content) {
        var cell = document.createElement('td');
        cell.innerHTML = content || '<br>';
        return cell;
      }

      function showTableContextMenu(event, cell, quill) {
        activeTableCell = cell;
        activeQuill = quill || activeQuill;
        closeEditorPopovers();
        if (!tableContextMenu) return;
        tableContextMenu.style.left = Math.min(event.clientX, window.innerWidth - 230) + 'px';
        tableContextMenu.style.top = '0px';
        tableContextMenu.classList.add('is-open');
        var rect = tableContextMenu.getBoundingClientRect();
        var top = event.clientY - rect.height - 8;
        if (top < 8) top = Math.min(event.clientY + 8, window.innerHeight - rect.height - 8);
        tableContextMenu.style.top = Math.max(8, top) + 'px';
      }

      function applyTableAction(action) {
        if (!activeTableCell) return;
        var cell = activeTableCell;
        var row = cell.parentElement;
        var table = cell.closest('table');
        if (!row || !table) return;
        var colIndex = tableCellIndex(cell);
        var colCount = tableColumnCount(table);

        if (action === 'insert-row-above' || action === 'insert-row-below') {
          var newRow = document.createElement('tr');
          Array.from({ length: colCount }).forEach(function () {
            newRow.append(createTableCell());
          });
          if (action === 'insert-row-above') {
            row.before(newRow);
          } else {
            row.after(newRow);
          }
        }

        if (action === 'delete-row') {
          if (table.rows.length <= 1) {
            table.remove();
          } else {
            row.remove();
          }
        }

        if (action === 'insert-col-left' || action === 'insert-col-right') {
          Array.from(table.rows).forEach(function (tableRow) {
            var reference = tableRow.cells[colIndex] || tableRow.cells[tableRow.cells.length - 1];
            var newCell = createTableCell();
            if (!reference) {
              tableRow.append(newCell);
            } else if (action === 'insert-col-left') {
              reference.before(newCell);
            } else {
              reference.after(newCell);
            }
          });
        }

        if (action === 'delete-col') {
          Array.from(table.rows).forEach(function (tableRow) {
            tableRow.cells[colIndex]?.remove();
          });
          if (!table.querySelector('td, th')) table.remove();
        }

        if (action === 'delete-cell') {
          cell.innerHTML = '<br>';
        }

        if (action === 'delete-table') {
          table.remove();
        }

        activeTableCell = null;
        tableContextMenu?.classList.remove('is-open');
        syncTableEdit();
      }

      document.querySelectorAll('[data-quill-editor]').forEach(function (editor) {
        var input = editor.parentElement?.querySelector('[data-quill-input]');
        var toolbar = editor.previousElementSibling;
        quillInstance = new Quill(editor, {
          theme: 'snow',
          modules: {
            toolbar: {
              container: toolbar,
              handlers: {
                link: function () {
                  openLinkModal(this.quill, null);
                },
                image: function () {
                  openMediaForEditor(this.quill);
                }
              }
            },
            clipboard: { matchVisual: false }
          }
        });

        activeQuill = activeQuill || quillInstance;
        quillInstance.on('text-change', function () {
          input.value = quillInstance.root.innerHTML;
          updateSeo();
        });

        quillInstance.on('selection-change', function (range) {
          if (range) {
            savedRange = range;
            activeQuill = quillInstance;
          }
        });

        quillInstance.root.addEventListener('mouseover', function (event) {
          var anchor = event.target.closest('a');
          if (!anchor || !quillInstance.root.contains(anchor)) return;
          activeLink = anchor;
          activeQuill = quillInstance;
          var rect = anchor.getBoundingClientRect();
          var preview = document.querySelector('[data-link-preview]');
          if (preview) preview.href = anchor.href;
          if (linkPopover) {
            linkPopover.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
            linkPopover.style.top = (rect.bottom + 8) + 'px';
            linkPopover.classList.add('is-open');
          }
        });

        quillInstance.root.addEventListener('mouseleave', function () {
          setTimeout(function () {
            if (!linkPopover?.matches(':hover')) linkPopover?.classList.remove('is-open');
          }, 120);
        });

        quillInstance.root.addEventListener('contextmenu', function (event) {
          var cell = event.target.closest('td, th');
          if (!cell || !quillInstance.root.contains(cell)) return;
          event.preventDefault();
          showTableContextMenu(event, cell, quillInstance);
        });
      });

      function setImage(url, picker) {
        var targetPicker = picker || activePicker || document.querySelector('[data-featured-picker]');
        if (!targetPicker) return;
        var featuredInput = targetPicker.querySelector('[data-media-target]');
        var preview = targetPicker.querySelector('[data-featured-preview]');
        if (!featuredInput) return;
        featuredInput.value = url || '';
        if (preview) {
          var actions = url ? '<span class="featured-preview__actions"><span class="featured-preview__icon" role="button" tabindex="0" data-clear-media aria-label="Hapus gambar"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20.5c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5V7H5zM8 9h2v10H8zm6 0h2v10h-2zM17.5 4l-1-2h-9l-1 2H3v2h18V4z"/></svg></span></span>' : '';
          preview.innerHTML = actions + (url ? '<img src="' + url.replace(/"/g, '&quot;') + '" alt="">' : '<span class="featured-preview__hint">Belum ada gambar<small>Klik untuk pilih dari Media Library</small></span>');
          bindClearMedia(preview.querySelector('[data-clear-media]'));
        }
        updateSeo();
      }

      function insertEditorImage(url) {
        if (!activeQuill || !url) return false;
        var range = savedRange || activeQuill.getSelection(true) || { index: activeQuill.getLength(), length: 0 };
        activeQuill.setSelection(range.index, range.length || 0);
        if (range.length) activeQuill.deleteText(range.index, range.length, 'user');
        activeQuill.insertEmbed(range.index, 'image', url, 'user');
        activeQuill.insertText(range.index + 1, '\n', 'user');
        activeQuill.setSelection(range.index + 2, 0);
        syncQuillInputs();
        updateSeo();
        return true;
      }

      document.querySelectorAll('[data-editor-tab]').forEach(function (tab) {
        tab.addEventListener('click', function () {
          var id = tab.getAttribute('data-editor-tab');
          document.querySelectorAll('[data-editor-tab]').forEach(function (item) {
            item.classList.toggle('is-active', item === tab);
          });
          document.querySelectorAll('[data-editor-panel]').forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-editor-panel') === id);
          });
        });
      });

      if (titleInput) {
        titleInput.addEventListener('input', function () {
          if (slugInput && !slugInput.dataset.touched) slugInput.value = slugify(titleInput.value);
          if (metaTitleInput && !metaTitleInput.dataset.touched) metaTitleInput.value = titleInput.value;
          updateSeo();
        });
      }
      if (slugInput) slugInput.addEventListener('input', function () { slugInput.dataset.touched = '1'; updateSeo(); });
      if (metaTitleInput) metaTitleInput.addEventListener('input', function () { metaTitleInput.dataset.touched = '1'; updateSeo(); });
      if (metaDescriptionInput) metaDescriptionInput.addEventListener('input', updateSeo);
      if (categoryInput) categoryInput.addEventListener('change', updateSeo);
      if (publishToggle) publishToggle.addEventListener('change', updatePublishSubmit);
      document.querySelectorAll('[data-media-target]').forEach(function (input) {
        input.addEventListener('input', function () {
          setImage(input.value, input.closest('[data-featured-picker]'));
        });
      });

      document.querySelectorAll('[data-open-media]').forEach(function (button) {
        button.addEventListener('click', function () {
          activePicker = button.closest('[data-featured-picker]');
          activeQuill = null;
          openMediaModal();
        });
      });
      document.querySelectorAll('[data-close-media]').forEach(function (button) {
        button.addEventListener('click', function () { modal?.classList.remove('is-open'); });
      });
      document.querySelector('[data-open-media-library]')?.addEventListener('click', openMediaLibrary);
      document.querySelector('[data-media-prev]')?.addEventListener('click', function () {
        if (mediaPickerState.currentPage > 1) loadMediaPage(mediaPickerState.currentPage - 1);
      });
      document.querySelector('[data-media-next]')?.addEventListener('click', function () {
        if (mediaPickerState.currentPage < mediaPickerState.lastPage) loadMediaPage(mediaPickerState.currentPage + 1);
      });
      function bindClearMedia(button) {
        if (!button || button.dataset.boundClear === '1') return;
        button.dataset.boundClear = '1';
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          setImage('', button.closest('[data-featured-picker]'));
        });
        button.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          event.stopPropagation();
          setImage('', button.closest('[data-featured-picker]'));
        });
      }

      document.querySelectorAll('[data-clear-media]').forEach(bindClearMedia);

      function bindMediaButton(button) {
        button.addEventListener('click', function () {
          var url = button.getAttribute('data-media-url') || '';
          if (activeQuill && !activePicker) {
            insertEditorImage(url);
          } else {
            setImage(url);
          }
          modal?.classList.remove('is-open');
        });
      }

      document.querySelectorAll('[data-media-url]').forEach(bindMediaButton);

      function uploadSelectedMedia(file) {
        var dropzone = document.querySelector('[data-media-dropzone]');
        var dropzoneTitle = document.querySelector('[data-media-dropzone-title]');
        var input = document.querySelector('[data-media-upload]');
        if (!file) return;
        var originalText = dropzoneTitle?.textContent || 'Klik atau drop gambar di sini';
        if (input) input.disabled = true;
        dropzone?.classList.add('is-uploading');
        if (dropzoneTitle) dropzoneTitle.textContent = 'Mengupload gambar...';
        var data = new FormData();
        data.append('_token', csrf);
        data.append('file', file);
        fetch('{{ route('cms.store', 'media') }}', {
          method: 'POST',
          body: data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        }).then(function (response) {
          return response.json();
        }).then(function (payload) {
          if (!payload || !payload.media || !payload.media.url) return;
          var grid = document.querySelector('[data-media-grid]');
          grid?.prepend(createMediaButton(payload.media));
          setMediaStatus('', false);
          if (activeQuill && !activePicker) {
            insertEditorImage(payload.media.url);
          } else {
            setImage(payload.media.url);
          }
          input.value = '';
          modal?.classList.remove('is-open');
        }).catch(function () {
          alert('Upload gagal. Coba lagi.');
        }).finally(function () {
          if (input) {
            input.disabled = false;
            input.value = '';
          }
          dropzone?.classList.remove('is-uploading', 'is-dragging');
          if (dropzoneTitle) dropzoneTitle.textContent = originalText;
        });
      }

      document.querySelector('[data-media-upload]')?.addEventListener('change', function () {
        uploadSelectedMedia(this.files && this.files[0]);
      });

      document.querySelector('[data-media-dropzone]')?.addEventListener('dragover', function (event) {
        event.preventDefault();
        this.classList.add('is-dragging');
      });

      document.querySelector('[data-media-dropzone]')?.addEventListener('dragleave', function () {
        this.classList.remove('is-dragging');
      });

      document.querySelector('[data-media-dropzone]')?.addEventListener('drop', function (event) {
        event.preventDefault();
        this.classList.remove('is-dragging');
        uploadSelectedMedia(event.dataTransfer?.files && event.dataTransfer.files[0]);
      });

      document.querySelectorAll('[data-close-link]').forEach(function (button) {
        button.addEventListener('click', function () {
          linkModal?.classList.remove('is-open');
        });
      });

      document.querySelector('[data-apply-link]')?.addEventListener('click', function () {
        if (!activeQuill) return;
        var url = (document.querySelector('[data-link-url]')?.value || '').trim();
        var newTab = !!document.querySelector('[data-link-new-tab]')?.checked;
        var nofollow = !!document.querySelector('[data-link-nofollow]')?.checked;
        var sponsored = !!document.querySelector('[data-link-sponsored]')?.checked;
        var ugc = !!document.querySelector('[data-link-ugc]')?.checked;

        if (!url) {
          linkModal?.classList.remove('is-open');
          return;
        }

        if (activeLink) {
          activeLink.setAttribute('href', url);
          applyLinkAttributes(activeLink, { newTab: newTab, nofollow: nofollow, sponsored: sponsored, ugc: ugc });
        } else {
          var range = savedRange || activeQuill.getSelection(true);
          if (!range || range.length === 0) {
            var insertText = url.replace(/^https?:\/\//, '');
            range = range || { index: activeQuill.getLength(), length: 0 };
            activeQuill.insertText(range.index, insertText, 'user');
            activeQuill.setSelection(range.index, insertText.length);
            range = { index: range.index, length: insertText.length };
          }
          activeQuill.formatText(range.index, range.length, 'link', url, 'user');
          setTimeout(function () {
            activeQuill.root.querySelectorAll('a[href="' + CSS.escape(url) + '"]').forEach(function (anchor) {
              applyLinkAttributes(anchor, { newTab: newTab, nofollow: nofollow, sponsored: sponsored, ugc: ugc });
            });
            syncQuillInputs();
          }, 0);
        }

        linkModal?.classList.remove('is-open');
        activeLink = null;
        syncQuillInputs();
        updateSeo();
      });

      document.querySelector('[data-remove-link]')?.addEventListener('click', function () {
        if (activeLink) {
          activeLink.replaceWith(document.createTextNode(activeLink.textContent || ''));
        } else if (activeQuill && savedRange) {
          activeQuill.formatText(savedRange.index, savedRange.length || 1, 'link', false, 'user');
        }
        linkModal?.classList.remove('is-open');
        syncQuillInputs();
        updateSeo();
      });

      document.querySelector('[data-edit-hover-link]')?.addEventListener('click', function () {
        openLinkModal(activeQuill || quillInstance, activeLink);
      });

      linkPopover?.addEventListener('mouseleave', function () {
        linkPopover.classList.remove('is-open');
      });

      document.querySelectorAll('[data-raw-html-trigger]').forEach(function (button) {
        button.addEventListener('click', function () {
          var editor = button.closest('.col-span-12')?.querySelector('[data-quill-editor]');
          activeQuill = editor?.__quill || activeQuill || quillInstance;
          var input = document.querySelector('[data-raw-html-input]');
          if (input && activeQuill) input.value = activeQuill.root.innerHTML.trim();
          closeEditorPopovers();
          rawModal?.classList.add('is-open');
        });
      });

      document.querySelectorAll('[data-close-raw-html]').forEach(function (button) {
        button.addEventListener('click', function () {
          rawModal?.classList.remove('is-open');
        });
      });

      document.querySelector('[data-apply-raw-html]')?.addEventListener('click', function () {
        if (!activeQuill) return;
        var html = document.querySelector('[data-raw-html-input]')?.value || '';
        activeQuill.setContents([]);
        activeQuill.clipboard.dangerouslyPasteHTML(0, html, 'user');
        rawModal?.classList.remove('is-open');
        syncQuillInputs();
        updateSeo();
      });

      document.querySelectorAll('[data-table-trigger]').forEach(function (button) {
        button.addEventListener('click', function () {
          var editor = button.closest('.col-span-12')?.querySelector('[data-quill-editor]');
          activeQuill = editor?.__quill || activeQuill || quillInstance;
          savedRange = activeQuill?.getSelection(true) || savedRange;
          var rect = button.getBoundingClientRect();
          if (tablePopover) {
            tablePopover.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
            tablePopover.style.top = (rect.bottom + 8) + 'px';
            tablePopover.classList.toggle('is-open');
          }
        });
      });

      document.querySelectorAll('[data-table-cell]').forEach(function (cell) {
        cell.addEventListener('mouseenter', function () {
          var row = Number(cell.dataset.row || 1);
          var col = Number(cell.dataset.col || 1);
          document.querySelector('[data-table-size]').textContent = row + ' x ' + col;
          document.querySelectorAll('[data-table-cell]').forEach(function (item) {
            item.classList.toggle('is-active', Number(item.dataset.row) <= row && Number(item.dataset.col) <= col);
          });
        });
        cell.addEventListener('click', function () {
          if (!activeQuill) return;
          var row = Number(cell.dataset.row || 1);
          var col = Number(cell.dataset.col || 1);
          var range = savedRange || activeQuill.getSelection(true) || { index: activeQuill.getLength(), length: 0 };
          activeQuill.clipboard.dangerouslyPasteHTML(range.index, createTableHtml(row, col), 'user');
          tablePopover?.classList.remove('is-open');
          syncQuillInputs();
          updateSeo();
        });
      });

      document.querySelectorAll('[data-table-action]').forEach(function (button) {
        button.addEventListener('click', function () {
          applyTableAction(button.dataset.tableAction || '');
        });
      });

      document.addEventListener('click', function (event) {
        if (event.target.closest('[data-table-trigger], [data-table-popover], [data-table-context-menu], [data-link-popover], [data-link-modal], [data-media-modal], [data-raw-html-modal]')) return;
        closeEditorPopovers();
      });

      function updateSeo() {
        var title = (metaTitleInput?.value || titleInput?.value || '').trim();
        var slug = (slugInput?.value || slugify(titleInput?.value || '')).trim();
        var description = (metaDescriptionInput?.value || '').trim();
        var categoryOk = categoryInput ? !!categoryInput.value : true;
        var firstImageInput = document.querySelector('[data-media-target]');
        var featuredOk = firstImageInput ? !!firstImageInput.value : true;
        var html = quillInstance ? quillInstance.root.innerHTML : '';
        var hasContentImage = /<img\s/i.test(html);
        var hasInternalLink = /href=["']\/|href=["']https?:\/\/(www\.)?lanyarddepok\.com/i.test(html);

        var rules = [
          ['Judul tersedia', !!(titleInput && titleInput.value.trim())],
          ['Kategori dipilih', categoryOk],
          ['Featured image tersedia', featuredOk],
          ['Ada gambar dalam artikel', hasContentImage],
          ['Ada internal link', hasInternalLink],
          ['Meta description tersedia', !!description],
          ['Meta title tersedia', !!title]
        ];
        var score = Math.round((rules.filter(function (rule) { return rule[1]; }).length / rules.length) * 100);
        var scoreLevel = score >= 80 ? 'good' : (score >= 50 ? 'warning' : 'bad');

        document.querySelector('[data-seo-preview-title]').textContent = title || 'Meta title preview';
        document.querySelector('[data-seo-preview-slug]').textContent = slug || 'slug';
        document.querySelector('[data-seo-preview-description]').textContent = description || 'Meta description preview.';
        document.querySelector('[data-seo-score]').textContent = score;
        document.querySelector('[data-seo-score-circle]')?.setAttribute('data-score-level', scoreLevel);
        document.querySelector('[data-seo-score-note]').textContent = score >= 80 ? 'Bagus. Elemen SEO utama sudah lengkap.' : 'Masih ada elemen SEO yang perlu dilengkapi.';

        var list = document.querySelector('[data-seo-rules]');
        if (list) {
          list.innerHTML = rules.map(function (rule) {
            return '<li class="flex items-center justify-between gap-3"><span>' + rule[0] + '</span><span class="badge ' + (rule[1] ? 'badge--success' : 'badge--warning') + '">' + (rule[1] ? 'OK' : 'Cek') + '</span></li>';
          }).join('');
        }
      }

      form?.addEventListener('submit', function () {
        syncQuillInputs();
      });

      updateSeo();
      updatePublishSubmit();
    })();
  </script>
@endpush
