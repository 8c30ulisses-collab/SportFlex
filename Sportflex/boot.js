(function(){
const SF=window.SF;
SF.applyPrefs();
if(location.hash.startsWith('#jogo')&&!SF.st.onboarded){}
SF.render();
})();
