console.log('app.js loaded');

(function(window) {
  

  // https://stackoverflow.com/a/17373688
  const randomColor = brightness => {
    const randomChannel = brightness => {
      let r = 255-brightness;
      let n = 0|((Math.random() * r) + brightness);
      let s = n.toString(16);
      return (s.length==1) ? '0'+s : s;
    }

    return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
  }

  console.log(randomColor(200));
  console.log(randomColor(200));
  console.log(randomColor(200));
  console.log(randomColor(200));
})(window);