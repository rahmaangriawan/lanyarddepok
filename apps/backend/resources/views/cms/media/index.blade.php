@extends('layouts.meridian')

@section('title', 'Media Library')

@php
    $typeLabels = [
        'all' => 'Semua',
        'image' => 'Gambar',
        'pdf' => 'PDF',
        'other' => 'Lainnya',
    ];
    $formatBytes = function (?int $bytes): string {
        if (!$bytes) {
            return '0 KB';
        }
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }
        return max(1, round($bytes / 1024)) . ' KB';
    };
    $displayName = function (string $filename): string {
        $name = pathinfo($filename, PATHINFO_FILENAME) ?: $filename;
        $name = preg_replace('/[-_]+/', ' ', $name) ?: $name;
        return \Illuminate\Support\Str::headline($name);
    };
@endphp

@push('head')
  <style>
    .media-dropzone {
      position: relative;
      min-height: 15rem;
      display: grid;
      place-items: center;
      border: 1px dashed color-mix(in srgb, var(--color-primary) 34%, var(--color-border));
      border-radius: var(--radius-2xl);
      background: color-mix(in srgb, var(--color-primary) 5%, var(--color-card));
      padding: 2.5rem;
      text-align: center;
      cursor: pointer;
      transition: border-color .18s ease, background-color .18s ease, transform .18s ease;
    }
    .media-dropzone:hover,
    .media-dropzone.is-dragging {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 9%, var(--color-card));
      transform: translateY(-1px);
    }
    .media-dropzone.is-uploading {
      pointer-events: none;
      opacity: .8;
    }
    .media-dropzone input[type="file"] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }
    .media-dropzone__content {
      position: relative;
      z-index: 1;
      display: grid;
      justify-items: center;
      align-content: center;
      gap: .65rem;
      max-width: 32rem;
      margin-inline: auto;
    }
    .media-dropzone__content .media-card__icon {
      margin: 0;
    }
    .media-dropzone__title {
      margin: .35rem 0 0;
      color: var(--color-foreground);
      font-size: 1.25rem;
      font-weight: 800;
      line-height: 1.2;
    }
    .media-dropzone__copy {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: .9rem;
      line-height: 1.6;
    }
    .media-upload-loading {
      display: none;
      align-items: center;
      gap: .5rem;
      justify-content: center;
      margin-top: 1rem;
      color: var(--color-primary);
      font-weight: 700;
    }
    .media-dropzone.is-uploading .media-upload-loading {
      display: flex;
    }
    .media-spinner {
      width: 1rem;
      height: 1rem;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
      border-top-color: var(--color-primary);
      animation: media-spin .8s linear infinite;
    }
    @keyframes media-spin {
      to { transform: rotate(360deg); }
    }
    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
      gap: 1rem;
    }
    .media-card__preview {
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      background: var(--color-background);
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .media-card__preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .media-card__icon {
      width: 3rem;
      height: 3rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: var(--meridian-accent);
      background: color-mix(in srgb, var(--meridian-accent) 12%, transparent);
    }
    .media-actions {
      display: flex;
      gap: .45rem;
      align-items: center;
    }
    .media-action-button {
      width: 2.15rem;
      height: 2.15rem;
      min-height: 2.15rem;
      padding: 0;
      display: inline-grid;
      place-items: center;
      border-radius: .75rem;
    }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">Media Library</h1>
      <p class="page__description">Unggah, preview, salin URL, dan hapus aset visual untuk konten website.</p>
    </div>
  </header>

  <div class="page__body">
    <section class="page__section">
      <form class="media-dropzone" method="post" action="{{ route('cms.store', 'media') }}" enctype="multipart/form-data" data-media-upload-form>
        @csrf
        <input type="file" name="file" accept="image/*,application/pdf" required data-media-file-input aria-label="Upload media" />
        <div class="media-dropzone__content">
          <div class="media-card__icon">
            @include('cms.partials.icon', ['name' => 'media'])
          </div>
          <h2 class="media-dropzone__title">Upload Media Baru</h2>
          <p class="media-dropzone__copy">Klik kotak ini atau seret gambar/PDF ke sini. Maksimal 5MB per file.</p>
          <div class="media-upload-loading" data-media-upload-loading>
            <span class="media-spinner"></span>
            <span>Mengupload file...</span>
          </div>
        </div>
      </form>
    </section>

    <section class="page__section">
      <div class="card">
        <div class="card__header flex-wrap gap-3">
          <form class="flex w-full flex-col gap-2 md:flex-row" method="get" action="{{ route('cms.index', 'media') }}">
            <div class="input-group md:w-72">
              <span class="input-group__text">@include('cms.partials.icon', ['name' => 'search'])</span>
              <input class="input" type="search" name="q" value="{{ $filters['q'] }}" placeholder="Cari filename atau URL..." />
            </div>
            <select class="input md:w-40" name="file_type">
              @foreach($typeLabels as $value => $label)
                <option value="{{ $value }}" @selected($filters['file_type'] === $value)>{{ $label }}</option>
              @endforeach
            </select>
            <button class="button button--outline button--neutral" type="submit">Filter</button>
          </form>
        </div>

        <div class="card__body">
          <div class="media-grid">
            @forelse($items as $item)
              @php
                  $isImage = str_starts_with((string) $item->mimetype, 'image/');
                  $isPdf = $item->mimetype === 'application/pdf';
              @endphp
              <article class="card media-card">
                <div class="card__body">
                  <div class="media-card__preview">
                    @if($isImage)
                      <img src="{{ $item->url }}" alt="{{ $item->filename }}" loading="lazy" />
                    @else
                      <div class="text-center">
                        <div class="mx-auto media-card__icon">
                          @include('cms.partials.icon', ['name' => $isPdf ? 'file' : 'media'])
                        </div>
                        <div class="mt-3 text-sm font-bold">{{ $isPdf ? 'PDF' : 'FILE' }}</div>
                      </div>
                    @endif
                  </div>

                  <h2 class="mt-4 line-clamp-2 font-bold" title="{{ $item->filename }}">{{ $displayName($item->filename) }}</h2>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span class="badge badge--light">{{ $item->mimetype }}</span>
                    <span class="badge badge--light">{{ $formatBytes($item->size) }}</span>
                  </div>
                  <p class="mt-2 text-xs text-muted-foreground">{{ optional($item->createdAt)->translatedFormat('d M Y H:i') }}</p>

                  <div class="media-actions mt-4">
                    <button class="button button--sm button--primary media-action-button" type="button" data-copy-url="{{ $item->url }}" title="Copy URL" aria-label="Copy URL {{ $item->filename }}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.05em" height="1.05em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm-4 4q-.825 0-1.412-.587T3 20V7h2v13h10v2z"/></svg>
                    </button>
                    <a class="button button--sm button--outline button--neutral media-action-button" href="{{ $item->url }}" target="_blank" rel="noopener" title="Buka file" aria-label="Buka {{ $item->filename }}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.05em" height="1.05em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3l-1.42-1.42l9.3-9.29H14z"/><path fill="currentColor" d="M5 5h6v2H5v12h12v-6h2v6q0 .825-.587 1.413T17 21H5q-.825 0-1.412-.587T3 19V7q0-.825.588-1.412T5 5"/></svg>
                    </a>
                    <form method="post" action="{{ route('cms.destroy', ['media', $item->id]) }}" onsubmit="return confirm('Hapus media ini?')">
                      @csrf
                      @method('DELETE')
                      <button class="button button--sm button--outline button--danger media-action-button" type="submit" title="Hapus file" aria-label="Hapus {{ $item->filename }}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.05em" height="1.05em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"/></svg>
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            @empty
              <div class="card">
                <div class="card__body text-center">
                  <div class="mx-auto media-card__icon">@include('cms.partials.icon', ['name' => 'media'])</div>
                  <h2 class="mt-4 text-lg font-bold">Belum ada media</h2>
                  <p class="mt-2 text-sm text-muted-foreground">Upload file pertama untuk mulai mengelola aset website.</p>
                </div>
              </div>
            @endforelse
          </div>
        </div>

        <div class="card__footer">
          <span class="text-xs text-muted-foreground">Showing {{ $items->firstItem() ?? 0 }}-{{ $items->lastItem() ?? 0 }} of {{ $items->total() }}</span>
          <div class="ms-auto">{{ $items->links() }}</div>
        </div>
      </div>
    </section>
  </div>
@endsection

@push('scripts')
  <script>
    document.querySelectorAll('[data-media-upload-form]').forEach(function (form) {
      var input = form.querySelector('[data-media-file-input]');

      function submitUpload() {
        if (!input || !input.files || input.files.length === 0) return;
        form.classList.add('is-uploading');
        form.submit();
      }

      input.addEventListener('change', submitUpload);

      ['dragenter', 'dragover'].forEach(function (eventName) {
        form.addEventListener(eventName, function (event) {
          event.preventDefault();
          form.classList.add('is-dragging');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        form.addEventListener(eventName, function (event) {
          event.preventDefault();
          form.classList.remove('is-dragging');
        });
      });

      form.addEventListener('drop', function (event) {
        if (!event.dataTransfer || !event.dataTransfer.files.length) return;
        input.files = event.dataTransfer.files;
        submitUpload();
      });

      form.addEventListener('submit', function () {
        form.classList.add('is-uploading');
      });
    });

    document.querySelectorAll('[data-copy-url]').forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-copy-url') || '';
        navigator.clipboard.writeText(value).then(function () {
          var original = button.innerHTML;
          button.textContent = 'OK';
          setTimeout(function () { button.innerHTML = original; }, 1200);
        });
      });
    });
  </script>
@endpush
