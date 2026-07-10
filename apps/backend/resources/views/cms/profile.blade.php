@extends('layouts.meridian')

@section('title', 'Profil Saya')

@section('content')
  <header class="page__header">
    <div class="page__headline">
      <h1 class="page__title">Profil Saya</h1>
      <p class="page__description">Kelola identitas admin dan password login dashboard.</p>
    </div>
  </header>

  <div class="page__body">
    <section class="page__section">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 xl:col-span-6">
          <form class="card" method="post" action="{{ route('profile.update') }}">
            @csrf
            @method('PATCH')
            <div class="card__header"><span class="card__title">Informasi Profil</span></div>
            <div class="card__body space-y-4">
              <div class="form-group">
                <label class="form-label" for="name">Nama</label>
                <input id="name" class="input" type="text" name="name" value="{{ old('name', $user->name) }}" required />
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
@endsection
