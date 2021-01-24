/**
  * https://tonejs.github.io/demos
  * http://www.guitarland.com/EssentialScales.html
  * https://medium.com/dev-red/tutorial-lets-make-music-with-javascript-and-tone-js-f6ac39d95b8c
  *
  * https://en.wikipedia.org/wiki/Portal:Microtonal_music
  * https://en.wikipedia.org/wiki/Microtonal_music
  *
  * https://en.wikipedia.org/wiki/Set_theory_(music)
  *
  * http://microtonal-synthesis.com/scales.html
  * https://ru.wikipedia.org/wiki/Пифагоров_строй /// http://microtonal-synthesis.com/scale_pythagorean.html
  * https://ru.wikipedia.org/wiki/Тон_Шепарда /// https://soundcloud.com/tomerbe/james-tenney-for-ann-rising
  * https://en.wikipedia.org/wiki/Tonnetz
  * https://en.wikipedia.org/wiki/Arab_tone_system
  *
  * https://en.wikipedia.org/wiki/Bohlen%E2%80%93Pierce_scale
  * 1 step = 1200*log_2(3^(1/13))
  *
  * https://en.wikipedia.org/wiki/17_equal_temperament
  *
  * soft: http://robertinventor.com/software/tunesmithy/scales.htm ||| http://www.microtonalsoftware.com/
  * longread: https://www.academia.edu/1914055/Microtonal_Modes_and_Scales_from_the_Middle_East_and_Central_Asia
  * KEYBOARD HAS 70 WORKING KEYS
  *
  * http://badassjs.com/post/41708259332/teoria-a-javascript-music-theory-library-for
  *
  * Pygmie scale:
  * 1/1        8/7       21/16     3/2       7/4       2/1
  * 261.626Hz 299.001Hz 343.384Hz 392.438Hz 457.845Hz 523.251Hz
  * As cents (hundredths of a twelve equal semitone), the same scale is:
  * 0.0 231.174 470.781 701.955 968.826 1200.0
  *
  * TO FIND TONE: F(I) = F(0) * 2^(I/N), where F(0) = camertone, I - halftone distance 0..N, N - splitting of octave
  * 1 CENT = 2^(1/1200), 100 cents = 1/2Tone, difference in cents = 1200*
  *
  * KEYBOARD
  * http://www.javascriptkit.com/javatutors/javascriptkey.shtml
  *
  * https://github.com/keithamus/jwerty/blob/master/README-DETAILED.md
  * https://github.com/firedev/jquery.keynav
  *
  * http://www.l90r.com/posts/piano-a-flexible-piano-keyboard-plugin-for-jquery
  * =============================================================================
  * =============================================================================
  *
  * CHINESE:
  * https://en.wikipedia.org/wiki/Chinese_musicology, https://en.wikipedia.org/wiki/Sh%C3%AD-%C3%A8r-l%C7%9C
  * http://users.wfu.edu/moran/Cathay_Cafe/template.html
  *
  * https://proglib.io/p/fourier-transform/
  *
  *   * БИБЛИОТЕКИ И О БИБЛИОТЕКАХ
  * https://www.guitarland.com/MusicTheoryWithToneJS/PlayNote.html
  * https://howlerjs.com/
  * https://alemangui.github.io/pizzicato/
  * https://www.charlie-roberts.com/pubs/gibber_music_2015_ICMC.pdf — http://charlie-roberts.com/gibber/about-gibber/
  *  https://nexus-js.github.io/ui/ — HTML5 interfaces and Javascript helper functions
  * to assist with building web audio instruments in the browser
  * https://stuartmemo.com/qwerty-hancock/ — Need an interactive HTML plugin-free keyboard for your web audio project? Qwerty Hancock is just the thing.
  * https://abbernie.gith ub.io/tune/
  *
  * http://www.newbyz.org/byzantine_music_for_western_musicians.pdf
  *
  * важно изучить, если будешь вообще этим заниматься... желательно бы
  * http://www.kelfar.net/orthodoxiaradio/Diatonic.html
  */

  /**
   * Задачи:
   * — может ли ПолиСинт выключать одну ноту из аккорда?
   * — изыскать решение, почему "западают клавиши"
   * — разработать трекер, формируемый динамически
   * — изменять количество нот через интерфейс
   * — изменять длительность базовой ноты трекера через интерфейс
   * — расширить дальше одной октавы
   */

if (true){
  // Reduce a fraction by finding the Greatest Common Divisor and dividing by it.
  function frac_reduce(numerator,denominator){
    if (isNaN(numerator) || isNaN(denominator)) return NaN;
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(numerator,denominator);
    return [numerator/gcd, denominator/gcd];
  }

  function logY2baseX(x, y) {
    //in JS no function log_base(N) - If you need a logarithm to other bases, use Math.log(x) / Math.log(otherBase)
    return Math.log(y) / Math.log(x);
  }

  window.frac_reduce = frac_reduce;
  window.logY2baseX = logY2baseX;
}

let BASE_TONE = 440; //in Hz
let STEPS = 17;
let SYNTHS = [];
let KEYS = [];

(function prepareAll() {
  //F(I) = F(0) * 2^(I/N), where F(0) = camertone, I - halftone distance 0..N
  for(i=0;i<=STEPS;i++){
    SYNTHS.push({
      // 'synth': new Tone.Synth().toMaster(),
      'synth': new Tone.PolySynth(1, Tone.Synth).toMaster(),
      'freq': [BASE_TONE * (2**(i/STEPS))],
      'on': false
    });
  }
})();

// for now our keyboard is only 40 keys long
let kbdkeys=[
  "1234567890".split(""),
  "qwertyuiop".split(""),
  "asdfghjkl;".split(""),
  'zxcvbnm'.split("")
]; kbdsubs = kbdkeys.slice();
kbdkeys[3].push('a-comma', 'full-stop', 'forward-slash');
kbdsubs[3].push(",",".","/");

let knum = 0;
$(function(){
  for (i=0;i<kbdkeys.length;i++){
    $("#kbd").append("<div id='r"+i+"'></div>");
    for(j=0;j<kbdkeys[0].length;j++){
      let kkey = kbdkeys[i][j]; //used to bind to JWERTY.js
      let ksub = kbdsubs[i][j]; //used to subscribe the key on screen
      let kname = "k_"+i+"_"+j;
      $("#r"+i).append("<div align='center' id='"+kname+"'></div>");
      $("#"+kname)
        .append("<span align='center'>"+ksub+" <i>"+knum+"</i> <b>"+"</b></span>")
        .css('background-color', 'rgba(0,0,0,0.25)')
        .data('knum', knum);
      if (knum > STEPS){
        $("#"+kname)
        .css('background-color', '')
        .css('color', 'rgba(0,0,0,0.25)')
        .prop('disabled', true);
      }else{
        $(document)
        .bind('keydown', jwerty.event(kkey, function () {startSound(kname);}))
        .bind('keyup', jwerty.event(kkey, function () {stopSound(kname);}));
      }
      knum++;
    }
  }
});

function startSound(kname) {
  let o = $("#"+kname);
  o.css('background-color', 'magenta');
  index = o.data('knum');
  if (SYNTHS[index]['on']) return; //in order not to trigger unneeded times
  SYNTHS[index]['synth'].triggerAttack(SYNTHS[index]['freq']);
  SYNTHS[index]['on'] = true;
  // console.log("Pressed: ", kname);
}

function stopSound(kname){
  SYNTHS[index]['on'] = false;
  let o = $("#"+kname);
  o.css('background-color', 'rgba(0,0,0,0.25)');
  index = o.data('knum');
  SYNTHS[index]['synth'].triggerRelease(SYNTHS[index]['freq']);
  // console.log("Released: ", kname);
}
