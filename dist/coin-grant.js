// Requested one-time top-up for the existing browser-local farm save.
export function applyCoinGrant(state){
 const id='owner-topup-2026-11-04-2000';
 if(!Number.isFinite(state.coins)||state.coinGrants?.includes(id))return false;
 state.coins+=2000;state.coinGrants=[...(state.coinGrants||[]),id];return true;
}
