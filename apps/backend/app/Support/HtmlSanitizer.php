<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

class HtmlSanitizer
{
    private const ALLOWED_TAGS = [
        'a',
        'blockquote',
        'br',
        'caption',
        'code',
        'div',
        'em',
        'figcaption',
        'figure',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'img',
        'li',
        'ol',
        'p',
        'pre',
        'span',
        'strong',
        'table',
        'tbody',
        'td',
        'tfoot',
        'th',
        'thead',
        'tr',
        'u',
        'ul',
    ];

    private const GLOBAL_ATTRIBUTES = ['class', 'id', 'title', 'aria-label'];

    private const TAG_ATTRIBUTES = [
        'a' => ['href', 'target', 'rel'],
        'img' => ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
        'td' => ['colspan', 'rowspan'],
        'th' => ['colspan', 'rowspan', 'scope'],
    ];

    public static function clean(?string $html): string
    {
        $html = (string) $html;

        if ($html === '') {
            return '';
        }

        $document = new DOMDocument();
        $previous = libxml_use_internal_errors(true);

        $document->loadHTML(
            '<!doctype html><html><body>'.$html.'</body></html>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $body = $document->getElementsByTagName('body')->item(0);

        if (! $body) {
            return '';
        }

        self::sanitizeChildren($body);

        $clean = '';
        foreach ($body->childNodes as $child) {
            $clean .= $document->saveHTML($child);
        }

        return trim($clean);
    }

    private static function sanitizeChildren(DOMNode $node): void
    {
        for ($child = $node->firstChild; $child !== null;) {
            $next = $child->nextSibling;

            if ($child instanceof DOMElement) {
                $tag = strtolower($child->tagName);

                if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                    self::unwrapOrRemove($child);
                    $child = $next;
                    continue;
                }

                self::sanitizeAttributes($child, $tag);
                self::sanitizeChildren($child);
            }

            $child = $next;
        }
    }

    private static function unwrapOrRemove(DOMElement $element): void
    {
        $tag = strtolower($element->tagName);

        if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'], true)) {
            $element->parentNode?->removeChild($element);
            return;
        }

        while ($element->firstChild) {
            $element->parentNode?->insertBefore($element->firstChild, $element);
        }

        $element->parentNode?->removeChild($element);
    }

    private static function sanitizeAttributes(DOMElement $element, string $tag): void
    {
        $allowed = array_merge(self::GLOBAL_ATTRIBUTES, self::TAG_ATTRIBUTES[$tag] ?? []);

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->name);
            $value = trim($attribute->value);

            if (str_starts_with($name, 'on') || str_starts_with($name, 'data-') || ! in_array($name, $allowed, true)) {
                $element->removeAttributeNode($attribute);
                continue;
            }

            if (in_array($name, ['href', 'src'], true) && ! self::isSafeUrl($value)) {
                $element->removeAttributeNode($attribute);
            }
        }

        if ($tag === 'a' && $element->hasAttribute('target')) {
            $element->setAttribute('rel', 'noopener noreferrer');
        }
    }

    private static function isSafeUrl(string $value): bool
    {
        if ($value === '' || str_starts_with($value, '#') || str_starts_with($value, '/')) {
            return true;
        }

        $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https', 'mailto', 'tel'], true);
    }
}
