$(document).ready(function() {
	$("#loadpage").hide();

	if (!Detector.webgl) Detector.addGetWebGLMessage();

	var container;
	var camera;
	var scene;
	var renderer;
	var mesh;
	var lightMesh;
	var geometry;
	var spheres = [];
	var directionalLight;
	var pointLight;
	var mouseX = 0;
	var mouseY = 0;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	var container;
	var controls;
	var stats;
	var keyboard = new THREEx.KeyboardState();
	var clock = new THREE.Clock();
	var cube;

	// assign global variables to HTML elements
	var video = document.getElementById('monitor');
	var videoCanvas = document.getElementById('videoCanvas');
	var videoContext = videoCanvas.getContext('2d');

	var layer2Canvas = document.getElementById('layer2');
	var layer2Context = layer2Canvas.getContext('2d');

	var blendCanvas  = document.getElementById("blendCanvas");
	var blendContext = blendCanvas.getContext('2d');

	var messageArea = document.getElementById("messageArea");
	var buttons;
	var lastImageData;

	document.addEventListener('mousemove', onDocumentMouseMove, false);

	function init() {
		container = document.createElement('div')
	  container.style.position =  'absolute';
		document.body.appendChild( container );

	  // camera
		camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 100000);
		camera.position.z = 3200;
	  // scene
		scene = new THREE.Scene();

		var imageNames = [];

		$.get("http://localhost:3000/image-titles", (data, status) => {
			console.log('getting payload: ', data);

			for(title in data) {

				var currTitle = data.titles
				var imageTitleHolder = [];

				for (var i = 0; i < currTitle.length; i++) {
					imageTitleHolder.push(currTitle[i])
				}

				var colorRed = THREE.ImageUtils.loadTexture("images/SquareRed.png");
			  var colorGreen = THREE.ImageUtils.loadTexture("images/SquareGreen.png");
			  var colorBlue = THREE.ImageUtils.loadTexture("images/SquareBlue.png");
			  var cubeGeometry = new THREE.SphereBufferGeometry(400, 144, 64);

				var textureCube = new THREE.CubeTextureLoader()
					.setPath( './maps/' )
					.load([
						`${imageTitleHolder[0]}` + `.png`,
						`${imageTitleHolder[1]}` + `.png`,
						`${imageTitleHolder[2]}` + `.png`,
						`${imageTitleHolder[3]}` + `.png`,
						`${imageTitleHolder[4]}` + `.png`,
						`${imageTitleHolder[5]}` + `.png`
					]);

				var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.0099 } );

			  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
			  cube.position.set(0,26,0);
			  cube.rotation.set(Math.PI / 4, 0, 0);
			  scene.add(cube);

				scene.background = new THREE.CubeTextureLoader()
					.setPath( './assets/' )
					.load([
						`${imageTitleHolder[0]}` + `.png`,
						`${imageTitleHolder[1]}` + `.png`,
						`${imageTitleHolder[2]}` + `.png`,
						`${imageTitleHolder[3]}` + `.png`,
						`${imageTitleHolder[4]}` + `.png`,
						`${imageTitleHolder[5]}` + `.png`
					]);

				var geometry = new THREE.SphereBufferGeometry( 100, 32, 16 );

				var textureCube = new THREE.CubeTextureLoader()
					.setPath( './assets/' )
					.load([
						`${imageTitleHolder[0]}` + `.png`,
						`${imageTitleHolder[1]}` + `.png`,
						`${imageTitleHolder[2]}` + `.png`,
						`${imageTitleHolder[3]}` + `.png`,
						`${imageTitleHolder[4]}` + `.png`,
						`${imageTitleHolder[5]}` + `.png`
					]);

			  textureCube.mapping = THREE.CubeRefractionMapping;
		  }
		});

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);
		window.addEventListener('resize', onWindowResize, true);

		// VIDEO SET UP
	  // these changes are permanent
	  videoContext.translate(320, 0);
	  videoContext.scale(-1, 1);
	  // background color if no video present
	  videoContext.fillStyle = '#005337';
	  videoContext.fillRect(0, 0, videoCanvas.width, videoCanvas.height );
	  buttons = [];

	  var button1 = new Image();
	  button1.src ="images/SquareRed.png";

	  var buttonData1 = {
	    name: "red",
	    image: button1,
	    x: 240 - 200 - 30,
	    y: 10,
	    w: 32,
	    h: 32
	  };

	  buttons.push( buttonData1 );

	  var button2 = new Image();
	  button2.src ="images/SquareGreen.png";

	  var buttonData2 = {
	    name: "green",
	    image: button2,
	    x: 240 - 135 - 20,
	    y: 10,
	    w: 32,
	    h: 32
	  };

	  buttons.push( buttonData2 );

	  var button3 = new Image();
	  button3.src ="images/SquareBlue.png";

	  var buttonData3 = {
	    name: "blue",
	    image: button3,
	    x: 240 - 80 - 0,
	    y: 10,
	    w: 32,
	    h: 32
	  };

	  buttons.push(buttonData3);

		var button4 = new Image();
		button4.src ="images/SquareRed.png";

		var buttonData4 = {
			name: "yellow",
			image: button4,
			x: 240 - 0 - 0,
			y: 10,
			w: 32,
			h: 32
		};

		buttons.push(buttonData4);

		var button5 = new Image();
		button5.src ="images/SquareBlue.png";

		var buttonData5 = {
			name: "brown",
			image: button5,
			x: 240 - 0 + 40,
			y: 50,
			w: 32,
			h: 32
		};

		buttons.push(buttonData5);

		// CONTROLS
		controls = new THREE.OrbitControls(camera, renderer.domElement);
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

		if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
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

	  var delta = clock.getDelta();
	  cube.rotation.y += delta / 24;

	  camera.position.x += ( mouseX - camera.position.x ) * .05;
	  camera.position.y += ( - mouseY - camera.position.y ) * .05;

	  camera.lookAt(scene.position);
		renderer.render(scene, camera);
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
	        camera.position.z -= 200;
	      }
	      if (buttons[b].name == "green") {
	        camera.position.z += 200;
	      }
	      if (buttons[b].name == "blue") {
					goWild();
	      }
				if (buttons[b].name == "yellow") {
					cube.add(camera)
				}
				if (buttons[b].name == "brown") {
					cube.remove(camera)
					scene.children.forEach(function(object){
						if(object === cube) {
							//do nothing
						}
						else {
							scene.remove(object);
						}
					});
				}
			}
		}
	}

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

	function goWild() {
	  var textureCube = new THREE.CubeTextureLoader()
	    .setPath( './maps/' )
	    .load( [ 'denver.png', 'la.png', 'ny.png', 'portland.png', 'miami.png', 'sd.png' ] );

	  var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.0099 } );
	  var geometry = new THREE.SphereBufferGeometry( 100, 32, 16 );

	  for ( var i = 0; i < 3; i ++ ) {
	    var mesh = new THREE.Mesh( geometry, material );
	    mesh.position.x = Math.random() * 10000 - 5000;
	    mesh.position.y = Math.random() * 10000 - 5000;
	    mesh.position.z = Math.random() * 10000 - 5000;
	    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
	    scene.add( mesh );
	    spheres.push( mesh );
	  }
	}
});
