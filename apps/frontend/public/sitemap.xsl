<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:html="http://www.w3.org/1999/xhtml"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="id">
      <head>
        <title>XML Sitemap - Lanyard Depok</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #373f50;
            background-color: #fafafa;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.04);
            border: 1px solid #eaeaea;
          }
          h1 {
            color: #373f50;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 8px;
            font-weight: 800;
          }
          h1 span {
            color: #7c4f3d;
            margin-left: 6px;
          }
          .description {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 24px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 16px;
          }
          .description a {
            color: #7c4f3d;
            text-decoration: none;
            font-weight: 700;
          }
          .description a:hover {
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            margin-top: 10px;
          }
          th {
            background-color: #f9fafb;
            color: #4b5563;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 12px 16px;
            border-bottom: 2px solid #f3f4f6;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 13.5px;
            word-break: break-all;
          }
          tr:hover td {
            background-color: #fcfcfc;
          }
          a {
            color: #7c4f3d;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
          }
          .footer {
            margin-top: 30px;
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
            border-t: 1px solid #f3f4f6;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>XML Sitemap<span>Lanyard Depok</span></h1>
          
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <p class="description">
                Ini adalah sitemap index utama Lanyard Depok. Pilih salah satu sitemap di bawah untuk melihat daftar URL yang dapat dirayapi mesin pencari.
              </p>
              <table>
                <thead>
                  <tr>
                    <th style="width: 70%;">Sitemap URL</th>
                    <th>Last Modified (WIB)</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <p class="description">
                Ini adalah daftar URL publik Lanyard Depok. Setiap URL dapat diklik untuk membuka halaman terkait. Kembali ke <a href="/sitemap.xml">Sitemap Index Utama</a>.
              </p>
              <table>
                <thead>
                  <tr>
                    <th style="width: 60%;">URL Halaman</th>
                    <xsl:if test="sitemap:urlset/sitemap:url/sitemap:priority">
                      <th>Priority</th>
                    </xsl:if>
                    <xsl:if test="sitemap:urlset/sitemap:url/sitemap:changefreq">
                      <th>Change Freq</th>
                    </xsl:if>
                    <th>Last Modified (WIB)</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                      </td>
                      <xsl:if test="sitemap:priority">
                        <td>
                          <xsl:value-of select="sitemap:priority"/>
                        </td>
                      </xsl:if>
                      <xsl:if test="sitemap:changefreq">
                        <td>
                          <xsl:value-of select="sitemap:changefreq"/>
                        </td>
                      </xsl:if>
                      <td>
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>
          
          <div class="footer">
            Generated by Lanyard Depok SEO System.
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
