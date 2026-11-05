export function installMobileUI({modal}){
 window.openMobileMenu=()=>modal('<span class="service-tag">MEADOW MARKET · FARM MENU</span><h2>Your farm, at a touch.</h2><div class="mobile-menu-grid">'+[
 ['openCountyMap','🗺 County map'],['openCountyEstate','🌳 Your estate'],['openCountyContracts','📦 Deliveries'],['openVehicles','🚜 Farm vehicles'],['showAvatar','🧑 Farmer'],['openFarmPanel','🌾 Supplies'],['openBreeding','🐴 Breeding'],['openTraining','🏇 Training'],['nextDay','☀ Next farm day'],['home','⌂ Centre camera'],['toggleGraphics','⚙ Graphics quality'],['openCycle','↻ Farm cycle']
 ].map(([action,label])=>'<button onclick="document.querySelector(\'dialog\').close();'+action+'()">'+label+'</button>').join('')+'</div><p>Tap an animal or building for actions. Drag the farm to pan. Pinch with two fingers to zoom. Use ↶ / ↷ to rotate.</p><p>Your phone and desktop use the same website. Progress is saved in this browser on this device.</p>');
}
