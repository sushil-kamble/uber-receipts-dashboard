import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const currentDate = new Date().toISOString().split("T")[0];

// Generate robots.txt
const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${APP_URL}/sitemap.xml
`;

// Generate sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${APP_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${APP_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

// Ensure the public directory exists
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Write files
fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsContent);
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapContent);

console.log("Generated robots.txt and sitemap.xml successfully!");
