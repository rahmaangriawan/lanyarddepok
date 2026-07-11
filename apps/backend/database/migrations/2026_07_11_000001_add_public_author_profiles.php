<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user', function (Blueprint $table) {
            if (! Schema::hasColumn('user', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }

            if (! Schema::hasColumn('user', 'bio')) {
                $table->text('bio')->nullable()->after('email');
            }

            if (! Schema::hasColumn('user', 'avatar')) {
                $table->string('avatar')->nullable()->after('bio');
            }
        });

        Schema::table('post', function (Blueprint $table) {
            if (! Schema::hasColumn('post', 'authorId')) {
                $table->unsignedBigInteger('authorId')->nullable()->after('categoryId');
                $table->index('authorId');
                $table->foreign('authorId')->references('id')->on('user')->nullOnDelete();
            }
        });

        if (! Schema::hasTable('author_slug_redirect')) {
            Schema::create('author_slug_redirect', function (Blueprint $table) {
                $table->id();
                $table->string('slug')->unique();
                $table->unsignedBigInteger('userId');
                $table->timestamp('createdAt')->useCurrent();
                $table->foreign('userId')->references('id')->on('user')->cascadeOnDelete();
            });
        }

        $usedSlugs = [];
        foreach (DB::table('user')->orderBy('id')->get(['id', 'name', 'slug']) as $user) {
            $base = Str::slug((string) $user->name) ?: "penulis-{$user->id}";
            $slug = $base;
            $suffix = 2;

            while (isset($usedSlugs[$slug])) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }

            $usedSlugs[$slug] = true;

            if ($user->slug !== $slug) {
                DB::table('user')->where('id', $user->id)->update(['slug' => $slug]);
            }
        }

        Schema::table('user', function (Blueprint $table) {
            $table->unique('slug', 'user_slug_unique');
        });

        $primaryAuthorId = DB::table('user')
            ->where('role', 'ADMIN')
            ->orderBy('id')
            ->value('id') ?? DB::table('user')->orderBy('id')->value('id');

        if ($primaryAuthorId) {
            DB::table('post')->whereNull('authorId')->update(['authorId' => $primaryAuthorId]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('author_slug_redirect');

        Schema::table('post', function (Blueprint $table) {
            if (Schema::hasColumn('post', 'authorId')) {
                $table->dropForeign(['authorId']);
                $table->dropIndex(['authorId']);
                $table->dropColumn('authorId');
            }
        });

        Schema::table('user', function (Blueprint $table) {
            if (Schema::hasColumn('user', 'slug')) {
                $table->dropUnique('user_slug_unique');
                $table->dropColumn('slug');
            }

            if (Schema::hasColumn('user', 'bio')) {
                $table->dropColumn('bio');
            }

            if (Schema::hasColumn('user', 'avatar')) {
                $table->dropColumn('avatar');
            }
        });
    }
};
