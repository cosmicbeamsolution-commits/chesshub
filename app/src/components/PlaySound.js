module.exports = function (sound, vol) {
  if (sound === undefined) {
    sound = 'move.mp3'
  }

  if (vol === undefined) {
    vol = 0.5
  }

  const settings = JSON.parse(localStorage.getItem('player')) || {}
  const theme = settings.soundTheme || 'light'
  const audio = new Audio(['/sounds', theme, sound].join('/'))
  audio.volume = vol

  if (settings.sound) {
    var playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // Automatic playback started!
        // Show playing UI.
      }).catch(error => {
        console.log(error)
      // Auto-play was prevented
      // Show paused UI.
      })
    }
  }
}
