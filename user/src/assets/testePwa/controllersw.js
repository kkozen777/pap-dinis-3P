//alert('uu')

// Register service worker to control making site work offline

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js?v=2025.01')
    .then(() => { console.log('Service Worker Registered for Dinis'); });
}



// Code to handle install prompt on desktop


let deferredPrompt;
const addBtn = document.querySelector('.add-button');
const addBtnOk = document.querySelector('.ok_pwa');

//addBtn.style.display = 'block';//'none';
//alert('ff')

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';
  
  //alert('xxx')


  addBtnOk.addEventListener('click', () => {
    // hide our user interface that shows our A2HS button
	//alert('cliquei')
	
	addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the  prompt');
      } else {
        console.log('User dismissed the  prompt');
      }
      deferredPrompt = null;
    });
  });
  
  
});
