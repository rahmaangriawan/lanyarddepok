<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inquiry')) {
            Schema::create('inquiry', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email');
                $table->string('phone');
                $table->text('message');
                $table->timestamp('createdAt')->useCurrent()->index();
            });
        }

        if (! Schema::hasTable('category')) {
            Schema::create('category', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('type')->default('BLOG');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->index(['type', 'slug']);
                $table->index(['type', 'name']);
            });
        }

        if (! Schema::hasTable('post')) {
            Schema::create('post', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('content');
                $table->boolean('published')->default(false);
                $table->string('featuredImage')->nullable();
                $table->unsignedBigInteger('categoryId')->nullable();
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->string('metaTitle')->nullable();
                $table->text('metaDescription')->nullable();
                $table->foreign('categoryId')->references('id')->on('category')->nullOnDelete();
                $table->index(['published', 'createdAt']);
                $table->index(['categoryId', 'published', 'createdAt']);
                $table->index(['published', 'slug']);
            });
        }

        if (! Schema::hasTable('page')) {
            Schema::create('page', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('content');
                $table->boolean('published')->default(false);
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->string('metaTitle')->nullable();
                $table->text('metaDescription')->nullable();
                $table->index(['published', 'createdAt']);
                $table->index(['published', 'slug']);
            });
        }

        if (! Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->string('filename');
                $table->string('filepath');
                $table->string('mimetype');
                $table->integer('size');
                $table->string('url');
                $table->timestamp('createdAt')->useCurrent();
                $table->index(['mimetype', 'createdAt']);
            });
        }

        if (! Schema::hasTable('setting')) {
            Schema::create('setting', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            });
        }

        if (! Schema::hasTable('product')) {
            Schema::create('product', function (Blueprint $table) {
                $table->id();
                $table->string('sku')->unique();
                $table->string('name')->nullable();
                $table->string('slug')->unique()->nullable();
                $table->text('specs')->nullable();
                $table->text('accessories')->nullable();
                $table->string('basePrice')->nullable();
                $table->string('minOrder')->nullable();
                $table->text('shortDescription')->nullable();
                $table->string('sheetStatus')->nullable();
                $table->string('sites')->nullable();
                $table->integer('sortOrder')->default(999999);
                $table->string('featuredImage')->nullable();
                $table->unsignedBigInteger('categoryId')->nullable();
                $table->text('description')->nullable();
                $table->boolean('published')->default(false);
                $table->string('metaTitle')->nullable();
                $table->text('metaDescription')->nullable();
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->foreign('categoryId')->references('id')->on('category')->nullOnDelete();
                $table->index(['published', 'createdAt']);
                $table->index(['categoryId', 'published', 'createdAt']);
                $table->index(['published', 'sortOrder', 'createdAt']);
            });
        }

        if (! Schema::hasTable('portfolio')) {
            Schema::create('portfolio', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description');
                $table->string('imageUrl');
                $table->string('logoUrl')->nullable();
                $table->string('logoText')->nullable();
                $table->string('link')->nullable();
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->index(['createdAt']);
            });
        }

        if (! Schema::hasTable('comment')) {
            Schema::create('comment', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('postId');
                $table->string('name');
                $table->string('email');
                $table->text('content');
                $table->boolean('approved')->default(false);
                $table->timestamp('createdAt')->useCurrent();
                $table->foreign('postId')->references('id')->on('post')->cascadeOnDelete();
                $table->index(['postId', 'approved', 'createdAt']);
            });
        }

        if (! Schema::hasTable('citypage')) {
            Schema::create('citypage', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('content');
                $table->boolean('published')->default(false);
                $table->string('featuredImage')->nullable();
                $table->unsignedBigInteger('parentId')->nullable();
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->string('metaTitle')->nullable();
                $table->text('metaDescription')->nullable();
                $table->foreign('parentId')->references('id')->on('citypage')->nullOnDelete();
                $table->index(['published', 'createdAt']);
                $table->index(['parentId', 'published', 'createdAt']);
                $table->index(['published', 'slug']);
            });
        }

        if (! Schema::hasTable('order')) {
            Schema::create('order', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('userId')->nullable();
                $table->string('lanyardWidth');
                $table->string('printingType');
                $table->string('attachment');
                $table->integer('quantity');
                $table->integer('totalPrice');
                $table->text('notes')->nullable();
                $table->string('status')->default('PENDING');
                $table->timestamp('createdAt')->useCurrent();
                $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
                $table->foreign('userId')->references('id')->on('user')->nullOnDelete();
                $table->index(['userId', 'createdAt']);
                $table->index(['status', 'createdAt']);
            });
        }
    }

    public function down(): void
    {
        foreach (['order', 'citypage', 'comment', 'portfolio', 'product', 'setting', 'media', 'page', 'post', 'category', 'inquiry'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
