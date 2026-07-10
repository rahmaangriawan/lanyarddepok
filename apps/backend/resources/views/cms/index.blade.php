@extends('layouts.meridian')

@section('title', $config['title'])

@php
    $createUrl = route('cms.create', $resource);
    if ($resource === 'categories' && request('type')) {
        $createUrl .= '?type=' . urlencode(request('type'));
    }

    $canToggle = collect($config['fields'])->contains(fn ($field) => in_array($field['name'] ?? '', ['published', 'approved'], true));
    $statusField = collect($config['fields'])->first(fn ($field) => in_array($field['name'] ?? '', ['published', 'approved'], true))['name'] ?? null;
    $canBulkCategory = in_array('categoryId', $config['fillable'] ?? [], true);
    $visibleColumns = collect($config['columns'])->reject(fn ($column) => ($column['key'] ?? '') === 'slug')->values();
    $primaryColumn = $visibleColumns->firstWhere('primary', true);
    $hasThumbnail = in_array('featuredImage', $config['fillable'] ?? [], true) || in_array('imageUrl', $config['fillable'] ?? [], true);

    $thumbnailFor = function ($item) {
        return data_get($item, 'featuredImage') ?: data_get($item, 'imageUrl') ?: data_get($item, 'logoUrl');
    };

    $toggleLabel = function ($item) use ($statusField) {
        if ($statusField === 'published') {
            return (bool) data_get($item, $statusField) ? 'Jadikan Draft' : 'Publish';
        }

        if ($statusField === 'approved') {
            return (bool) data_get($item, $statusField) ? 'Unapprove' : 'Approve';
        }

        return 'Ubah Status';
    };
@endphp

@push('head')
  <style>
    .cms-title-cell {
      display: flex;
      align-items: center;
      gap: .75rem;
      min-width: 15rem;
    }
    .cms-title-thumb {
      width: 3rem;
      height: 3rem;
      flex: 0 0 3rem;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: .75rem;
      background: var(--color-background);
      display: grid;
      place-items: center;
    }
    .cms-title-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cms-title-link {
      color: var(--color-foreground);
      text-decoration: none;
    }
    .cms-title-link:hover {
      color: var(--color-primary);
    }
    .cms-row-actions {
      display: inline-flex;
      justify-content: flex-end;
      gap: .45rem;
    }
    .cms-icon-action {
      width: 2.1rem;
      height: 2.1rem;
      min-height: 2.1rem;
      padding: 0;
      display: inline-grid;
      place-items: center;
      border-radius: .7rem;
    }
    .cms-icon-action:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 8%, var(--color-card));
    }
    .cms-icon-action--danger:hover {
      border-color: var(--color-danger);
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger) 8%, var(--color-card));
    }
    .cms-table-header {
      align-items: center;
      gap: 1rem;
    }
    .cms-table-tools {
      position: relative;
      display: flex;
      flex: 1 1 100%;
      align-items: center;
      justify-content: flex-start;
      gap: .75rem;
      min-width: 0;
      min-height: 2.8rem;
    }
    .cms-table-search {
      flex: 0 1 40%;
      min-width: 18rem;
      max-width: 28rem;
      min-height: 3.5rem;
      height: 3.5rem;
      border-radius: .9rem;
      align-items: center;
      box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--color-foreground) 5%, transparent);
    }
    .cms-table-search .input,
    .cms-table-search .input-group__text {
      min-height: 100%;
    }
    .bulk-panel {
      display: none;
      flex-wrap: wrap;
      gap: .5rem;
      align-items: center;
      justify-content: flex-end;
      position: absolute;
      top: 50%;
      right: 0;
      z-index: 5;
      transform: translateY(-50%);
      max-width: min(48rem, 58%);
      min-width: min(38rem, 58%);
      margin: 0;
      padding: .55rem;
      border: 1px solid var(--color-border);
      border-radius: .9rem;
      background: var(--color-card);
      box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--color-foreground) 7%, transparent);
    }
    .bulk-panel.is-visible {
      display: inline-flex;
    }
    .bulk-panel__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      border-radius: 999px;
      color: var(--meridian-accent);
      background: color-mix(in srgb, var(--meridian-accent) 12%, var(--color-card));
      font-size: .8rem;
      font-weight: 800;
    }
    .bulk-panel .input {
      width: auto;
      min-width: 9rem;
      min-height: 2rem;
      padding-top: .3rem;
      padding-bottom: .3rem;
      font-size: .85rem;
    }
    .bulk-panel .button {
      min-height: 2rem;
      padding-top: .35rem;
      padding-bottom: .35rem;
    }
    .table-checkbox {
      width: 2.75rem;
    }
    @media (max-width: 960px) {
      .cms-table-tools,
      .cms-table-search,
      .bulk-panel {
        flex: 1 1 100%;
        width: 100%;
        max-width: none;
      }
      .cms-table-tools {
        min-height: 0;
        flex-wrap: wrap;
        justify-content: stretch;
      }
      .bulk-panel {
        position: static;
        transform: none;
        min-width: 0;
        max-width: none;
      }
    }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">{{ $config['title'] }}</h1>
      <p class="page__description">{{ $config['description'] }}</p>
    </div>
    <div class="page__actions">
      <a class="button button--primary" href="{{ $createUrl }}">Tambah {{ $config['singular'] }}</a>
    </div>
  </header>

  <div class="page__body">
    <section class="page__section">
      <div class="card" data-table-select>
        <form id="bulkForm" method="post" action="{{ route('cms.bulk', $resource) }}" onsubmit="return confirm('Proses data yang dipilih?')">
          @csrf
        </form>

        <div class="card__header flex-wrap cms-table-header">
          <div class="cms-table-tools">
            <form class="input-group cms-table-search" role="search" method="get" action="{{ route('cms.index', $resource) }}">
              @if(request('type'))
                <input type="hidden" name="type" value="{{ request('type') }}" />
              @endif
              <span class="input-group__text">@include('cms.partials.icon', ['name' => 'search'])</span>
              <input type="search" name="q" value="{{ $filters['q'] ?? '' }}" class="input" placeholder="Search {{ strtolower($config['title']) }}..." aria-label="Search" />
            </form>

            <div class="bulk-panel" data-bulk-panel aria-live="polite">
              <span class="bulk-panel__count"><span data-selected-count>0</span></span>
              <span class="text-sm font-bold">dipilih</span>
              <select class="input" name="bulk_action" form="bulkForm" required>
                <option value="">Pilih aksi</option>
                @if($statusField === 'published')
                  <option value="publish">Publish</option>
                  <option value="draft">Jadikan Draft</option>
                @elseif($statusField === 'approved')
                  <option value="approve">Approve</option>
                  <option value="unapprove">Unapprove</option>
                @endif
                @if($canBulkCategory)
                  <option value="category">Ganti Kategori</option>
                @endif
                <option value="delete">Hapus</option>
              </select>
              @if($canBulkCategory)
                <select class="input" name="categoryId" form="bulkForm">
                  <option value="">Tanpa kategori</option>
                  @foreach(($options['categories'] ?? []) as $option)
                    <option value="{{ $option['value'] }}">{{ $option['label'] }}</option>
                  @endforeach
                </select>
              @endif
              <button class="button button--primary" type="submit" form="bulkForm">Terapkan</button>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table--hover table--align-middle">
            <thead class="table__head--alt">
              <tr>
                <th scope="col" class="table-checkbox">
                  <input class="checkbox" type="checkbox" data-select-all aria-label="Pilih semua" />
                </th>
                @foreach($visibleColumns as $column)
                  <th scope="col">{{ $column['label'] }}</th>
                @endforeach
                <th scope="col" class="text-end"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              @forelse($items as $item)
                @php
                    $primaryValue = data_get($item, $primaryColumn['key'] ?? 'id') ?: $config['singular'];
                @endphp
                <tr>
                  <td class="table-checkbox">
                  <input class="checkbox" type="checkbox" name="selected[]" value="{{ $item->id }}" form="bulkForm" data-row-checkbox data-select-row aria-label="Pilih {{ $primaryValue }}" />
                  </td>
                  @foreach($visibleColumns as $column)
                    @php
                        $value = data_get($item, $column['key']);
                        $type = $column['type'] ?? 'text';
                        $isPrimary = !empty($column['primary']);
                        $editUrl = route('cms.edit', [$resource, $item->id]);
                        $thumbnail = $thumbnailFor($item);
                    @endphp
                    <td class="{{ $isPrimary ? 'font-bold' : '' }}">
                      @if($isPrimary)
                        <div class="cms-title-cell">
                          @if($hasThumbnail)
                            <a class="cms-title-thumb" href="{{ $editUrl }}" aria-label="Edit {{ $value }}">
                              @if($thumbnail)
                                <img src="{{ $thumbnail }}" alt="" loading="lazy" />
                              @else
                                @include('cms.partials.icon', ['name' => 'file'])
                              @endif
                            </a>
                          @endif
                          <a class="cms-title-link line-clamp-2" href="{{ $editUrl }}">{{ $value ?: 'Tanpa judul' }}</a>
                        </div>
                      @elseif($type === 'boolean')
                        <span class="badge {{ $value ? 'badge--success' : 'badge--warning' }}">{{ $value ? 'Aktif' : 'Nonaktif' }}</span>
                      @elseif($type === 'date' && $value)
                        {{ \Illuminate\Support\Carbon::parse($value)->translatedFormat('d M Y') }}
                      @elseif($type === 'bytes' && is_numeric($value))
                        {{ round($value / 1024) }} KB
                      @else
                        <span class="line-clamp-2">{{ $value }}</span>
                      @endif
                    </td>
                  @endforeach
                  <td class="text-end">
                    <div class="cms-row-actions">
                      <a class="button button--sm button--outline button--neutral cms-icon-action" href="{{ route('cms.edit', [$resource, $item->id]) }}" title="Edit {{ $config['singular'] }}" aria-label="Edit {{ $primaryValue }}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.05em" height="1.05em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 20h4.25L19.1 9.15l-4.25-4.25L4 15.75zm2-3.42l8.85-8.85l1.42 1.42L7.42 18H6zM19.7 8.55q.575-.575.575-1.4t-.575-1.4l-1.45-1.45q-.575-.575-1.4-.575t-1.4.575l-.6.6l4.25 4.25z"/></svg>
                      </a>
                      <form method="post" action="{{ route('cms.destroy', [$resource, $item->id]) }}" onsubmit="return confirm('Hapus data ini?')">
                        @csrf
                        @method('DELETE')
                        <button class="button button--sm button--outline button--danger cms-icon-action cms-icon-action--danger" type="submit" title="Hapus {{ $config['singular'] }}" aria-label="Hapus {{ $primaryValue }}">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1.05em" height="1.05em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2z"/></svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="{{ count($visibleColumns) + 2 }}" class="text-center text-muted-foreground">
                    Belum ada data.
                  </td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

        <div class="card__footer flex-wrap gap-3">
          <span class="text-xs text-muted-foreground">Showing {{ $items->firstItem() ?? 0 }}-{{ $items->lastItem() ?? 0 }} of {{ $items->total() }}</span>
          <div class="ms-auto">{{ $items->links() }}</div>
        </div>
      </div>
    </section>
  </div>
@endsection

@push('scripts')
  <script>
    (function () {
      var selectAll = document.querySelector('[data-select-all]');
      var bulkPanel = document.querySelector('[data-bulk-panel]');
      var selectedCount = document.querySelector('[data-selected-count]');
      if (!selectAll) return;

      function rowCheckboxes() {
        return Array.from(document.querySelectorAll('[data-row-checkbox]'));
      }

      function updateBulkPanel() {
        var checkboxes = rowCheckboxes();
        var checked = checkboxes.filter(function (checkbox) {
          return checkbox.checked;
        });

        if (selectedCount) selectedCount.textContent = checked.length;
        if (bulkPanel) bulkPanel.classList.toggle('is-visible', checked.length > 0);
        selectAll.checked = checked.length > 0 && checked.length === checkboxes.length;
        selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
      }

      selectAll.addEventListener('change', function () {
        rowCheckboxes().forEach(function (checkbox) {
          checkbox.checked = selectAll.checked;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
        updateBulkPanel();
      });

      document.addEventListener('change', function (event) {
        if (! event.target.matches('[data-row-checkbox]')) {
          return;
        }

        updateBulkPanel();
      });

      updateBulkPanel();
    })();
  </script>
@endpush
