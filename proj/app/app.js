
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer;
var mesh, lightMesh, geometry;
var spheres = [];
var directionalLight, pointLight;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var cube;

// assign global variables to HTML elements
var video = document.getElementById( 'monitor' );
var videoCanvas = document.getElementById( 'videoCanvas' );
var videoContext = videoCanvas.getContext( '2d' );

var layer2Canvas = document.getElementById( 'layer2' );
var layer2Context = layer2Canvas.getContext( '2d' );

var blendCanvas  = document.getElementById( "blendCanvas" );
var blendContext = blendCanvas.getContext('2d');

var messageArea = document.getElementById( "messageArea" );
var buttons;
var lastImageData;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function init() {

	container = document.createElement( 'div' )
  container.style.position =  'absolute';
	document.body.appendChild( container );

  // camera
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.z = 3200;
  // scene
	scene = new THREE.Scene();

	scene.background = new THREE.CubeTextureLoader()
    .setPath( './maps/' )
    .load([ 'denver.png', 'la.png', 'ny.png', 'portland.png', 'miami.png', 'sd.png' ] );

  var geometry = new THREE.SphereBufferGeometry( 100, 32, 16 );

	var textureCube = new THREE.CubeTextureLoader()
    .setPath( './maps/' )
    .load( [ 'denver.png', 'la.png', 'ny.png', 'portland.png', 'miami.png', 'sd.png' ] );

  textureCube.mapping = THREE.CubeRefractionMapping;

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, true );

  ////////////
  // CUSTOM //
  ////////////
  this.colorRed = THREE.ImageUtils.loadTexture( "images/SquareRed.png" );
  this.colorGreen = THREE.ImageUtils.loadTexture( "images/SquareGreen.png" );
  this.colorBlue = THREE.ImageUtils.loadTexture( "images/SquareBlue.png" );
  this.cubeGeometry = new THREE.CubeGeometry( 250, 250, 250 );

  this.cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xf442d9,
    map: colorRed,
    emissive: 0x333333
  });

  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0,26,0);
  cube.rotation.set(Math.PI / 4, 0, 0);

  scene.add(cube);
  // VIDEO SET UP

  // these changes are permanent
  videoContext.translate(320, 0);
  videoContext.scale(-1, 1);

  // background color if no video present
  videoContext.fillStyle = '#005337';
  videoContext.fillRect( 0, 0, videoCanvas.width, videoCanvas.height );
  buttons = [];

  var button1 = new Image();
  button1.src ="images/SquareRed.png";

  var buttonData1 = {
    name: "red",
    image: button1,
    x:320 - 96 - 30,
    y:10,
    w:32,
    h:32
  };

  buttons.push( buttonData1 );

  var button2 = new Image();
  button2.src ="images/SquareGreen.png";

  var buttonData2 = {
    name: "green",
    image: button2,
    x: 320 - 64 - 20,
    y: 10,
    w:32,
    h:32
  };

  buttons.push( buttonData2 );

  var button3 = new Image();
  button3.src ="images/SquareBlue.png";

  var buttonData3 = {
    name: "blue",
    image: button3,
    x: 320 - 32 - 10,
    y: 10,
    w:32,
    h:32
  };

  buttons.push( buttonData3 );

	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );

  ///////////////////
  //// MISC /////////
  ///////////////////
  // goWild();
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2,
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(event) {
	mouseX = ( event.clientX - windowHalfX ) * 10;
	mouseY = ( event.clientY - windowHalfY ) * 10;
}

init();
animate();

function animate() {
  requestAnimationFrame( animate );
	render();
	update();
}

function update() {
	if ( keyboard.pressed("z") ) { }

	controls.update();
	blend();
	checkAreas();
}

function render() {
	if ( video.readyState === video.HAVE_ENOUGH_DATA )
	{
		// mirror video
		videoContext.drawImage( video, 0, 0, videoCanvas.width, videoCanvas.height );
		for ( var i = 0; i < buttons.length; i++ )
			layer2Context.drawImage( buttons[i].image, buttons[i].x, buttons[i].y, buttons[i].w, buttons[i].h );
	}

	var timer = 0.0001 * Date.now();

	for ( var i = 0, il = spheres.length; i < il; i ++ ) {
		var sphere = spheres[ i ];
		sphere.position.x = 5000 * Math.cos( timer + i );
		sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );
	}

  renderer.render( scene, camera );
  var delta = clock.getDelta();
  cube.rotation.y += delta;

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );
  renderer.render( scene, camera );
}

// check if white region from blend overlaps area of interest (e.g. triggers)
function checkAreas() {
	for (var b = 0; b < buttons.length; b++) {
		// get the pixels in a note area from the blended image
		var blendedData = blendContext.getImageData( buttons[b].x, buttons[b].y, buttons[b].w, buttons[b].h );

		// calculate the average lightness of the blended data
		var i = 0;
		var sum = 0;
		var countPixels = blendedData.data.length * 0.25;

		while (i < countPixels) {
			sum += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]);
			++i;
		}

		// calculate an average between of the color values of the note area [0-255]
		var average = Math.round(sum / (3 * countPixels));

    // more than 20% movement detected
		if (average > 50) {
			console.log( "Button " + buttons[b].name + " triggered." ); // do stuff

      if (buttons[b].name == "red") {

        cubeMaterial.map = colorRed;
        camera.position.z += 200;


      }

      if (buttons[b].name == "green") {

        cubeMaterial.map = colorGreen;
        camera.position.z -= 200;

      }

      if (buttons[b].name == "blue") {

        cubeMaterial.map = colorBlue;

      }
			// messageArea.innerHTML = "Button " + buttons[b].name + " triggered.";
		}
		// console.log("Button " + b + " average " + average);
	}
}

///////////////////////////////////////
/// video process helper methods //////
///////////////////////////////////////

function blend() {
	var width  = videoCanvas.width;
	var height = videoCanvas.height;
	// get current webcam image data
	var sourceData = videoContext.getImageData(0, 0, width, height);
	// create an image if the previous image doesn’t exist
	if (!lastImageData) lastImageData = videoContext.getImageData(0, 0, width, height);
	// create a ImageData instance to receive the blended result
	var blendedData = videoContext.createImageData(width, height);
	// blend the 2 images
	differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
	// draw the result in a canvas
	blendContext.putImageData(blendedData, 0, 0);
	// store the current webcam image
	lastImageData = sourceData;
}

function differenceAccuracy(target, data1, data2) {
	if (data1.length != data2.length) return null;
	var i = 0;
	while (i < (data1.length * 0.25)) {
		var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
		var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
		var diff = threshold(fastAbs(average1 - average2));
		target[4*i]   = diff;
		target[4*i+1] = diff;
		target[4*i+2] = diff;
		target[4*i+3] = 0xFF;
		++i;
	}
}

function fastAbs(value)   { return (value ^ (value >> 31)) - (value >> 31); }
function threshold(value) { return (value > 0x15) ? 0xFF : 0; }

///////////////////////////////////////
/// misc //////////////////////////////
///////////////////////////////////////
function goWild() {
  var textureCube = new THREE.CubeTextureLoader()
    .setPath( './maps/' )
    .load( [ 'denver.png', 'la.png', 'ny.png', 'portland.png', 'miami.png', 'sd.png' ] );

  var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.20 } );
  var geometry = new THREE.SphereBufferGeometry( 100, 32, 16 );

  for ( var i = 0; i < 500; i ++ ) {
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = Math.random() * 10000 - 5000;
    mesh.position.y = Math.random() * 10000 - 5000;
    mesh.position.z = Math.random() * 10000 - 5000;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
    scene.add( mesh );
    spheres.push( mesh );
  }
}
