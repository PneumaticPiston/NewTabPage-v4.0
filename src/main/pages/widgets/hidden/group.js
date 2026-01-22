debug.log("Hidden group widget loaded");
// Code must be within this block to prevent conflicts with other widgets
{
const parentDiv = document.currentScript.parentElement;

// Get settings from widget URL parameters
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const searchParam = url.searchParams.get(settingsParameter);

// Build widget within parentDiv
}