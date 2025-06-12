#!/usr/bin/env node

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function convertSvgToWebP(svgPath, webpPath, width = 400, height = 300) {
  try {
    console.log(`Converting ${svgPath} to ${webpPath}...`);

    await sharp(svgPath)
      .resize(width, height)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);

    console.log(`✅ Successfully created ${webpPath}`);
  } catch (error) {
    console.error(`❌ Error converting ${svgPath}:`, error.message);
  }
}

async function main() {
  const conversions = [
    {
      svg: "public/images/restaurants/default-restaurant.svg",
      webp: "public/images/restaurants/default-restaurant.webp",
    },
    {
      svg: "public/images/disney/default-attraction.svg",
      webp: "public/images/disney/default-attraction.webp",
    },
    {
      svg: "public/images/disney/default-park.svg",
      webp: "public/images/disney/default-park.webp",
    },
    {
      svg: "public/images/disney/default-event.svg",
      webp: "public/images/disney/default-event.webp",
    },
  ];

  console.log("🎨 Converting default images to WebP format...\n");

  for (const { svg, webp } of conversions) {
    if (fs.existsSync(svg)) {
      await convertSvgToWebP(svg, webp);
    } else {
      console.log(`⚠️  Warning: ${svg} not found, skipping...`);
    }
  }

  console.log("\n✨ Conversion complete!");
  console.log("\n📁 Created default images:");
  console.log(
    "   • Restaurant fallback: /images/restaurants/default-restaurant.webp"
  );
  console.log(
    "   • Attraction fallback: /images/disney/default-attraction.webp"
  );
  console.log("   • Park fallback: /images/disney/default-park.webp");
  console.log("   • Event fallback: /images/disney/default-event.webp");
  console.log(
    "\n🎯 These images are now available for use in your components!"
  );
}

main().catch(console.error);
