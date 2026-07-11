<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\AuthorSlugRedirect;
use App\Support\AuthorProfile;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        return view('cms.profile', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $user = $request->user();
            $previousSlug = $user->slug;

            $user->fill($request->validated());
            $nextSlug = AuthorProfile::nextSlug($user, $user->name);
            $user->slug = $nextSlug;
            $user->save();

            AuthorSlugRedirect::query()
                ->where('userId', $user->id)
                ->where('slug', $nextSlug)
                ->delete();

            if ($previousSlug && $previousSlug !== $nextSlug) {
                AuthorSlugRedirect::updateOrCreate(
                    ['slug' => $previousSlug],
                    ['userId' => $user->id],
                );
            }
        });

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
