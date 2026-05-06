// src/providers/googleDrive/manifest.js
const googleDriveManifest = {
  id: "googleDrive",
  provider_name: "Nobody TV",
  description: "Google Drive video provider",
  main_url: "https://drive.google.com",
  favicon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
  main_page: {
    all: "All Videos"
  },
  capabilities: {
    mediaCatalog: true,
    streaming: true,
    search: false,
    itemDetails: false
  }
};

module.exports = googleDriveManifest;
