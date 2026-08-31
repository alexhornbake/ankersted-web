#!/usr/bin/env node

/**
 * Migration script: Convert .md/.mdx blog posts to .mdoc format
 * 
 * This script:
 * 1. Reads all .md/.mdx files in src/content/blog/
 * 2. Extracts YAML frontmatter and converts dates to ISO format
 * 3. Creates new .mdoc files with the same content
 * 4. Removes the old .md/.mdx files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, 'src', 'content', 'blog');

// Parse frontmatter and content
function parseFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		throw new Error('Invalid frontmatter format');
	}

	const frontmatterStr = match[1];
	const body = match[2];

	// Simple YAML parser for our use case
	const frontmatter = {};
	frontmatterStr.split('\n').forEach((line) => {
		const [key, ...valueParts] = line.split(':');
		if (key && valueParts.length > 0) {
			let value = valueParts.join(':').trim();
			// Remove quotes if present
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			frontmatter[key.trim()] = value;
		}
	});

	return { frontmatter, body };
}

// Convert date string to ISO format YYYY-MM-DD
function convertDateToISO(dateStr) {
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) {
			console.warn(`Warning: Could not parse date "${dateStr}"`);
			return dateStr;
		}
		return date.toISOString().split('T')[0];
	} catch (e) {
		console.warn(`Warning: Could not convert date "${dateStr}": ${e.message}`);
		return dateStr;
	}
}

// Build YAML frontmatter string
function buildFrontmatter(frontmatter) {
	const lines = [];
	Object.entries(frontmatter).forEach(([key, value]) => {
		// Quote string values if they contain special characters or spaces
		const needsQuotes = typeof value === 'string' && (value.includes(':') || value.includes(',') || value.includes('"'));
		const quotedValue = needsQuotes ? `"${value}"` : value;
		lines.push(`${key}: ${quotedValue}`);
	});
	return lines.join('\n');
}

// Main migration logic
async function migrate() {
	console.log('🚀 Starting blog post migration to .mdoc format...\n');

	const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

	if (files.length === 0) {
		console.log('✅ No files to migrate');
		return;
	}

	console.log(`Found ${files.length} file(s) to migrate:\n`);

	files.forEach((file) => {
		const filePath = path.join(BLOG_DIR, file);
		const content = fs.readFileSync(filePath, 'utf-8');

		try {
			const { frontmatter, body } = parseFrontmatter(content);

			// Convert pubDate to ISO format
			if (frontmatter.pubDate) {
				frontmatter.pubDate = convertDateToISO(frontmatter.pubDate);
			}
			if (frontmatter.updatedDate) {
				frontmatter.updatedDate = convertDateToISO(frontmatter.updatedDate);
			}

			// Create .mdoc file
			const mdocFilename = path.basename(file, path.extname(file)) + '.mdoc';
			const mdocPath = path.join(BLOG_DIR, mdocFilename);

			const frontmatterStr = buildFrontmatter(frontmatter);
			const mdocContent = `---\n${frontmatterStr}\n---\n${body}`;

			fs.writeFileSync(mdocPath, mdocContent, 'utf-8');
			console.log(`✅ ${file} → ${mdocFilename}`);

			// Remove old file
			fs.unlinkSync(filePath);
			console.log(`   └─ Removed ${file}\n`);
		} catch (error) {
			console.error(`❌ Error processing ${file}:`);
			console.error(`   ${error.message}\n`);
		}
	});

	console.log('✨ Migration complete!');
	console.log(`\nNext steps:`);
	console.log('1. Verify the new .mdoc files in src/content/blog/');
	console.log('2. Restart your dev server: npm run dev');
	console.log('3. Visit /keystatic to see your blog posts in the admin UI');
}

migrate().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
