@extends('layouts.meridian')

@section('title', 'Dashboard')

@push('head')
  <style>
    .dashboard-stat-card {
      min-height: 17.5rem;
      overflow: hidden;
    }
    .dashboard-stat-card__top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }
    .dashboard-stat-icon {
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: .75rem;
      color: var(--stat-color);
      background: color-mix(in srgb, var(--stat-color) 14%, #fff);
      margin-bottom: 1rem;
    }
    .dashboard-trend {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      border-radius: 999px;
      padding: .25rem .55rem;
      font-size: .8rem;
      font-weight: 700;
      color: #15803d;
      background: color-mix(in srgb, #16a34a 14%, #fff);
    }
    .dashboard-trend.is-down {
      color: #b91c1c;
      background: color-mix(in srgb, #ef4444 12%, #fff);
    }
    .dashboard-stat-value {
      margin-top: 1rem;
      font-size: clamp(2.25rem, 4vw, 3.25rem);
      line-height: 1;
      font-weight: 500;
      letter-spacing: 0;
      color: var(--color-foreground);
    }
    .dashboard-stat-caption {
      margin-top: .75rem;
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: .12em;
      color: var(--color-muted-foreground);
    }
    .dashboard-sparkline {
      width: 100%;
      height: 6.75rem;
      margin-top: 1.25rem;
      color: var(--stat-color);
    }
    .dashboard-progress {
      display: grid;
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .dashboard-progress__track {
      display: grid;
      grid-template-columns: var(--segments);
      height: 1rem;
      overflow: hidden;
      border-radius: 999px;
      background: var(--color-background);
    }
    .dashboard-progress__bar {
      background: var(--bar-color);
    }
    .dashboard-progress__items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
      gap: .75rem;
    }
    .dashboard-progress__item {
      border-right: 1px solid var(--color-border);
    }
    .dashboard-progress__item:last-child {
      border-right: 0;
    }
    .dashboard-progress__label {
      display: flex;
      align-items: center;
      gap: .4rem;
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--color-muted-foreground);
    }
    .dashboard-dot {
      width: .5rem;
      height: .5rem;
      border-radius: 999px;
      background: var(--bar-color);
    }
    .dashboard-progress__value {
      margin-top: .65rem;
      font-size: 1.7rem;
      line-height: 1;
      color: var(--color-foreground);
    }
    .dashboard-progress__percent {
      margin-top: .45rem;
      font-size: .85rem;
      color: var(--color-muted-foreground);
    }
    .dashboard-module-card {
      position: relative;
      overflow: hidden;
      text-decoration: none;
      transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
    }
    .dashboard-module-card::after {
      content: none;
    }
    .dashboard-module-card:hover {
      transform: translateY(-2px);
      border-color: color-mix(in srgb, var(--stat-color) 42%, var(--color-border));
      box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--stat-color) 10%, transparent);
    }
    .dashboard-module-value {
      margin-top: 1.4rem;
      font-size: 2rem;
      line-height: 1;
      font-weight: 500;
    }
    .dashboard-module-caption {
      margin-top: .35rem;
      color: var(--color-muted-foreground);
      font-size: .82rem;
    }
    .stat-tone-blue { --stat-color: #2563eb; }
    .stat-tone-green { --stat-color: #16a34a; }
    .stat-tone-amber { --stat-color: #f59e0b; }
    .stat-tone-violet { --stat-color: #7c3aed; }
    .segment-tone-success { --bar-color: #16a34a; }
    .segment-tone-blue { --bar-color: #2563eb; }
    .segment-tone-amber { --bar-color: #f59e0b; }
    @media (max-width: 768px) {
      .dashboard-progress__items {
        grid-template-columns: 1fr;
      }
      .dashboard-progress__item {
        border-right: 0;
        border-bottom: 1px solid var(--color-border);
        padding-bottom: .75rem;
      }
      .dashboard-progress__item:last-child {
        border-bottom: 0;
      }
    }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">Welcome back, <span>{{ auth()->user()->name }}</span> 👋</h1>
    </div>
  </header>

  <div class="page__body">
    <section class="page__section">
      <div class="grid grid-cols-12 gap-4">
        @foreach($stats as $stat)
          @php
              $tone = $stat['tone'] ?? 'blue';
              $isSegmented = ! empty($stat['segments']);
              $sparkline = $stat['sparkline'] ?? [];
              $maxSpark = max($sparkline ?: [1]);
              $points = collect($sparkline)->map(function ($value, $index) use ($sparkline, $maxSpark) {
                  $count = max(count($sparkline) - 1, 1);
                  $x = round(($index / $count) * 240, 2);
                  $y = round(88 - (($value / max($maxSpark, 1)) * 64), 2);
                  return "{$x},{$y}";
              })->implode(' ');
              $areaPoints = $points ? "0,104 {$points} 240,104" : '';
              $gridClass = 'xl:col-span-4';
              $trendValue = (float) ($stat['trend'] ?? 0);
          @endphp
          <div class="col-span-12 md:col-span-6 {{ $gridClass }}">
            <div class="card dashboard-stat-card stat-tone-{{ $tone }} h-full">
              <div class="card__body">
                <div class="dashboard-stat-card__top">
                  <div>
                    <span class="dashboard-stat-icon" aria-hidden="true">
                      @if($stat['label'] === 'Produk')
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.35em" height="1.35em" viewBox="0 0 24 24"><path fill="currentColor" d="M7 18c-1.1 0-2-.9-2-2V7.83L3.59 9.24L2.17 7.83L7 3l4.83 4.83l-1.42 1.41L9 7.83V16h8.17l-1.41-1.41l1.41-1.42L22 18l-4.83 4.83l-1.41-1.42L17.17 20z"/></svg>
                      @elseif($stat['label'] === 'Artikel')
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.35em" height="1.35em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h9l5 5v13q0 .825-.587 1.413T18 22zm8-14V4H6v16h12V8zM8 12h8v-2H8zm0 4h8v-2H8z"/></svg>
                      @elseif($stat['label'] === 'Media')
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.35em" height="1.35em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm1-4h12l-3.75-5l-3 4L9 13z"/></svg>
                      @else
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.35em" height="1.35em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12q-1.65 0-2.825-1.175T8 8t1.175-2.825T12 4t2.825 1.175T16 8t-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"/></svg>
                      @endif
                    </span>
                    <span class="stat__label">{{ $stat['label'] }}</span>
                    <div class="dashboard-stat-value">{{ number_format($stat['value']) }}</div>
                    <p class="dashboard-stat-caption">{{ $stat['caption'] }}</p>
                  </div>
                  <span class="dashboard-trend {{ $trendValue < 0 ? 'is-down' : '' }}">{{ $trendValue < 0 ? '↓' : '↑' }} {{ $stat['trend'] }}</span>
                </div>

                @if($isSegmented)
                  @php
                      $segments = collect($stat['segments']);
                      $template = $segments->map(fn ($segment) => max((int) $segment['percent'], 1) . 'fr')->implode(' ');
                  @endphp
                  <div class="dashboard-progress">
                    <div class="dashboard-progress__track" style="--segments: {{ $template }}">
                      @foreach($segments as $segment)
                        <span class="dashboard-progress__bar segment-tone-{{ $segment['tone'] ?? 'blue' }}"></span>
                      @endforeach
                    </div>
                    <div class="dashboard-progress__items">
                      @foreach($segments as $segment)
                        <div class="dashboard-progress__item">
                          <div class="dashboard-progress__label segment-tone-{{ $segment['tone'] ?? 'blue' }}">
                            <span class="dashboard-dot"></span>
                            {{ $segment['label'] }}
                          </div>
                          <div class="dashboard-progress__value">{{ number_format($segment['value']) }}</div>
                          <div class="dashboard-progress__percent">{{ $segment['percent'] }}%</div>
                        </div>
                      @endforeach
                    </div>
                  </div>
                @else
                  <svg class="dashboard-sparkline" viewBox="0 0 240 112" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="sparkline-fill-{{ $loop->index }}" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="currentColor" stop-opacity=".28" />
                        <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points="{{ $areaPoints }}" fill="url(#sparkline-fill-{{ $loop->index }})"></polygon>
                    <polyline points="{{ $points }}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
                  </svg>
                @endif
              </div>
            </div>
          </div>
        @endforeach
      </div>
    </section>

    <section class="page__section">
      <div class="grid grid-cols-12 gap-4 items-start">
        <div class="col-span-12 xl:col-span-8">
          <div class="card">
            <div class="card__header">
              <span class="card__title">Aktivitas Pos Terbaru</span>
              <a class="button button--sm button--primary" href="{{ route('cms.create', 'posts') }}">Pos Baru</a>
            </div>
            <div class="table-responsive">
              <table class="table table--hover table--align-middle">
                <thead class="table__head--alt">
                  <tr>
                    <th>Judul</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th class="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse($recentPosts as $post)
                    <tr>
                      <th scope="row">{{ $post->title }}</th>
                      <td>{{ $post->slug }}</td>
                      <td><span class="badge {{ $post->published ? 'badge--success' : 'badge--warning' }}">{{ $post->published ? 'Published' : 'Draft' }}</span></td>
                      <td class="text-end"><a class="button button--sm button--outline button--neutral" href="{{ route('cms.edit', ['posts', $post->id]) }}">Edit</a></td>
                    </tr>
                  @empty
                    <tr><td colspan="4" class="text-center text-muted-foreground">Belum ada pos.</td></tr>
                  @endforelse
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-span-12 xl:col-span-4">
          <div class="card">
            <div class="card__header">
              <span class="card__title">Inquiry Terbaru</span>
              <a class="button button--sm button--outline button--neutral" href="{{ route('cms.index', 'inquiries') }}">Lihat</a>
            </div>
            <div class="card__body">
              <div class="space-y-3">
                @forelse($recentInquiries as $inquiry)
                  <a class="media media--interactive" href="{{ route('cms.edit', ['inquiries', $inquiry->id]) }}">
                    <span class="avatar avatar--sm avatar--circle" data-stisla-avatar><span class="avatar__fallback">{{ strtoupper(substr($inquiry->name, 0, 2)) }}</span></span>
                    <span class="media__body">
                      <span class="media__title">{{ $inquiry->name }}</span>
                      <span class="media__description">{{ $inquiry->email ?: $inquiry->phone }}</span>
                    </span>
                  </a>
                @empty
                  <p class="text-muted-foreground">Belum ada inquiry.</p>
                @endforelse
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="page__section">
      <div class="grid grid-cols-12 gap-4">
        @foreach($moduleCounts as $module)
          <div class="col-span-12 sm:col-span-6 xl:col-span-3">
            <a class="card dashboard-module-card stat-tone-{{ $module['tone'] }} h-full" href="{{ $module['href'] }}">
              <div class="card__body">
                <div>
                  <span class="text-eyebrow">{{ $module['label'] }}</span>
                  <div class="dashboard-module-value">{{ number_format($module['count']) }}</div>
                  <p class="dashboard-module-caption">{{ $module['caption'] }}</p>
                </div>
              </div>
            </a>
          </div>
        @endforeach
      </div>
    </section>
  </div>
@endsection
