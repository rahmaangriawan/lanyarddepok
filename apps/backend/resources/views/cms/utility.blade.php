@extends('layouts.meridian')

@section('title', $title)

@push('head')
  <style>
    .analytics-card-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .analytics-status-card {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--color-border);
      background:
        linear-gradient(135deg, color-mix(in srgb, var(--analytics-tone) 8%, transparent), transparent 52%),
        var(--color-card);
      min-height: 10rem;
    }

    .analytics-status-card .card__body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.35rem;
    }

    .analytics-status-card__top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .analytics-status-card__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 1rem;
      color: var(--analytics-tone);
      background: color-mix(in srgb, var(--analytics-tone) 12%, white);
    }

    .analytics-status-card__icon svg {
      width: 1.2rem;
      height: 1.2rem;
    }

    .analytics-status-card__badge {
      border-radius: 999px;
      padding: .35rem .65rem;
      font-size: .72rem;
      font-weight: 700;
      line-height: 1;
      color: var(--analytics-tone);
      background: color-mix(in srgb, var(--analytics-tone) 10%, white);
    }

    .analytics-status-card__label {
      color: var(--color-muted-foreground);
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .analytics-status-card__value {
      margin-top: .45rem;
      color: var(--color-foreground);
      font-size: clamp(1.25rem, 2vw, 1.6rem);
      font-weight: 800;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }

    .analytics-status-card__description {
      margin: 0;
      color: var(--color-muted-foreground);
      font-size: .9rem;
      line-height: 1.6;
    }

    @media (max-width: 980px) {
      .analytics-card-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <span class="text-eyebrow">{{ $eyebrow }}</span>
      <h1 class="page__title">{{ $title }}</h1>
      <p class="page__description">{{ $description }}</p>
    </div>
    <div class="page__actions">
      <a class="button button--outline button--neutral" href="{{ route('cms.index', 'settings') }}">Buka Settings</a>
    </div>
  </header>

  <div class="page__body">
    <section class="page__section">
      <div class="analytics-card-grid">
        @foreach($cards as $card)
          @php
            $tone = match($card['tone'] ?? 'primary') {
                'success' => 'var(--color-success, #16a34a)',
                'warning' => 'var(--color-warning, #f59e0b)',
                default => 'var(--color-primary, #2f80ed)',
            };
          @endphp
          <div class="card analytics-status-card h-full" style="--analytics-tone: {{ $tone }};">
            <div class="card__body">
              <div class="analytics-status-card__top">
                <span class="analytics-status-card__icon" aria-hidden="true">
                  @if(($card['icon'] ?? '') === 'search')
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="m20 20-3.5-3.5"></path>
                    </svg>
                  @elseif(($card['icon'] ?? '') === 'key')
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="7.5" cy="15.5" r="3.5"></circle>
                      <path d="m10 13 8-8"></path>
                      <path d="m15 5 4 4"></path>
                      <path d="m13 7 4 4"></path>
                    </svg>
                  @else
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19V5"></path>
                      <path d="M4 19h16"></path>
                      <path d="M8 15v-4"></path>
                      <path d="M12 15V8"></path>
                      <path d="M16 15v-6"></path>
                    </svg>
                  @endif
                </span>
                <span class="analytics-status-card__badge">{{ $card['status'] ?? 'Status' }}</span>
              </div>
              <div>
                <span class="analytics-status-card__label">{{ $card['label'] }}</span>
                <p class="analytics-status-card__value">{{ $card['value'] }}</p>
              </div>
              <p class="analytics-status-card__description">{{ $card['description'] ?? '' }}</p>
            </div>
          </div>
        @endforeach
      </div>
    </section>
  </div>
@endsection
