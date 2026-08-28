<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap | Mohammad Faeem Charitable Trust (MFCT)</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet" />
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9f5ec;
            color: #1a1a1a;
            padding: 2rem 1rem;
            line-height: 1.6;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #d4c9a8;
            box-shadow: 0 10px 30px rgba(26, 60, 44, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1a3c2c 0%, #2e5e42 100%);
            color: #ffffff;
            padding: 2.5rem 2rem;
            position: relative;
          }
          .tag {
            display: inline-block;
            background: rgba(200, 168, 75, 0.2);
            color: #e0c068;
            border: 1px solid rgba(200, 168, 75, 0.4);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
          }
          .title {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            color: #ffffff;
          }
          .desc {
            font-size: 0.9rem;
            color: #d4c9a8;
            max-width: 700px;
          }
          .stats-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 2rem;
            background: #faf6ee;
            border-bottom: 1px solid #e8e0cc;
            font-size: 0.85rem;
            font-weight: 600;
            color: #1a3c2c;
          }
          .stats-badge {
            background: #1a3c2c;
            color: #ffffff;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.8rem;
          }
          .table-wrapper {
            overflow-x: auto;
            padding: 1rem 1.5rem 2rem 1.5rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.85rem;
          }
          th {
            background: #f4ede0;
            color: #1a3c2c;
            font-weight: 700;
            padding: 0.85rem 1rem;
            border-bottom: 2px solid #d4c9a8;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
          }
          td {
            padding: 0.9rem 1rem;
            border-bottom: 1px solid #ece4d0;
            vertical-align: middle;
          }
          tr:hover td {
            background-color: #faf6ee;
          }
          a {
            color: #1a3c2c;
            font-weight: 600;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.2s ease;
          }
          a:hover {
            color: #c8a84b;
            text-decoration: underline;
          }
          .priority-pill {
            display: inline-block;
            padding: 0.2rem 0.55rem;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.75rem;
            text-align: center;
          }
          .priority-high {
            background: rgba(46, 94, 66, 0.15);
            color: #1a3c2c;
            border: 1px solid rgba(46, 94, 66, 0.3);
          }
          .priority-med {
            background: rgba(200, 168, 75, 0.18);
            color: #8a6e1a;
            border: 1px solid rgba(200, 168, 75, 0.35);
          }
          .priority-low {
            background: rgba(100, 116, 139, 0.12);
            color: #475569;
            border: 1px solid rgba(100, 116, 139, 0.25);
          }
          .freq-pill {
            display: inline-block;
            background: #f1ebd9;
            color: #5a6a5f;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
          }
          .footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.8rem;
            color: #5a6a5f;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="tag">Search Engine Optimization</div>
            <h1 class="title">XML Sitemap</h1>
            <p class="desc">This is the official XML Sitemap for <strong>Mohammad Faeem Charitable Trust (MFCT)</strong>, generated for search engine indexing by Google, Bing, Yahoo, and DuckDuckGo.</p>
          </div>
          
          <div class="stats-bar">
            <span>Index Status: <strong>Active</strong></span>
            <span>Total URLs: <span class="stats-badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span></span>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>URL</th>
                  <th style="width: 120px;">Priority</th>
                  <th style="width: 130px;">Change Freq</th>
                  <th style="width: 180px;">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td style="color: #718096; font-weight: 600;">
                      <xsl:value-of select="position()"/>
                    </td>
                    <td>
                      <a href="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="sitemap:priority &gt;= 0.9">
                          <span class="priority-pill priority-high"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:when>
                        <xsl:when test="sitemap:priority &gt;= 0.7">
                          <span class="priority-pill priority-med"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="priority-pill priority-low"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td>
                      <span class="freq-pill"><xsl:value-of select="sitemap:changefreq"/></span>
                    </td>
                    <td style="color: #5a6a5f; font-size: 0.8rem;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>© <xsl:value-of select="substring(sitemap:urlset/sitemap:url[1]/sitemap:lastmod, 1, 4)"/> Mohammad Faeem Charitable Trust (MFCT) | <a href="https://www.mfcttrust.com">Back to Home</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
