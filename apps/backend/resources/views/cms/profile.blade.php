@extends('layouts.meridian')

@section('title', 'Profil Saya')

@php
  $authorBaseUrl = rtrim(config('app.frontend_url', env('ASTRO_FRONTEND_URL', 'http://localhost:4321')), '/').'/penulis/';
@endphp

@push('head')
  <style>
    .author-avatar-picker { display: grid; gap: .75rem; }
    .author-avatar-preview { display: grid; place-items: center; width: 8rem; aspect-ratio: 1; overflow: hidden; border: 1px solid var(--color-border); border-radius: 50%; background: var(--color-muted); color: var(--color-primary); font-size: 2rem; font-weight: 800; }
    .author-avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
    .author-avatar-actions { display: flex; flex-wrap: wrap; gap: .6rem; }
    .author-profile-slug { display: grid; gap: .45rem; padding: .8rem .9rem; border: 1px dashed var(--color-border); border-radius: var(--radius-lg); background: var(--color-background); }
    .author-profile-slug code { overflow: hidden; color: var(--color-primary-emphasis); font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }
    .author-media-modal { position: fixed; inset: 0; z-index: 10001; display: none; align-items: center; justify-content: center; padding: 1rem; background: rgba(15, 23, 42, .45); }
    .author-media-modal.is-open { display: flex; }
    .author-media-modal__panel { width: min(54rem, 100%); max-height: 86vh; overflow: auto; border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: #fff; box-shadow: 0 1.5rem 4rem rgba(15, 23, 42, .22); }
    .author-media-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
    .author-media-item { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-card); color: inherit; text-align: left; cursor: pointer; }
    .author-media-item:hover, .author-media-item:focus-visible { border-color: var(--color-primary); outline: none; }
    .author-media-item img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; }
    .author-media-item span { display: block; overflow: hidden; padding: .5rem; font-size: .72rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .author-media-pagination { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
    @media (max-width: 640px) { .author-media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
@endpush

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">Profil Saya</h1>
      <p class="page__description">Kelola identitas penulis publik dan password login dashboard.</p>
    </div>
  </header>

  <div class="page__body">
    <section class="page__section">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 xl:col-span-6">
          <form class="card" method="post" action="{{ route('profile.update') }}">
            @csrf
            @method('PATCH')
            <div class="card__header"><span class="card__title">Profil Penulis</span></div>
            <div class="card__body space-y-4">
              <div class="form-group">
                <label class="form-label">Foto Profil</label>
                <div class="author-avatar-picker" data-author-avatar-picker>
                  <div class="author-avatar-preview" data-author-avatar-preview>
                    @if($user->avatar)
                      <img src="{{ $user->avatar }}" alt="Foto {{ $user->name }}" data-author-avatar-image />
                    @else
                      <span data-author-avatar-initial>{{ strtoupper(substr($user->name, 0, 1)) }}</span>
                    @endif
                  </div>
                  <input id="avatar" type="hidden" name="avatar" value="{{ old('avatar', $user->avatar) }}" data-author-avatar-input />
                  <div class="author-avatar-actions">
                    <button class="button button--outline button--neutral" type="button" data-open-author-media>Pilih dari Media Library</button>
                    <button class="button button--ghost text-danger" type="button" data-remove-author-avatar @disabled(! $user->avatar)>Hapus foto</button>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="name">Nama</label>
                <input id="name" class="input" type="text" name="name" value="{{ old('name', $user->name) }}" required data-author-name />
              </div>
              <div class="form-group">
                <label class="form-label" for="bio">Bio Penulis</label>
                <textarea id="bio" class="input min-h-32" name="bio" maxlength="600" placeholder="Ceritakan peran atau keahlian Anda sebagai penulis." data-author-bio>{{ old('bio', $user->bio) }}</textarea>
              </div>
              <div class="author-profile-slug">
                <span class="text-sm font-semibold">URL profil publik</span>
                <code data-author-profile-url>{{ $authorBaseUrl }}{{ $user->slug ?: 'nama-penulis' }}</code>
                <span class="text-xs text-muted-foreground">Slug dibuat otomatis dari nama ketika profil disimpan.</span>
              </div>
              <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input id="email" class="input" type="email" name="email" value="{{ old('email', $user->email) }}" required />
              </div>
            </div>
            <div class="card__footer">
              <button class="button button--primary ms-auto" type="submit">Simpan Profil</button>
            </div>
          </form>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <form class="card" method="post" action="{{ route('password.update') }}">
            @csrf
            @method('PUT')
            <div class="card__header"><span class="card__title">Update Password</span></div>
            <div class="card__body space-y-4">
              <div class="form-group">
                <label class="form-label" for="current_password">Password Saat Ini</label>
                <input id="current_password" class="input" type="password" name="current_password" autocomplete="current-password" />
              </div>
              <div class="form-group">
                <label class="form-label" for="password">Password Baru</label>
                <input id="password" class="input" type="password" name="password" autocomplete="new-password" />
              </div>
              <div class="form-group">
                <label class="form-label" for="password_confirmation">Konfirmasi Password</label>
                <input id="password_confirmation" class="input" type="password" name="password_confirmation" autocomplete="new-password" />
              </div>
            </div>
            <div class="card__footer">
              <button class="button button--primary ms-auto" type="submit">Simpan Password</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>

  <div class="author-media-modal" data-author-media-modal aria-hidden="true">
    <div class="author-media-modal__panel" role="dialog" aria-modal="true" aria-labelledby="authorMediaTitle">
      <div class="card mb-0">
        <div class="card__header flex items-center justify-between gap-4">
          <div><span id="authorMediaTitle" class="card__title">Pilih Foto Profil</span><p class="mt-1 text-sm text-muted-foreground">Pilih gambar dari Media Library.</p></div>
          <button class="button button--outline button--neutral" type="button" data-close-author-media>Tutup</button>
        </div>
        <div class="card__body">
          <p class="text-sm text-muted-foreground" data-author-media-status>Memuat gambar...</p>
          <div class="author-media-grid mt-4" data-author-media-grid></div>
          <div class="author-media-pagination" data-author-media-pagination hidden>
            <button class="button button--outline button--neutral" type="button" data-author-media-prev>Sebelumnya</button>
            <span class="text-sm font-semibold text-muted-foreground" data-author-media-page></span>
            <button class="button button--outline button--neutral" type="button" data-author-media-next>Berikutnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
@endsection

@push('scripts')
  <script>
    (function () {
      var nameInput = document.querySelector('[data-author-name]');
      var avatarInput = document.querySelector('[data-author-avatar-input]');
      var avatarPreview = document.querySelector('[data-author-avatar-preview]');
      var removeAvatar = document.querySelector('[data-remove-author-avatar]');
      var profileUrl = document.querySelector('[data-author-profile-url]');
      var baseUrl = @json($authorBaseUrl);
      var modal = document.querySelector('[data-author-media-modal]');
      var grid = document.querySelector('[data-author-media-grid]');
      var status = document.querySelector('[data-author-media-status]');
      var pagination = document.querySelector('[data-author-media-pagination]');
      var pageLabel = document.querySelector('[data-author-media-page]');
      var previous = document.querySelector('[data-author-media-prev]');
      var next = document.querySelector('[data-author-media-next]');
      var endpoint = @json(route('cms.media-picker'));
      var state = { loaded: false, page: 1, lastPage: 1, loading: false };

      function slugify(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'nama-penulis';
      }

      function refreshProfileUrl() {
        if (profileUrl && nameInput) profileUrl.textContent = baseUrl + slugify(nameInput.value || '');
      }

      function refreshAvatar(url) {
        var name = (nameInput && nameInput.value || 'A').trim();
        avatarPreview.innerHTML = url
          ? '<img src="' + url.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" alt="Foto profil" data-author-avatar-image />'
          : '<span data-author-avatar-initial>' + (name.charAt(0) || 'A').toUpperCase() + '</span>';
        if (removeAvatar) removeAvatar.disabled = !url;
      }

      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      }

      function renderMedia(items) {
        grid.innerHTML = '';
        if (!items.length) {
          status.textContent = 'Belum ada gambar di Media Library.';
          return;
        }

        status.textContent = 'Pilih gambar untuk foto profil.';
        items.forEach(function (item) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'author-media-item';
          button.innerHTML = '<img src="' + item.url.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" alt="" /><span></span>';
          button.querySelector('span').textContent = item.filename;
          button.addEventListener('click', function () {
            avatarInput.value = item.url;
            refreshAvatar(item.url);
            closeModal();
          });
          grid.appendChild(button);
        });
      }

      function loadPage(page) {
        if (state.loading) return;
        state.loading = true;
        status.textContent = 'Memuat gambar...';
        fetch(endpoint + '?page=' + page + '&per_page=24', { headers: { Accept: 'application/json' } })
          .then(function (response) { if (!response.ok) throw new Error(); return response.json(); })
          .then(function (payload) {
            var details = payload.pagination || {};
            state.page = Number(details.current_page || page || 1);
            state.lastPage = Math.max(1, Number(details.last_page || 1));
            state.loaded = true;
            renderMedia(payload.media || []);
            pagination.hidden = false;
            pageLabel.textContent = 'Halaman ' + state.page + ' dari ' + state.lastPage;
            previous.disabled = state.page <= 1;
            next.disabled = state.page >= state.lastPage;
          })
          .catch(function () { status.textContent = 'Media Library gagal dimuat. Coba lagi.'; })
          .finally(function () { state.loading = false; });
      }

      document.querySelectorAll('[data-open-author-media]').forEach(function (button) {
        button.addEventListener('click', function () {
          modal.classList.add('is-open');
          modal.setAttribute('aria-hidden', 'false');
          if (!state.loaded) loadPage(1);
        });
      });
      document.querySelectorAll('[data-close-author-media]').forEach(function (button) { button.addEventListener('click', closeModal); });
      modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });
      previous.addEventListener('click', function () { if (state.page > 1) loadPage(state.page - 1); });
      next.addEventListener('click', function () { if (state.page < state.lastPage) loadPage(state.page + 1); });
      removeAvatar.addEventListener('click', function () { avatarInput.value = ''; refreshAvatar(''); });
      nameInput.addEventListener('input', function () { refreshProfileUrl(); if (!avatarInput.value) refreshAvatar(''); });
      refreshProfileUrl();
    })();
  </script>
@endpush
