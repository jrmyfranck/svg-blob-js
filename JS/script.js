import { spline } from "@georgedoescode/spline";
import { makeNoise2D } from "open-simplex-noise";

// our <path> element
const path = document.querySelector("path");

let animation_state = "paused";
let animation_lifetime = 0;



const BlobConfig = {
	viewbox_width: 200,
	viewbox_height: 200,
	points_nb: 5,
	base_radius: 75,
    radius_variance: 10,
	animation_variance: 20, /* base + variance shouldn't be more than viewbox/2 */
	base_rotation: "random",
    tension_percent: 0,
    speed: 0,
    speed_on_hover: 0.01,
    ramp_duration_in: 180,
    ramp_duration_out: 120
};

function toRadians(angle) {
	/* Helper to convert from degrees to radians */
	return angle * (Math.PI / 180);
}
function map(n, start1, end1, start2, end2) {
	/* map a number from 1 range to another */
	return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}



function startMoving() {
    animation_state = "on";
}
function stopMoving() {
    animation_state = "paused";
    animation_lifetime = 0;
}



function createPoints() {
	const points = [];
	// how many points do we need
	const numPoints = BlobConfig.points_nb;
	// used to equally space each point around the circle
	const angleStep = (Math.PI * 2) / numPoints;
	// the radius of the circle
	let rad = BlobConfig.base_radius;

	const rotation = BlobConfig.base_rotation !== "random" ? BlobConfig.base_rotation : toRadians(Math.random() * 360);

	for (let i = 1; i <= numPoints; i++) {
		// x & y coordinates of the current point
		// based on polar coordinates
		const theta = i * angleStep + rotation;

		const x = BlobConfig.viewbox_width / 2 + (Math.random() * BlobConfig.radius_variance - BlobConfig.radius_variance / 2) + Math.cos(theta) * rad;
		const y = BlobConfig.viewbox_height / 2 + (Math.random() * BlobConfig.radius_variance - BlobConfig.radius_variance / 2) + Math.sin(theta) * rad;

		// store the point
		points.push({
			x: x,
			y: y,
			/* we need to keep a reference to the point's original {x, y} coordinates 
      for when we modulate the values later */
			originX: x,
			originY: y,
			// more on this in a moment!
			noiseOffsetX: Math.random() * 1000,
			noiseOffsetY: Math.random() * 1000
		});
	}

	return points;
}

const points = createPoints();

/* Noise source */
const noise2D = makeNoise2D(Date.now()); // Using current date as seed


// how fast we progress through "time"
let noiseStep = BlobConfig.speed;

function noise(x, y) {
  // return a value at {x point in time} {y point in time}
  // each noise function returns a float between -1 and 1, exclusive
  return noise2D(x, y);
}


function log_animation_state() {
    console.log(`animation state: ${animation_state} -- animation lifetime: ${animation_lifetime} -- noiseStep: ${noiseStep}`);
}



(function animate() {
	/**
    generate a smooth continuous curve based on points, using Bezier curves. 
    spline() will return an SVG path-data string. The arguments are (points, tension, close). Play with tension and check out the effect! 
    */
	path.setAttribute("d", spline(points, map(BlobConfig.tension_percent, 0, 100, 1.5, .4), true));

    if (animation_state == "on") {
        animation_lifetime += 1;
        
        
        if (animation_lifetime <= BlobConfig.ramp_duration_in) {
            console.info("accelerating...");
            
            if (noiseStep < BlobConfig.speed_on_hover) {
                noiseStep += BlobConfig.speed_on_hover / BlobConfig.ramp_duration_in;
            }
        }
        else {
            console.info("full speed ahead, mister Spock!");
            
        }
    }
    else {
        if (noiseStep > BlobConfig.speed) {
            noiseStep -= BlobConfig.speed_on_hover / BlobConfig.ramp_duration_out;
            console.info("decelerating...")
        }
        else {
            console.info("we've stopped.")
        }
    }
    
    // for every point...
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
    
        // return a pseudo random value between -1 / 1 based on this point's current x, y positions in "time"
        const nX = noise(point.noiseOffsetX, point.noiseOffsetX);
        const nY = noise(point.noiseOffsetY, point.noiseOffsetY);
        // map this noise value to a new value, somewhere between it's original location -20 and it's original location + 20
        const x = map(nX, -1, 1, point.originX - BlobConfig.animation_variance, point.originX + BlobConfig.animation_variance);
        const y = map(nY, -1, 1, point.originY - BlobConfig.animation_variance, point.originY + BlobConfig.animation_variance);
    
        // update the point's current coordinates
        point.x = x;
        point.y = y;
    
        // progress the point's x, y values through "time"
        point.noiseOffsetX += noiseStep;
        point.noiseOffsetY += noiseStep;
      }

    log_animation_state();


	requestAnimationFrame(animate);
})();



const svg = document.querySelector("svg")

/* Event Listeners on SVG */
path.addEventListener("mouseover", () => {
    svg.style.transition = "transform 2s cubic-bezier(0.6,0,0.5,1)";
    svg.style.transformOrigin = "center center";
    svg.style.transform = "scale(1.2)";
    startMoving();
});
path.addEventListener("mouseleave", () => {
    svg.style.transform = "unset";
    svg.style.transition = "transform 1.5s cubic-bezier(0.2,0,0.2,1)";
    stopMoving();
});





