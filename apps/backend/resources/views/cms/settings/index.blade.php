@extends('layouts.meridian')

@section('title', 'CMS Settings')

@php
    $fieldValue = function (string $key, string $fallback = '') use ($settings): string {
        return (string) old("settings.{$key}", $settings[$key] ?? $fallback);
    };

    $autoLinkRows = [];
    $oldKeywords = old('seo_auto_link_keywords');
    $oldUrls = old('seo_auto_link_urls');

    if (is_array($oldKeywords)) {
        foreach ($oldKeywords as $index => $keyword) {
            $autoLinkRows[] = [
                'keyword' => (string) $keyword,
                'url' => (string) ($oldUrls[$index] ?? ''),
            ];
        }
    } else {
        $autoLinkRows = $seoAutoLinks ?? [];
    }

    if (count($autoLinkRows) === 0) {
        $autoLinkRows[] = ['keyword' => '', 'url' => ''];
    }
@endphp

@push('head')
  <style>
    .settings-shell {
      display: grid;
      grid-template-columns: 17rem minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    .settings-tabs {
      display: grid;
      gap: .6rem;
    }
    .settings-tab {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: .75rem;
      min-height: 3.35rem;
      padding: .9rem 1rem;
      text-align: left;
      box-shadow: none !important;
    }
    .settings-tab__icon {
      width: 2rem;
      height: 2rem;
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      border-radius: .85rem;
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-card));
      color: var(--color-primary);
    }
    .settings-tab__meta {
      display: grid;
      gap: .15rem;
      min-width: 0;
    }
    .settings-tab__title {
      font-weight: 700;
      color: var(--color-foreground);
    }
    .settings-tab__hint {
      font-size: .75rem;
      line-height: 1.25;
      color: var(--color-muted-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .settings-tab.is-active {
      color: var(--color-primary-emphasis);
      border-color: color-mix(in srgb, var(--color-primary) 42%, var(--color-border));
      background: color-mix(in srgb, var(--color-primary) 9%, var(--color-card));
      box-shadow: none !important;
    }
    .settings-tab:hover {
      color: var(--color-primary-emphasis);
      border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
      background: color-mix(in srgb, var(--color-primary) 6%, var(--color-card));
      box-shadow: none !important;
    }
    .settings-tab:focus,
    .settings-tab:focus-visible {
      box-shadow: none !important;
    }
    .settings-tab.is-active .settings-tab__icon,
    .settings-tab:hover .settings-tab__icon {
      background: color-mix(in srgb, var(--color-primary) 14%, var(--color-card));
      color: var(--color-primary-emphasis);
    }
    .settings-panel {
      display: none;
    }
    .settings-panel.is-active {
      display: block;
    }
    .settings-panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border);
    }
    .settings-field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .settings-field-card {
      padding: 1.15rem;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: var(--color-card);
    }
    .settings-field-card .input {
      padding: .85rem 1rem;
    }
    .settings-field-card select.input {
      min-height: 3.15rem;
      padding: .75rem 2.75rem .75rem 1rem;
      line-height: 1.35;
    }
    .settings-field-card textarea.input {
      min-height: 8.25rem;
      padding: 1rem 1.05rem;
      line-height: 1.65;
    }
    .settings-field--wide {
      grid-column: 1 / -1;
    }
    .settings-image-field {
      display: grid;
      gap: .75rem;
    }
    .settings-image-preview {
      position: relative;
      min-height: 10rem;
      display: grid;
      place-items: center;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      background: color-mix(in srgb, var(--color-muted) 55%, var(--color-card));
    }
    .settings-image-preview img {
      width: 100%;
      height: 100%;
      max-height: 13rem;
      object-fit: contain;
      padding: 1rem;
    }
    .settings-image-preview.is-empty img {
      display: none;
    }
    .settings-image-empty {
      color: var(--color-muted-foreground);
      font-size: .9rem;
    }
    .settings-auto-links {
      display: grid;
      gap: .75rem;
    }
    .settings-auto-link-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) auto;
      gap: .6rem;
      align-items: center;
    }
    .settings-credential-upload {
      display: grid;
      gap: .75rem;
    }
    .settings-credential-drop {
      min-height: 8.5rem;
      display: grid;
      place-items: center;
      padding: 1.25rem;
      border: 1px dashed color-mix(in srgb, var(--color-primary) 34%, var(--color-border));
      border-radius: 1rem;
      text-align: center;
      cursor: pointer;
      background: color-mix(in srgb, var(--color-primary) 4%, var(--color-card));
      transition: border-color .16s ease, background .16s ease;
    }
    .settings-credential-drop.is-saved {
      border-color: color-mix(in srgb, #16a34a 42%, var(--color-border));
      background: color-mix(in srgb, #16a34a 7%, var(--color-card));
    }
    .settings-credential-drop.is-ready {
      border-color: color-mix(in srgb, #2563eb 46%, var(--color-border));
      background: color-mix(in srgb, #2563eb 7%, var(--color-card));
    }
    .settings-credential-drop:hover,
    .settings-credential-drop.is-dragging {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 8%, var(--color-card));
    }
    .settings-credential-drop input {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }
    .settings-credential-content {
      display: grid;
      justify-items: center;
      gap: .4rem;
    }
    .settings-credential-badge {
      display: none;
      padding: .2rem .55rem;
      border-radius: 999px;
      color: #15803d;
      background: #dcfce7;
      font-size: .72rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .settings-credential-drop.is-saved .settings-credential-badge {
      display: inline-flex;
    }
    .settings-credential-action {
      display: inline-flex;
      align-items: center;
      min-height: 2.2rem;
      margin-top: .25rem;
      padding: .45rem .8rem;
      border: 1px solid color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
      border-radius: .65rem;
      color: var(--color-primary-emphasis);
      background: var(--color-card);
      font-size: .82rem;
      font-weight: 700;
    }
    .settings-credential-status {
      color: var(--color-muted-foreground);
      font-size: .85rem;
    }
    .settings-credential-status.is-saved {
      color: #15803d;
      font-weight: 600;
    }
    .settings-credential-status.is-ready {
      color: #1d4ed8;
      font-weight: 600;
    }
    .settings-raw-note {
      padding: .9rem 1rem;
      border-radius: 1rem;
      border: 1px dashed color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
      color: var(--color-muted-foreground);
      background: color-mix(in srgb, var(--color-primary) 5%, transparent);
    }
    @media (max-width: 980px) {
      .settings-shell {
        grid-template-columns: 1fr;
      }
      .settings-tabs {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .settings-field-grid,
      .settings-auto-link-row {
        grid-template-columns: 1fr;
      }
    }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">CMS Settings</h1>
      <p class="page__description">Kelola konfigurasi website dengan kategori yang rapi tanpa perlu mengedit data teknis mentah.</p>
    </div>
  </header>

  <div class="page__body">
    <form method="post" action="{{ route('cms.store', 'settings') }}">
      @csrf

      <div class="settings-shell">
        <aside class="card">
          <div class="card__header">
            <span class="card__title">Kategori</span>
          </div>
          <div class="card__body">
            <nav class="settings-tabs" aria-label="Settings tabs">
              @foreach($groups as $id => $group)
                <button class="button button--outline button--neutral settings-tab {{ $loop->first ? 'is-active' : '' }}" type="button" data-settings-tab="{{ $id }}">
                  <span class="settings-tab__icon">@include('cms.partials.icon', ['name' => $id === 'brand-media' ? 'image' : ($id === 'kontak' ? 'phone' : ($id === 'seo' ? 'chart' : ($id === 'integrasi' ? 'grid' : 'settings')))])</span>
                  <span class="settings-tab__meta">
                    <span class="settings-tab__title">{{ $group['label'] }}</span>
                    <span class="settings-tab__hint">{{ $group['description'] }}</span>
                  </span>
                </button>
              @endforeach
              <button class="button button--outline button--neutral settings-tab" type="button" data-settings-tab="raw">
                <span class="settings-tab__icon">@include('cms.partials.icon', ['name' => 'file'])</span>
                <span class="settings-tab__meta">
                  <span class="settings-tab__title">Raw Keys</span>
                  <span class="settings-tab__hint">Key custom lanjutan</span>
                </span>
              </button>
            </nav>
          </div>
        </aside>

        <section class="min-w-0">
          @foreach($groups as $id => $group)
            <div class="settings-panel {{ $loop->first ? 'is-active' : '' }}" data-settings-panel="{{ $id }}">
              <div class="card">
                <div class="card__body">
                  <div class="settings-panel-head">
                    <div>
                      <span class="eyebrow">{{ $group['label'] }}</span>
                      <h2 class="mt-2 text-2xl font-bold">{{ $group['label'] }}</h2>
                      <p class="mt-1 text-sm text-muted-foreground">{{ $group['description'] }}</p>
                    </div>
                    <span class="badge badge--soft">{{ count($group['fields']) }} field</span>
                  </div>

                  <div class="settings-field-grid mt-5">
                    @foreach($group['fields'] as $field)
                      @php
                          $key = $field['key'];
                          $type = $field['type'] ?? 'text';
                          $fallback = (string) ($field['fallback'] ?? ($type === 'color' ? '#6f4f43' : ''));
                          $value = $fieldValue($key, $fallback);
                          $isWide = in_array($type, ['textarea', 'credential', 'auto_links'], true);
                      @endphp

                      <div class="settings-field-card {{ $isWide ? 'settings-field--wide' : '' }}">
                        <label class="form-label" for="setting-{{ $key }}">{{ $field['label'] }}</label>

                        @if($type === 'auto_links')
                          <div class="settings-auto-links" data-auto-links>
                            @foreach($autoLinkRows as $link)
                              <div class="settings-auto-link-row" data-auto-link-row>
                                <input class="input" type="text" name="seo_auto_link_keywords[]" value="{{ $link['keyword'] }}" placeholder="Keyword, contoh: lanyard custom" />
                                <input class="input" type="url" name="seo_auto_link_urls[]" value="{{ $link['url'] }}" placeholder="URL tujuan, contoh: /produk" />
                                <button class="button button--outline button--neutral" type="button" data-remove-auto-link>Hapus</button>
                              </div>
                            @endforeach
                          </div>
                          <button class="button button--outline button--neutral mt-3" type="button" data-add-auto-link>Tambah Auto Link</button>
                        @elseif($type === 'image')
                          <div class="settings-image-field" data-image-field>
                            <div class="settings-image-preview {{ $value === '' ? 'is-empty' : '' }}" data-image-preview>
                              <img src="{{ $value }}" alt="{{ $field['label'] }}" data-image-preview-img />
                              <span class="settings-image-empty">Belum ada gambar</span>
                            </div>
                            <input id="setting-{{ $key }}" class="input" type="text" name="settings[{{ $key }}]" value="{{ $value }}" placeholder="/uploads/nama-file.webp" data-image-input />
                          </div>
                        @elseif($type === 'textarea')
                          <textarea id="setting-{{ $key }}" class="input min-h-32" name="settings[{{ $key }}]" placeholder="{{ $field['placeholder'] ?? '' }}">{{ $value }}</textarea>
                        @elseif($type === 'credential')
                          @php($hasCredential = trim($value) !== '')
                          <div class="settings-credential-upload" data-credential-upload data-credential-saved="{{ $hasCredential ? 'true' : 'false' }}">
                            <input id="setting-{{ $key }}" type="hidden" name="settings[{{ $key }}]" value="{{ e($value) }}" data-credential-value />
                            <label class="settings-credential-drop {{ $hasCredential ? 'is-saved' : '' }}" for="setting-{{ $key }}-file" data-credential-drop>
                              <input id="setting-{{ $key }}-file" type="file" accept="application/json,.json" data-credential-file />
                              <span class="settings-credential-content">
                                <span class="settings-credential-badge">Tersimpan</span>
                                <strong data-credential-title>{{ $hasCredential ? 'Credential Google sudah tersimpan' : 'Upload file credential JSON' }}</strong>
                                <span class="block text-sm text-muted-foreground" data-credential-description>{{ $hasCredential ? 'Gunakan file baru bila ingin mengganti service account yang aktif.' : 'Klik area ini atau seret file service account dari Google Cloud.' }}</span>
                                <span class="settings-credential-action" data-credential-action>{{ $hasCredential ? 'Ganti credential JSON' : 'Pilih credential JSON' }}</span>
                              </span>
                            </label>
                            <p class="settings-credential-status {{ $hasCredential ? 'is-saved' : '' }}" data-credential-status>{{ $hasCredential ? 'Credential aktif tersimpan dan siap digunakan.' : 'Belum ada credential tersimpan.' }}</p>
                          </div>
                        @elseif($type === 'select')
                          <select id="setting-{{ $key }}" class="input" name="settings[{{ $key }}]">
                            @foreach($field['options'] as $optionValue => $optionLabel)
                              <option value="{{ $optionValue }}" @selected($value === (string) $optionValue)>{{ $optionLabel }}</option>
                            @endforeach
                          </select>
                        @elseif($type === 'color')
                          <div class="flex items-center gap-3">
                            <input id="setting-{{ $key }}" class="theme-color-input" type="color" name="settings[{{ $key }}]" value="{{ $value ?: '#6f4f43' }}" />
                            <span class="text-sm text-muted-foreground">{{ $value ?: '#6f4f43' }}</span>
                          </div>
                        @else
                          <input id="setting-{{ $key }}" class="input" type="{{ $type }}" name="settings[{{ $key }}]" value="{{ $value }}" placeholder="{{ $field['placeholder'] ?? '' }}" />
                        @endif
                      </div>
                    @endforeach
                  </div>
                </div>
              </div>
            </div>
          @endforeach

          <div class="settings-panel" data-settings-panel="raw">
            <div class="card">
              <div class="card__body">
                <div class="settings-panel-head">
                  <div>
                    <span class="eyebrow">Advanced</span>
                    <h2 class="mt-2 text-2xl font-bold">Raw Keys</h2>
                    <p class="mt-1 text-sm text-muted-foreground">Area lanjutan untuk key custom yang belum masuk kategori utama.</p>
                  </div>
                </div>

                <p class="settings-raw-note mt-5">Gunakan bagian ini hanya untuk key custom atau integrasi yang belum tersedia di tab utama. Pengaturan umum, media, SEO, kontak, dan Google sebaiknya diubah dari tab masing-masing.</p>

                <div class="table-responsive mt-5">
                  <table class="table table--hover table--align-middle">
                    <thead class="table__head--alt">
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th class="text-end">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      @forelse($rawSettings as $setting)
                        <tr>
                          <td class="font-bold font-mono">{{ $setting->key }}</td>
                          <td>
                            <textarea class="input min-h-32 font-mono" name="settings[{{ $setting->key }}]">{{ old("settings.{$setting->key}", $setting->value) }}</textarea>
                          </td>
                          <td class="text-end">
                            <label class="checkbox">
                              <input type="checkbox" name="delete_keys[]" value="{{ $setting->key }}" />
                              <span>Hapus</span>
                            </label>
                          </td>
                        </tr>
                      @empty
                        <tr>
                          <td colspan="3" class="text-center text-muted-foreground">Tidak ada raw key tambahan.</td>
                        </tr>
                      @endforelse
                    </tbody>
                  </table>
                </div>

                <div class="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="form-label" for="new_key">Tambah Key Baru</label>
                    <input id="new_key" class="input font-mono" type="text" name="new_key" value="{{ old('new_key') }}" placeholder="custom_key_name" />
                  </div>
                  <div>
                    <label class="form-label" for="new_value">Value</label>
                    <textarea id="new_value" class="input min-h-32 font-mono" name="new_value" placeholder="Isi value custom">{{ old('new_value') }}</textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <a class="button button--outline button--neutral" href="{{ route('dashboard') }}">Batal</a>
            <button class="button button--primary" type="submit">Simpan Settings</button>
          </div>
        </section>
      </div>
    </form>
  </div>
@endsection

@push('scripts')
  <script>
    (function () {
      var tabs = document.querySelectorAll('[data-settings-tab]');
      var panels = document.querySelectorAll('[data-settings-panel]');

      function activate(id) {
        tabs.forEach(function (tab) {
          tab.classList.toggle('is-active', tab.getAttribute('data-settings-tab') === id);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-settings-panel') === id);
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          activate(tab.getAttribute('data-settings-tab'));
        });
      });

      document.querySelectorAll('[data-image-field]').forEach(function (field) {
        var input = field.querySelector('[data-image-input]');
        var preview = field.querySelector('[data-image-preview]');
        var image = field.querySelector('[data-image-preview-img]');

        function updatePreview() {
          var value = (input.value || '').trim();
          preview.classList.toggle('is-empty', value === '');
          if (value !== '') {
            image.src = value;
          }
        }

        input.addEventListener('input', updatePreview);
        updatePreview();
      });

      document.querySelectorAll('[data-credential-upload]').forEach(function (field) {
        var hidden = field.querySelector('[data-credential-value]');
        var fileInput = field.querySelector('[data-credential-file]');
        var drop = field.querySelector('[data-credential-drop]');
        var status = field.querySelector('[data-credential-status]');
        var title = field.querySelector('[data-credential-title]');
        var description = field.querySelector('[data-credential-description]');
        var action = field.querySelector('[data-credential-action]');
        var hasSavedCredential = field.getAttribute('data-credential-saved') === 'true';

        function setStatus(message, state) {
          if (! status) return;

          status.textContent = message;
          status.classList.toggle('is-saved', state === 'saved');
          status.classList.toggle('is-ready', state === 'ready');
        }

        function setCredentialState(state, fileName) {
          var isSaved = state === 'saved';
          var isReady = state === 'ready';

          drop.classList.toggle('is-saved', isSaved);
          drop.classList.toggle('is-ready', isReady);

          if (title) {
            title.textContent = isSaved ? 'Credential Google sudah tersimpan' : (isReady ? 'Credential baru siap disimpan' : 'Upload file credential JSON');
          }

          if (description) {
            description.textContent = isSaved
              ? 'Gunakan file baru bila ingin mengganti service account yang aktif.'
              : (isReady ? fileName + ' akan mengganti credential aktif setelah Settings disimpan.' : 'Klik area ini atau seret file service account dari Google Cloud.');
          }

          if (action) {
            action.textContent = isSaved || isReady ? 'Ganti credential JSON' : 'Pilih credential JSON';
          }
        }

        function readFile(file) {
          if (! file) return;

          if (! file.name.toLowerCase().endsWith('.json')) {
            setStatus('File harus berformat .json.');
            return;
          }

          var reader = new FileReader();
          reader.onload = function () {
            hidden.value = String(reader.result || '');
            setCredentialState('ready', file.name);
            setStatus(file.name + ' siap disimpan. Klik Simpan Settings untuk menerapkan perubahan.', 'ready');
          };
          reader.onerror = function () {
            setStatus('File gagal dibaca. Coba pilih ulang.');
          };
          reader.readAsText(file);
        }

        fileInput.addEventListener('change', function () {
          readFile(fileInput.files && fileInput.files[0]);
        });

        ['dragenter', 'dragover'].forEach(function (eventName) {
          drop.addEventListener(eventName, function (event) {
            event.preventDefault();
            drop.classList.add('is-dragging');
          });
        });

        ['dragleave', 'drop'].forEach(function (eventName) {
          drop.addEventListener(eventName, function () {
            drop.classList.remove('is-dragging');
          });
        });

        drop.addEventListener('drop', function (event) {
          event.preventDefault();
          readFile(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
        });

        setCredentialState(hasSavedCredential ? 'saved' : 'empty');
      });

      document.querySelectorAll('[data-add-auto-link]').forEach(function (button) {
        button.addEventListener('click', function () {
          var wrapper = button.parentElement.querySelector('[data-auto-links]');
          var row = wrapper.querySelector('[data-auto-link-row]').cloneNode(true);
          row.querySelectorAll('input').forEach(function (input) {
            input.value = '';
          });
          wrapper.appendChild(row);
        });
      });

      document.addEventListener('click', function (event) {
        var remove = event.target.closest('[data-remove-auto-link]');
        if (! remove) {
          return;
        }

        var wrapper = remove.closest('[data-auto-links]');
        var rows = wrapper.querySelectorAll('[data-auto-link-row]');

        if (rows.length === 1) {
          rows[0].querySelectorAll('input').forEach(function (input) {
            input.value = '';
          });
          return;
        }

        remove.closest('[data-auto-link-row]').remove();
      });
    })();
  </script>
@endpush
